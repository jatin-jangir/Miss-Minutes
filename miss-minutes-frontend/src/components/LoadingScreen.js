// src/components/LoadingScreen.js
import React, { useState, useEffect } from "react";
import "./LoadingScreen.css";

function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    "Initializing market data...",
    "Loading investment algorithms...",
    "Preparing AI competitor...",
    "Setting up your portfolio...",
    "Ready to invest!"
  ];

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const messageTimer = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="logo-animation">
          <div className="coin-stack">
            <div className="coin coin-1">💰</div>
            <div className="coin coin-2">💰</div>
            <div className="coin coin-3">💰</div>
          </div>
        </div>
        
        <h2 className="loading-title">Miss Minutes</h2>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
        
        <p className="loading-message">{messages[currentMessage]}</p>
        
        <div className="floating-particles">
          <div className="particle particle-1">$</div>
          <div className="particle particle-2">€</div>
          <div className="particle particle-3">£</div>
          <div className="particle particle-4">¥</div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
