// src/pages/MainPage.js
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MainPage.css";

// Constants
const MONTHS_IN_YEAR = 12;
const MONTH_DURATION = 5000; // 5 seconds per month (1 year = 60s)

const initialInvestments = {
  savings: { balance: 0, interest: 0.02 },
  fixedDeposit: [],
  bonds: [],
  indexFund: { profit: 0, shares: 0, price: 100 },
  stocks: {
    "LOL Materials": { profit: 0, shares: 0, price: 50 },
    "MP Technologies": { profit: 0, shares: 0, price: 80 },
    "Pretty Things": { profit: 0, shares: 0, price: 30 },
    "Yummy Foods": { profit: 0, shares: 0, price: 20 },
  },
  crop: { shares: 0, price: 10 },
  gold: { shares: 0, price: 70 },
};

function MainPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState(state?.playerName || "Player");
  const [durationMinutes, setDurationMinutes] = useState(state?.duration || 5);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(1);
  const [cash, setCash] = useState(10000);
  const [investments, setInvestments] = useState(initialInvestments);
  const [investmentHistory, setInvestmentHistory] = useState([]);
  const [netWorth, setNetWorth] = useState(0);


  const intervalRef = useRef();

  // -------------------------------
  // Simulate Time
  // -------------------------------
   useEffect(() => {
    intervalRef.current = setInterval(() => {
      setMonth((prev) => {
        if (prev === MONTHS_IN_YEAR - 1) {
          setYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      });

      // compute current game time in months
      // you can get month and year latest values inside interval via functional updates or refs
      // but here for simplicity, use setTimeout trick or use a functional state update for investmentHistory

      // Instead of referencing month/year directly (which may be stale), use functional update:
      setInvestmentHistory((prev) => {
        // Get current month and year from latest state inside functional update is tricky,
        // so better keep track of month and year in refs or merge this inside month state updater
        // For demo, let's just assume you can access them here (somewhat inaccurate):
        
        // Alternative: Use useEffect triggered by month/year to add history snapshot

        // To simplify and avoid stale closure problem, I recommend:
        // 1) Remove history update here.
        // 2) Add separate useEffect watching month/year to add snapshot.

        return prev; // temporary no-op here
      });
    }, MONTH_DURATION);

    return () => clearInterval(intervalRef.current);
  }, []);  // empty array, so interval set once

  // Add this useEffect to add history snapshot after month/year updates
  useEffect(() => {
    const gameTime = (year - 1) * MONTHS_IN_YEAR + (month + 1);
    setInvestmentHistory((prev) => [
      ...prev,
      {
        time: gameTime,
        netWorth,
        cash,
        investments: { ...investments },
      },
    ]);
  }, [month, year, netWorth, cash, investments]);

  // -------------------------------
  // Update prices & add cash every 6 months
  // -------------------------------
  useEffect(() => {
    if (month % 6 === 0) {
      setCash((prev) => prev + 1000);
    }

    setInvestments((prev) => {
      const newStocks = Object.fromEntries(
        Object.entries(prev.stocks).map(([name, stock]) => [
          name,
          {
            ...stock,
            price: Math.max(1, +(stock.price * (0.9 + Math.random() * 0.2)).toFixed(2)),
          },
        ])
      );

      return {
        ...prev,
        stocks: newStocks,
        indexFund: {
          ...prev.indexFund,
          price: Math.max(1, +(prev.indexFund.price * (0.95 + Math.random() * 0.1)).toFixed(2)),
        },
        crop: {
          ...prev.crop,
          price: Math.max(1, +(prev.crop.price * (0.95 + Math.random() * 0.1)).toFixed(2)),
        },
        gold: {
          ...prev.gold,
          price: Math.max(1, +(prev.gold.price * (0.95 + Math.random() * 0.1)).toFixed(2)),
        },
      };
    });
  }, [month]);

  // -------------------------------
  // Net Worth Calculation
  // -------------------------------
  useEffect(() => {
    let total = cash;

    // Savings + interest
    total += investments.savings.balance;

    // Index fund value
    total += investments.indexFund.shares * investments.indexFund.price;

    // Stocks
    for (const stock of Object.values(investments.stocks)) {
      total += stock.shares * stock.price;
    }

    // Crop & Gold
    total += investments.crop.shares * investments.crop.price;
    total += investments.gold.shares * investments.gold.price;

    setNetWorth(Math.round(total));
  }, [cash, investments]);

  // -------------------------------
  // Buy / Sell logic
  // -------------------------------
  const buyItem = (type, name = null) => {
    const inv = { ...investments };
    let price = 0;

    if (type === "stocks") {
      price = inv.stocks[name].price;
      if (cash >= price) {
        inv.stocks[name].shares += 1;
        setCash(cash - price);
      }
    } else {
      price = inv[type].price;
      if (cash >= price) {
        inv[type].shares += 1;
        setCash(cash - price);
      }
    }

    setInvestments(inv);
  };

  const sellItem = (type, name = null) => {
    const inv = { ...investments };
    let price = 0;

    if (type === "stocks") {
      if (inv.stocks[name].shares > 0) {
        price = inv.stocks[name].price;
        inv.stocks[name].shares -= 1;
        setCash(cash + price);
      }
    } else {
      if (inv[type].shares > 0) {
        price = inv[type].price;
        inv[type].shares -= 1;
        setCash(cash + price);
      }
    }

    setInvestments(inv);
  };

  // -------------------------------
  // Game End
  // -------------------------------
  useEffect(() => {
    if (year > durationMinutes) {
      const results = {
        netWorth,
        cash,
        investments,
        history: investmentHistory,
      };
      navigate("/results", { state: results });
    }
  }, [year, durationMinutes, netWorth, cash, investments, investmentHistory, navigate]);

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="main-game">
      <header>
        <h2>🏦 Welcome, {playerName}</h2>
        <p>
          Year: {year} / {durationMinutes} &nbsp;|&nbsp; Month: {month + 1}/12
        </p>
        <p>💵 Cash: ${cash.toFixed(2)} | 📊 Net Worth: ${netWorth.toFixed(2)}</p>
      </header>

      <section className="investments">
        <h3>📈 Stocks</h3>
        {Object.entries(investments.stocks).map(([name, stock]) => (
          <div key={name} className="investment-card">
            <strong>{name}</strong>
            <p>💲Price: ${stock.price}</p>
            <p>📦 Shares: {stock.shares}</p>
            <button onClick={() => buyItem("stocks", name)}>Buy</button>
            <button onClick={() => sellItem("stocks", name)}>Sell</button>
          </div>
        ))}

        <h3>📊 Index Fund</h3>
        <div className="investment-card">
          <p>💲Price: ${investments.indexFund.price}</p>
          <p>📦 Shares: {investments.indexFund.shares}</p>
          <button onClick={() => buyItem("indexFund")}>Buy</button>
          <button onClick={() => sellItem("indexFund")}>Sell</button>
        </div>

        <h3>🌽 Crop</h3>
        <div className="investment-card">
          <p>💲Price: ${investments.crop.price}</p>
          <p>📦 Shares: {investments.crop.shares}</p>
          <button onClick={() => buyItem("crop")}>Buy</button>
          <button onClick={() => sellItem("crop")}>Sell</button>
        </div>

        <h3>🥇 Gold</h3>
        <div className="investment-card">
          <p>💲Price: ${investments.gold.price}</p>
          <p>📦 Shares: {investments.gold.shares}</p>
          <button onClick={() => buyItem("gold")}>Buy</button>
          <button onClick={() => sellItem("gold")}>Sell</button>
        </div>
      </section>
    </div>
  );
}

export default MainPage;
