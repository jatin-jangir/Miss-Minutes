// src/pages/StartPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StartPage.css";
import LoadingScreen from "../components/LoadingScreen";

function StartPage() {
  const [playerName, setPlayerName] = useState("");
  const [duration, setDuration] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  // Simulate loading for aesthetic effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 300);
    }, 1250);
    return () => clearTimeout(timer);
  }, []);

  const startGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    navigate("/main", { state: { playerName: playerName.trim(), duration } });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`start-page ${showContent ? "fade-in" : ""}`}>
      {/* Background floating shapes for aesthetic */}
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Main container */}
      <div className="container">
        {/* Header with logo and title */}
        <header className="game-header">
          <div className="logo-section">
            <div className="logo-icon">⏰</div>
            <h1 className="game-title">Miss Minutes</h1>
            <p className="game-subtitle">Master the Art of Financial Strategy</p>
          </div>
        </header>

        {/* Content divided into two sections */}
        <div className="start-content">
          {/* Left: Form and AI challenge */}
          <div className="left-section">
            <div className="form-container">
              <h2>Start Your Journey</h2>
              {/* Player Name Input */}
              <div className="input-group">
                <label htmlFor="playerName">Player Name</label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              {/* Duration Selector */}
              <div className="input-group">
                <label htmlFor="duration">Game Duration</label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  <option value={5}>5 minutes - Quick Challenge</option>
                  <option value={10}>10 minutes - Standard Game</option>
                  <option value={20}>20 minutes - Expert Mode</option>
                </select>
              </div>
              {/* AI Challenger Badge */}
              <div className="ai-competitor-section">
                <div className="ai-badge">
                  <span className="ai-icon">🤖</span>
                  <div>
                    <h4>AI Competitor</h4>
                    <p>Challenge our advanced AI to test your skills</p>
                  </div>
                </div>
              </div>
              {/* Start Button */}
              <button className="start-button" onClick={startGame}>
                <span>Start Game</span>
                <div className="button-glow"></div>
              </button>
            </div>
          </div>
          {/* Right: Investment options and rules */}
          <div className="right-section">
            
            {/* Game Rules */}
            <div className="rules-section">
              <h3>📜 Game Rules</h3>
              <ul>
                <li>Each minute equals one game year (12 months)</li>
                <li>Receive cash income every 6 months</li>
                <li>Market prices fluctuate monthly</li>
                <li>Earn interest on savings and fixed deposits</li>
                <li>Early withdrawal penalties apply</li>
                <li>Beat the AI to win the challenge</li>
              </ul>
            </div>
            {/* Investment Options */}
            <div className="rules-section">
                    
               <h3>Investment Options</h3>
              <ul>
                <li>📈 Stocks: "High risk, high reward"</li>
                <li>🏦 Fixed Deposits "Stable returns"</li>
                <li>💰 Savings Account "Safe and liquid"</li>
                <li>🌾 Crops Agricultural investments"</li>
                <li>📊 Index Funds "Diversified portfolio"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
