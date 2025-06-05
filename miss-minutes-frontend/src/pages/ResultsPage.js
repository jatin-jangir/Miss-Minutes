// src/pages/ResultsPage.js
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResultsPage.css";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure state from navigation
  const {
    finalNetWorth = 0,
    aiScore = 0,
    yearlyPerformance = [],
    portfolioHistory = [],
    transactions = [],
    marketData = {},
    investments = {},
    duration = 5,
    playerName = "Player",
  } = location.state || {};

  // Investment performance analysis
  const investmentPerformance = Object.entries(investments).map(([key, value]) => {
    let currentValue = 0;
    if (["stocks", "index", "crops", "gold"].includes(key)) {
      currentValue = (value.shares || value.units || 0) * (marketData[key] || 0);
    } else {
      currentValue = value.amount || 0;
    }
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      invested: value.totalInvested || 0,
      currentValue,
      return: currentValue - (value.totalInvested || 0),
      roi: value.totalInvested ? ((currentValue - value.totalInvested) / value.totalInvested) * 100 : 0,
    };
  });

  // Draw a simple performance chart
  const perfCanvasRef = useRef(null);
  useEffect(() => {
    if (!perfCanvasRef.current || !portfolioHistory.length) return;
    const canvas = perfCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width,
      height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const allValues = portfolioHistory.flatMap((d) => [d.netWorth, d.aiScore]);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    const valueRange = maxValue - minValue || 1;

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Player line
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.beginPath();
    portfolioHistory.forEach((point, idx) => {
      const x = padding + (idx / (portfolioHistory.length - 1)) * chartWidth;
      const y = padding + ((maxValue - point.netWorth) / valueRange) * chartHeight;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // AI line
    ctx.strokeStyle = "#EF4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    portfolioHistory.forEach((point, idx) => {
      const x = padding + (idx / (portfolioHistory.length - 1)) * chartWidth;
      const y = padding + ((maxValue - point.aiScore) / valueRange) * chartHeight;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legend
    ctx.fillStyle = "#F8FAFC";
    ctx.font = "14px Inter";
    ctx.fillText("You", padding, 25);
    ctx.fillStyle = "#10B981";
    ctx.fillRect(padding - 20, 18, 15, 3);

    ctx.fillStyle = "#F8FAFC";
    ctx.fillText("AI", padding + 60, 25);
    ctx.fillStyle = "#EF4444";
    ctx.fillRect(padding + 40, 18, 15, 3);
  }, [portfolioHistory]);

  // Annual returns
  const annualReturns = yearlyPerformance.map((year, idx) => ({
    year: idx + 1,
    playerReturn: year.playerNetWorth - (portfolioHistory[idx * 12]?.netWorth || 10000),
    aiReturn: year.aiScore - (portfolioHistory[idx * 12]?.aiScore || 10000),
  }));

  // Render
  const playerWon = finalNetWorth > aiScore;
  const totalYears = Math.floor(duration);

  return (
    <div className="results-page">
      <div className="results-header">
        <div className="results-title">
          <h1>{playerWon ? "🏆 Victory!" : "💸 Game Over"}</h1>
          <p>
            {playerWon
              ? "You beat the AI! Excellent investment strategy!"
              : "The AI performed better this time. Try again!"}
          </p>
        </div>
        <button onClick={() => navigate("/")} className="home-btn">
          🏠 Play Again
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card primary">
          <div className="card-header">
            <h3>Final Net Worth</h3>
            <div className="card-icon">💰</div>
          </div>
          <div className="card-value">{formatCurrency(finalNetWorth)}</div>
          <div className="comparison">
            vs AI: {formatCurrency(finalNetWorth - aiScore)} (
            {aiScore ? ((finalNetWorth / aiScore - 1) * 100).toFixed(1) : "0"}%)
          </div>
        </div>
        <div className="summary-card secondary">
          <div className="card-header">
            <h3>Total Duration</h3>
            <div className="card-icon">⏱️</div>
          </div>
          <div className="card-value">
            {totalYears} Year{totalYears !== 1 ? "s" : ""}
          </div>
          <div className="card-subtext">{duration} minutes of gameplay</div>
        </div>
        <div className="summary-card tertiary">
          <div className="card-header">
            <h3>Transactions</h3>
            <div className="card-icon">📊</div>
          </div>
          <div className="card-value">{transactions.length}</div>
          <div className="card-subtext">
            {(transactions.length / (totalYears * 12)).toFixed(1)} per month
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <div className="chart-container">
          <h3>Performance Over Time</h3>
          <canvas ref={perfCanvasRef} width={600} height={300}></canvas>
        </div>
        <div className="investment-breakdown">
          <h3>Investment Performance</h3>
          <div className="investment-grid">
            {investmentPerformance.map((inv, i) => (
              <div key={inv.name} className="investment-card">
                <h4>{inv.name}</h4>
                <div className="metrics">
                  <div className="metric">
                    <span>Invested:</span>
                    <span>{formatCurrency(inv.invested)}</span>
                  </div>
                  <div className="metric">
                    <span>Current:</span>
                    <span>{formatCurrency(inv.currentValue)}</span>
                  </div>
                  <div className={`metric ${inv.return >= 0 ? "positive" : "negative"}`}>
                    <span>ROI:</span>
                    <span>{inv.roi.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="detailed-analysis">
        <h2>Yearly Performance</h2>
        <div className="annual-returns">
          {annualReturns.map((yr, i) => (
            <div key={yr.year} className="year-card">
              <h4>Year {yr.year}</h4>
              <div className={`return ${yr.playerReturn > 0 ? "positive" : "negative"}`}>
                You: {formatCurrency(yr.playerReturn)}
              </div>
              <div className={`return ${yr.aiReturn > 0 ? "positive" : "negative"}`}>
                AI: {formatCurrency(yr.aiReturn)}
              </div>
              <div className="difference">
                Difference: {formatCurrency(yr.playerReturn - yr.aiReturn)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="transaction-history">
        <h3>Major Transactions</h3>
        <div className="timeline">
          {transactions
            .filter((t) => t.amount > 1000)
            .slice(0, 10)
            .map((t, i) => (
              <div key={t.id || i} className="event">
                <div className="event-date">
                  Year {t.year}, Month {t.month}
                </div>
                <div className="event-description">{t.description}</div>
                <div className={`event-amount ${t.type}`}>
                  {t.type === "income" ? "+" : t.type === "buy" ? "-" : "+"}
                  {formatCurrency(t.amount)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
