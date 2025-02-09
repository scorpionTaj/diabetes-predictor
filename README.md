# Diabetes Predictor

This project is a web application for predicting diabetes risk using state-of-the-art machine learning techniques. It consists of a React frontend and a Flask backend.

---

## Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the React project directory, you can run:

- ### `npm start`

  Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

- ### `npm test`

  Launches the test runner in the interactive watch mode.

- ### `npm run build`

  Builds the app for production to the `build` folder.

- ### `npm run eject`
  Exposes configuration files. **Note:** This is a one-way operation.

---

## Backend

The Flask backend manages user authentication and prediction API endpoints. It utilizes SQLite, Flask-Login, and machine learning models stored in the `models` directory.

### How to Run the Backend

1. Create a virtual environment if needed.
2. Install the dependencies (e.g., `pip install -r requirements.txt`).
3. Run the application:
   ```bash
   python app.py
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000) by default.

---

## API Endpoints

Below are the main API endpoints provided by the backend:

- **User Authentication**

  - `POST /api/register` - Register a new user.
  - `POST /api/login` - Log in a user.
  - `POST /api/logout` - Log out the current user.
  - `GET /api/current_user` - Get details of the logged-in user.
  - `POST /api/change_password` - Change the current user's password.

- **Prediction**

  - `POST /api/predict` - Submit input data to get a diabetes prediction.
  - `GET /api/models` - Retrieve available model names (including auto-select option "best").
  - `GET /api/predictions` - Retrieve the prediction history of the current user.
  - `GET /api/prediction_stats` - Get statistics of predictions.
  - `GET /api/feature_importance` - Get feature importance scores from the models.

- **Health Check**
  - `GET /api/health` - Check if the backend service is running.
  - `GET /api/model_metrics` - Retrieve model performance metrics.

---

## Additional Information

- **Logging:** The backend logs requests and prediction activities.
- **CORS:** Configured to support credentials.
- **Database:** Uses SQLite database stored in the `data` folder.

For more details, please refer to the source code and inline comments.

# Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
