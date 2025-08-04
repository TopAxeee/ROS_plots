import React from 'react';
import { Box } from '@mui/material';

function Tooltip({ content, darkMode }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: content.x + 20,
        top: content.y - 40,
        backgroundColor: darkMode ? '#424242' : 'white',
        border: '1px solid',
        borderColor: darkMode ? 'divider' : 'divider',
        borderRadius: 1,
        padding: 1,
        boxShadow: 3,
        zIndex: 20,
        maxWidth: '300px',
        fontSize: '12px',
        color: darkMode ? '#e0e0e0' : 'text.primary'
      }}
      dangerouslySetInnerHTML={{ __html: content.content }}
    />
  );
}

export default Tooltip;