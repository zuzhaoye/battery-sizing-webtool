import React, { useState, useEffect } from 'react';
import ContourChart from './ContourChart';
import NPVComparisonChart from './NPVComparisonChart';
import ProfileCharts from './ProfileCharts';
import { BESSOptimization } from '../utils/BESSOptimization';

const capacityIntervals = 5
const powerIntervals = 5
const totalCombinations = capacityIntervals * powerIntervals;

const Calculator = ({ loadData, energyChargeData, inputs, ranges }) => {
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bestCombination, setBestCombination] = useState(null);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [error, setError] = useState(null);

  // Function to generate initial data
  const generateInitialData = () => {
    const initialData = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        initialData.push({
          capacity: i,
          power: j,
          sum: 0
        });
      }
    }
    return initialData;
  };

  // Set initial data on component mount
  useEffect(() => {
    setResults(generateInitialData());
  }, []);

  const calculateCombinations = async () => {
    setIsCalculating(true);
    setProgress(0);
    setResults([]);
    setCalculationComplete(false);
    setError(null);
    setBestCombination(null); // Clear previous best combination

    const batteryCapacity = ranges.find(range => range.name === 'Battery Capacity');
    const maxPower = ranges.find(range => range.name === 'Power Limit');

    if (!batteryCapacity || !maxPower) {
      setError('Battery Capacity or Power Limit range not found');
      setIsCalculating(false);
      return;
    }

    const capacityStep = (batteryCapacity.max - batteryCapacity.min) / (capacityIntervals - 1);
    const powerStep = (maxPower.max - maxPower.min) / (powerIntervals - 1);

    const capacityValues = Array.from({ length: capacityIntervals }, (_, i) => batteryCapacity.min + i * capacityStep);
    const powerValues = Array.from({ length: powerIntervals }, (_, i) => maxPower.min + i * powerStep);

    let bestCombination = null;
    const newResults = [];

    const calculateCombination = async (capacity, power) => {
      try {
        const result = await BESSOptimization({ capacity, power, loadData, energyChargeData, inputs });
        newResults.push(result);

        if (!bestCombination || result.npv < bestCombination.npv) {
          bestCombination = result;
        }

        setProgress((newResults.length / totalCombinations) * 100);
        setResults(prevResults => [...prevResults, result]); // Update results incrementally
      } catch (err) {
        console.error('Error in optimization:', err);
        setError(`Error in optimization: ${err.message}`);
      }
    };

    for (let i = 0; i < capacityValues.length; i++) {
      for (let j = 0; j < powerValues.length; j++) {
        await calculateCombination(capacityValues[i], powerValues[j]);
      }
    }

    setIsCalculating(false);
    setCalculationComplete(true);
    setBestCombination(bestCombination);
  };

  return (
    <div style={{ margin: '20px 0', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
      <h3>Calculation Results</h3>
      <button 
        onClick={calculateCombinations} 
        disabled={isCalculating}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isCalculating ? '#cccccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isCalculating ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {isCalculating ? 'Calculating...' : 'Start Calculation'}
      </button>
      
      {/* Add this block to display the error message */}
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: '#4CAF50',
              height: '20px',
              borderRadius: '5px',
              transition: 'width 0.5s'
            }}
          ></div>
        </div>
        <p>Progress: {progress.toFixed(2)}%</p>
      </div>
      {calculationComplete && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Contour Chart</h4>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              This chart shows the lifetime costs for different combinations of battery energy capacity
              and power limit. Darker colors indicate lower cost values. The red circle highlights the best combination.
            </p>
            <ContourChart data={results} isCalculating={isCalculating} bestCombination={bestCombination} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Cost Comparison Over Time</h4>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              This chart compares the cost over time for two scenarios:
              with and without a battery storage system. A lower curve indicates a more financially beneficial scenario.
            </p>
            {bestCombination && (
              <p style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>
                Recommended: Capacity {bestCombination.capacity.toFixed(2)} kWh, Power {bestCombination.power.toFixed(2)} kW
              </p>
            )}
            <NPVComparisonChart bestCombination={bestCombination} />
          </div>
          {bestCombination && (
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Load and Battery SoC Profiles</h4>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                These charts show the comparison between the original and new load profiles, 
                as well as the battery energy and state of charge profiles over a 24-hour period.
              </p>
              <ProfileCharts 
                originalLoad={loadData.map(item => item.y)}
                newLoad={bestCombination.newLoad}
                energyProfile={bestCombination.energyProfile}
                SoCProfile={bestCombination.SoCProfile}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default Calculator;
