"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PredictGraph: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/predictions`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch predictions");
        return res.json();
      })
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load prediction history.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-4">Loading graph...</div>;
  if (error)
    return <div className="text-center mt-4 text-red-500">{error}</div>;
  if (history.length === 0)
    return <div className="text-center mt-4">No predictions to display.</div>;

  // Prepare data for charting
  const displayDateTime = "08/02/2024, 15:40:28";
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const labels = sortedHistory.map(() => displayDateTime);
  const dataPoints = sortedHistory.map((entry) =>
    entry.prediction === "Diabetic" ? 1 : 0
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Diabetic Prediction (1) vs Not Diabetic (0)",
        data: dataPoints,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Prediction Graph
      </h1>
      <Line data={data} />
    </div>
  );
};

export default PredictGraph;
