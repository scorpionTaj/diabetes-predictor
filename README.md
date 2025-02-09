# 🏥 Diabetes Predictor

A comprehensive web application for predicting diabetes risk using machine learning models, developed by TAN Team.

## 🧭 Navigation

- 🏠 **Home** - Main dashboard and prediction interface
- ℹ️ **About** - Project information and team details
- 👤 **Profile** - User settings and personal information
- 📜 **History** - Past predictions and analysis
- 📊 **Visualizations** - Interactive data charts and insights
- 📚 **Resources** - Educational content about diabetes
- 📞 **Contact Us** - Get in touch with the team
- 🚪 **Logout** - Secure session termination

## ✨ Features

- 🔐 **User Authentication**: Secure login and registration system
- 🤖 **Multiple ML Models**: Support for:
  - Logistic Regression
  - Support Vector Classification (SVC)
  - Decision Tree
  - K-Nearest Neighbors (KNN)
  - Random Forest
  - Gradient Boosting
  - XGBoost
- 🎯 **Auto-select Best Model**: Intelligent selection of the optimal performing model
- 📊 **Data Visualization**: Interactive charts for prediction trends and model performance
- 🌓 **Dark Mode Support**: Full compatibility with dark themes
- 📱 **Responsive Design**: Mobile-friendly interface
- ⚡ **Real-time Predictions**: Instant diabetes risk assessment
- 👤 **Profile Management**: User profile and password management
- 📚 **Resource Center**: Educational resources about diabetes

## 🛠️ Tech Stack

### Frontend

- ⚛️ React, TypeScript, Tailwind CSS
- 🔄 React Router, React Icons
- 📈 Chart.js/React-Chartjs-2
- 💫 React Spring
- 🔌 Axios

### Backend

- 🐍 Flask, Flask-Login, Flask-CORS
- 💾 SQLAlchemy, SQLite
- 🔑 Werkzeug

### Machine Learning

- 📊 Scikit-learn
- 🐼 Pandas
- 🔢 NumPy
- 💾 Joblib, Pickle
- 🚀 XGBoost

## 📥 Installation

1. Clone the repository:

```bash
git clone https://github.com/scorpionTaj/diabetes-predictor.git
cd diabetes-predictor
```

2. Install frontend dependencies:

```bash
npm install
```

3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:
   Create a `.env` file in the frontend directory with:

```
REACT_APP_API_URL=http://localhost:5000/api
PUBLIC_URL=http://localhost:3000
```

5. Start the development servers:

**Frontend:**

```bash
npm start
```

**Backend:**

```bash
python app.py
```

## 🎮 Usage

1. Register a new account or login with existing credentials
2. Input the medical parameters:
   - Pregnancies
   - Glucose
   - Blood Pressure
   - Skin Thickness
   - Insulin
   - BMI
   - Diabetes Pedigree Function
   - Age
3. Choose a prediction model or use the auto-select option
4. Click "Predict" to get the diabetes risk assessment
5. View visualizations and prediction history on your dashboard

## 📚 API Documentation

### Authentication Endpoints

- 🔑 `POST /api/register` - Register a new user
- 🔓 `POST /api/login` - Log in a user
- 🔒 `POST /api/logout` - Log out the current user
- 👤 `GET /api/current_user` - Get details of the logged-in user
- 🔄 `POST /api/change_password` - Change the current user's password

### Prediction Endpoints

- 🎯 `POST /api/predict` - Submit input data to get a diabetes prediction
- 🤖 `GET /api/models` - Retrieve available model names
- 📊 `GET /api/predictions` - Retrieve the prediction history
- 📈 `GET /api/prediction_stats` - Get statistics of predictions
- 📋 `GET /api/feature_importance` - Get feature importance scores

### System Endpoints

- ❤️ `GET /api/health` - Check if the backend service is running
- 📊 `GET /api/model_metrics` - Retrieve model performance metrics

## 📁 Project Structure

```
diabetes-predictor/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── backend/
    ├── models/
    ├── static/
    ├── templates/
    ├── app.py
    └── requirements.txt
```

## 👥 Team Members

- 👨‍💻 Tajeddine Bourhim - Data Scientist & AI Student
- 👨‍💻 Anass Zbir - Data Scientist & AI Student
- 👨‍💻 Nawfal Khallou - Data Scientist & AI Student

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- 📊 Data source: Pima Indians Diabetes Database
- 🎨 UI/UX inspiration from modern healthcare apps
- 🤖 Machine learning model implementations using scikit-learn

## 📚 Additional Information

- **Logging:** The backend logs requests and prediction activities
- **CORS:** Configured to support credentials
- **Database:** Uses SQLite database stored in the `data` folder

## 🔗 Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
