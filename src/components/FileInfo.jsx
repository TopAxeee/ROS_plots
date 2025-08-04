import React from 'react';
import { 
  Box, 
  Grid, 
  Typography 
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

function FileInfo({ fileInfo, darkMode }) {
  return (
    <Box sx={{ 
      padding: 2, 
      border: '1px solid', 
      borderColor: darkMode ? 'divider' : 'divider',
      borderRadius: 1,
      height: '100%',
      backgroundColor: darkMode ? 'background.default' : 'background.paper'
    }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Информация о файле
      </Typography>
      
      {fileInfo.fileName ? (
        <Box>
          {/* Заголовок файла */}
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Файл:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {fileInfo.fileName}
            </Typography>
          </Box>
          
          {/* Информация о времени */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Начало:
                </Typography>
                <Typography variant="body1">
                  {fileInfo.startTime}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Конец:
                </Typography>
                <Typography variant="body1">
                  {fileInfo.endTime}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Длительность:
                </Typography>
                <Typography variant="body1">
                  {fileInfo.duration}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center'
        }}>
          <UploadIcon sx={{ 
            fontSize: 48, 
            color: darkMode ? 'text.disabled' : 'text.disabled', 
            marginBottom: 1 
          }} />
          <Typography variant="body1" color="textSecondary">
            Загрузите файл для анализа
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default FileInfo;