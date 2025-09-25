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

} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';

// Create Subject Dialog Component
export const CreateCourseDialog = ({ open, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    course: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          course: editData.course || '',
        });
      } else {
        setFormData({
          course: '',
        });
      }
    }
  }, [open, editData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.toUpperCase()
    }));
  };

  const handleSubmit = async () => {
    if (!formData.course.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Course is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        course: formData.course.trim(),
      };

      let response;
      let successMessage;

      if (isEditMode) {
        response = await axios.patch(`${BASE_URL}/api/course/${editData._id}`, payload);
        successMessage = 'Course updated successfully!';
      } else {
        response = await axios.post(`${BASE_URL}/api/course`, payload);
        successMessage = 'Course created successfully!';
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
            course: '',
          });
        }
        
        onSuccess(); 
        onClose();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} course:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} Course. Please try again.`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        course: '',
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
        {isEditMode ? 'Edit Course' : 'Create New Course'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Course"
            value={formData.course}
            onChange={(e) => handleInputChange('course', e.target.value)}
            fullWidth
            required
            variant="outlined"
            placeholder="Enter Course name"
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
            : (isEditMode ? 'Update Course' : 'Create Course')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};
