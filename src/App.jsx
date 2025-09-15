import { useState, useEffect, useMemo } from "react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { generateTestData } from "./testData";
import './App.css';


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  zoomPlugin
);

function App() {
  const [weight, setWeight] = useState("");
  const [data, setData] = useState(generateTestData());
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightInMeters, setHeightInMeters] = useState(null);

  // Load height from localStorage on component mount
  useEffect(() => {
    const savedHeight = localStorage.getItem('userHeight');
    if (savedHeight) {
      const { feet, inches } = JSON.parse(savedHeight);
      setHeightFeet(feet);
      setHeightInches(inches);
      setHeightInMeters(convertToMeters(feet, inches));
    }
  }, []);

  // Convert feet and inches to meters
  const convertToMeters = (feet, inches) => {
    const totalInches = (feet * 12) + inches;
    return totalInches * 0.0254; // 1 inch = 0.0254 meters
  };

  // Save height to localStorage and update meters
  const handleSaveHeight = () => {
    if (!heightFeet || !heightInches) return;
    
    const feet = parseInt(heightFeet);
    const inches = parseInt(heightInches);
    
    if (feet < 0 || inches < 0 || inches >= 12) {
      alert("Please enter valid height values (feet >= 0, inches 0-11)");
      return;
    }
    
    const meters = convertToMeters(feet, inches);
    setHeightInMeters(meters);
    
    // Save to localStorage
    localStorage.setItem('userHeight', JSON.stringify({ feet, inches }));
  };

  const handleLogWeight = () => {
    if (!weight) return;
    const newEntry = {
      date: new Date(),
      weight: parseFloat(weight),
    };
    setData([...data, newEntry]);
    setWeight("");
  };

  const latestWeight = data.length > 0 ? data[data.length - 1].weight : null;
  const bmi = latestWeight && heightInMeters ? (latestWeight / (heightInMeters * heightInMeters)).toFixed(1) : null;

  // Chart.js configuration - pass full dataset but show only last 4 points initially
  const chartData = useMemo(() => ({
    datasets: [{
      label: 'Weight (kg)',
      data: data.map(item => ({
        x: item.date,
        y: item.weight
      })),
      borderColor: '#17b76d',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: '#17b76d',
      pointBorderColor: '#1a1a1a',
      pointBorderWidth: 2,
      tension: 0.1,
      fill: true
    }]
  }), [data]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString();
          },
          label: (context) => {
            return `Weight: ${context.parsed.y} kg`;
          }
        }
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
        limits: {
          x: {
            min: data.length > 0 ? data[0].date : undefined,
            max: data.length > 0 ? data[data.length - 1].date : undefined
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            day: 'MMM dd',
            month: 'MMM yyyy'
          }
        },
        title: {
          display: false
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#888'
        },
        min: data.length > 4 ? data[data.length - 4].date : undefined,
        max: data.length > 0 ? data[data.length - 1].date : undefined
      },
      y: {
        title: {
          display: false
        },
        grid: {
          color: 'rgba(255,255,255,0.1)'
        },
        ticks: {
          color: '#888'
        }
      }
    }
  }), [data]);

  const getBmiClass = () => {
    if (!bmi) return '';
    if (bmi < 18.5) return 'bmi-underweight';
    if (bmi < 25) return 'bmi-normal';
    if (bmi < 30) return 'bmi-overweight';
    return 'bmi-obese';
  };

  return (
    <div className="app-container">
      {/* Header Section - Current Weight & BMI */}
      <div className="header-section">
        <div>
          <div className="current-weight">
            {latestWeight ? `${latestWeight}kg` : '--'}
          </div>
          <div className="weight-label">Current Weight</div>
        </div>
        {bmi && (
          <div>
            <div className={`bmi-value ${getBmiClass()}`}>
              {bmi}
            </div>
            <div className="bmi-label">BMI</div>
          </div>
        )}
      </div>

      {/* Height Input Section */}
      {!heightInMeters && (
        <div className="input-section">
          <div className="section-title">Set Your Height</div>
          <div className="height-inputs">
            <input
              type="number"
              placeholder="Feet"
              value={heightFeet}
              onChange={(e) => setHeightFeet(e.target.value)}
              className="height-input"
              min="0"
              max="8"
            />
            <span className="height-separator">'</span>
            <input
              type="number"
              placeholder="Inches"
              value={heightInches}
              onChange={(e) => setHeightInches(e.target.value)}
              className="height-input"
              min="0"
              max="11"
            />
            <span className="height-separator">"</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button onClick={handleSaveHeight} className="save-button">
              Save Height
            </button>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {data.length > 0 && (
        <div className="chart-section">
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Weight Input Section */}
      <div className="input-section">
        <div className="section-title">Log Weight</div>
        <div className="weight-inputs">
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="weight-input"
            step="0.1"
            min="0"
          />
          <button onClick={handleLogWeight} className="log-button">
            Log
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;