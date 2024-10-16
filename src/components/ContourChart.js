import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

const ContourChart = ({ data, isCalculating, bestCombination }) => {
  const chartRef = useRef(null);

  const processData = (data) => {
    if (data.length === 0) {
      return {
        z: Array(10).fill().map(() => Array(10).fill(0)),
        x: Array(10).fill().map((_, i) => i),
        y: Array(10).fill().map((_, i) => i)
      };
    }

    const validData = data.filter(d => d && typeof d.npv === 'number' && 
                                        typeof d.capacity === 'number' && 
                                        typeof d.power === 'number');

    return {
      z: validData.map(d => d.npv),
      x: validData.map(d => d.capacity),
      y: validData.map(d => d.power)
    };
  };

  useEffect(() => {
    const chartElement = chartRef.current; // Store the ref value in a variable

    if (!isCalculating && data.length > 0 && chartElement) {
      const { z, x, y } = processData(data);
      
      const traces = [{
        type: 'contour',
        z: z,
        x: x,
        y: y,
        colorscale: 'Viridis',
        contours: {
          coloring: 'heatmap'
        },
        colorbar: {
          title: {
            text: 'Lifetime Cost',
            side: 'right',
            font: { size: 12 }
          },
          tickfont: { size: 12 }
        }
      }];

      // Add a scatter trace for the best combination
      if (bestCombination) {
        traces.push({
          type: 'scatter',
          x: [bestCombination.capacity],
          y: [bestCombination.power],
          mode: 'markers',
          marker: {
            color: 'red',
            size: 12,
            symbol: 'circle-open',
            line: { width: 2 }
          },
          showlegend: false,
          hoverinfo: 'text',
          text: `Best: Capacity ${bestCombination.capacity.toFixed(2)} kWh, Power ${bestCombination.power.toFixed(2)} kW`
        });
      }

      const layout = {
        xaxis: { 
          title: 'Battery Capacity (kWh)',
          titlefont: { size: 12 },
          tickfont: { size: 12 }
        },
        yaxis: { 
          title: 'Power Limit (kW)',
          titlefont: { size: 12 },
          tickfont: { size: 12 }
        },
        autosize: true,
        margin: {
          l: 50,
          r: 50,
          b: 50,
          t: 30,
          pad: 4
        },
        font: { size: 12 }
      };

      const config = {
        responsive: true,
        displayModeBar: false
      };

      Plotly.newPlot(chartElement, traces, layout, config);
    } else if (chartElement) {
      Plotly.purge(chartElement);
    }

    return () => {
      if (chartElement) {
        Plotly.purge(chartElement);
      }
    };
  }, [data, isCalculating, bestCombination]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default ContourChart;
