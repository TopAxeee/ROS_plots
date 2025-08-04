import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Checkbox, 
  FormControlLabel,
  Slider,
  Divider
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

function PlotSettings({ 
  plotSettings, 
  dataAvailability,
  handleSettingChange, 
  handleMarkerSizeChange,
  darkMode 
}) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Основные графики
      </Typography>
      
      <Grid container spacing={1}>
        <Grid item xs={6} sm={4}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showROS && dataAvailability.hasROS} 
                onChange={handleSettingChange('showROS')} 
                icon={<VisibilityOffIcon />}
                checkedIcon={<VisibilityIcon />}
                disabled={!dataAvailability.hasROS}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Смещение"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showFineB && dataAvailability.hasFineB} 
                onChange={handleSettingChange('showFineB')} 
                icon={<VisibilityOffIcon />}
                checkedIcon={<VisibilityIcon />}
                disabled={!dataAvailability.hasFineB}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="FineB"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showMorion && dataAvailability.hasMorion} 
                onChange={handleSettingChange('showMorion')} 
                disabled={!dataAvailability.hasMorion || !plotSettings.showFineB}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Morion"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showFrame2 && dataAvailability.hasFrame2} 
                onChange={handleSettingChange('showFrame2')} 
                disabled={!dataAvailability.hasFrame2}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Frame 2"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
        
        <Grid item xs={6} sm={4}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showUTCTime && dataAvailability.hasUTCTime} 
                onChange={handleSettingChange('showUTCTime')} 
                disabled={!dataAvailability.hasUTCTime}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="UTC Time"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ marginY: 2 }} />
      
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Детальные настройки
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" gutterBottom>
            FineB
          </Typography>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showFineBLabels} 
                onChange={handleSettingChange('showFineBLabels')} 
                disabled={!dataAvailability.hasFineB || !plotSettings.showFineB}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Подписи"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showFineBMarkers} 
                onChange={handleSettingChange('showFineBMarkers')} 
                disabled={!dataAvailability.hasFineB || !plotSettings.showFineB}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Маркеры"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" gutterBottom>
            Frame 2
          </Typography>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showFrame2Jumps} 
                onChange={handleSettingChange('showFrame2Jumps')} 
                disabled={!dataAvailability.hasFrame2 || !plotSettings.showFrame2}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Удалять 'скачки'"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showFrame2Markers} 
                onChange={handleSettingChange('showFrame2Markers')} 
                disabled={!dataAvailability.hasFrame2 || !plotSettings.showFrame2}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Маркеры"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" gutterBottom>
            UTC Time
          </Typography>
          <FormControlLabel
            control={
              <Checkbox 
                checked={plotSettings.showUTCTimeMarkers} 
                onChange={handleSettingChange('showUTCTimeMarkers')} 
                disabled={!dataAvailability.hasUTCTime || !plotSettings.showUTCTime}
                sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)' }}
              />
            }
            label="Маркеры"
            sx={{ 
              '& .MuiTypography-root': { 
                color: darkMode ? '#e0e0e0' : 'text.primary' 
              } 
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="body2" gutterBottom>
            Размер маркеров: {plotSettings.markerSize}
          </Typography>
          <Slider
            value={plotSettings.markerSize}
            onChange={handleMarkerSizeChange}
            min={2}
            max={12}
            step={1}
            valueLabelDisplay="auto"
            sx={{ 
              '& .MuiSlider-thumb': {
                backgroundColor: darkMode ? '#1976d2' : '#1976d2'
              },
              '& .MuiSlider-track': {
                backgroundColor: darkMode ? '#90caf9' : '#1976d2'
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default PlotSettings;