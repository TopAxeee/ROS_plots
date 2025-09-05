import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const FileInfo = ({ name, startTime, endTime, duration }) => {
  const formatTime = (unixTime) => {
    return new Date(unixTime * 1000).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}д ${hours}ч ${minutes}м ${secs}с`;
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2, mb: 2 }}>
      <Box display="flex" alignItems="center" mb={1}>
        <InfoIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Информация о файле</Typography>
      </Box>
      
      <Box pl={3}>
        <Typography variant="body1"><strong>Имя файла:</strong> {name}</Typography>
        <Typography variant="body1"><strong>Начало записи:</strong> {formatTime(startTime)}</Typography>
        <Typography variant="body1"><strong>Конец записи:</strong> {formatTime(endTime)}</Typography>
        <Typography variant="body1"><strong>Длительность:</strong> {formatDuration(duration)}</Typography>
      </Box>
    </Paper>
  );
};

export default FileInfo;