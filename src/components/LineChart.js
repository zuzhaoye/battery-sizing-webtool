import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Papa from 'papaparse';

/**
 * LineChartComponent - A React component for rendering an interactive line chart
 * 
 * @param {Object} props - Component props
 * @param {string} [props.xLabel="Time"] - Label for the x-axis
 * @param {string} [props.yLabel="Value"] - Label for the y-axis
 * @param {Function} props.onDataUpdate - Callback function when data is updated
 * @param {Array} [props.initialData] - Initial data points for the chart
 */

const LineChartComponent = ({ xLabel = "Time", yLabel = "Value", onDataUpdate, initialData }) => {
  // State declarations
  const [points, setPoints] = useState(initialData || Array.from({length: 24}, (_, i) => ({ x: i, y: 0.3 })));
  const [dragIndex, setDragIndex] = useState(null);
  const [minY, setMinY] = useState(Math.min(...points.map(point => point.y)));
  const [maxY, setMaxY] = useState(Math.max(...points.map(point => point.y)));
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Wrap padding object in useMemo
  const padding = useMemo(() => ({ left: 60, right: 20, top: 20, bottom: 40 }), []);

  // Calculate chart dimensions
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height * 0.7 - padding.top - padding.bottom; // Reduce height to 70% of container

  /**
   * Scale function for x-axis
   * @param {number} x - Input value
   * @returns {number} Scaled output value
   */
  const xScale = (x) => (x / 24) * chartWidth + padding.left;

  /**
   * Scale function for y-axis
   * @param {number} y - Input value
   * @returns {number} Scaled output value
   */
  const yScale = (y) => chartHeight - ((y - minY) / (maxY - minY)) * chartHeight + padding.top;

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  /**
   * Effect hook to adjust points when min or max Y values change
   */
  useEffect(() => {
    setPoints(prevPoints => 
      prevPoints.map(point => ({
        ...point,
        y: Math.max(minY, Math.min(maxY, point.y))
      }))
    );
  }, [minY, maxY]);

  /**
   * Effect hook to call onDataUpdate when points change
   */
  useEffect(() => {
    onDataUpdate(points);
  }, [points, onDataUpdate]);

  /**
   * Handler for mouse down event on data points
   */
  const handleMouseDown = useCallback((index) => (e) => {
    setDragIndex(index);
  }, []);

  /**
   * Handler for mouse move event for dragging points
   */
  const handleMouseMove = useCallback((e) => {
    if (dragIndex !== null) {
      const svgRect = e.currentTarget.getBoundingClientRect();
      const mouseY = e.clientY - svgRect.top;
      const chartY = Math.max(padding.top, Math.min(mouseY, dimensions.height - padding.bottom));
      const dataY = Number(((maxY - minY) * (1 - (chartY - padding.top) / chartHeight) + minY).toFixed(2));
      
      setPoints(prevPoints => {
        const newPoints = prevPoints.map((point, index) => 
          index === dragIndex ? { ...point, y: dataY } : point
        );
        onDataUpdate(newPoints);
        return newPoints;
      });
    }
  }, [dragIndex, chartHeight, padding, dimensions.height, minY, maxY, onDataUpdate]);

  /**
   * Handler for mouse up event to end dragging
   */
  const handleMouseUp = useCallback(() => {
    setDragIndex(null);
  }, []);

  const pathD = `M ${points.map((p, i) => {
    if (i === 0) return `${xScale(p.x)},${yScale(p.y)}`;
    const curr = p;
    
    // For a step function, we need two line segments for each point
    return `H ${xScale(curr.x)} V ${yScale(curr.y)}`;
  }).join(' ')}`;

  const areaPathD = `${pathD} L ${xScale(points[points.length - 1].x)},${yScale(minY)} L ${xScale(points[0].x)},${yScale(minY)} Z`;

  const formatTime = (hour) => {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  const downloadCSV = () => {
    const csvContent = [
      [xLabel, yLabel],
      ...points.map(point => [formatTime(point.x), point.y.toFixed(2)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'chart_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      Papa.parse(selectedFile, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0];
            console.log("Actual headers:", headers);
            console.log("Expected headers:", xLabel, yLabel);
            if (headers.length === 2 && 
                headers[0].toLowerCase().includes(xLabel.toLowerCase()) && 
                headers[1].toLowerCase().includes(yLabel.toLowerCase())) {
              const newPoints = results.data.slice(1).map((row, index) => {
                const timeString = row[0];
                const y = parseFloat(row[1]);
                
                // Convert time string to 24-hour format
                const x = convertTo24HourFormat(timeString);
                
                if (isNaN(x) || isNaN(y)) {
                  setError(`Invalid data in row ${index + 2}`);
                  return null;
                }
                return { x, y };
              }).filter(point => point !== null);

              if (newPoints.length > 0) {
                setPoints(newPoints);
                setMinY(Math.min(...newPoints.map(p => p.y)));
                setMaxY(Math.max(...newPoints.map(p => p.y)));
                setError("");
              } else {
                setError("No valid data found in the CSV file");
              }
            } else {
              setError("CSV format is incorrect. Expected headers: Time, Value");
            }
          } else {
            setError("No data found in the CSV file");
          }
        },
        header: false,
        skipEmptyLines: true,
        transformHeader: header => header.trim().toLowerCase(),
      });
    } else {
      setError("No file selected");
    }
  };

  // Helper function to convert time string to 24-hour format
  const convertTo24HourFormat = (timeString) => {
    const [time, period] = timeString.split(' ');
    let [hours] = time.split(':').map(Number); // Remove 'minutes' from here
    
    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
    
    return hours;
  };

  /**
   * This is the main return function for the LineChart component.
   * It renders the SVG chart, input boxes, and axis labels.
   */
  return (
    <div ref={containerRef} style={{ 
      width: '100%', 
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <svg 
        width="100%" 
        height="70%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height * 0.7}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseUp}
        style={{ background: '#f8f9fa', borderRadius: '8px' }}
      >
        {/* Definitions for gradients and filters */}
        <defs>
          {/* Gradient for area fill */}
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0, 123, 255, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 123, 255, 0.05)" />
          </linearGradient>
          {/* Drop shadow filter for line */}
          <filter id="dropShadow" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="2" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Vertical grid lines */}
        {Array.from({length: 24}, (_, i) => i * 2).map(tick => (
          <line key={tick} x1={xScale(tick)} y1={padding.top} x2={xScale(tick)} y2={dimensions.height - padding.bottom} stroke="#dee2e6" />
        ))}

        {/* Horizontal grid lines and Y-axis ticks */}
        {Array.from({ length: 6 }, (_, i) => minY + i * (maxY - minY) / 5).map(tick => (
          <g key={tick}>
            <line 
              x1={padding.left} 
              y1={yScale(tick)} 
              x2={dimensions.width - padding.right} 
              y2={yScale(tick)} 
              stroke="#dee2e6" 
            />
            <text 
              x={padding.left - 10} 
              y={yScale(tick)} 
              textAnchor="end" 
              dominantBaseline="middle"
              fontSize="14"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X-axis line */}
        <line x1={padding.left} y1={dimensions.height - padding.bottom} x2={dimensions.width - padding.right} y2={dimensions.height - padding.bottom} stroke="#dee2e6" strokeWidth="2" />
        
        {/* Y-axis line */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={dimensions.height - padding.bottom} stroke="#dee2e6" strokeWidth="2" />

        {/* Update X-axis ticks positioning */}
        {Array.from({length: 9}, (_, i) => i * 3).map(tick => (
          <text 
            key={tick} 
            x={xScale(tick)} 
            y={dimensions.height * 0.7 - padding.bottom + 20} 
            textAnchor="middle"
            fontSize="12"
          >
            {formatTime(tick)}
          </text>
        ))}

        {/* Area fill under the line */}
        <path d={areaPathD} fill="url(#areaGradient)" />
        
        {/* The main line of the chart */}
        <path d={pathD} fill="none" stroke="#007bff" strokeWidth="3" filter="url(#dropShadow)" />

        {/* Data points and hover effects */}
        {points.map((point, index) => (
          <g key={index}>
            {/* Individual data point */}
            <circle
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r="6"
              fill={hoveredIndex === index ? "#dc3545" : "#ffffff"}
              stroke="#dc3545"
              strokeWidth="2"
              onMouseDown={handleMouseDown(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'ns-resize', transition: 'all 0.2s ease-in-out' }}
            />
            {/* Tooltip for hovered point */}
            {hoveredIndex === index && (
              <g>
                <rect
                  x={xScale(point.x) + 10}
                  y={yScale(point.y) - 50}
                  width="120"
                  height="40"
                  fill="rgba(255, 255, 255, 0.9)"
                  stroke="#6c757d"
                  strokeWidth="1"
                  rx="5"
                  ry="5"
                />
                <text x={xScale(point.x) + 20} y={yScale(point.y) - 35} fontSize="12" fill="#495057">
                  Time: {formatTime(point.x)}
                </text>
                <text x={xScale(point.x) + 20} y={yScale(point.y) - 15} fontSize="12" fill="#495057">
                  Value: {point.y.toFixed(2)}
                </text>
              </g>
            )}
          </g>
        ))}
        
        {/* X-axis label */}
        <text
          x={dimensions.width / 2}
          y={dimensions.height * 0.7}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
        >
          {xLabel}
        </text>

        {/* Y-axis label */}
        <text
          x={10}
          y={dimensions.height * 0.3}
          textAnchor="middle"
          transform={`rotate(-90 10 ${dimensions.height * 0.35})`}
          fontSize="16"
          fontWeight="bold"
        >
          {yLabel}
        </text>
      </svg>

      {/* Controls section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '15px'
      }}>
        {/* Y-axis range controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Y-axis Range:
            <input
              type="number" 
              value={minY} 
              onChange={(e) => setMinY(Number(e.target.value))} 
              style={{ width: '80px', marginLeft: '10px', marginRight: '10px' }}
            />
            to
            <input 
              type="number" 
              value={maxY} 
              onChange={(e) => setMaxY(Number(e.target.value))} 
              style={{ width: '80px', marginLeft: '10px' }}
            />
          </label>
        </div>

        {/* File upload and download section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id={`fileInput-${xLabel}`}
            />
            <label htmlFor={`fileInput-${xLabel}`} style={{
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Choose File
            </label>
            <button 
              onClick={handleUpload}
              style={{
                padding: '8px 15px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px',
                transition: 'background-color 0.3s',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Upload
            </button>
          </div>
          <button 
            onClick={downloadCSV}
            style={{
              padding: '8px 15px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#138496'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#17a2b8'}
          >
            Download CSV Template
          </button>
        </div>
      </div>
      
      {/* Error messages */}
      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '10px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default LineChartComponent;
