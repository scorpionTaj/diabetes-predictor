import os
import json
import pickle
import joblib
import logging
from datetime import datetime, timedelta

import pandas as pd
from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager,
    login_user,
    login_required,
    logout_user,
    current_user,
    UserMixin,
)
from werkzeug.security import generate_password_hash, check_password_hash

# -------------------------------
# Flask Application Setup
# -------------------------------
app = Flask(__name__)
app.secret_key = (
    "supersecretkey"  # Consider using an environment variable in production
)
CORS(
    app, supports_credentials=True
)  # Updated CORS configuration to support credentials

# -------------------------------
# Logging Configuration
# -------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)

logging.basicConfig(level=logging.DEBUG)


@app.before_request
def log_request_info():
    logging.debug("Headers: %s", request.headers)
    logging.debug("Body: %s", request.get_data())


# -------------------------------
# Database Setup (SQLite + SQLAlchemy)
# -------------------------------
basedir = os.path.abspath(os.path.dirname(__file__))
data_dir = os.path.join(basedir, "data")
os.makedirs(data_dir, exist_ok=True)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    data_dir, "users.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# -------------------------------
# Flask-Login Setup
# -------------------------------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = (
    "login"  # Although this is an API, you may handle redirection on the frontend
)


# -------------------------------
# Database Model
# -------------------------------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


with app.app_context():
    db.create_all()
    # Create a default test user if not present (for development/testing)
    if not User.query.filter_by(username="test").first():
        test_user = User(username="test", password_hash=generate_password_hash("test"))
        db.session.add(test_user)
        db.session.commit()
        logging.info("Default test user created: username: 'test', password: 'test'")


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Add this unauthorized handler to return JSON responses
@login_manager.unauthorized_handler
def unauthorized_callback():
    return jsonify({"error": "Unauthorized"}), 401


# -------------------------------
# Model Loading & Preprocessor Setup
# -------------------------------
MODELS_DIR = "models"
models = {}

# Load all models (using joblib) except the preprocessor
for filename in os.listdir(MODELS_DIR):
    if filename.endswith(".pkl") and filename != "preprocessor.pkl":
        model_name = filename.replace(".pkl", "").replace("_", " ").title()
        model_path = os.path.join(MODELS_DIR, filename)
        try:
            models[model_name] = joblib.load(model_path)
            logging.info(f"Loaded model: {model_name}")
        except Exception as e:
            logging.error(f"Error loading model {model_name}: {e}")

logging.info(f"Total models loaded: {len(models)}. Models: {', '.join(models.keys())}")

# Load the preprocessor (if available)
preprocessor = None
preprocessor_path = os.path.join(MODELS_DIR, "preprocessor.pkl")
try:
    with open(preprocessor_path, "rb") as f:
        preprocessor = pickle.load(f)
    logging.info("Loaded fitted preprocessor successfully.")
except Exception as e:
    logging.error(
        "Fitted preprocessor not found. Some models might require raw input transformation."
    )

# -------------------------------
# Expected Features for Prediction
# -------------------------------
expected_features = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
    # One-hot encoded BMI_Category (drop_first=True)
    "BMI_Category_Obesity1",
    "BMI_Category_Obesity2",
    "BMI_Category_Obesity3",
    "BMI_Category_Overweight",
    "BMI_Category_Underweight",
    # One-hot encoded Insulin_Category (keep only "Normal" if drop_first)
    "Insulin_Category_Normal",
    # One-hot encoded Glucose_Category (keep "Normal", "Overweight", "Secret" if drop_first)
    "Glucose_Category_Normal",
    "Glucose_Category_Overweight",
    "Glucose_Category_Secret",
]


# -------------------------------
# Helper Functions
# -------------------------------
def categorize_bmi(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi <= 24.9:
        return "Normal"
    elif bmi <= 29.9:
        return "Overweight"
    elif bmi <= 34.9:
        return "Obesity1"
    elif bmi <= 39.9:
        return "Obesity2"
    else:
        return "Obesity3"


def insulin_category(ins):
    return "Normal" if 16 <= ins <= 166 else "Abnormal"


def glucose_category(gluc):
    if gluc <= 70:
        return "Low"
    elif gluc <= 99:
        return "Normal"
    elif gluc <= 126:
        return "Overweight"
    else:
        return "Secret"


def auto_select_model(metrics_file, models_dict):
    """Return the model name with the highest accuracy based on metrics_file.
    If file not found or no metrics available, return the first model."""
    if os.path.exists(metrics_file):
        with open(metrics_file, "r") as f:
            metrics_dict = json.load(f)
        best_model = None
        best_acc = -1
        for name, metric in metrics_dict.items():
            try:
                acc = float(metric.get("Accuracy", 0))
                if acc > best_acc:
                    best_acc = acc
                    best_model = name
            except Exception as e:
                logging.warning(f"Could not parse accuracy for model {name}: {e}")
        if best_model:
            logging.info(
                f"Auto-selected best model: {best_model} with accuracy {best_acc}"
            )
            return best_model
    fallback = list(models_dict.keys())[0] if models_dict else None
    logging.warning(
        "Metrics file not found or no valid metrics. Falling back to first model."
    )
    return fallback


# -------------------------------
# API Routes
# -------------------------------


# ---------- Authentication Endpoints ----------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken."}), 400

    new_user = User(
        username=username,
        password_hash=generate_password_hash(password),
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registration successful."}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        return jsonify(
            {
                "message": "Logged in successfully.",
                "user": {"id": user.id, "username": user.username},
            }
        )
    else:
        return jsonify({"error": "Invalid username or password."}), 401


@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully."})


# New endpoint to return current user's info
@app.route("/api/current_user", methods=["GET"])
def current_user_info():
    if current_user.is_authenticated:
        return jsonify(
            {
                "id": current_user.id,
                "username": current_user.username,
            }
        )
    return jsonify({"error": "Not authenticated"}), 401


# New endpoint for changing password
@app.route("/api/change_password", methods=["OPTIONS", "POST"])
@cross_origin(supports_credentials=True)
@login_required
def change_password():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body."}), 400

    currentPassword = data.get("currentPassword")
    newPassword = data.get("newPassword")
    if not currentPassword or not newPassword:
        return jsonify({"error": "Current and new passwords are required."}), 400

    if not current_user.check_password(currentPassword):
        return jsonify({"error": "Current password is incorrect."}), 400

    try:
        current_user.password_hash = generate_password_hash(newPassword)
        db.session.commit()
        return jsonify({"message": "Password updated successfully."}), 200
    except Exception as e:
        return jsonify({"error": "Password update failed.", "details": str(e)}), 500


# ---------- Prediction Endpoint ----------
@app.route("/api/predict", methods=["POST"])
@login_required
def predict():
    # Accept JSON input only
    data = request.form.to_dict()

    if not data:
        return jsonify({"error": "Missing form data."}), 400

    try:
        # 1. Retrieve raw features
        raw_features = [
            "Pregnancies",
            "Glucose",
            "BloodPressure",
            "SkinThickness",
            "Insulin",
            "BMI",
            "DiabetesPedigreeFunction",
            "Age",
        ]
        user_input = []
        for feature in raw_features:
            try:
                user_input.append(float(data[feature]))
            except Exception as e:
                logging.error(f"Invalid input for {feature}: {e}")
                return jsonify({"error": f"Invalid input for {feature}."}), 400

        input_df = pd.DataFrame([user_input], columns=raw_features)

        # 2. Create categorical features
        bmi_val = input_df["BMI"].iloc[0]
        input_df["BMI_Category"] = categorize_bmi(bmi_val)
        input_df["Insulin_Category"] = insulin_category(input_df["Insulin"].iloc[0])
        input_df["Glucose_Category"] = glucose_category(input_df["Glucose"].iloc[0])

        # 3. One-hot encoding with fixed categorical ordering
        bmi_categories = [
            "Underweight",
            "Normal",
            "Overweight",
            "Obesity1",
            "Obesity2",
            "Obesity3",
        ]
        input_df["BMI_Category"] = pd.Categorical(
            input_df["BMI_Category"], categories=bmi_categories, ordered=True
        )
        insulin_categories = ["Abnormal", "Normal"]
        input_df["Insulin_Category"] = pd.Categorical(
            input_df["Insulin_Category"], categories=insulin_categories, ordered=True
        )
        glucose_categories = ["Low", "Normal", "Overweight", "Secret"]
        input_df["Glucose_Category"] = pd.Categorical(
            input_df["Glucose_Category"], categories=glucose_categories, ordered=True
        )

        input_df = pd.get_dummies(
            input_df,
            columns=["BMI_Category", "Insulin_Category", "Glucose_Category"],
            drop_first=True,
        )
        # Ensure all expected features are present
        for col in expected_features:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[expected_features]

        # 4. Model selection
        selected_model_name = data.get("model", "best")
        if selected_model_name == "best":
            metrics_file = os.path.join(MODELS_DIR, "model_metrics.json")
            selected_model_name = auto_select_model(metrics_file, models)
            if selected_model_name is None:
                return jsonify({"error": "No models available for prediction."}), 400

        if selected_model_name not in models:
            logging.error(f"Selected model '{selected_model_name}' not found.")
            return jsonify({"error": "Selected model not found."}), 400

        model = models[selected_model_name]

        # 5. Make prediction
        if hasattr(model, "named_steps"):
            # Model is a pipeline
            prediction = model.predict(input_df)[0]
            probability = (
                model.predict_proba(input_df)[0][1]
                if hasattr(model, "predict_proba")
                else None
            )
        else:
            # Non-pipeline: apply preprocessor if available
            X_transformed = (
                preprocessor.transform(input_df) if preprocessor else input_df
            )
            prediction = model.predict(X_transformed)[0]
            probability = (
                model.predict_proba(X_transformed)[0][1]
                if hasattr(model, "predict_proba")
                else None
            )

        result_text = "Diabetic" if prediction == 1 else "Not Diabetic"
        prob_msg = (
            f"Confidence: {probability * 100:.2f}%"
            if probability is not None
            else "No Probability Available"
        )

        # 6. Log prediction to file
        PREDICTIONS_FILE = os.path.join(data_dir, "predictions.json")
        log_entry = {
            "user_id": current_user.id,
            "username": current_user.username,
            "timestamp": datetime.utcnow().isoformat(),
            "inputs": {feature: data.get(feature) for feature in raw_features},
            "model": selected_model_name,
            "prediction": result_text,
            "probability": probability,
        }
        if os.path.exists(PREDICTIONS_FILE):
            with open(PREDICTIONS_FILE, "r") as f:
                predictions_log = json.load(f)
        else:
            predictions_log = []
        predictions_log.append(log_entry)
        with open(PREDICTIONS_FILE, "w") as f:
            json.dump(predictions_log, f, indent=4)

        # 7. Return prediction result as JSON
        return jsonify(
            {
                "result": result_text,
                "probability": float(probability) if probability is not None else None,
                "model_used": selected_model_name,
                "confidence_message": prob_msg,
            }
        )

    except Exception as e:
        logging.exception("Error during prediction:")
        return jsonify({"error": str(e)}), 500


# ---------- Models Endpoint ----------
@app.route("/api/models", methods=["GET"])
def get_models():
    # Return list of available models with an option "best"
    return jsonify(["best"] + list(models.keys()))


# ---------- Basic Endpoint for Health Check ----------
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "OK"})


# New endpoint to return user's complete prediction history
@app.route("/api/predictions", methods=["GET"])
@login_required
def get_predictions():
    PREDICTIONS_FILE = os.path.join(data_dir, "predictions.json")
    if os.path.exists(PREDICTIONS_FILE):
        with open(PREDICTIONS_FILE, "r") as f:
            predictions_log = json.load(f)
        # Filter predictions for the current user
        user_predictions = [
            p for p in predictions_log if p.get("user_id") == current_user.id
        ]
        return jsonify(user_predictions)
    return jsonify([]), 200


# Endpoint to get model metrics
@app.route("/api/model_metrics", methods=["GET"])
def get_model_metrics():
    METRICS_FILE = os.path.join(MODELS_DIR, "model_metrics.json")
    if os.path.exists(METRICS_FILE):
        with open(METRICS_FILE, "r") as f:
            metrics = json.load(f)
        return jsonify(metrics)
    return jsonify({"error": "Metrics file not found"}), 404


# Endpoint to get prediction statistics
@app.route("/api/prediction_stats", methods=["GET"])
@login_required
def get_prediction_stats():
    PREDICTIONS_FILE = os.path.join(data_dir, "predictions.json")
    if os.path.exists(PREDICTIONS_FILE):
        with open(PREDICTIONS_FILE, "r") as f:
            predictions_log = json.load(f)
        # Filter predictions for the current user
        user_predictions = [
            p for p in predictions_log if p.get("user_id") == current_user.id
        ]
        # Calculate statistics
        total_predictions = len(user_predictions)
        diabetic_predictions = sum(
            1 for p in user_predictions if p.get("prediction") == "Diabetic"
        )
        non_diabetic_predictions = total_predictions - diabetic_predictions
        return jsonify(
            {
                "total_predictions": total_predictions,
                "diabetic_predictions": diabetic_predictions,
                "non_diabetic_predictions": non_diabetic_predictions,
            }
        )
    return (
        jsonify(
            {
                "total_predictions": 0,
                "diabetic_predictions": 0,
                "non_diabetic_predictions": 0,
            }
        ),
        200,
    )


# Endpoint to get feature importance
@app.route("/api/feature_importance", methods=["GET"])
@login_required
def get_feature_importance():
    feature_importance = {}
    for model_name, model in models.items():
        if hasattr(model, "feature_importances_"):
            feature_importance[model_name] = model.feature_importances_.tolist()
        elif hasattr(model, "coef_"):
            feature_importance[model_name] = model.coef_[0].tolist()
    return jsonify(feature_importance)


# -------------------------------
# Main Entrypoint
# -------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

# WSGI callable for Gunicorn
application = app
