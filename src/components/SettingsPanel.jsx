import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ColorPicker from './ColorPicker';

const SettingsPanel = ({ settings, onUpdate }) => {
  const handleSettingChange = (graph, key, value) => {
    const newSettings = {
      ...settings,
      [graph]: {
        ...settings[graph],
        [key]: value
      }
    };
    onUpdate(newSettings);
  };

  const handleCheckboxChange = (graph, event) => {
    event.stopPropagation(); // Предотвращаем всплытие события
    handleSettingChange(graph, 'show', event.target.checked);
  };

  const graphs = [
    { key: 'ros', label: 'Смещение РОС' },
    { key: 'dir3', label: 'Dir 3/6' },
    { key: 'fineB', label: 'FineB' },
    { key: 'frame2', label: 'Frame 2' },
    { key: 'utc', label: 'UTC Time' }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Настройки графиков
      </Typography>
      
      {graphs.map((graph) => (
        <Accordion key={graph.key} TransitionProps={{ unmountOnExit: true }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" width="100%">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings[graph.key].show}
                    onClick={(e) => e.stopPropagation()} // Останавливаем всплытие при клике на чекбокс
                    onChange={(e) => handleCheckboxChange(graph.key, e)}
                  />
                }
                label={graph.label}
                onClick={(e) => e.stopPropagation()} // Останавливаем всплытие при клике на текст
              />
              <Chip 
                size="small" 
                sx={{ 
                  backgroundColor: settings[graph.key].color, 
                  color: 'white', 
                  ml: 2 
                }} 
                label="Цвет" 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Тип графика</InputLabel>
                <Select
                  value={settings[graph.key].type}
                  label="Тип графика"
                  onChange={(e) => handleSettingChange(graph.key, 'type', e.target.value)}
                >
                  <MenuItem value="line">Линия</MenuItem>
                  <MenuItem value="lineWithMarkers">Линия с маркерами</MenuItem>
                  <MenuItem value="scatter">Только маркеры</MenuItem>
                </Select>
              </FormControl>
              
              <Box>
                <Typography gutterBottom>Размер маркеров</Typography>
                <Slider
                  value={settings[graph.key].markerSize}
                  onChange={(e, value) => handleSettingChange(graph.key, 'markerSize', value)}
                  min={1}
                  max={20}
                  valueLabelDisplay="auto"
                  disabled={settings[graph.key].type === 'line'}
                />
              </Box>
              
              <ColorPicker
                color={settings[graph.key].color}
                onChange={(color) => handleSettingChange(graph.key, 'color', color)}
              />
              
              {graph.key === 'frame2' && (
                <>
                  <TextField
                    label="Лимит значений Frame2"
                    type="number"
                    value={settings.frame2.limit}
                    onChange={(e) => handleSettingChange('frame2', 'limit', Number(e.target.value))}
                    fullWidth
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.frame2.showJumps}
                        onChange={(e) => handleSettingChange('frame2', 'showJumps', e.target.checked)}
                      />
                    }
                    label="Показывать скачки"
                  />
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default SettingsPanel;