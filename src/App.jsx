import React, { useState, useCallback } from 'react';
import { Container, Typography, CssBaseline, Paper, Box } from '@mui/material';
import FileUploader from './components/FileUploader';
import GraphPanel from './components/GraphPanel';
import SettingsPanel from './components/SettingsPanel';
import ErrorDisplay from './components/ErrorDisplay';
import FileInfo from './components/FileInfo';
import LoadingOverlay from './components/LoadingOverlay';
import { parseROSLog } from './utils/rosParser';

function App() {
  const [graphData, setGraphData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    ros: { show: true, color: '#ff0000', markerSize: 5, type: 'line' },
    dir3: { show: true, color: '#00ff00', markerSize: 5, type: 'line' },
    fineB: { show: true, color: '#0000ff', markerSize: 5, type: 'scatter' },
    frame2: { show: true, color: '#00ffff', markerSize: 5, type: 'line', limit: 1000, showJumps: false },
    utc: { show: true, color: '#ff00ff', markerSize: 5, type: 'line' }
  });

  const handleFileLoad = useCallback(async (content, fileName) => {
    setLoading(true);
    
    // Используем setTimeout чтобы дать интерфейсу обновиться перед тяжелой обработкой
    setTimeout(() => {
      try {
        const parsedData = parseROSLog(content);
        setGraphData(parsedData);
        setErrors(parsedData.errors);
        setFileInfo({
          name: fileName,
          startTime: parsedData.startTime,
          endTime: parsedData.endTime,
          duration: parsedData.duration
        });
      } catch (error) {
        setErrors([{
          line: 0,
          message: "Ошибка обработки файла",
          details: error.message
        }]);
      } finally {
        setLoading(false);
      }
    }, 100);
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <>
      <CssBaseline />
      <LoadingOverlay 
        open={loading} 
        message="Обработка данных лога..." 
      />
      <Container maxWidth="xl">
        <Box my={4}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Анализатор логов РОС
          </Typography>
          
          <FileUploader onFileLoad={handleFileLoad} />
          
          {fileInfo && <FileInfo {...fileInfo} />}
          
          {graphData && (
            <Box mt={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <SettingsPanel settings={settings} onUpdate={updateSettings} />
                <GraphPanel data={graphData} settings={settings} />
              </Paper>
            </Box>
          )}
          
          {errors.length > 0 && <ErrorDisplay errors={errors} />}
        </Box>
      </Container>
    </>
  );
}

export default App;