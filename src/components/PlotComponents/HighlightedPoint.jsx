import React from 'react';
import { Box } from '@mui/material';

function HighlightedPoint({ point }) {
  return (
    <Box 
      sx={{ 
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <svg width="100%" height="100%">
        <circle 
          cx={point.x} 
          cy={point.y} 
          r="5" 
          fill="none" 
          stroke="red" 
          strokeWidth="2"
        />
      </svg>
    </Box>
  );
}

export default HighlightedPoint;