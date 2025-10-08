import styled from '@emotion/styled';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { BASE_URL } from 'app/config/config';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

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

export const UploadJsonDialog = ({ open, onClose, onUploadSuccess, sectionIds , fetchSectionById}) => {
  const [selectedJsonFile, setSelectedJsonFile] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [questionBankTests, setQuestionBankTests] = useState([]);
  const [selectedQuestionBankId, setSelectedQuestionBankId] = useState('');
  const [loadingTests, setLoadingTests] = useState(false);
  const { folderId } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sectionIds && open) {
      fetchQuestionBankTests();
    }
  }, [sectionIds, open]);
  const fetchQuestionBankTests = async () => {
    setLoadingTests(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/question-bank/folders`);
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

  const validateJsonFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          JSON.parse(e.target.result);
          resolve(true);
        } catch (error) {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  const handleJsonFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
      const isValidJson = await validateJsonFile(file);
      if (isValidJson) {
        setSelectedJsonFile(file);
      } else {
        setSelectedJsonFile(null);
        Swal.fire({
          icon: 'error',
          title: 'Invalid JSON File',
          text: 'The selected file contains invalid JSON format.',
          confirmButtonColor: '#d33'
        });
      }
    } else {
      setSelectedJsonFile(null);
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a .json file.',
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleZipFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedZipFile(file);
    } else {
      setSelectedZipFile(null);
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please upload a .zip file.',
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleJsonDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      const isValidJson = await validateJsonFile(file);
      if (isValidJson) {
        setSelectedJsonFile(file);
      } else {
        setSelectedJsonFile(null);
        Swal.fire({
          icon: 'error',
          title: 'Invalid JSON File',
          text: 'The dropped file contains invalid JSON format.',
          confirmButtonColor: '#d33'
        });
      }
    } else {
      setSelectedJsonFile(null);
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please drop a .json file.',
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleZipDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedZipFile(file);
    } else {
      setSelectedZipFile(null);
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Type',
        text: 'Please drop a .zip file.',
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
    if (!selectedJsonFile && !selectedZipFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Files Missing',
        text: 'Please select both a .json file and a .zip file before uploading.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('jsonfile', selectedJsonFile);
    formData.append('zipfile', selectedZipFile);

    const questionBankParentId = selectedQuestionBankId || folderId;
    if (questionBankParentId) {
      formData.append("questionBankParentId", questionBankParentId);
    }
    formData.append("createdBy", 'admin');
    formData.append("sectionIds", sectionIds || []);

    try {
      const response = await axios.post(`${BASE_URL}/api/upload-json`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: response.data.message || 'Your files have been uploaded successfully.',
          confirmButtonColor: '#28a745'
        });
        onUploadSuccess(response.data);
        handleClose();
        fetchSectionById();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.response?.data?.message || 'Failed to upload files. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedJsonFile(null);
    setSelectedZipFile(null);
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
          <CloudUploadIcon sx={{ mr: 1 }} /> Upload JSON & Images
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

        {/* Question Bank Test Selector */}
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
                  <em>None - Extract from JSON</em>
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
              Select a question bank test to use its metadata, or leave empty to extract from JSON file.
            </Typography>
          </Box>
        )}

        {/* JSON File Drop Zone */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Upload JSON File</Typography>
        <DropZone
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleJsonDrop}
          sx={{ mb: 3 }}
        >
          <input
            type="file"
            hidden
            accept=".json"
            id="json-upload-input"
            onChange={handleJsonFileChange}
          />
          <CloudUploadIcon sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Drag and drop your .json file here, or
          </Typography>
          <Button variant="contained" component="label" htmlFor="json-upload-input">
            Browse File
          </Button>
          {selectedJsonFile && (
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
              Selected file: <Box component="span" sx={{ color: 'primary.main', wordBreak: 'break-all' }}>{selectedJsonFile.name}</Box>
            </Typography>
          )}
        </DropZone>

        {/* ZIP File Drop Zone */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Upload ZIP File (Images)</Typography>
        <DropZone
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleZipDrop}
        >
          <input
            type="file"
            hidden
            accept=".zip"
            id="zip-upload-input"
            onChange={handleZipFileChange}
          />
          <CloudUploadIcon sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Drag and drop your .zip file here, or
          </Typography>
          <Button variant="contained" component="label" htmlFor="zip-upload-input">
            Browse File
          </Button>
          {selectedZipFile && (
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
              Selected file: <Box component="span" sx={{ color: 'primary.main', wordBreak: 'break-all' }}>{selectedZipFile.name}</Box>
            </Typography>
          )}
        </DropZone>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          Ensure that the ZIP file contains all images referenced in the JSON file.
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
          disabled={(!selectedJsonFile && !selectedZipFile) || loading}
          // disabled={!selectedJsonFile || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
