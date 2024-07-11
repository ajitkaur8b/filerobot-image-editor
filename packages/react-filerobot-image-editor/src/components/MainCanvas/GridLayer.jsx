// GridLayer.js
import React from 'react';
import { Layer, Rect } from 'react-konva';

const GridLayer = ({ width, height, gridSize }) => {
  const gridLines = [];
  // Generate vertical grid lines
  for (let x = 0; x <= width; x += gridSize) {
    gridLines.push(<Rect key={`v${x}`} x={x} y={0} width={1} height={height} stroke="#ccc" strokeWidth={0.5} />);
  }

  // Generate horizontal grid lines
  for (let y = 0; y <= height; y += gridSize) {
    gridLines.push(<Rect key={`h${y}`} x={0} y={y} width={width} height={1} stroke="#ccc" strokeWidth={0.5} />);
  }

  return (
    <>
      {gridLines}
    </>
  );
};

export default GridLayer;
