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
  Typography,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';

// Create Subject Dialog Component
export const CreateClassDialog = ({ open, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    class: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          class: editData.class || '',
        });
      } else {
        setFormData({
          class: '',
        });
      }
    }
  }, [open, editData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.class.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'class is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        className: formData.class.trim(),
      };

      let response;
      let successMessage;

      if (isEditMode) {
        response = await axios.patch(`${BASE_URL}/api/class/${editData._id}`, payload);
        successMessage = 'class updated successfully!';
      } else {
        response = await axios.post(`${BASE_URL}/api/class`, payload);
        successMessage = 'class created successfully!';
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
            class: '',
          });
        }
        
        onSuccess(); 
        onClose();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} class:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} class. Please try again.`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
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
        {isEditMode ? 'Edit Class' : 'Create New Class'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Class"
            value={formData.class}
            onChange={(e) => handleInputChange('class', e.target.value)}
            fullWidth
            required
            variant="outlined"
            placeholder="Enter class name"
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
            : (isEditMode ? 'Update Class' : 'Create Class')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};
