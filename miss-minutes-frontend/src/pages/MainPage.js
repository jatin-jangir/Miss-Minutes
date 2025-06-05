// src/pages/MainPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MainPage.css';
import ResultsPage from './ResultsPage'; // Adjust the path if different
const MainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playerName = 'Player', duration = 10 } = location.state || {};

  // Game State Management
  const [gameTime, setGameTime] = useState(0);
  const [currentYear, setCurrentYear] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [isGameActive, setIsGameActive] = useState(true);
  const [aiScore, setAiScore] = useState(10000);
  const [yearlyPerformance, setYearlyPerformance] = useState([]);

  // Financial State
  const [pocketCash, setPocketCash] = useState(10000);
  const [investments, setInvestments] = useState({
    stocks: { shares: 0, avgPrice: 0, totalInvested: 0 },
    index: { shares: 0, avgPrice: 0, totalInvested: 0 },
    fixedDeposit: { amount: 0, maturityMonth: null, interestRate: 0.08, totalInvested: 0 },
    savings: { amount: 0, interestRate: 0.03, totalInvested: 0 },
    bonds: { amount: 0, maturityMonth: null, interestRate: 0.06, totalInvested: 0 },
    crops: { units: 0, avgPrice: 0, totalInvested: 0 },
    gold: { units: 0, avgPrice: 0, totalInvested: 0 }
  });

  // Market Data
  const [marketPrices, setMarketPrices] = useState({
    stocks: 100,
    index: 150,
    crops: 50,
    gold: 2000
  });

  const [interestRates, setInterestRates] = useState({
    fixedDeposit: 0.08,
    savings: 0.03,
    bonds: 0.06
  });

  const [priceHistory, setPriceHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [actionType, setActionType] = useState('buy');
  const [actionAmount, setActionAmount] = useState('');
  let transactionCounter = 0;
  const generateUniqueId = () => `${Date.now()}-${transactionCounter++}`;
  const [lockPeriod, setLockPeriod] = useState(12);

  // Calculate total months since game start
  const totalMonths = Math.floor(gameTime / 5);

  // Timer calculations
  const totalGameTimeSeconds = duration * 60;
  const gameProgressPercentage = (gameTime / totalGameTimeSeconds) * 100;
  const yearProgressPercentage = ((currentMonth - 1) / 12) * 100;
  const monthProgressInSeconds = gameTime % 5;
  
  // Net Worth Calculation
  const calculateNetWorth = useCallback(() => {
    let totalValue = pocketCash + investments.savings.amount;
    
    totalValue += investments.stocks.shares * marketPrices.stocks;
    totalValue += investments.index.shares * marketPrices.index;
    totalValue += investments.crops.units * marketPrices.crops;
    totalValue += investments.gold.units * marketPrices.gold;
    totalValue += investments.fixedDeposit.amount;
    totalValue += investments.bonds.amount;
    
    return Math.round(totalValue);
  }, [pocketCash, investments, marketPrices]);

  // AI Competitor Logic
  const updateAIScore = useCallback(() => {
    const randomReturn = 0.95 + Math.random() * 0.1; // -5% to +5% monthly
    setAiScore(prev => Math.round(prev * randomReturn));
  }, []);

  // Market Price Fluctuation
  const updateMarketPrices = useCallback(() => {
    setMarketPrices(prev => {
      const newPrices = {
        stocks: Math.max(20, prev.stocks * (0.9 + Math.random() * 0.2)),
        index: Math.max(50, prev.index * (0.95 + Math.random() * 0.1)),
        crops: Math.max(20, prev.crops * (0.85 + Math.random() * 0.3)),
        gold: Math.max(1500, prev.gold * (0.98 + Math.random() * 0.04))
      };
      
      // Update price history for charts
      setPriceHistory(prev => {
        const newHistory = [...prev, {
          month: totalMonths,
          ...newPrices,
          netWorth: calculateNetWorth()
        }];
        return newHistory.slice(-24); // Keep last 24 months
      });
      
      return newPrices;
    });

    // Update interest rates occasionally
    if (Math.random() < 0.3) {
      setInterestRates(prev => ({
        fixedDeposit: Math.max(0.04, Math.min(0.12, prev.fixedDeposit + (Math.random() - 0.5) * 0.01)),
        savings: Math.max(0.01, Math.min(0.05, prev.savings + (Math.random() - 0.5) * 0.005)),
        bonds: Math.max(0.03, Math.min(0.09, prev.bonds + (Math.random() - 0.5) * 0.008))
      }));
    }
  }, [totalMonths, calculateNetWorth]);

  // Add interest to savings and fixed deposits
  const addInterest = useCallback(() => {
    setInvestments(prev => {
      const newInvestments = { ...prev };
      
      // Savings interest (monthly)
      if (newInvestments.savings.amount > 0) {
        const monthlyRate = interestRates.savings / 12;
        newInvestments.savings.amount *= (1 + monthlyRate);
      }
      
      // FD interest (monthly compounding)
      if (newInvestments.fixedDeposit.amount > 0) {
        const monthlyRate = interestRates.fixedDeposit / 12;
        newInvestments.fixedDeposit.amount *= (1 + monthlyRate);
      }
      
      // Bonds interest (monthly compounding)
      if (newInvestments.bonds.amount > 0) {
        const monthlyRate = interestRates.bonds / 12;
        newInvestments.bonds.amount *= (1 + monthlyRate);
      }
      
      return newInvestments;
    });
  }, [interestRates]);

  useEffect(() => {
    if (!isGameActive) return;

    const gameInterval = setInterval(() => {
      setGameTime(prev => {
        const newTime = prev + 1;
        
        if (newTime >= duration * 60) {
          setIsGameActive(false);
          return prev;
        }

        const newTotalMonths = Math.floor(newTime / 5);
        const newYear = Math.floor(newTotalMonths / 12) + 1;
        const newMonth = (newTotalMonths % 12) + 1;
        
        setCurrentYear(newYear);
        setCurrentMonth(newMonth);

        // Monthly events (every 5 seconds)
        if (newTime % 5 === 0 && newTime > 0) {
          updateMarketPrices();
          addInterest();
          updateAIScore();
        }

        // Yearly performance tracking (every 60 seconds)
        if (newTime % (5 * 12) === 0) {
          setYearlyPerformance(prev => [...prev, {
            year: newYear,
            playerNetWorth: calculateNetWorth(),
            aiScore: aiScore
          }]);
        }

        // Bi-annual income (every 30 seconds)
        if (newTime % 30 === 0 && newTime > 0) {
          const baseIncome = 2000;
          const bonusIncome = Math.floor(Math.random() * 1000);
          const totalIncome = baseIncome + bonusIncome;
          
          setPocketCash(prev => prev + totalIncome);
          
          setTransactions(prev => [{
            id: generateUniqueId(),
            type: 'income',
            amount: totalIncome,
            description: 'Bi-annual Salary',
            timestamp: new Date().toLocaleTimeString(),
            year: newYear,
            month: newMonth
          }, ...prev.slice(0, 9)]);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(gameInterval);
  }, [isGameActive, duration, updateMarketPrices, addInterest, updateAIScore, calculateNetWorth]);


  // Investment Actions
  const handleInvestmentAction = () => {
    const amount = parseFloat(actionAmount);
    if (!amount || amount <= 0 || !selectedInvestment) return;

    const investment = selectedInvestment;
    let success = false;
    let transactionDescription = '';
    
    if (actionType === 'buy') {
      if (['stocks', 'index', 'crops', 'gold'].includes(investment)) {
        const price = marketPrices[investment];
        const units = amount / price;
        const totalCost = units * price;
        
        if (totalCost > pocketCash) {
          alert('Insufficient funds!');
          return;
        }
        
        setPocketCash(prev => prev - totalCost);
        setInvestments(prev => ({
          ...prev,
          [investment]: {
            ...prev[investment],
            shares: (prev[investment].shares || 0) + units,
            avgPrice: ((prev[investment].avgPrice * (prev[investment].shares || 0)) + totalCost) / 
                     ((prev[investment].shares || 0) + units),
            totalInvested: (prev[investment].totalInvested || 0) + totalCost
          }
        }));
        
        transactionDescription = `Bought ${units.toFixed(4)} ${investment} at $${price.toFixed(2)}`;
        success = true;
        
      } else if (investment === 'savings') {
        if (amount > pocketCash) {
          alert('Insufficient funds!');
          return;
        }
        
        setPocketCash(prev => prev - amount);
        setInvestments(prev => ({
          ...prev,
          savings: {
            ...prev.savings,
            amount: prev.savings.amount + amount,
            totalInvested: (prev.savings.totalInvested || 0) + amount
          }
        }));
        
        transactionDescription = `Deposited $${amount} to savings`;
        success = true;
        
      } else if (['fixedDeposit', 'bonds'].includes(investment)) {
        if (amount > pocketCash) {
          alert('Insufficient funds!');
          return;
        }
        
        const maturityMonth = totalMonths + lockPeriod;
        
        setPocketCash(prev => prev - amount);
        setInvestments(prev => ({
          ...prev,
          [investment]: {
            ...prev[investment],
            amount: prev[investment].amount + amount,
            maturityMonth: prev[investment].amount === 0 ? maturityMonth : prev[investment].maturityMonth,
            totalInvested: (prev[investment].totalInvested || 0) + amount
          }
        }));
        
        transactionDescription = `Invested $${amount} in ${investment} for ${lockPeriod} months`;
        success = true;
      }
      
    } else { // sell
      if (['stocks', 'index', 'crops', 'gold'].includes(investment)) {
        const currentUnits = investments[investment].shares || 0;
        const unitsToSell = amount / marketPrices[investment];
        
        if (unitsToSell > currentUnits) {
          alert('Insufficient holdings to sell!');
          return;
        }
        
        const saleValue = unitsToSell * marketPrices[investment];
        
        setPocketCash(prev => prev + saleValue);
        setInvestments(prev => ({
          ...prev,
          [investment]: {
            ...prev[investment],
            shares: prev[investment].shares - unitsToSell
          }
        }));
        
        transactionDescription = `Sold ${unitsToSell.toFixed(4)} ${investment} at $${marketPrices[investment].toFixed(2)}`;
        success = true;
        
      } else if (investment === 'savings') {
        const available = investments.savings.amount;
        const withdrawAmount = Math.min(amount, available);
        
        if (withdrawAmount === 0) {
          alert('No savings to withdraw!');
          return;
        }
        
        setPocketCash(prev => prev + withdrawAmount);
        setInvestments(prev => ({
          ...prev,
          savings: {
            ...prev.savings,
            amount: prev.savings.amount - withdrawAmount
          }
        }));
        
        transactionDescription = `Withdrew $${withdrawAmount.toFixed(2)} from savings`;
        success = true;
        
      } else if (['fixedDeposit', 'bonds'].includes(investment)) {
        const available = investments[investment].amount;
        const isMatured = totalMonths >= (investments[investment].maturityMonth || 0);
        
        if (available === 0) {
          alert('No investment to withdraw!');
          return;
        }
        
        let withdrawAmount = Math.min(amount, available);
        let penalty = 0;
        
        if (!isMatured) {
          penalty = withdrawAmount * 0.1;
          withdrawAmount = withdrawAmount - penalty;
          alert(`Early withdrawal penalty: $${penalty.toFixed(2)}`);
        }
        
        setPocketCash(prev => prev + withdrawAmount);
        setInvestments(prev => ({
          ...prev,
          [investment]: {
            ...prev[investment],
            amount: prev[investment].amount - Math.min(amount, available)
          }
        }));
        
        transactionDescription = `Withdrew $${withdrawAmount.toFixed(2)} from ${investment}${penalty > 0 ? ` (penalty: $${penalty.toFixed(2)})` : ''}`;
        success = true;
      }
    }
    
    if (success) {
      setTransactions(prev => [{
        id: generateUniqueId(),
        type: actionType,
        investment: investment,
        amount: amount,
        price: marketPrices[investment] || null,
        description: transactionDescription,
        timestamp: new Date().toLocaleTimeString(),
        year: currentYear,
        month: currentMonth
      }, ...prev.slice(0, 9)]);
      
      setActionAmount('');
    }
  };

  // Utility Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPerformanceColor = (current, previous) => {
    if (current > previous) return '#10B981';
    if (current < previous) return '#EF4444';
    return '#94A3B8';
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const investmentOptions = [
    { 
      id: 'stocks', 
      name: 'Stocks', 
      icon: '📈', 
      price: marketPrices.stocks, 
      unit: 'share',
      type: 'market',
      owned: investments.stocks.shares,
      value: investments.stocks.shares * marketPrices.stocks
    },
    { 
      id: 'index', 
      name: 'Index Fund', 
      icon: '📊', 
      price: marketPrices.index, 
      unit: 'share',
      type: 'market',
      owned: investments.index.shares,
      value: investments.index.shares * marketPrices.index
    },
    { 
      id: 'fixedDeposit', 
      name: 'Fixed Deposit', 
      icon: '🏦', 
      price: null, 
      unit: 'amount',
      type: 'fixed',
      rate: interestRates.fixedDeposit,
      owned: investments.fixedDeposit.amount,
      value: investments.fixedDeposit.amount,
      maturity: investments.fixedDeposit.maturityMonth
    },
    { 
      id: 'savings', 
      name: 'Savings', 
      icon: '💰', 
      price: null, 
      unit: 'amount',
      type: 'liquid',
      rate: interestRates.savings,
      owned: investments.savings.amount,
      value: investments.savings.amount
    },
    { 
      id: 'bonds', 
      name: 'Gov Bonds', 
      icon: '📜', 
      price: null, 
      unit: 'amount',
      type: 'fixed',
      rate: interestRates.bonds,
      owned: investments.bonds.amount,
      value: investments.bonds.amount,
      maturity: investments.bonds.maturityMonth
    },
    { 
      id: 'crops', 
      name: 'Crops', 
      icon: '🌾', 
      price: marketPrices.crops, 
      unit: 'unit',
      type: 'market',
      owned: investments.crops.units,
      value: investments.crops.units * marketPrices.crops
    },
    { 
      id: 'gold', 
      name: 'Gold', 
      icon: '🥇', 
      price: marketPrices.gold, 
      unit: 'oz',
      type: 'market',
      owned: investments.gold.units,
      value: investments.gold.units * marketPrices.gold
    }
  ];

  // Game Over Screen
  useEffect(() => {
    if (!isGameActive && gameTime >= duration * 60) {
      navigate("/results", {
        state: {
          finalNetWorth: calculateNetWorth(),
          aiScore,
          yearlyPerformance,
          portfolioHistory: priceHistory,
          transactions,
          marketData: marketPrices,
          investments,
          duration,
          playerName
        }
      });
    }
    // eslint-disable-next-line
  }, [isGameActive, gameTime]);

  return (
    <div className="main-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⏰</span>
            <span className="logo-text">Miss Minutes</span>
          </div>
        </div>
        
        <div className="nav-menu">
          <div className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Dashboard</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Portfolio</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">📈</span>
            <span className="nav-text">Analytics</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">💳</span>
            <span className="nav-text">Transactions</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Investment Game</p>
          </div>
          
          <div className="header-center">
            <div className="enhanced-timer">
                {/* Main Timer Display */}
                <div className="timer-main">
                  <div className="timer-icon">⏱️</div>
                  <div className="timer-content">
                    <div className="timer-primary">
                      <span className="current-time">{formatTime(gameTime)}</span>
                      <span className="time-separator">/</span>
                      <span className="total-time">{formatTime(totalGameTimeSeconds)}</span>
                    </div>
                  </div>
                </div>
              

              {/* Progress Bars Container */}
              <div className="progress-container">
                {/* Overall Game Progress */}
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Game Progress</span>
                    <span className="progress-value">{gameProgressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar game-progress">
                      <div 
                        className="progress-fill"
                        style={{ width: `${gameProgressPercentage}%` }}
                      >
                        <div className="progress-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Year Progress */}
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Year {currentYear} - {getMonthName(currentMonth)}</span>
                    <span className="progress-value">{yearProgressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar year-progress">
                      <div 
                        className="progress-fill"
                        style={{ width: `${yearProgressPercentage}%` }}
                      >
                        <div className="progress-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>

              
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">👤</div>
              <div className="user-info">
                <h4>{playerName}</h4>
                <p>Investor</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Summary Cards */}
          <div className="summary-section">
            <div className="summary-card primary">
              <div className="card-header">
                <h3>Pocket Cash</h3>
                <div className="card-icon">💵</div>
              </div>
              <div className="card-value">{formatCurrency(pocketCash)}</div>
              <div className="card-label">Available Balance</div>
            </div>
            
            <div className="summary-card secondary">
              <div className="card-header">
                <h3>Total Investment</h3>
                <div className="card-icon">📈</div>
              </div>
              <div className="card-value">{formatCurrency(calculateNetWorth() - pocketCash)}</div>
              <div className="card-label">Portfolio Value</div>
            </div>
            
            <div className="summary-card tertiary">
              <div className="card-header">
                <h3>Net Worth</h3>
                <div className="card-icon">💎</div>
              </div>
              <div className="card-value">{formatCurrency(calculateNetWorth())}</div>
              <div className="card-label">Total Value</div>
            </div>

            <div className="summary-card ai-score">
              <div className="card-header">
                <h3>AI Competitor</h3>
                <div className="card-icon">🤖</div>
              </div>
              <div className="card-value">{formatCurrency(aiScore)}</div>
              <div className="card-label">
                {calculateNetWorth() > aiScore ? 'You\'re Winning!' : 'You\'re Behind'}
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="dashboard-grid">
            {/* Investment Options */}
            <div className="panel investment-panel">
              <div className="panel-header">
                <h3>Investment Options</h3>
                <div className="panel-actions">
                  <button className={`action-btn ${actionType === 'buy' ? 'active' : ''}`}
                          onClick={() => setActionType('buy')}>
                    Buy
                  </button>
                  <button className={`action-btn ${actionType === 'sell' ? 'active' : ''}`}
                          onClick={() => setActionType('sell')}>
                    Sell
                  </button>
                </div>
              </div>
              
              <div className="investment-grid">
                {investmentOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`investment-card ${selectedInvestment === option.id ? 'selected' : ''}`}
                    onClick={() => setSelectedInvestment(option.id)}
                  >
                    <div className="card-top">
                      <div className="investment-icon">{option.icon}</div>
                      <h4>{option.name}</h4>
                    </div>
                    
                    {option.price && (
                      <div className="investment-price">
                        {formatCurrency(option.price)}
                        <span className="price-change">
                          {priceHistory.length > 1 && (
                            <span style={{color: getPerformanceColor(
                              option.price, 
                              priceHistory[priceHistory.length - 2]?.[option.id] || option.price
                            )}}>
                              {option.price > (priceHistory[priceHistory.length - 2]?.[option.id] || 0) ? '↗' : '↘'}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    {option.rate && (
                      <div className="investment-rate">
                        {(option.rate * 100).toFixed(2)}% APR
                        {option.maturity && totalMonths < option.maturity && (
                          <span className="maturity-info">
                            Matures in {option.maturity - totalMonths} months
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="investment-owned">
                      <span>Owned: {option.type === 'market' ? option.owned.toFixed(4) : formatCurrency(option.owned)}</span>
                      <span>Value: {formatCurrency(option.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Panel */}
              {selectedInvestment && (
                <div className="action-panel">
                  <div className="action-header">
                    <h4>
                      {actionType === 'buy' ? 'Buy' : 'Sell'} {' '}
                      {investmentOptions.find(opt => opt.id === selectedInvestment)?.name}
                    </h4>
                  </div>
                  
                  <div className="action-form">
                    {['fixedDeposit', 'bonds'].includes(selectedInvestment) && actionType === 'buy' && (
                      <div className="lock-period-selector">
                        <label>Lock Period (months):</label>
                        <select value={lockPeriod} onChange={(e) => setLockPeriod(Number(e.target.value))}>
                          <option value={6}>6 months</option>
                          <option value={12}>12 months</option>
                          <option value={24}>24 months</option>
                          <option value={36}>36 months</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="amount-input-group">
                      <input
                        type="number"
                        placeholder="Enter amount ($)"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="amount-input"
                      />
                      <button 
                        onClick={handleInvestmentAction} 
                        className="execute-btn"
                        disabled={!actionAmount || parseFloat(actionAmount) <= 0}
                      >
                        {actionType === 'buy' ? 'Buy' : 'Sell'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Market Chart */}
            <div className="panel chart-panel">
              <div className="panel-header">
                <h3>Market Trends</h3>
              </div>
              <div className="chart-container">
                {priceHistory.length > 1 ? (
                  <canvas 
                    id="marketChart" 
                    width="400" 
                    height="250"
                    ref={(canvas) => {
                      if (canvas && priceHistory.length > 1) {
                        const ctx = canvas.getContext('2d');
                        const { width, height } = canvas;
                        
                        ctx.clearRect(0, 0, width, height);
                        
                        const padding = 40;
                        const chartWidth = width - 2 * padding;
                        const chartHeight = height - 2 * padding;
                        
                        // Get data ranges
                        const allValues = priceHistory.flatMap(d => [d.stocks, d.index, d.gold, d.crops]);
                        const maxValue = Math.max(...allValues);
                        const minValue = Math.min(...allValues);
                        const valueRange = maxValue - minValue || 1;
                        
                        // Draw grid
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                        ctx.lineWidth = 1;
                        
                        for (let i = 0; i <= 5; i++) {
                          const y = padding + (i / 5) * chartHeight;
                          ctx.beginPath();
                          ctx.moveTo(padding, y);
                          ctx.lineTo(width - padding, y);
                          ctx.stroke();
                        }
                        
                        // Draw lines
                        const drawLine = (dataKey, color) => {
                          ctx.strokeStyle = color;
                          ctx.lineWidth = 2;
                          ctx.beginPath();
                          
                          priceHistory.forEach((point, index) => {
                            const x = padding + (index / (priceHistory.length - 1)) * chartWidth;
                            const y = padding + ((maxValue - point[dataKey]) / valueRange) * chartHeight;
                            
                            if (index === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                          });
                          
                          ctx.stroke();
                        };
                        
                        drawLine('stocks', '#4F46E5');
                        drawLine('index', '#7C3AED');
                        drawLine('gold', '#F59E0B');
                        drawLine('crops', '#10B981');
                        
                        // Legend
                        ctx.fillStyle = '#F8FAFC';
                        ctx.font = '12px Inter';
                        
                        const legendItems = [
                          { label: 'Stocks', color: '#4F46E5' },
                          { label: 'Index', color: '#7C3AED' },
                          { label: 'Gold', color: '#F59E0B' },
                          { label: 'Crops', color: '#10B981' }
                        ];
                        
                        legendItems.forEach((item, index) => {
                          const x = padding + index * 80;
                          const y = 20;
                          
                          ctx.fillStyle = item.color;
                          ctx.fillRect(x, y - 8, 12, 3);
                          
                          ctx.fillStyle = '#F8FAFC';
                          ctx.fillText(item.label, x + 16, y);
                        });
                      }
                    }}
                  />
                ) : (
                  <div className="chart-placeholder">
                    <p>Market data will appear after a few months...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="panel activities-panel">
              <div className="panel-header">
                <h3>Recent Activities</h3>
              </div>
              <div className="activities-list">
                {transactions.length === 0 ? (
                  <div className="no-activities">
                    <p>No transactions yet</p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="activity-item">
                      <div className="activity-icon">
                        {transaction.type === 'buy' ? '📈' : 
                         transaction.type === 'sell' ? '📉' : 
                         '💰'}
                      </div>
                      <div className="activity-details">
                        <h4>{transaction.description}</h4>
                        <p>
                          {transaction.timestamp} - Year {transaction.year}, Month {transaction.month}
                        </p>
                      </div>
                      <div className={`activity-amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'buy' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
