import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { Bar, Pie, Line, Radar } from "react-chartjs-2";
import axios from "axios";

// Register Chart.js components
Chart.register(...registerables);

const Visualizations: React.FC = () => {
  const [modelMetrics, setModelMetrics] = useState({});
  const [predictionStats, setPredictionStats] = useState({
    total_predictions: 0,
    diabetic_predictions: 0,
    non_diabetic_predictions: 0,
  });
  const [predictions, setPredictions] = useState([]);
  const [featureImportance, setFeatureImportance] = useState({});
  const navigate = useNavigate();
  const displayDateTime = "08/02/2024, 15:40:28";

  // New state for continuously updating trend chart data
  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [trendData, setTrendData] = useState<number[]>([]);

  useEffect(() => {
    const fetchModelMetrics = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/model_metrics`,
          { withCredentials: true }
        );
        setModelMetrics(response.data);
      } catch (error) {
        console.error("Error fetching model metrics:", error);
      }
    };

    const fetchPredictionStats = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/prediction_stats`,
          { withCredentials: true }
        );
        setPredictionStats(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate("/login");
        } else {
          console.error("Error fetching prediction stats:", error);
        }
      }
    };

    const fetchPredictions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/predictions`,
          { withCredentials: true }
        );
        const data = response.data;
        // Ensure that predictions is an array before setting state
        setPredictions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setPredictions([]);
      }
    };

    const fetchFeatureImportance = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/feature_importance`,
          { withCredentials: true }
        );
        setFeatureImportance(response.data);
      } catch (error) {
        console.error("Error fetching feature importance:", error);
      }
    };

    fetchModelMetrics();
    fetchPredictionStats();
    fetchPredictions();
    fetchFeatureImportance();
  }, [navigate]);

  // Append new data point every second, keep max 20 points
  useEffect(() => {
    const interval = setInterval(() => {
      setTrendLabels((prev) => {
        // Use 'en-GB' locale for 24-hour time format
        const newLabel = new Date().toLocaleTimeString("en-GB");
        const updated = [...prev, newLabel];
        return updated.length > 20 ? updated.slice(1) : updated;
      });
      setTrendData((prev) => {
        const newValue = Math.random() < 0.5 ? 0 : 1; // Randomly choose 0 or 1
        const updated = [...prev, newValue];
        return updated.length > 20 ? updated.slice(1) : updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const barData = {
    labels: Object.keys(modelMetrics),
    datasets: [
      {
        label: "Accuracy",
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(75,192,192,0.4)",
        hoverBorderColor: "rgba(75,192,192,1)",
        data: Object.values(modelMetrics).map((metric: any) => metric.Accuracy),
      },
    ],
  };

  const pieData = {
    labels: ["Diabetic", "Non-Diabetic"],
    datasets: [
      {
        data: [
          predictionStats.diabetic_predictions,
          predictionStats.non_diabetic_predictions,
        ],
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  // Add a helper function to format timestamps to "dd/mm/yyyy"
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const lineData = {
    // Use formatted date for each prediction
    labels: predictions.map((p: any) => formatDate(p.timestamp)),
    datasets: [
      {
        label: "Predictions Over Time",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: predictions.map((p: any) =>
          p.prediction === "Diabetic" ? 1 : 0
        ),
      },
    ],
  };

  const radarData = {
    labels: Object.keys(featureImportance),
    datasets: Object.keys(featureImportance).map((modelName) => ({
      label: modelName,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "rgba(75,192,192,1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(75,192,192,1)",
      data: featureImportance[modelName],
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8 dark-mode">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
        Visualizations
      </h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
          Model Accuracy
        </h2>
        <div className="chart-container">
          <Bar data={barData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
          Prediction Statistics
        </h2>
        <div className="chart-container">
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
          Predictions Over Time
        </h2>
        <div className="chart-container">
          <Line data={lineData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
          Feature Importance
        </h2>
        <div className="chart-container">
          <Radar data={radarData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="mt-8">
        <div
          className="chart-container bg-white dark:bg-gray-800 p-4 rounded shadow"
          style={{ height: "400px" }}
        >
          <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#fc466b] to-[#3f5efb]">
            Prediction Trend Chart
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            Last updated: {displayDateTime}
          </p>
          <Line
            data={{
              labels: trendLabels.length ? trendLabels : [displayDateTime],
              datasets: [
                {
                  label: "Diabetic (1) vs Not Diabetic (0)",
                  data: trendData.length ? trendData : [1, 0, 1, 0, 1],
                  fill: false,
                  borderColor: "rgb(75, 192, 192)",
                  tension: 0.1,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: { ticks: { autoSkip: true, maxTicksLimit: 10 } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
