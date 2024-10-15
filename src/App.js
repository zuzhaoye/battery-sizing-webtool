import React, { useState } from 'react';
import './App.css';
import LineChartComponent from './components/LineChart';
import Calculator from './components/Calculator';
import InputTable from './components/InputTable';
import StudyRangeTable from './components/StudyRangeTable';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function App() {
  const initialLoadData = [
    { x: 0, y: 12.81 },
    { x: 1, y: 10.1 },
    { x: 2, y: 12.1 },
    { x: 3, y: 12.64 },
    { x: 4, y: 15.95 },
    { x: 5, y: 13.18 },
    { x: 6, y: 12.7 },
    { x: 7, y: 47.88 },
    { x: 8, y: 18.61 },
    { x: 9, y: 5.37 },
    { x: 10, y: 6.26 },
    { x: 11, y: -5.76 },
    { x: 12, y: -11.12 },
    { x: 13, y: -6.31 },
    { x: 14, y: 4.37 },
    { x: 15, y: 15.86 },
    { x: 16, y: 21.27 },
    { x: 17, y: 17.19 },
    { x: 18, y: 17.79 },
    { x: 19, y: 12.14 },
    { x: 20, y: 12.63 },
    { x: 21, y: 14.78 },
    { x: 22, y: 23.65 },
    { x: 23, y: 14.16 },
  ];
  const initialEnergyChargeData = [
    { x: 0, y: 0.16056 },
    { x: 1, y: 0.16056 },
    { x: 2, y: 0.16056 },
    { x: 3, y: 0.16056 },
    { x: 4, y: 0.16056 },
    { x: 5, y: 0.16056 },
    { x: 6, y: 0.16056 },
    { x: 7, y: 0.16056 },
    { x: 8, y: 0.16056 },
    { x: 9, y: 0.16056 },
    { x: 10, y: 0.16056 },
    { x: 11, y: 0.16056 },
    { x: 12, y: 0.16056 },
    { x: 13, y: 0.16056 },
    { x: 14, y: 0.16056 },
    { x: 15, y: 0.16056 },
    { x: 16, y: 0.59779 },
    { x: 17, y: 0.59779 },
    { x: 18, y: 0.59779 },
    { x: 19, y: 0.59779 },
    { x: 20, y: 0.59779 },
    { x: 21, y: 0.16056 },
    { x: 22, y: 0.16056 },
    { x: 23, y: 0.16056 },
  ];

  const [loadData, setLoadData] = useState(initialLoadData);
  const [energyChargeData, setEnergyChargeData] = useState(initialEnergyChargeData);
  const [inputs, setInputs] = useState([]);
  const [ranges, setRanges] = useState([]);

  const handleLoadDataUpdate = (newData) => {
    setLoadData(newData);
  };

  const handleEnergyChargeDataUpdate = (newData) => {
    setEnergyChargeData(newData);
  };

  const handleInputChange = (newInputs) => {
    setInputs(newInputs);
  };

  const handleRangeChange = (newRanges) => {
    setRanges(newRanges);
  };

  return (
    <div className="App">
      <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
        <Typography variant="h3" gutterBottom>Battery Sizing Tool</Typography>
        <Typography variant="body1" paragraph>
          This tool helps you determine the optimal battery energy storage system (BESS) size for your building.
        </Typography>
        
        <Divider style={{ margin: '20px 0' }} />

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Load and Energy Price Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Enter or adjust your load profile and energy prices over a 24-hour period.
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', width: '100%' }}>
              <LineChartComponent 
                xLabel="Time" 
                yLabel="Load (kW)" 
                onDataUpdate={handleLoadDataUpdate} 
                initialData={initialLoadData}
              />
              <LineChartComponent 
                xLabel="Time" 
                yLabel="Energy Charge ($/kWh)" 
                onDataUpdate={handleEnergyChargeDataUpdate} 
                initialData={initialEnergyChargeData}
              />
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">System Parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Set various parameters for the battery system. These inputs will affect the optimal battery size and system performance.
            </Typography>
            <InputTable onInputChange={handleInputChange} />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Study Range</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Define the range of values to study for optimal battery sizing. This helps in exploring different scenarios and finding the best solution.
            </Typography>
            <StudyRangeTable onRangeChange={handleRangeChange} />
          </AccordionDetails>
        </Accordion>

        <Divider style={{ margin: '20px 0' }} />

        <Typography variant="h5" gutterBottom>Results</Typography>
        <Paper elevation={2} style={{ padding: '20px' }}>
          <Typography variant="body2" paragraph>
            Based on the provided data and parameters, here are the calculated results for the optimal battery size and system performance.
          </Typography>
          <Calculator 
            loadData={loadData} 
            energyChargeData={energyChargeData} 
            inputs={inputs}
            ranges={ranges}
          />
        </Paper>
      </Paper>


    </div>
  );
}

export default App;
