import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';

export const CreateChapterDialog = ({ open, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    chapterName: '',
    subjectId: '',
  });
  const [subjects, setSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          chapterName: editData.chapterName || '',
          subjectId: editData.subjectId || '',
        });
      } else {
        setFormData({
          chapterName: '',
          subjectId: '',
        });
      }
    }
  }, [open, editData]);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await axios.get(`${BASE_URL}/api/subject`);
      setSubjects(response.data.data || response.data); // Handle both response formats
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load subjects. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSubjects();
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.toUpperCase()
    }));
  };

  const handleSubmit = async () => {
    if (!formData.chapterName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Chapter name is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (!formData.subjectId.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Subject is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        chapterName: formData.chapterName.trim(),
        subjectId: formData.subjectId,
      };

      let response;
      let successMessage;

      if (isEditMode) {
        response = await axios.patch(`${BASE_URL}/api/chapter/${editData._id}`, payload);
        successMessage = 'Chapter updated successfully!';
      } else {
        response = await axios.post(`${BASE_URL}/api/chapter`, payload);
        successMessage = 'Chapter created successfully!';
      }
      
      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: successMessage,
          confirmButtonColor: '#3085d6'
        });
        
        if (!isEditMode) {
          setFormData({
            chapterName: '',
            subjectId: '',
          });
        }
        
        onSuccess(); 
        onClose();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} chapter:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} chapter. Please try again.`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        chapterName: '',
        subjectId: '',
      });
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          minHeight: '400px'
        }
      }}
    >
      <DialogTitle>
        {isEditMode ? 'Edit Chapter' : 'Create New Chapter'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Chapter Name"
            value={formData.chapterName}
            onChange={(e) => handleInputChange('chapterName', e.target.value)}
            fullWidth
            required
            variant="outlined"
            placeholder="Enter chapter name"
          />

          <FormControl fullWidth variant="outlined" required>
            <InputLabel>Subject</InputLabel>
            <Select
              value={formData.subjectId}
              onChange={(e) => handleInputChange('subjectId', e.target.value)}
              label="Subject"
              disabled={loadingSubjects}
            >
              {loadingSubjects ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading subjects...
                </MenuItem>
              ) : subjects.length === 0 ? (
                <MenuItem disabled>No subjects available</MenuItem>
              ) : (
                subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.subject}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={submitting}
          color="secondary"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={submitting || loadingSubjects}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting 
            ? (isEditMode ? 'Updating...' : 'Creating...') 
            : (isEditMode ? 'Update Chapter' : 'Create Chapter')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};