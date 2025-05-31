// src/pages/StartPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StartPage.css";

function StartPage() {
  const [playerName, setPlayerName] = useState("");
  const [duration, setDuration] = useState(5);
  const navigate = useNavigate();

  const startGame = () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    navigate("/main", { state: { playerName, duration } });
  };

  return (
    <div className="start-page">
      <h1>💰 Money Management Game</h1>
      <label>
        Name:
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </label>
      <label>
        Duration:
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={20}>20 minutes</option>
        </select>
      </label>

      <div className="rules">
        <h3>📜 Rules</h3>
        <ul>
          <li>Each minute = 1 game year (split into 12 months)</li>
          <li>Get cash every 6 months</li>
          <li>Invest in stocks, index fund, fixed deposits, savings, bonds, crop, gold</li>
          <li>Prices change every month</li>
          <li>Interest on savings, bonds, and FDs</li>
          <li>Penalty for early withdrawal from bonds/FDs</li>
          <li>You can only sell after buying</li>
        </ul>
      </div>

      <button onClick={startGame}>Start Game</button>
    </div>
  );
}

export default StartPage;
