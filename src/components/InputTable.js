import React, { useState, useEffect } from 'react';

const InputTable = ({ onInputChange }) => {
  const [inputs, setInputs] = useState([
    { name: 'Demand Charge', value: 23.05, unit: '$/kW' },
    { name: 'Cost of Battery', value: 150, unit: '$/kWh' },
    { name: 'Cost of Power Equipment', value: 150, unit: '$/kW' },
    { name: 'Cost of Installation', value: 10000, unit: '$' },
    { name: 'Efficiency', value: 90, unit: '%' },
    { name: 'Degradation Rate', value: 2, unit: '% per year' },
    { name: 'Holding Period', value: 10, unit: 'year' },
    { name: 'Discount Rate', value: 5, unit: '% per year' },
  ]);

  useEffect(() => {
    onInputChange(inputs);
  }, [inputs, onInputChange]);

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index].value = value;
    setInputs(newInputs);
  };

  return (
    <table style={{ margin: '20px auto', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={tableHeaderStyle}>Parameter Name</th>
          <th style={tableHeaderStyle}>Value</th>
          <th style={tableHeaderStyle}>Unit</th>
        </tr>
      </thead>
      <tbody>
        {inputs.map((input, index) => (
          <tr key={index}>
            <td style={tableCellStyle}>{input.name}</td>
            <td style={tableCellStyle}>
              <input
                type="number"
                value={input.value}
                onChange={(e) => handleInputChange(index, parseFloat(e.target.value))}
                style={inputStyle}
              />
            </td>
            <td style={tableCellStyle}>{input.unit}</td>
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

export default InputTable;
