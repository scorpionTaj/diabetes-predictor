import React, { useState, useEffect } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const About: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("isLoggedIn"));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
        About the Diabetes Predictor
      </h2>
      <p className="mb-8 text-gray-700 dark:text-gray-300 text-center">
        This application was developed by <strong>TAN Team</strong> as a proof
        of concept for predicting diabetes risk using state-of-the-art machine
        learning techniques.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <DeveloperCard
          name="Tajeddine Bourhim"
          role="Data Scientist & AI Student"
          image="/images/dev1.jpg"
          github="https://github.com/scorpionTaj"
          linkedin="https://www.linkedin.com/in/tajeddine-bourhim"
        />
        <DeveloperCard
          name="Anass Zbir"
          role="Data Scientist & AI Student"
          image="/images/dev2.jpg"
          github="https://github.com/ana3ss7z"
          linkedin="https://www.linkedin.com/in/anass-zbir-2b17a526b"
        />
        <DeveloperCard
          name="Nawfal Khallou"
          role="Data Scientist & AI Student"
          image="/images/dev3.jpg"
          github="https://github.com/nawfal-khallou"
          linkedin="https://www.linkedin.com/in/nawfal-khallou"
        />
      </div>
      <div className="mt-12 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Project Details
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Technology Stack
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                <ul className="list-disc list-inside mb-4">
                  <li>
                    <strong>React</strong>: A JavaScript library for building
                    user interfaces.
                  </li>
                  <li>
                    <strong>Tailwind CSS</strong>: A utility-first CSS framework
                    for styling.
                  </li>
                  <li>
                    <strong>React Router</strong>: For routing and navigation.
                  </li>
                  <li>
                    <strong>React Icons</strong>: For using icons in the
                    application.
                  </li>
                  <li>
                    <strong>Google Translate</strong>: For language translation.
                  </li>
                  <li>
                    <strong>Flask</strong>: A lightweight WSGI web application
                    framework in Python.
                  </li>
                  <li>
                    <strong>Flask-Login</strong>: For user session management.
                  </li>
                  <li>
                    <strong>Flask-CORS</strong>: For handling Cross-Origin
                    Resource Sharing (CORS).
                  </li>
                  <li>
                    <strong>SQLAlchemy</strong>: An SQL toolkit and
                    Object-Relational Mapping (ORM) library for Python.
                  </li>
                  <li>
                    <strong>SQLite</strong>: A C library that provides a
                    lightweight disk-based database.
                  </li>
                  <li>
                    <strong>Werkzeug</strong>: A comprehensive WSGI web
                    application library.
                  </li>
                </ul>
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Machine Learning Models
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                <ul className="list-disc list-inside mb-4">
                  <li>
                    <strong>Logistic Regression</strong>: A statistical model
                    that in its basic form uses a logistic function to model a
                    binary dependent variable.
                  </li>
                  <li>
                    <strong>Support Vector Classifier (SVC)</strong>: A
                    supervised learning model used for classification and
                    regression analysis.
                  </li>
                  <li>
                    <strong>Decision Tree</strong>: A decision support tool that
                    uses a tree-like model of decisions and their possible
                    consequences.
                  </li>
                  <li>
                    <strong>K-Nearest Neighbors (KNN)</strong>: A non-parametric
                    method used for classification and regression.
                  </li>
                  <li>
                    <strong>Random Forest</strong>: An ensemble learning method
                    for classification, regression, and other tasks.
                  </li>
                  <li>
                    <strong>Gradient Boosting</strong>: A machine learning
                    technique for regression and classification problems.
                  </li>
                  <li>
                    <strong>XGBoost</strong>: An optimized distributed gradient
                    boosting library designed to be highly efficient, flexible,
                    and portable.
                  </li>
                </ul>
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Dataset
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                Pima Indians Diabetes Database
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Other Tools
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                <ul className="list-disc list-inside mb-4">
                  <li>
                    <strong>Joblib</strong>: For model serialization.
                  </li>
                  <li>
                    <strong>Pickle</strong>: For serializing and de-serializing
                    Python object structures.
                  </li>
                  <li>
                    <strong>Pandas</strong>: For data manipulation and analysis.
                  </li>
                  <li>
                    <strong>Scikit-learn</strong>: For machine learning
                    algorithms and tools.
                  </li>
                  <li>
                    <strong>Matplotlib</strong>: For plotting and visualization.
                  </li>
                  <li>
                    <strong>Jupyter Notebook</strong>: For creating and sharing
                    documents that contain live code, equations, visualizations,
                    and narrative text.
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

const DeveloperCard: React.FC<{
  name: string;
  role: string;
  image: string;
  github: string;
  linkedin: string;
}> = ({ name, role, image, github, linkedin }) => {
  // Assign a background color based on the developer name
  let bgColor = "bg-white dark:bg-gray-800";
  if (name === "Tajeddine Bourhim") bgColor = "bg-blue-500";
  else if (name === "Anass Zbir") bgColor = "bg-green-500";
  else if (name === "Nawfal Khallou") bgColor = "bg-red-500";

  return (
    <div
      className={`${bgColor} shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105`}
    >
      <img
        src={image || "/placeholder.svg"}
        alt={name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2 text-white">{name}</h3>
        <p className="text-gray-100 text-sm mb-4">{role}</p>
        <div className="flex justify-center space-x-4">
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-gray-300"
          >
            <FaGithub className="h-6 w-6" />
          </a>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-gray-300"
          >
            <FaLinkedin className="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
