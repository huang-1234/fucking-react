import React, { useState, useEffect } from 'react';
import { Typography, Tooltip } from 'antd';

const { Text } = Typography;

interface GridVisualizerProps<T> {
  grid: T[][];
  visited?: boolean[][];
  currentCell?: [number, number];
  path?: [number, number][];
  distances?: number[][];
  islandIds?: number[][];
  cellSize?: number;
  cellRenderer?: (value: T, row: number, col: number, props: CellProps) => React.ReactNode;
  onCellClick?: (row: number, col: number, value: T) => void;
  legend?: { [key: string]: string };
  showCoordinates?: boolean;
}

interface CellProps {
  isVisited: boolean;
  isCurrent: boolean;
  isInPath: boolean;
  distance?: number;
  islandId?: number;
}

function DefaultCellRenderer<T>(value: T, row: number, col: number, props: CellProps) {
  const { isVisited, isCurrent, isInPath, distance, islandId } = props;

  // Determine background color based on cell state
  let backgroundColor = '#a29bfe'; // Default unvisited
  let textColor = 'white';

  if (isCurrent) {
    backgroundColor = '#ff7675'; // Current cell
  } else if (isInPath) {
    backgroundColor = '#fdcb6e'; // Path
  } else if (isVisited) {
    backgroundColor = '#74b9ff'; // Visited
  }

  // For island problems
  if (islandId !== undefined && islandId > 0) {
    // Generate a color based on island ID
    const hue = (islandId * 137) % 360; // Golden ratio to distribute colors
    backgroundColor = `hsl(${hue}, 70%, 70%)`;
    textColor = hue > 200 && hue < 320 ? 'white' : 'black';
  }

  // For maze problems
  if (value === 1 || value === '1') {
    backgroundColor = '#2d3436'; // Wall
  }

  // For distance display
  let displayValue: React.ReactNode = value as React.ReactNode;
  if (distance !== undefined && distance >= 0) {
    displayValue = (
      <>
        {value}
        <div style={{ fontSize: '0.7em', opacity: 0.8 }}>d:{distance}</div>
      </>
    );
  }

  return (
    <Tooltip title={`(${row}, ${col})${distance !== undefined ? ` - Distance: ${distance}` : ''}`}>
      <div
        style={{
          backgroundColor,
          color: textColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          transition: 'all 0.3s ease',
          fontWeight: isCurrent ? 'bold' : 'normal',
          border: isInPath ? '2px solid #e17055' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '4px',
          boxShadow: isCurrent ? '0 0 8px rgba(255, 118, 117, 0.8)' : 'none'
        }}
      >
        {displayValue}
      </div>
    </Tooltip>
  );
}

function GridVisualizer<T>({
  grid,
  visited = [],
  currentCell,
  path = [],
  distances,
  islandIds,
  cellSize = 40,
  cellRenderer = DefaultCellRenderer,
  onCellClick,
  legend,
  showCoordinates = false
}: GridVisualizerProps<T>) {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  // Initialize visited array if not provided
  const effectiveVisited = visited.length > 0 ? visited :
    Array(grid.length).fill(0).map(() => Array(grid[0].length).fill(false));

  // Convert path array to a set of strings for faster lookups
  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));

  const handleCellClick = (row: number, col: number) => {
    if (onCellClick) {
      onCellClick(row, col, grid[row][col]);
    }
  };

  const renderGrid = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {/* Column coordinates */}
        {showCoordinates && (
          <div style={{ display: 'flex', marginLeft: cellSize }}>
            {grid[0].map((_, colIndex) => (
              <div
                key={`col-${colIndex}`}
                style={{
                  width: cellSize,
                  height: 20,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.8em',
                  color: '#666'
                }}
              >
                {colIndex}
              </div>
            ))}
          </div>
        )}

        {grid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} style={{ display: 'flex', gap: '2px' }}>
            {/* Row coordinates */}
            {showCoordinates && (
              <div
                style={{
                  width: 20,
                  height: cellSize,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.8em',
                  color: '#666'
                }}
              >
                {rowIndex}
              </div>
            )}

            {row.map((cell, colIndex) => {
              const isVisited = effectiveVisited[rowIndex]?.[colIndex] || false;
              const isCurrent = currentCell?.[0] === rowIndex && currentCell?.[1] === colIndex;
              const isInPath = pathSet.has(`${rowIndex},${colIndex}`);
              const distance = distances?.[rowIndex]?.[colIndex];
              const islandId = islandIds?.[rowIndex]?.[colIndex];
              const isHovered = hoveredCell?.[0] === rowIndex && hoveredCell?.[1] === colIndex;

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    cursor: onCellClick ? 'pointer' : 'default',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease',
                    zIndex: isHovered ? 10 : 1
                  }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseEnter={() => setHoveredCell([rowIndex, colIndex])}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {cellRenderer(cell, rowIndex, colIndex, {
                    isVisited,
                    isCurrent,
                    isInPath,
                    distance,
                    islandId
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderLegend = () => {
    if (!legend) return null;

    return (
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {Object.entries(legend).map(([key, color]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: color,
                borderRadius: '4px'
              }}
            />
            <Text>{key}</Text>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{ overflowX: 'auto', padding: '16px' }}>
        {renderGrid()}
      </div>
      {renderLegend()}
    </div>
  );
}

export default GridVisualizer;
