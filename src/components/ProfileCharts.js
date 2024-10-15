import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProfileCharts = ({ 
  originalLoad, 
  newLoad, 
  SoCProfile, 
  originalLoadColor = '#3f84f2', 
  newLoadColor = '#ed931c', 
  socColor = '#82ca9d',
  originalLoadPointColor = '#3f84f2',
  newLoadPointColor = '#ed931c',
  socPointColor = '#82ca9d'
}) => {
  // Prepare data for the load profile comparison chart
  const loadProfileData = originalLoad.map((load, index) => ({
    hour: index,
    originalLoad: load,
    newLoad: newLoad[index]
  }));

  // Add an extra data point for hour 24
  loadProfileData.push({
    hour: 24,
    originalLoad: loadProfileData[0].originalLoad,
    newLoad: loadProfileData[0].newLoad
  });

  // Prepare data for the SoC profile chart
  const socProfileData = SoCProfile.map((soc, index) => ({
    hour: index,
    SoC: soc * 100 // Convert to percentage
  }));

  // Add an extra data point for hour 24
  socProfileData.push({
    hour: 24,
    SoC: socProfileData[0].SoC
  });

  const chartStyle = {
    fontSize: '14px'
  };

  const formatHour = (hour) => {
    if (hour === 24) hour = 0;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour} ${ampm}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div> 
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={loadProfileData} style={chartStyle}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tickFormatter={formatHour}
              ticks={[0, 6, 12, 18, 24]}
              domain={[0, 24]}
            />
            <YAxis 
              label={{ 
                value: 'Load (kW)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
                offset: 10
              }} 
            />
            <Tooltip 
              formatter={(value) => `${value.toFixed(2)} kW`}
              labelFormatter={(label) => formatHour(label)}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Line 
              type="stepAfter" 
              dataKey="originalLoad" 
              stroke={originalLoadColor} 
              name="Original Load" 
              dot={{ stroke: originalLoadPointColor, strokeWidth: 1, fill: 'white', r: 3 }}
            />
            <Line 
              type="stepAfter" 
              dataKey="newLoad" 
              stroke={newLoadColor} 
              name="New Load" 
              dot={{ stroke: newLoadPointColor, strokeWidth: 1, fill: 'white', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={socProfileData} style={chartStyle} margin={{ bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              type="number"
              domain={[0, 24]}
              ticks={[0, 6, 12, 18, 24]}
              tickFormatter={formatHour}
              label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ 
                value: 'State of Charge (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
                offset: 5
              }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => formatHour(label)}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Line 
              type="stepAfter" 
              dataKey="SoC" 
              stroke={socColor} 
              name="State of Charge" 
              dot={{ stroke: socPointColor, strokeWidth: 1, fill: 'white', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfileCharts;
