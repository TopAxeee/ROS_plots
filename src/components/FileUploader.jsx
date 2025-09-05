import React from 'react';
import { Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUploader = ({ onFileLoad }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        onFileLoad(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box display="flex" justifyContent="center" my={4}>
      <Button
        variant="contained"
        component="label"
        startIcon={<CloudUploadIcon />}
        size="large"
      >
        Загрузить файл лога
        <input
          type="file"
          accept=".txt"
          hidden
          onChange={handleFileChange}
        />
      </Button>
    </Box>
  );
};

export default FileUploader;