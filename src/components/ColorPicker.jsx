import React from 'react';
import { Box, Typography, Button, Popover } from '@mui/material';
import { SketchPicker } from 'react-color';

const ColorPicker = ({ color, onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (newColor) => {
    onChange(newColor.hex);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'color-popover' : undefined;

  return (
    <Box>
      <Typography gutterBottom>Цвет графика</Typography>
      <Button
        variant="outlined"
        onClick={handleClick}
        style={{ backgroundColor: color, width: '100%', height: 40 }}
      >
        &nbsp;
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <SketchPicker color={color} onChange={handleChange} />
      </Popover>
    </Box>
  );
};

export default ColorPicker;