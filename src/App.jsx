import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Container,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import Header from './components/Header';
import FileInfo from './components/FileInfo';
import PlotSettings from './components/PlotSettings';
import PlotArea from './components/PlotArea';
import { parseROSFile } from './utils/FileParser';
import { downsampleData } from './utils/downsampling';
import { timeToString } from './utils/timeUtils';

function App() {
  // Состояния для данных и управления
  const [plotData, setPlotData] = useState([]);
  const [layout, setLayout] = useState({});
  const [fileInfo, setFileInfo] = useState({
    fileName: '',
    startTime: '',
    endTime: '',
    duration: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  
  // Флаги наличия данных
  const [dataAvailability, setDataAvailability] = useState({
    hasROS: false,
    hasFineB: false,
    hasMorion: false,
    hasFrame2: false,
    hasUTCTime: false
  });
  
  // Состояния для управления отображением графиков
  const [plotSettings, setPlotSettings] = useState({
    showROS: true,
    showFineB: true,
    showFineBLabels: false,
    showFineBMarkers: true,
    showMorion: true,
    showFrame2: true,
    showFrame2Jumps: true,
    showFrame2Markers: true,
    showUTCTime: true,
    showUTCTimeMarkers: true,
    markerSize: 4
  });
  
  const plotRef = useRef(null);
  const fileInputRef = useRef(null);
  const [highlightedPoint, setHighlightedPoint] = useState(null);
  const [crossMarker, setCrossMarker] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({ x: 0, y: 0, content: '' });
  const [parsedData, setParsedData] = useState(null);
  const [viewState, setViewState] = useState(null);
  
  // Дебаунс-таймер для перестроения графика
  const rebuildTimer = useRef(null);
  
  // Обработчик выбора файла
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    processFile(file);
  };

  // Обработчик drag & drop
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.txt')) {
      processFile(file);
    }
  };

  // Обработчик перетаскивания
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Функция обработки файла
  const processFile = (file) => {
    setLoading(true);
    setError('');
    setFileInfo({ fileName: file.name, startTime: '', endTime: '', duration: '' });
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsedData = parseROSFile(content);
        setParsedData(parsedData);
        
        // Определяем наличие данных для каждого типа графика
        const hasROS = parsedData.dir_X.length > 0;
        const hasFineB = parsedData.fineBListX.length > 0;
        const hasMorion = parsedData.morionPlotList.length > 0 && hasFineB;
        const hasFrame2 = parsedData.frame2_X.length > 0;
        const hasUTCTime = parsedData.utcTime_X.length > 0;
        
        setDataAvailability({
          hasROS,
          hasFineB,
          hasMorion,
          hasFrame2,
          hasUTCTime
        });
        
        // Сбрасываем состояние представления
        setViewState(null);
        
        // Устанавливаем настройки видимости
        setPlotSettings({
          showROS: hasROS,
          showFineB: hasFineB,
          showFineBLabels: false,
          showFineBMarkers: true,
          showMorion: hasMorion,
          showFrame2: hasFrame2,
          showFrame2Jumps: true,
          showFrame2Markers: true,
          showUTCTime: hasUTCTime,
          showUTCTimeMarkers: true,
          markerSize: 4
        });
        
        // Сразу перестраиваем график
        preparePlotData(parsedData);
        calculateTimeInfo(parsedData);
      } catch (error) {
        setError('Ошибка при обработке файла: ' + error.message);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Ошибка при чтении файла');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  // Обработка "скачков" в данных Frame2
  const cleanFrame2Data = (yArray) => {
    const result = [...yArray];
    let hasJumps = false;
    
    for (let i = 1; i < result.length - 1; i++) {
      if (Math.abs(result[i] - result[i - 1]) > 1000 && 
          Math.abs(result[i] - result[i + 1]) > 1000) {
        result[i] = NaN;
        hasJumps = true;
      }
    }
    
    if (hasJumps) {
      console.log("В графике найдены 'скачки'!");
    }
    
    return result;
  };
  
  // Коррекция временных меток
  const cleanXData = (xArray) => {
    const result = [...xArray];
    let delta = 0;
    
    for (let i = 1; i < result.length; i++) {
      if (result[i] - result[i - 1] < 0) {
        if (delta === 0) {
          delta = Math.abs(result[i] - result[i - 1]);
        }
        result[i] += delta;
      }
    }
    
    return result;
  };
  
  // Расчет временной информации
  const calculateTimeInfo = (parsedData) => {
    let startTime = '';
    let endTime = '';
    let duration = '';
    
    if (parsedData.dir_X.length > 0) {
      startTime = timeToString(parsedData.dir_X[0]);
      endTime = timeToString(parsedData.dir_X[parsedData.dir_X.length - 1]);
      const deltaTime = parsedData.dir_X[parsedData.dir_X.length - 1] - parsedData.dir_X[0];
      duration = timeToString(deltaTime);
    } else if (parsedData.frame2_X.length > 0) {
      startTime = timeToString(parsedData.frame2_X[0]);
      endTime = timeToString(parsedData.frame2_X[parsedData.frame2_X.length - 1]);
      const deltaTime = parsedData.frame2_X[parsedData.frame2_X.length - 1] - parsedData.frame2_X[0];
      duration = timeToString(deltaTime);
    }
    
    setFileInfo(prev => ({ 
      ...prev,
      startTime, 
      endTime, 
      duration 
    }));
  };
  
  // Сохранение текущего состояния представления графика
  const saveCurrentViewState = () => {
    if (plotRef.current && plotRef.current.figure) {
      const fig = plotRef.current.figure;
      if (fig.layout && fig.layout.xaxis && fig.layout.xaxis.range && 
          fig.layout.yaxis && fig.layout.yaxis.range) {
        setViewState({
          xrange: [...fig.layout.xaxis.range],
          yrange: [...fig.layout.yaxis.range]
        });
      }
    }
  };
  
  // Восстановление сохраненного состояния представления
  const restoreViewState = (newLayout) => {
    if (viewState && viewState.xrange && viewState.yrange) {
      return {
        ...newLayout,
        xaxis: { 
          ...newLayout.xaxis, 
          range: viewState.xrange,
          autorange: false
        },
        yaxis: { 
          ...newLayout.yaxis, 
          range: viewState.yrange,
          autorange: false
        }
      };
    }
    return {
      ...newLayout,
      xaxis: { 
        ...newLayout.xaxis, 
        autorange: true
      },
      yaxis: { 
        ...newLayout.yaxis, 
        autorange: true
      }
    };
  };
  
  // Подготовка данных для Plotly
  const preparePlotData = useCallback((parsedData) => {
    if (!parsedData) return;
    
    const MAX_POINTS = 50000;
    const traces = [];
    
    // Сохраняем текущее состояние представления перед перестроением
    saveCurrentViewState();
    
    // Основной график смещения РОС
    if (parsedData.dir_X.length > 0 && plotSettings.showROS) {
      const xArray = cleanXData(parsedData.dir_X);
      const yArray = parsedData.dir_Y.map(y => Math.round(y));
      
      // Применяем downsampling если данных слишком много
      let displayX = xArray;
      let displayY = yArray;
      
      if (xArray.length > MAX_POINTS) {
        const sampled = downsampleData(xArray, yArray, MAX_POINTS);
        displayX = sampled.x;
        displayY = sampled.y;
      }
      
      traces.push({
        x: displayX,
        y: displayY,
        type: 'scattergl',
        mode: 'lines',
        line: { color: 'darkred', width: 1 },
        name: 'Смещение',
        hovertemplate: 'Смещение<br>X: %{x}<br>Y: %{y}<extra></extra>',
      });
    }
    
    // График FineB
    if (parsedData.fineBListX.length > 0 && plotSettings.showFineB) {
      const xArray = cleanXData(parsedData.fineBListX);
      const yArray = parsedData.fineBListY;
      
      // Применяем downsampling
      let displayX = xArray;
      let displayY = yArray;
      
      if (xArray.length > MAX_POINTS) {
        const sampled = downsampleData(xArray, yArray, MAX_POINTS);
        displayX = sampled.x;
        displayY = sampled.y;
      }
      
      traces.push({
        x: displayX,
        y: displayY,
        type: 'scattergl',
        mode: plotSettings.showFineBMarkers ? 'markers' : 'lines',
        marker: { 
          size: plotSettings.markerSize,
          color: 'blue'
        },
        text: plotSettings.showFineBLabels ? 
          parsedData.fineBListValue.map((val, i) => 
            `FineB = ${val}; Int = ${parsedData.fineBListIntegral[i]};<br>MORION = ${parsedData.morionList[i]}; CorrValue = ${parsedData.corrValue[i]}`) 
          : null,
        hovertemplate: 'FineB<br>X: %{x}<br>Y: %{y}<extra></extra>',
        name: 'FineB'
      });
    }
    
    // График Morion
    if (parsedData.morionPlotList.length > 0 && plotSettings.showMorion) {
      const xArray = cleanXData(parsedData.fineBListX);
      const yArray = parsedData.morionPlotList;
      
      // Применяем downsampling
      let displayX = xArray;
      let displayY = yArray;
      
      if (xArray.length > MAX_POINTS) {
        const sampled = downsampleData(xArray, yArray, MAX_POINTS);
        displayX = sampled.x;
        displayY = sampled.y;
      }
      
      traces.push({
        x: displayX,
        y: displayY,
        type: 'scattergl',
        mode: 'markers',
        marker: { 
          size: plotSettings.markerSize,
          color: 'black'
        },
        hovertemplate: 'Morion<br>X: %{x}<br>Y: %{y}<extra></extra>',
        name: 'Morion'
      });
    }
    
    // График Frame2
    if (parsedData.frame2_X.length > 0 && plotSettings.showFrame2) {
      let yArray = [...parsedData.frame2_Y];
      if (plotSettings.showFrame2Jumps) {
        yArray = cleanFrame2Data(yArray);
      }
      
      const xArray = cleanXData(parsedData.frame2_X);
      
      // Применяем downsampling
      let displayX = xArray;
      let displayY = yArray;
      
      if (xArray.length > MAX_POINTS) {
        const sampled = downsampleData(xArray, yArray, MAX_POINTS);
        displayX = sampled.x;
        displayY = sampled.y;
      }
      
      traces.push({
        x: displayX,
        y: displayY,
        type: 'scattergl',
        mode: plotSettings.showFrame2Markers ? 'markers' : 'lines',
        marker: { 
          size: plotSettings.markerSize,
          color: 'green'
        },
        hovertemplate: 'Frame 2<br>X: %{x}<br>Y: %{y}<extra></extra>',
        name: 'Frame 2',
        connectgaps: false
      });
    }
    
    // График UTC Time
    if (parsedData.utcTime_X.length > 0 && plotSettings.showUTCTime) {
      const xArray = cleanXData(parsedData.utcTime_X);
      const yArray = parsedData.utcTime_Y;
      
      // Применяем downsampling
      let displayX = xArray;
      let displayY = yArray;
      
      if (xArray.length > MAX_POINTS) {
        const sampled = downsampleData(xArray, yArray, MAX_POINTS);
        displayX = sampled.x;
        displayY = sampled.y;
      }
      
      traces.push({
        x: displayX,
        y: displayY,
        type: 'scattergl',
        mode: plotSettings.showUTCTimeMarkers ? 'lines+markers' : 'lines',
        line: { color: 'darkviolet', width: 1 },
        marker: { size: plotSettings.markerSize },
        hovertemplate: 'UTC TimeCollector<br>X: %{x}<br>Y: %{y}<extra></extra>',
        name: 'UTC TimeCollector'
      });
    }
    
    setPlotData(traces);
    
    // Настройка макета
    const backgroundColor = darkMode ? 'rgba(30, 30, 30, 0)' : 'rgba(255, 255, 255, 0)';
    
    let newLayout = {
      autosize: true,
      margin: { left: 50, right: 30, bottom: 50, top: 30, pad: 2 },
      hovermode: 'closest',
      showlegend: true,
      legend: { 
        orientation: 'horizontal', 
        y: -0.2,
        itemclick: false,
        itemdoubleclick: false
      },
      xaxis: { 
        title: 'Время',
        autorange: true,
        fixedrange: false,
        color: darkMode ? '#e0e0e0' : '#333'
      },
      yaxis: { 
        title: 'Значение',
        autorange: true,
        fixedrange: false,
        color: darkMode ? '#e0e0e0' : '#333'
      },
      dragmode: 'zoom',
      hoverlabel: { 
        bgcolor: darkMode ? '#424242' : '#FFF', 
        font: { color: darkMode ? '#e0e0e0' : '#000' } 
      },
      paper_bgcolor: backgroundColor,
      plot_bgcolor: backgroundColor,
      font: {
        color: darkMode ? '#e0e0e0' : '#333'
      }
    };
    
    // Восстанавливаем сохраненное состояние представления
    newLayout = restoreViewState(newLayout);
    
    setLayout(newLayout);
    
    setLoading(false);
  }, [darkMode, plotSettings, viewState]);
  
  // Обработчик изменения настроек
  const handleSettingChange = (setting) => (event) => {
    const newValue = event.target.checked;
    
    setPlotSettings(prev => {
      let newSettings = { ...prev, [setting]: newValue };
      
      // Если FineB отключен, то Morion тоже должен быть отключен
      if (setting === 'showFineB' && !newValue) {
        newSettings.showMorion = false;
      }
      
      return newSettings;
    });
  };
  
  // Обработчик изменения размера маркеров
  const handleMarkerSizeChange = (event, newValue) => {
    setPlotSettings(prev => ({
      ...prev,
      markerSize: newValue
    }));
  };
  
  // Перестроение графика с задержкой
  useEffect(() => {
    if (parsedData) {
      // Очищаем предыдущий таймер
      if (rebuildTimer.current) {
        clearTimeout(rebuildTimer.current);
      }
      
      // Устанавливаем новый таймер
      rebuildTimer.current = setTimeout(() => {
        setLoading(true);
        preparePlotData(parsedData);
      }, 100); // Задержка 100 мс
    }
    
    return () => {
      if (rebuildTimer.current) {
        clearTimeout(rebuildTimer.current);
      }
    };
  }, [plotSettings, parsedData, preparePlotData]);
  
  // Обработчик наведения мыши на график
  const handlePlotHover = (event) => {
    if (plotData.length === 0 || !event || !event.points || event.points.length === 0) return;
    
    const point = event.points[0];
    const { x, y, data, pointIndex } = point;
    
    // Определение имени графика
    let plotName = data.name;
    
    // Установка подсвеченной точки
    setHighlightedPoint({ x, y });
    
    // Подготовка содержимого всплывающей подсказки
    let tooltipContentString = `${plotName}<br>X: ${x}<br>Y: ${y.toFixed(2)}`;
    
    // Добавляем дополнительную информацию для FineB
    if (data.name === 'FineB' && pointIndex !== undefined && plotSettings.showFineBLabels) {
      const index = pointIndex;
      if (index < data.text.length) {
        tooltipContentString += `<br>${data.text[index]}`;
      }
    }
    
    setTooltipContent({
      x,
      y,
      content: tooltipContentString
    });
    
    setShowTooltip(true);
  };
  
  // Обработчик выхода мыши с графика
  const handlePlotUnhover = () => {
    setShowTooltip(false);
    setHighlightedPoint(null);
  };
  
  // Обработчик клика для установки маркера
  const handlePlotClick = (event) => {
    if (event.event.key === 'c' || event.event.key === 'C') {
      if (crossMarker) {
        setCrossMarker(null);
      } else if (highlightedPoint) {
        setCrossMarker(highlightedPoint);
      }
    }
  };
  
  // Обработчик нажатия клавиш
  const handleKeyDown = (event) => {
    if (event.key === 'c' || event.key === 'C') {
      if (crossMarker) {
        setCrossMarker(null);
      } else if (highlightedPoint) {
        setCrossMarker(highlightedPoint);
      }
      event.preventDefault();
    }
  };
  
  // Добавляем обработчик нажатия клавиш
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [highlightedPoint, crossMarker]);
  
  // Добавляем обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      if (plotRef.current && plotRef.current.figure) {
        Plotly.Plots.resize(plotRef.current);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Переключение темы
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Обработчик загрузки файла
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      color: darkMode ? 'text.primary' : 'text.primary',
      transition: 'background-color 0.3s ease',
      boxSizing: 'border-box'
    }}>
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        onFileUpload={handleUploadClick} 
      />
      
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }} 
        accept=".txt"
        onChange={handleFileSelect}
      />
      
      {/* Основная область настроек */}
      <Container maxWidth={false} sx={{ marginBottom: 2, width: '100%' }}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: darkMode ? 3 : 1,
          backgroundColor: darkMode ? 'background.paper' : 'background.default',
          width: '100%'
        }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <PlotSettings
                  plotSettings={plotSettings}
                  dataAvailability={dataAvailability}
                  handleSettingChange={handleSettingChange}
                  handleMarkerSizeChange={handleMarkerSizeChange}
                  darkMode={darkMode}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FileInfo 
                  fileInfo={fileInfo} 
                  darkMode={darkMode} 
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
      
      {/* Область графика */}
      <Container maxWidth={false} sx={{ flexGrow: 1, paddingX: 0, width: '100%' }}>
        <PlotArea
          plotData={plotData}
          layout={layout}
          loading={loading}
          error={error}
          darkMode={darkMode}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handlePlotHover={handlePlotHover}
          handlePlotUnhover={handlePlotUnhover}
          handlePlotClick={handlePlotClick}
          highlightedPoint={highlightedPoint}
          crossMarker={crossMarker}
          showTooltip={showTooltip}
          tooltipContent={tooltipContent}
          plotRef={plotRef}
        />
      </Container>
      
      {/* Статусная строка */}
      <Box sx={{ 
        padding: 1, 
        borderTop: '1px solid', 
        borderColor: darkMode ? 'divider' : 'divider',
        backgroundColor: darkMode ? 'background.default' : 'background.paper',
        width: '100%'
      }}>
        <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="body2" color="textSecondary">
            {plotData.length > 0 ? `${plotData.length} график(ов) отображено` : 'Ожидание загрузки файла...'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Нажмите 'C' для установки маркера
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;