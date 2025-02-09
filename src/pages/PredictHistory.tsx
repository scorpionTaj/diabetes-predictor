"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

// Updated helper function to select color based on confidence percentage from 0-100
const getConfidenceColor = (probability: number) => {
  const perc = probability * 100;
  if (perc < 20) return "text-red-500";
  else if (perc < 40) return "text-orange-500";
  else if (perc < 60) return "text-yellow-500";
  else if (perc < 80) return "text-green-400";
  else return "text-green-500";
};

const PredictHistory: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [expandedPrediction, setExpandedPrediction] = useState<string | null>(
    null
  );

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/predictions`, {
        withCredentials: true,
      })
      .then((response) => {
        setPredictions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching predictions:", error);
      });
  }, []);

  const handleRowClick = (timestamp: string) => {
    setExpandedPrediction(expandedPrediction === timestamp ? null : timestamp);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
          Prediction History
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                  Date
                </th>
                <th className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                  Prediction
                </th>
                <th className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                  Model Used
                </th>
                <th className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction) => (
                <React.Fragment key={prediction.timestamp}>
                  <tr
                    onClick={() => handleRowClick(prediction.timestamp)}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-center dark:text-white"
                  >
                    <td className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                      {formatDate(prediction.timestamp)}
                    </td>
                    <td className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                      {prediction.prediction}
                    </td>
                    <td className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                      {prediction.model}
                    </td>
                    <td className="px-4 py-2 border-b dark:border-gray-600 dark:text-white">
                      {prediction.probability ? (
                        <span
                          className={getConfidenceColor(prediction.probability)}
                        >
                          {(prediction.probability * 100).toFixed(2)}%
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                  {expandedPrediction === prediction.timestamp && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                          <h2 className="text-xl font-bold mb-4">
                            Prediction Details
                          </h2>
                          <ul className="list-disc list-inside">
                            {Object.entries(prediction.inputs).map(
                              ([key, value]) => (
                                <li
                                  key={key}
                                  className="text-gray-700 dark:text-gray-300"
                                >
                                  <strong>{key}:</strong> {value}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictHistory;
