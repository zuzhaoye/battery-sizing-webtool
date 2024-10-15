import React, { useState, useEffect } from 'react';

const StudyRangeTable = ({ onRangeChange }) => {
  const [ranges, setRanges] = useState([
    { name: 'Battery Capacity', min: 50, max: 150, unit: 'kWh' },
    { name: 'Power Limit', min: 25, max: 75, unit: 'kW' },
  ]);

  useEffect(() => {
    onRangeChange(ranges);
  }, [ranges, onRangeChange]);

  const handleRangeChange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index][field] = value;
    setRanges(newRanges);
  };

  return (
    <table style={{ margin: '20px auto', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={tableHeaderStyle}>Parameter Name</th>
          <th style={tableHeaderStyle}>Min</th>
          <th style={tableHeaderStyle}>Max</th>
          <th style={tableHeaderStyle}>Unit</th>
        </tr>
      </thead>
      <tbody>
        {ranges.map((range, index) => (
          <tr key={index}>
            <td style={tableCellStyle}>{range.name}</td>
            <td style={tableCellStyle}>
              <input
                type="number"
                value={range.min}
                onChange={(e) => handleRangeChange(index, 'min', parseFloat(e.target.value))}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>
              <input
                type="number"
                value={range.max}
                onChange={(e) => handleRangeChange(index, 'max', parseFloat(e.target.value))}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>{range.unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const tableHeaderStyle = {
  backgroundColor: '#f2f2f2',
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const inputStyle = {
  width: '100%',
  padding: '5px',
  border: '1px solid #ddd',
  borderRadius: '4px',
};

export default StudyRangeTable;