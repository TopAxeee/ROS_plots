import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton 
} from '@mui/material';
import { 
  Upload as UploadIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';

function Header({ darkMode, toggleDarkMode, onFileUpload }) {
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ marginBottom: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Анализ данных РОС
        </Typography>
        <IconButton color="inherit" onClick={toggleDarkMode} sx={{ marginRight: 1 }}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <Button 
          variant="contained" 
          startIcon={<UploadIcon />}
          onClick={onFileUpload}
        >
          Загрузить файл
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;