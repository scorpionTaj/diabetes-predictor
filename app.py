import os
import pickle
import json
import logging
import pandas as pd
from datetime import datetime
from flask import Flask, flash, redirect, request, render_template, session, url_for
from flask_assets import Environment, Bundle

from flask import Flask, flash, redirect, request, render_template, session, url_for
from flask_assets import Environment, Bundle
from flask_login import (
    LoginManager,
    login_user,
    login_required,
    logout_user,
    current_user,
    UserMixin,
)
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# -------------------------------
# Logging Configuration
# -------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)

# -------------------------------
# Flask Application Setup
# -------------------------------
app = Flask(__name__)
app.secret_key = "supersecretkey"

# Configure SQLite using Flask-SQLAlchemy
basedir = os.path.abspath(os.path.dirname(__file__))
data_dir = os.path.join(basedir, "data")
os.makedirs(data_dir, exist_ok=True)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    data_dir, "users.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -------------------------------
# Flask-Assets Setup
# -------------------------------
assets = Environment(app)
assets.directory = os.path.join(app.root_path, "static")
assets.url = "/static"
assets.manifest = "file"
assets.cache = True
assets.auto_build = True

# Define your CSS bundle
css_bundle = Bundle("style.css", filters="cssmin", output="gen/packed.css")
assets.register("main_css", css_bundle)

# Define your JavaScript bundle (if you have multiple JS files)
js_bundle = Bundle("app.js", filters="jsmin", output="gen/packed.js")
assets.register("main_js", js_bundle)

# -------------------------------
# Flask-Login Setup
# -------------------------------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"  # Redirect here if login required


# -------------------------------
# Database Models
# -------------------------------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Create tables if they do not exist
with app.app_context():
    db.create_all()


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# =============================================================================
# Helper Functions (must match training script)
# =============================================================================


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


def load_models(models_dir="models"):
    """Load all pickled models (excluding the preprocessor) from models_dir."""
    loaded_models = {}
    for filename in os.listdir(models_dir):
        if filename.endswith(".pkl") and filename != "preprocessor.pkl":
            model_name = filename.replace(".pkl", "").replace("_", " ").title()
            try:
                with open(os.path.join(models_dir, filename), "rb") as f:
                    loaded_models[model_name] = pickle.load(f)
                logging.info(f"Loaded model: {model_name}")
            except Exception as e:
                logging.error(f"Error loading {filename}: {e}")
    return loaded_models


def load_preprocessor(models_dir="models"):
    """Load the fitted preprocessor from disk."""
    preprocessor_path = os.path.join(models_dir, "preprocessor.pkl")
    try:
        with open(preprocessor_path, "rb") as f:
            preproc = pickle.load(f)
        logging.info("Fitted preprocessor loaded successfully.")
        return preproc
    except Exception as e:
        logging.error("Fitted preprocessor not found.")
        raise RuntimeError(
            "Fitted preprocessor not found. Please ensure it is saved as 'models/preprocessor.pkl'."
        ) from e


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
    # Fallback: return the first key from models_dict
    fallback = list(models_dict.keys())[0] if models_dict else None
    logging.warning(
        "Metrics file not found or no valid metrics. Falling back to first model."
    )
    return fallback


# =============================================================================
# Load Models and Preprocessor
# =============================================================================
MODELS_DIR = "models"
models = load_models(MODELS_DIR)
model_names = sorted(models.keys())
preprocessor = load_preprocessor(MODELS_DIR)

# =============================================================================
# Expected Feature Columns (must match training)
# =============================================================================
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
    # One-hot encoded Insulin_Category (alphabetically: "Abnormal", "Normal"; drop "Abnormal")
    "Insulin_Category_Normal",
    # One-hot encoded Glucose_Category (alphabetically: "Low", "Normal", "Overweight", "Secret"; drop "Low")
    "Glucose_Category_Normal",
    "Glucose_Category_Overweight",
    "Glucose_Category_Secret",
]

# For logging predictions (still using JSON for now)
PREDICTIONS_FILE = os.path.join(data_dir, "predictions.json")

# =============================================================================
# Routes
# =============================================================================


@app.route("/")
def home():
    return render_template(
        "index.html",
        models=model_names,
        user=current_user if current_user.is_authenticated else None,
    )


@app.route("/about")
def about():
    return render_template(
        "about.html", user=current_user if current_user.is_authenticated else None
    )


# ----- Authentication Routes -----
@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        flash("Already logged in.", "info")
        return redirect(url_for("home"))
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            flash("Logged in successfully.", "success")
            return redirect(url_for("home"))
        else:
            flash("Invalid username or password.", "danger")
    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        flash("Already logged in.", "info")
        return redirect(url_for("home"))
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if User.query.filter_by(username=username).first():
            flash("Username already taken.", "danger")
            return render_template("register.html")
        new_user = User(
            username=username, password_hash=generate_password_hash(password)
        )
        db.session.add(new_user)
        db.session.commit()
        flash("Registration successful. Please log in.", "success")
        return redirect(url_for("login"))
    return render_template("register.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Logged out successfully.", "info")
    return redirect(url_for("home"))


@app.route("/set_language")
def set_language():
    lang = request.args.get("lang", "en")
    session["lang"] = lang
    return redirect(request.referrer or url_for("home"))


@app.route("/predict", methods=["POST"])
@login_required
def predict():
    try:
        # 1. Retrieve and process input
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
                user_input.append(float(request.form[feature]))
            except Exception as e:
                logging.error(f"Invalid input for {feature}: {e}")
                return render_template(
                    "error.html", error=f"Invalid input for {feature}."
                )
        input_df = pd.DataFrame([user_input], columns=raw_features)

        # 2. Create categorical features
        bmi_val = input_df["BMI"].iloc[0]
        input_df["BMI_Category"] = categorize_bmi(bmi_val)
        input_df["Insulin_Category"] = insulin_category(input_df["Insulin"].iloc[0])
        input_df["Glucose_Category"] = glucose_category(input_df["Glucose"].iloc[0])

        # 3. Set categorical types and one-hot encode
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
        for col in expected_features:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[expected_features]

        # 4. Model selection and prediction
        selected_model_name = request.form.get("model")
        if selected_model_name == "best":
            metrics_file = os.path.join(MODELS_DIR, "metrics.json")
            selected_model_name = auto_select_model(metrics_file, models)
            if selected_model_name is None:
                return render_template(
                    "error.html", error="No models available for prediction."
                )
        if selected_model_name not in models:
            logging.error(f"Selected model '{selected_model_name}' not found.")
            return render_template("error.html", error="Selected model not found."), 400
        model = models[selected_model_name]
        if hasattr(model, "named_steps"):
            prediction = model.predict(input_df)[0]
            probability = (
                model.predict_proba(input_df)[0][1]
                if hasattr(model, "predict_proba")
                else None
            )
        else:
            X_transformed = preprocessor.transform(input_df)
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

        # 5. Log prediction (still saving in a JSON file)
        log_entry = {
            "user_id": current_user.id,
            "username": current_user.username,
            "timestamp": datetime.utcnow().isoformat(),
            "inputs": {feature: request.form[feature] for feature in raw_features},
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

        return render_template(
            "result.html",
            result=result_text,
            prob_msg=prob_msg,
            model=selected_model_name,
            probability=probability or 0,
            user=current_user,
        )
    except Exception as e:
        logging.exception("Error during prediction:")
        return render_template("error.html", error=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
