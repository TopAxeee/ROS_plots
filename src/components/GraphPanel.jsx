import React, { useEffect, useState, useRef, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const GraphPanel = ({ data, settings }) => {
  const [plotData, setPlotData] = useState([]);
  const [plotLayout, setPlotLayout] = useState({});
  const plotRef = useRef(null);
  const zoomStateRef = useRef(null);
  const theme = useTheme();

  // Функция для сохранения текущего масштаба
  const saveZoomState = useCallback(() => {
    if (plotRef.current && plotRef.current.layout) {
      const layout = plotRef.current.layout;
      zoomStateRef.current = {
        xaxis: {
          range: layout.xaxis.range,
          autorange: layout.xaxis.autorange
        },
        yaxis: {
          range: layout.yaxis.range,
          autorange: layout.yaxis.autorange
        }
      };
    }
  }, []);

  // Функция для восстановления масштаба
  const restoreZoomState = useCallback((layout) => {
    if (zoomStateRef.current) {
      return {
        ...layout,
        xaxis: { ...layout.xaxis, ...zoomStateRef.current.xaxis },
        yaxis: { ...layout.yaxis, ...zoomStateRef.current.yaxis }
      };
    }
    return layout;
  }, []);

  useEffect(() => {
    if (!data) return;

    // Сохраняем текущий масштаб перед обновлением данных
    saveZoomState();

    // Создаем traces для каждого типа данных
    const traces = [];

    // ROS data
    if (settings.ros.show && data.rosData && data.rosData.length > 0) {
      traces.push({
        x: data.rosData.map(item => item.time),
        y: data.rosData.map(item => item.value),
        type: 'scattergl',
        mode: settings.ros.type === 'line' ? 'lines' : 
              settings.ros.type === 'lineWithMarkers' ? 'lines+markers' : 'markers',
        name: 'Смещение РОС',
        line: { color: settings.ros.color },
        marker: { 
          size: settings.ros.markerSize,
          color: settings.ros.color 
        }
      });
    }

    // Dir3 data
    if (settings.dir3.show && data.dir3Data && data.dir3Data.length > 0) {
      // Фильтруем только ненулевые значения для Dir3
      const filteredDir3Data = data.dir3Data.filter(item => item.value !== 0);
      
      traces.push({
        x: filteredDir3Data.map(item => item.time),
        y: filteredDir3Data.map(item => item.value),
        type: 'scattergl',
        mode: settings.dir3.type === 'line' ? 'lines' : 
              settings.dir3.type === 'lineWithMarkers' ? 'lines+markers' : 'markers',
        name: 'Dir 3/6',
        line: { color: settings.dir3.color },
        marker: { 
          size: settings.dir3.markerSize,
          color: settings.dir3.color 
        }
      });
    }

    // FineB data
    if (settings.fineB.show && data.fineBFullData && data.fineBFullData.length > 0) {
      traces.push({
        x: data.fineBFullData.map(item => item.time),
        y: data.fineBFullData.map(item => item.value),
        type: 'scattergl',
        mode: settings.fineB.type === 'line' ? 'lines' : 
              settings.fineB.type === 'lineWithMarkers' ? 'lines+markers' : 'markers',
        name: 'FineB',
        line: { color: settings.fineB.color },
        marker: { 
          size: settings.fineB.markerSize,
          color: settings.fineB.color 
        },
        customdata: data.fineBFullData.map(item => [
          item.integral,
          item.morion,
          item.corrValue,
          item.morionDiff
        ]),
        hovertemplate: 
          '<b>FineB</b><br>' +
          'Время: %{x}<br>' +
          'Значение: %{y}<br>' +
          'Integral: %{customdata[0]}<br>' +
          'MORION: %{customdata[1]}<br>' +
          'CorrValue: %{customdata[2]}<br>' +
          'MORION Diff: %{customdata[3]}<br>' +
          '<extra></extra>'
      });
    }

    // Frame2 data - применяем фильтрацию если нужно
    let frame2DataToShow = data.frame2Data || [];
    if (!settings.frame2.showJumps) {
      frame2DataToShow = frame2DataToShow.filter(
        item => Math.abs(item.value) < settings.frame2.limit
      );
    }

    if (settings.frame2.show && frame2DataToShow.length > 0) {
      traces.push({
        x: frame2DataToShow.map(item => item.time),
        y: frame2DataToShow.map(item => item.value),
        type: 'scattergl',
        mode: settings.frame2.type === 'line' ? 'lines' : 
              settings.frame2.type === 'lineWithMarkers' ? 'lines+markers' : 'markers',
        name: 'Frame 2',
        line: { color: settings.frame2.color },
        marker: { 
          size: settings.frame2.markerSize,
          color: settings.frame2.color 
        }
      });
    }

    // UTC Time data
    if (settings.utc.show && data.utcTimeData && data.utcTimeData.length > 0) {
      traces.push({
        x: data.utcTimeData.map(item => item.time),
        y: data.utcTimeData.map(item => item.value),
        type: 'scattergl',
        mode: settings.utc.type === 'line' ? 'lines' : 
              settings.utc.type === 'lineWithMarkers' ? 'lines+markers' : 'markers',
        name: 'UTC Time',
        line: { color: settings.utc.color },
        marker: { 
          size: settings.utc.markerSize,
          color: settings.utc.color 
        }
      });
    }

    // Конфигурация макета
    const baseLayout = {
      title: 'Графики данных РОС',
      autosize: true,
      height: 500,
      margin: {
        l: 60,
        r: 30,
        b: 60,
        t: 60,
        pad: 4
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: theme.palette.text.primary
      },
      xaxis: {
        title: 'Время (UNIX)',
        type: 'linear',
        tickformat: '.0f',
        gridcolor: theme.palette.divider,
        linecolor: theme.palette.divider,
        zerolinecolor: theme.palette.divider
      },
      yaxis: {
        title: 'Значение',
        gridcolor: theme.palette.divider,
        linecolor: theme.palette.divider,
        zerolinecolor: theme.palette.divider
      },
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1,
        bgcolor: 'rgba(255, 255, 255, 0.8)'
      },
      modebar: {
        bgcolor: 'rgba(0,0,0,0)',
        color: theme.palette.text.primary,
        activecolor: theme.palette.primary.main
      }
    };

    // Восстанавливаем масштаб если нужно
    const finalLayout = restoreZoomState(baseLayout);

    setPlotData(traces);
    setPlotLayout(finalLayout);
  }, [data, settings, theme, saveZoomState, restoreZoomState]);

  // Обработчик изменения масштаба
  const handlePlotUpdate = useCallback((figure) => {
    // Сохраняем текущий масштаб при взаимодействии с графиком
    if (figure && figure.layout) {
      zoomStateRef.current = {
        xaxis: { 
          range: figure.layout.xaxis.range,
          autorange: figure.layout.xaxis.autorange 
        },
        yaxis: { 
          range: figure.layout.yaxis.range,
          autorange: figure.layout.yaxis.autorange 
        }
      };
    }
  }, []);

  if (!data) return null;

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>
        Графики данных
      </Typography>
      
      <Paper elevation={1} sx={{ p: 1 }}>
        <Plot
          ref={plotRef}
          data={plotData}
          layout={plotLayout}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToAdd: [
              'hoverClosestGl2d',
              'hoverCompareCartesian',
              'toggleHover'
            ],
            modeBarButtonsToRemove: [
              'pan2d',
              'select2d',
              'lasso2d',
              'autoScale2d',
              'zoom2d'
            ],
            toImageButtonOptions: {
              format: 'svg',
              filename: 'ros_graph',
              height: 600,
              width: 800,
              scale: 1
            }
          }}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
          onUpdate={handlePlotUpdate}
          onInitialized={handlePlotUpdate}
        />
      </Paper>
      
      <Box mt={2}>
        <Typography variant="body2" color="textSecondary">
          Используйте инструменты графика для масштабирования, панорамирования и сохранения.
          Для просмотра детальной информации наведите курсор на точки данных.
        </Typography>
      </Box>
    </Box>
  );
};

export default GraphPanel;