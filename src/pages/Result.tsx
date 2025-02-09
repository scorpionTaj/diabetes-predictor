"use client";

import React, { useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Home, Info } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getConfidenceColor } from "../utils/getConfidenceColor";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Result: React.FC = () => {
  const navigate = useNavigate();
  const chartRef = useRef<ChartJS>(null);

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login");
    }
  }, [navigate]);

  const location = useLocation();
  const { result, probability, modelUsed } = location.state as {
    result: string;
    probability: number;
    modelUsed: string;
  };

  const chartData = {
    labels: ["Not Diabetic", "Diabetic"],
    datasets: [
      {
        label: "Probability",
        data: [1 - probability, probability],
        backgroundColor: ["rgba(75, 192, 192, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1500,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { font: { size: 14 } },
      },
      title: {
        display: true,
        text: "Diabetes Prediction Probability",
        font: { size: 20, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.label}: ${(context.parsed.y * 100).toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value: number) => (value * 100).toFixed(0) + "%",
        },
      },
    },
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement("a");
      a.href = url;
      a.download = "prediction_chart.png";
      a.click();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
        Prediction Result
      </h1>
      <p className="text-center text-sm text-gray-600 mb-4">
        Your health analysis is provided below
      </p>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <p className="text-lg dark:text-white">
            Based on your input, the model predicts you are:{" "}
            <span className="font-bold text-xl text-indigo-600">{result}</span>
          </p>
          <Info
            className="w-5 h-5 ml-2 text-gray-400"
            title="Prediction info"
          />
        </div>
        <p className="text-lg mb-4 dark:text-white">
          The confidence of this prediction is:{" "}
          <span
            className={`font-bold text-xl ${getConfidenceColor(probability)}`}
          >
            {(probability * 100).toFixed(2)}%
          </span>
        </p>
        <p className="text-lg mb-8 dark:text-white">
          Model used:{" "}
          <span className="font-bold text-xl text-indigo-600">{modelUsed}</span>
        </p>
        <div className="mb-4">
          <Bar ref={chartRef} data={chartData} options={options} />
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            <Home className="w-5 h-5" title="Back to Home" />
            <span>Back Home</span>
          </button>
          <button
            onClick={downloadChart}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <span>Download Graph</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
