"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import { useSpring, animated } from "react-spring";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);

  // Check login using API (which uses SQLite via Flask-Login)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/current_user`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setIsAuth(true);
          axios
            .get(`${process.env.REACT_APP_API_URL}/current_user`, {
              withCredentials: true,
            })
            .then((response) => {
              setCurrentUser(response.data);
            })
            .catch(() => {
              setCurrentUser(null);
            });
        } else {
          setIsAuth(false);
          navigate("/login");
        }
      })
      .catch(() => {
        setIsAuth(false);
        navigate("/login");
      });
  }, [navigate]);

  const [formData, setFormData] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
    model: "best",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Fetch available models from the Flask API
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/models`)
      .then((response) => response.json())
      .then((data) => setAvailableModels(data))
      .catch((error) => console.error("Error fetching models:", error));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value === "" && key !== "model") {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/predict`,
          {
            method: "POST",
            credentials: "include", // include session cookies
            body: formDataToSend,
          }
        );
        const data = await response.json();
        if (response.ok) {
          navigate("/result", {
            state: {
              result: data.result,
              probability: data.probability,
              modelUsed: data.model_used,
            },
          });
        } else {
          setErrors({
            submit:
              data.error ||
              "An error occurred during prediction. Please try again.",
          });
        }
      } catch (error) {
        console.error("Error during prediction:", error);
        setErrors({
          submit: "An error occurred during prediction. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const welcomeAnimation = useSpring({
    opacity: currentUser ? 1 : 0,
    transform: currentUser ? "translateY(0)" : "translateY(-20px)",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-xl shadow-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
          Diabetes Predictor
        </h1>
        {currentUser && (
          <animated.div style={welcomeAnimation}>
            <p className="mb-6 text-center font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
              Welcome, {currentUser.username}!
            </p>
          </animated.div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            label="Pregnancies"
            name="Pregnancies"
            type="number"
            value={formData.Pregnancies}
            onChange={handleChange}
            min={0}
            max={20}
            error={errors.Pregnancies}
          />
          <InputField
            label="Glucose"
            name="Glucose"
            type="number"
            value={formData.Glucose}
            onChange={handleChange}
            min={0}
            max={300}
            error={errors.Glucose}
          />
          <InputField
            label="Blood Pressure"
            name="BloodPressure"
            type="number"
            value={formData.BloodPressure}
            onChange={handleChange}
            min={0}
            max={200}
            error={errors.BloodPressure}
          />
          <InputField
            label="Skin Thickness"
            name="SkinThickness"
            type="number"
            value={formData.SkinThickness}
            onChange={handleChange}
            min={0}
            max={100}
            error={errors.SkinThickness}
          />
          <InputField
            label="Insulin"
            name="Insulin"
            type="number"
            value={formData.Insulin}
            onChange={handleChange}
            min={0}
            max={900}
            error={errors.Insulin}
          />
          <InputField
            label="BMI"
            name="BMI"
            type="number"
            value={formData.BMI}
            onChange={handleChange}
            min={10}
            max={60}
            step={0.1}
            error={errors.BMI}
          />
          <InputField
            label="Diabetes Pedigree Function"
            name="DiabetesPedigreeFunction"
            type="number"
            value={formData.DiabetesPedigreeFunction}
            onChange={handleChange}
            min={0}
            max={3}
            step={0.01}
            error={errors.DiabetesPedigreeFunction}
          />
          <InputField
            label="Age"
            name="Age"
            type="number"
            value={formData.Age}
            onChange={handleChange}
            min={1}
            max={120}
            error={errors.Age}
          />

          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Choose Model
            </label>
            <select
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model === "best" ? "Auto-select Best Model" : model}
                </option>
              ))}
            </select>
          </div>

          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#fc466b] to-[#3f5efb] hover:from-[#fc466b] hover:to-[#3f5efb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : "Predict"}
            </button>
          </div>
        </form>
      </div>

      {/* About Panel */}
      <div className="mt-10 max-w-2xl mx-auto bg-gray-100 dark:bg-gray-900 p-6 rounded-xl text-center shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center mb-2">
          <FaInfoCircle className="mr-2" />
          About Diabetes Predictor
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Developed by TAN Team with state-of-the-art machine learning
          techniques.
        </p>
      </div>
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}> = ({ label, name, type, value, onChange, min, max, step, error }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      required
      className={`mt-1 block w-full border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default Home;
