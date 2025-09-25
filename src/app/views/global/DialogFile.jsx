import styled from '@emotion/styled';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useState, useEffect } from 'react';
import QuizIcon from '@mui/icons-material/Quiz';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { formatDate } from './FormatDate';
import { useNavigate, useParams } from 'react-router-dom';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '& .MuiTypography-root': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: 600,
  }
}));

export const DialogFile = ({ handleCloseTestDialog, openTestDialog, fetchData, editFileData }) => {
  const { folderId } = useParams();
  const isEditMode = Boolean(editFileData);
  const navigate = useNavigate();

  const [testForm, setTestForm] = useState({
    name: '',
    date: new Date(),
    duration: { hours: 1, minutes: 0 }
  });

  const [creating, setCreating] = useState(false);
  const [testErrors, setTestErrors] = useState({});

  useEffect(() => {
    if (openTestDialog) {
      if (editFileData) {
        const [hours, minutes] = editFileData.duration?.split(':') ?? ['1', '0'];
        
        setTestForm({
          name: editFileData.name || '',
          date: new Date(editFileData.date),
          duration: {
            hours: parseInt(hours, 10),
            minutes: parseInt(minutes, 10)
          }
        });
      } else {
        setTestForm({
          name: '',
          date: new Date(),
          duration: { hours: 1, minutes: 0 }
        });
      }
      setTestErrors({});
    }
  }, [openTestDialog, editFileData]);

  const validateTestForm = () => {
    const newErrors = {};
    if (!testForm.name.trim()) newErrors.name = 'Test name is required';
    else if (testForm.name.length < 3) newErrors.name = 'Test name must be at least 3 characters';
    else if (testForm.name.length > 100) newErrors.name = 'Test name must be less than 100 characters';

    if (!testForm.date) newErrors.date = 'Date is required';
    if (testForm.duration.hours === 0 && testForm.duration.minutes === 0)
      newErrors.duration = 'Duration must be at least 1 minute';

    setTestErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateTestForm()) return;

    setCreating(true);
    let formattedDate;
    if (isEditMode) {
      const originalDate = new Date(editFileData.date);
      const currentDate = new Date(testForm.date);
      if (originalDate.toDateString() === currentDate.toDateString()) {
        formattedDate = editFileData.date;
      } else {
        formattedDate = formatDate(testForm.date);
      }
    } else {
      formattedDate = formatDate(testForm.date);
    }

    let payload = {
      name: testForm.name.trim(),
      date: formattedDate,
      duration: `${testForm.duration.hours}:${String(testForm.duration.minutes).padStart(2, '0')}`,
      parentId: folderId ?? null
    };

    try {
      const response = isEditMode
        ? await axios.patch(`${BASE_URL}/api/global-library/files/${editFileData._id}`, payload)
        : await axios.post(`${BASE_URL}/api/global-library/add-new-file`, payload);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Updated' : 'Created',
          text: `Test ${isEditMode ? 'updated' : 'created'} successfully!`,
          confirmButtonColor: '#28a745'
        });
        await fetchData();
        handleCloseTestDialog();
      }
      if (!isEditMode) {
        navigate(`/editTest/${response.data.file._id}`);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Something went wrong.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={openTestDialog}
      onClose={handleCloseTestDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
    >
      <StyledDialogTitle>
        <Typography variant="h6">
          <QuizIcon />
          {isEditMode ? 'Edit Test' : 'Create New Test'}
        </Typography>
        <IconButton onClick={handleCloseTestDialog} size="small" sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <TextField
          autoFocus
          label="Test Name"
          fullWidth
          value={testForm.name}
          onChange={(e) => {
            setTestForm(prev => ({ ...prev, name: e.target.value }));
            if (testErrors.name) setTestErrors(prev => ({ ...prev, name: '' }));
          }}
          error={!!testErrors.name}
          helperText={testErrors.name || "Enter a descriptive name"}
          required
          inputProps={{ maxLength: 100 }}
          sx={{ mb: 2 }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Test Date *"
            value={testForm.date}
            onChange={(newValue) => {
              setTestForm(prev => ({ ...prev, date: newValue }));
              if (testErrors.date) setTestErrors(prev => ({ ...prev, date: '' }));
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!testErrors.date,
                helperText: testErrors.date || 'Select the test date'
              }
            }}
          />
          {editFileData && editFileData.date && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Previous Date: {editFileData.date}
            </Typography>
          )}
        </LocalizationProvider>
       
        <Box display="flex" gap={2} mt={2} mb={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Duration *</Typography>
            <Box display="flex" gap={1}>
              <FormControl sx={{ minWidth: 80 }}>
                <InputLabel>Hours</InputLabel>
                <Select
                  value={testForm.duration.hours}
                  label="Hours"
                  onChange={(e) => {
                    setTestForm(prev => ({
                      ...prev,
                      duration: { ...prev.duration, hours: e.target.value }
                    }));
                    if (testErrors.duration) setTestErrors(prev => ({ ...prev, duration: '' }));
                  }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <MenuItem key={i} value={i}>{i}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 80 }}>
                <InputLabel>Minutes</InputLabel>
                <Select
                  value={testForm.duration.minutes}
                  label="Minutes"
                  onChange={(e) => {
                    setTestForm(prev => ({
                      ...prev,
                      duration: { ...prev.duration, minutes: e.target.value }
                    }));
                    if (testErrors.duration) setTestErrors(prev => ({ ...prev, duration: '' }));
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <MenuItem key={i} value={i}>{String(i).padStart(2, '0')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {testErrors.duration && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {testErrors.duration}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ p: 2, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
            Test Duration: {testForm.duration.hours}h {String(testForm.duration.minutes).padStart(2, '0')}m
          </Typography>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleCloseTestDialog} variant="outlined" color="inherit" disabled={creating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          startIcon={creating ? <CircularProgress size={16} /> : <QuizIcon />}
          disabled={creating}
        >
          {creating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Test' : 'Create Test')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};