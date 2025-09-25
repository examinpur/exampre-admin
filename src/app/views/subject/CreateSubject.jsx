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
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';

export const CreateSubjectDialog = ({ open, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    subject: '',
    class: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const isEditMode = Boolean(editData);

  // Fetch classes when dialog opens
  useEffect(() => {
    if (open) {
      fetchClasses();
      if (editData) {
        setFormData({
          subject: editData.subject || '',
          class: editData.class || '',
        });
      } else {
        setFormData({
          subject: '',
          class: '',
        });
      }
    }
  }, [open, editData]);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/class`);
      if (response.data && response.data.data) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load classes. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'subject') {
      setFormData(prev => ({
        ...prev,
        [field]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.subject.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Subject is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (!formData.class) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Class is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        subject: formData.subject.trim(),
        classId: formData.class,
      };

      let response;
      let successMessage;

      if (isEditMode) {
        response = await axios.patch(`${BASE_URL}/api/subject/${editData._id}`, payload);
        successMessage = 'Subject updated successfully!';
      } else {
        response = await axios.post(`${BASE_URL}/api/subject`, payload);
        successMessage = 'Subject created successfully!';
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
            subject: '',
            class: '',
          });
        }
        
        onSuccess(); 
        onClose();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} subject:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} subject. Please try again.`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        subject: '',
        class: '',
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
          minHeight: '300px'
        }
      }}
    >
      <DialogTitle>
        {isEditMode ? 'Edit Subject' : 'Create New Subject'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth required variant="outlined">
            <InputLabel>Class</InputLabel>
            <Select
              value={formData.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              label="Class"
              disabled={loadingClasses}
            >
              {loadingClasses ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading classes...
                </MenuItem>
              ) : (
                classes.map((classItem) => (
                  <MenuItem key={classItem._id} value={classItem._id}>
                    Class {classItem.class}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            label="Subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            fullWidth
            required
            variant="outlined"
            placeholder="Enter subject name"
          />
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
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting 
            ? (isEditMode ? 'Updating...' : 'Creating...') 
            : (isEditMode ? 'Update Subject' : 'Create Subject')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};