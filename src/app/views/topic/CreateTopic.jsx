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
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';

export const CreateTopicDialog = ({ open, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    topic: '',
    subjectId: '',
    chapterId: '',
  });
  
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  
  const isEditMode = Boolean(editData);

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          topic: editData.topic || '',
          subjectId: editData.subjectId || '',
          chapterId: editData.chapterId || '',
        });
        // If editing and subjectId exists, fetch chapters for that subject
        if (editData.subjectId) {
          fetchChapters(editData.subjectId);
        }
      } else {
        setFormData({
          topic: '',
          subjectId: '',
          chapterId: '',
        });
        setChapters([]); // Clear chapters when creating new
      }
    }
  }, [open, editData]);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await axios.get(`${BASE_URL}/api/subject`);
      setSubjects(response.data.data || response.data);
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

  const fetchChapters = async (subjectId) => {
    if (!subjectId) {
      setChapters([]);
      return;
    }

    try {
      setLoadingChapters(true);
      const response = await axios.get(`${BASE_URL}/api/chapter/subject/${subjectId}`);
      setChapters(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load chapters. Please try again.',
        confirmButtonColor: '#d33'
      });
      setChapters([]);
    } finally {
      setLoadingChapters(false);
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

    // If subject changes, fetch chapters and reset chapter selection
    if (field === 'subjectId') {
      setFormData(prev => ({
        ...prev,
        chapterId: '' // Reset chapter when subject changes
      }));
      fetchChapters(value);
    }
  };

  const handleSubmit = async () => {
    if (!formData.topic.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Topic is required',
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

    if (!formData.chapterId.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Chapter is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        topic: formData.topic.trim(),
        subjectId: formData.subjectId,
        chapterId: formData.chapterId,
      };

      let response;
      let successMessage;

      if (isEditMode) {
        response = await axios.patch(`${BASE_URL}/api/topic/${editData._id}`, payload);
        successMessage = 'Topic updated successfully!';
      } else {
        response = await axios.post(`${BASE_URL}/api/topic`, payload);
        successMessage = 'Topic created successfully!';
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
            topic: '',
            subjectId: '',
            chapterId: '',
          });
          setChapters([]);
        }
        
        onSuccess(); 
        onClose();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} topic:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} topic. Please try again.`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        topic: '',
        subjectId: '',
        chapterId: '',
      });
      setChapters([]);
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
          minHeight: '500px'
        }
      }}
    >
      <DialogTitle>
        {isEditMode ? 'Edit Topic' : 'Create New Topic'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          
          {/* Subject Select */}
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

          {/* Chapter Select */}
          <FormControl fullWidth variant="outlined" required>
            <InputLabel>Chapter</InputLabel>
            <Select
              value={formData.chapterId}
              onChange={(e) => handleInputChange('chapterId', e.target.value)}
              label="Chapter"
              disabled={!formData.subjectId || loadingChapters}
            >
              {!formData.subjectId ? (
                <MenuItem disabled>Please select a subject first</MenuItem>
              ) : loadingChapters ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading chapters...
                </MenuItem>
              ) : chapters.length === 0 ? (
                <MenuItem disabled>No chapters available for this subject</MenuItem>
              ) : (
                chapters.map((chapter) => (
                  <MenuItem key={chapter._id} value={chapter._id}>
                    {chapter.chapterName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Topic Input */}
          <TextField
            label="Topic"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            fullWidth
            required
            variant="outlined"
            placeholder="Enter topic name"
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
          disabled={submitting || loadingSubjects || loadingChapters}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting 
            ? (isEditMode ? 'Updating...' : 'Creating...') 
            : (isEditMode ? 'Update Topic' : 'Create Topic')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};