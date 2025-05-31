import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./ResultsPage.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ResultsPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div>
        <h2>No game data found.</h2>
        <button onClick={() => navigate("/start")}>Go to Start</button>
      </div>
    );
  }

  const { netWorth = 0, cash = 0, investments = {} } = state;

  console.log("investments:", investments); // Debug output

  const labels = Object.keys(investments);
  const values = labels.map((key) => Number(investments[key] || 0));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Investment Distribution",
        data: values,
        backgroundColor: [
          "#1976d2", "#f44336", "#4caf50", "#ff9800", "#9c27b0", "#00bcd4", "#8bc34a"
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="results-page">
      <h1>Game Results</h1>
      <p><strong>Final Net Worth:</strong> ₹{netWorth}</p>
      <p><strong>Final Cash:</strong> ₹{cash}</p>

      <div className="chart-section">
        <Bar data={chartData} options={options} />
      </div>

      <button onClick={() => navigate("/start")}>Play Again</button>
    </div>
  );
};

export default ResultsPage;
