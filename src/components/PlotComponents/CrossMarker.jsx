import React from 'react';
import { Box } from '@mui/material';

function CrossMarker({ point }) {
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
        <line 
          x1={point.x - 10} 
          y1={point.y} 
          x2={point.x + 10} 
          y2={point.y} 
          stroke="red" 
          strokeWidth="2"
        />
        <line 
          x1={point.x} 
          y1={point.y - 10} 
          x2={point.x} 
          y2={point.y + 10} 
          stroke="red" 
          strokeWidth="2"
        />
      </svg>
    </Box>
  );
}

export default CrossMarker;