import os
import pickle
import json
import logging
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from flask import Flask, request, render_template, session
from flask_assets import Environment, Bundle

# For transformation pipeline (for non-pipeline models)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)

app = Flask(__name__)
app.secret_key = "supersecretkey"

# Create the assets environment
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

# =============================================================================
# Routes
# =============================================================================


@app.route("/")
def home():
    # Include auto-select option with value "best"
    return render_template("index.html", models=model_names)


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # ------------------------------
        # 1. Retrieve Raw Input from Form
        # ------------------------------
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

        # ------------------------------
        # 2. Reconstruct Categorical Features
        # ------------------------------
        bmi_val = input_df["BMI"].iloc[0]
        input_df["BMI_Category"] = categorize_bmi(bmi_val)

        insulin_val = input_df["Insulin"].iloc[0]
        input_df["Insulin_Category"] = insulin_category(insulin_val)

        glucose_val = input_df["Glucose"].iloc[0]
        input_df["Glucose_Category"] = glucose_category(glucose_val)

        # ------------------------------
        # 3. Set Categorical Dtypes with Sorted Categories
        # ------------------------------
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

        # ------------------------------
        # 4. One-Hot Encode Categorical Features (drop_first=True)
        # ------------------------------
        input_df = pd.get_dummies(
            input_df,
            columns=["BMI_Category", "Insulin_Category", "Glucose_Category"],
            drop_first=True,
        )

        # ------------------------------
        # 5. Ensure All Expected Features Exist and Order Them
        # ------------------------------
        for col in expected_features:
            if col not in input_df.columns:
                input_df[col] = 0
        input_df = input_df[expected_features]

        # ------------------------------
        # 6. Handle Model Selection (including auto-select)
        # ------------------------------
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
        logging.info(f"Using model: {selected_model_name}")

        # ------------------------------
        # 7. Make a Prediction (handle pipelines vs. standalone models)
        # ------------------------------
        if hasattr(model, "named_steps"):
            # For pipeline models (e.g., grid searched pipelines)
            prediction = model.predict(input_df)[0]
            probability = (
                model.predict_proba(input_df)[0][1]
                if hasattr(model, "predict_proba")
                else None
            )
        else:
            # For standalone models, transform input using the fitted preprocessor
            X_transformed = preprocessor.transform(input_df)
            prediction = model.predict(X_transformed)[0]
            probability = (
                model.predict_proba(X_transformed)[0][1]
                if hasattr(model, "predict_proba")
                else None
            )

        # ------------------------------
        # 8. Generate a Confidence Chart
        # ------------------------------
        # No need to save the plot, just render it in the template

        # ------------------------------
        # 9. Render the Result Template
        # ------------------------------
        result_text = "Diabetic" if prediction == 1 else "Not Diabetic"
        prob_msg = (
            f"Confidence: {probability * 100:.2f}%"
            if probability is not None
            else "No Probability Available"
        )
        return render_template(
            "result.html",
            result=result_text,
            prob_msg=prob_msg,
            model=selected_model_name,
            probability=probability or 0,
        )

    except Exception as e:
        logging.exception("Error during prediction:")
        return render_template("error.html", error=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
