import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

const NPVComparisonChart = ({ 
  bestCombination, 
  withBatteryColor = '#ed931c', 
  withoutBatteryColor = '#3f84f2',
  withBatteryPointColor = '#ed931c',
  withoutBatteryPointColor = '#3f84f2'
}) => {
  if (!bestCombination) {
    return null;
  }

  const data = bestCombination.npvByYear.withBattery.map((value, index) => ({
    year: index,
    withBattery: value,
    withoutBattery: bestCombination.npvByYear.withoutBattery[index]
  }));

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" style={{ fontSize: '16px' }} padding={{ left: 10, right: 10 }}>
            <Label 
              value="Years" 
              position="insideBottomRight"
              offset={-10}
              style={{ textAnchor: 'end', fontSize: '16px' }}
            />
          </XAxis>
          <YAxis style={{ fontSize: '14px' }} padding={{ top: 10, bottom: 10 }}>
            <Label 
              value="Cost ($)" 
              position="insideTopLeft"
              offset={-15}
              style={{ textAnchor: 'start', fontSize: '16px' }}
            />
          </YAxis>
          <Tooltip 
              formatter={(value) => `$ ${value.toFixed(2)}`}
              labelFormatter={(label) => `Year ${label}`}
            />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line 
            type="monotone" 
            dataKey="withBattery" 
            stroke={withBatteryColor} 
            name="With Battery"
            dot={{ stroke: withBatteryPointColor, strokeWidth: 2, fill: 'white', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="withoutBattery" 
            stroke={withoutBatteryColor} 
            name="Without Battery"
            dot={{ stroke: withoutBatteryPointColor, strokeWidth: 2, fill: 'white', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NPVComparisonChart;
