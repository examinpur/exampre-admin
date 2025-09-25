import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import styled from '@emotion/styled';
import Swal from 'sweetalert2';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import { useParams } from 'react-router-dom';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 3, 0, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '& .MuiTypography-root': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: 600,
  }
}));

const DropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[400]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border .24s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 150,
}));

export const UploadDocDialog = ({ open, onClose, onUploadSuccess, sectionIds, fetchSectionById }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previousYearsQuestion, setPreviousYearsQuestion] = useState(false);
  const [years, setYears] = useState('');
  const [resource, setResource] = useState('');
  const [questionBankTests, setQuestionBankTests] = useState([]);
  const [selectedQuestionBankId, setSelectedQuestionBankId] = useState('');
  const [loadingTests, setLoadingTests] = useState(false);
  const { folderId } = useParams();
  const [loading, setLoading] = useState(false);

  // Fetch question bank tests when sectionIds is available
  useEffect(() => {
    if (sectionIds && open) {
      fetchQuestionBankTests();
    }
  }, [sectionIds, open]);

  const fetchQuestionBankTests = async () => {
    setLoadingTests(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/question-bank/folders`); // Adjust endpoint as needed
      if (response.data && response.data.data) {
        setQuestionBankTests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching question bank tests:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch question bank tests.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingTests(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a .docx file.',
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please drop a .docx file.',
        confirmButtonColor: '#d33'
      });
    }
  };

  const formatTestName = (test) => {
    if (test.parentId && test.parentId.title) {
      return `${test.parentId.title} -> ${test.title}`;
    }
    return test.title;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'No File Selected',
        text: 'Please select a .docx file to upload.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('docfile', selectedFile);
    
    // Use selected question bank ID if available, otherwise use folderId
    const questionBankParentId = selectedQuestionBankId || folderId;
    if (questionBankParentId) {
      formData.append("questionBankParentId", questionBankParentId);
    }
    
    formData.append("createdBy", 'admin');
    formData.append("sectionIds", sectionIds || []);

    try {
      const response = await axios.post(`${BASE_URL}/upload-docx`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: response.data.message || 'Your document has been uploaded successfully.',
          confirmButtonColor: '#28a745'
        });
        onUploadSuccess(response.data);
        handleClose();
        // fetchSectionById();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Failed to upload document. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviousYearsQuestion(false);
    setResource('');
    setYears('');
    setSelectedQuestionBankId('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme => theme.shape.borderRadius * 2,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          overflowY: 'hidden',
        },
      }}
    >
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          <CloudUploadIcon sx={{ mr: 1 }} /> Upload Document
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: 'inherit' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3, pt: 2 }}>
        
        {/* Question Bank Test Selector - Only show when sectionIds has value */}
        {sectionIds && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="question-bank-select-label">
                Question Bank Test (Optional)
              </InputLabel>
              <Select
                labelId="question-bank-select-label"
                value={selectedQuestionBankId}
                onChange={(e) => setSelectedQuestionBankId(e.target.value)}
                label="Question Bank Test (Optional)"
                disabled={loadingTests}
              >
                <MenuItem value="">
                  <em>None - Extract from document</em>
                </MenuItem>
                {questionBankTests.map((test) => (
                  <MenuItem key={test._id} value={test._id}>
                    {formatTestName(test)}
                  </MenuItem>
                ))}
              </Select>
              {loadingTests && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="textSecondary">
                    Loading tests...
                  </Typography>
                </Box>
              )}
            </FormControl>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Select a question bank test to use its metadata, or leave empty to extract from document.
            </Typography>
          </Box>
        )}

        <DropZone
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            hidden
            accept=".docx"
            id="doc-upload-input"
            onChange={handleFileChange}
          />
          <CloudUploadIcon sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Drag and drop your .docx file here, or
          </Typography>
          <Button variant="contained" component="label" htmlFor="doc-upload-input">
            Browse File
          </Button>
          {selectedFile && (
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
              Selected file: <Box component="span" sx={{ color: 'primary.main', wordBreak: 'break-all' }}>{selectedFile.name}</Box>
            </Typography>
          )}
        </DropZone>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          Only .docx files are accepted.
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          color="primary"
          disabled={!selectedFile || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};