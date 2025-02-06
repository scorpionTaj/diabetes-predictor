# Diabetes Predictor

A Flask web application that uses machine learning models to predict diabetes risk based on user input. The app features a modern, responsive design with smooth animations, Font Awesome icons, and an About page with developer cards.

---

## Table of Contents

- [Diabetes Predictor](#diabetes-predictor)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [File Structure](#file-structure)
  - [Setup and Installation](#setup-and-installation)
  - [Usage](#usage)
  - [Theme Customization](#theme-customization)
  - [Smooth Transitions and Loading Feedback](#smooth-transitions-and-loading-feedback)
  - [PWA Features](#pwa-features)
  - [Training and Models](#training-and-models)
  - [Front-End Improvements](#front-end-improvements)
  - [Developer Information](#developer-information)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)
  - [Final Notes](#final-notes)

---

## Overview

This application predicts whether a patient is diabetic based on several input features (such as glucose level, BMI, age, etc.). It supports multiple machine learning models, including logistic regression, SVM, decision trees, random forests, gradient boosting, and more. The app also provides an auto-select feature that picks the best model based on performance metrics.

---

## Features

- **Multiple Models:**  
  Use any of the pre-trained models or auto-select the best-performing model.
- **Modern UI:**  
  Responsive design with a modern look using CSS Grid, Flexbox, and smooth animations.
- **Developer Cards:**  
  An About page that showcases the development team with pictures, GitHub, and LinkedIn links.
- **Detailed Logging:**  
  Logging for error handling and tracing using Python’s built-in logging module.
- **Auto-Select Best Model:**  
  Automatically select the best model based on stored metrics.
- **Interactive Charts:**  
  Display a confidence chart for the prediction result.

---

## File Structure

```
your_project/
├── app.py                  # Main Flask application
├── README.md               # Project documentation
├── models/
│   ├── preprocessor.pkl    # Fitted preprocessor from training
│   ├── metrics.json        # Model performance metrics
│   ├── <model>.pkl         # Pickled machine learning models
│   └── ...                 # Additional model files
├── static/
│   ├── app.js              # JavaScript for theme switching, spinner, PWA, and transitions
│   ├── style.css           # Main CSS file (Catppuccin Mocha Mauve palette with theme controls)
│   ├── manifest.json       # PWA manifest file
│   ├── sw.js               # Service Worker for PWA features
│   └── images/
│       ├── dev1.jpg        # Developer images
│       ├── dev2.jpg
│       └── dev3.jpg
├── templates/
│   ├── index.html          # Home page with input form and theme controls
│   ├── about.html          # About page with developer cards
│   ├── result.html         # Prediction result page
│   └── error.html          # Error display page
└── requirements.txt        # List of Python dependencies

```

---

## Setup and Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/scorpionTaj/diabetes-predictor.git
   cd diabetes-predictor
   ```

2. **Create a Virtual Environment and Install Dependencies:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Place Your Models and Preprocessor:**

   - Ensure that your training script has generated and saved the model pickle files and `preprocessor.pkl` inside the `models` folder.
   - Make sure `metrics.json` exists with model evaluation metrics.

4. **Run the Application:**

   ```bash
   python app.py
   ```

5. **Access the App:**

   Open your web browser and go to [http://127.0.0.1:5000/](http://127.0.0.1:5000/).

---

## Usage

1. **Input Data:**

   Fill in the input form on the home page with patient details such as pregnancies, glucose level, blood pressure, skin thickness, insulin level, BMI, diabetes pedigree function, and age.

2. **Model Selection:**

   Choose a model from the dropdown or select "Auto-select Best Model" to let the app choose the best model based on accuracy.

3. **Theme Customization:**

   Use the theme controls (located in the header) to switch between dark and light modes and to choose your preferred accent color.

4. **Submit and Get Prediction:**

   Click "Predict" to submit the form. A loading spinner will display during processing, and then you’ll see the prediction result along with a confidence chart.

5. **Navigation:**

   Use the navigation bar to switch between the home page and the About page to view developer information.

---

---

## Theme Customization

- **Mode:**  
  Users can toggle between **Dark** (default) and **Light** mode.
- **Accent Color:**  
  Options include Mauve (default), Green, Teal, Blue, and Red.
- **Persistence:**  
  The app saves your theme preferences using `localStorage` so that they persist across page reloads.

---

## Smooth Transitions and Loading Feedback

- **Smooth Page Transitions:**  
  Implemented via CSS transitions and optionally Barba.js (with GSAP) for seamless content changes.
- **Loading Spinner:**  
  A modal overlay with a spinner animation is displayed upon form submission to provide immediate feedback until the prediction is complete.

---

## PWA Features

- **Manifest File:**  
  The app includes a `manifest.json` file in the `static` folder for installability on mobile devices.
- **Service Worker:**  
  A service worker (`sw.js`) caches assets to enable offline functionality and faster load times.
- **Add to Home Screen:**  
  Users can install the app on their devices for a native-app-like experience.

---

## Training and Models

- **Training Process:**  
  A separate training script handles data preprocessing, model training, evaluation, and saving of pickle files.
- **Models and Preprocessor:**  
  The trained models and the fitted preprocessor are stored in the `models` folder.
- **Metrics:**  
  Model performance metrics are saved in `metrics.json` to facilitate auto-selection of the best model.

---

## Front-End Improvements

- **Asset Bundling:**  
  Flask-Assets is used to bundle and minify CSS and JS for faster load times.
- **Responsive Design:**  
  The UI uses CSS Grid and Flexbox for a fully responsive layout.
- **Custom Theme:**  
  The default theme uses the Catppuccin Mocha Mauve palette with options for user customization.
- **Animations:**  
  Smooth transitions, fade-ins, and hover effects provide a modern interactive experience.
- **Icons:**  
  Font Awesome icons enhance visual clarity throughout the app.

---

## Developer Information

The About page displays interactive developer cards with:

- **Images:** Developer photos (place your actual images in `static/images/`).
- **Roles:** Titles and brief descriptions.
- **Social Links:** Icons linking to GitHub and LinkedIn profiles.

---

## Troubleshooting

- **Flask-Assets:**  
  If bundled assets (`gen/packed.css` or `gen/packed.js`) are not found, verify your Flask-Assets configuration and run `flask assets build`.
- **Theme Issues:**  
  If the theme does not change, ensure JavaScript is enabled and that `app.js` is properly linked.
- **PWA Issues:**  
  Verify that `manifest.json` and `sw.js` are in the correct directories and that the service worker is registering.
- **General Errors:**  
  Check the browser console and `app.log` for detailed error messages.

---

## License

MIT License[](MIT)

---

## Final Notes

- **Assets and PWA:**  
  The project now uses Flask-Assets for optimized asset delivery and includes PWA features (manifest and service worker) for offline support and installation.
- **Smooth Transitions & Spinner:**  
  Smooth page transitions and a loading spinner/modal improve user experience during navigation and form submission.
- **Theme Customization:**  
  Users can toggle between dark/light modes and choose their accent color, with preferences saved across sessions.
- **Documentation:**  
  This README provides a comprehensive guide to the project, including setup, usage, and troubleshooting.
