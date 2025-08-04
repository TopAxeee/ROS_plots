import React from 'react';
import { 
  Card, 
  CardContent, 
  Box,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import Plot from 'react-plotly.js';
import HighlightedPoint from './PlotComponents/HighlightedPoint';
import CrossMarker from './PlotComponents/CrossMarker';
import Tooltip from './PlotComponents/Tooltip';

function PlotArea({
  plotData,
  layout,
  loading,
  error,
  darkMode,
  handleDrop,
  handleDragOver,
  handlePlotHover,
  handlePlotUnhover,
  handlePlotClick,
  highlightedPoint,
  crossMarker,
  showTooltip,
  tooltipContent,
  plotRef
}) {
  return (
    <Card sx={{ 
      height: 'calc(100vh - 200px)', 
      borderRadius: 2,
      boxShadow: darkMode ? 3 : 1,
      backgroundColor: darkMode ? 'background.paper' : 'background.default',
      overflow: 'hidden',
      width: '100%'
    }}>
      <CardContent sx={{ height: '100%', padding: 0 }}>
        <Box 
          sx={{ 
            width: '100%', 
            height: '100%',
            border: '1px dashed',
            borderColor: darkMode ? 'divider' : 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            position: 'relative'
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <CircularProgress size={50} />
              <Typography variant="body1" sx={{ marginTop: 2 }}>
                Обновление графика...
              </Typography>
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: darkMode ? 'error.dark' : 'error.light'
              }}
            >
              {error}
            </Alert>
          ) : plotData.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              padding: 2
            }}>
              <UploadIcon sx={{ 
                fontSize: 60, 
                color: darkMode ? 'text.disabled' : 'text.disabled', 
                marginBottom: 2 
              }} />
              <Typography variant="h6" gutterBottom>
                Загрузите файл с данными
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ marginBottom: 2 }}>
                Перетащите файл сюда или нажмите кнопку выше
              </Typography>
            </Box>
          ) : (
            <Plot
              ref={plotRef}
              data={plotData}
              layout={layout}
              config={{ 
                responsive: true,
                displayModeBar: true,
                scrollZoom: true,
                modeBarButtonsToRemove: ['select2d', 'lasso2d', 'resetScale2d'],
                toImageButtonOptions: {
                  format: 'png',
                  filename: 'ros_analysis',
                  height: 600,
                  width: 800,
                  scale: 2
                }
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler={true}
              onHover={handlePlotHover}
              onUnhover={handlePlotUnhover}
              onClick={handlePlotClick}
            />
          )}
          
          {highlightedPoint && (
            <HighlightedPoint point={highlightedPoint} />
          )}
          
          {crossMarker && (
            <CrossMarker point={crossMarker} />
          )}
          
          {showTooltip && (
            <Tooltip 
              content={tooltipContent} 
              darkMode={darkMode} 
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default PlotArea;