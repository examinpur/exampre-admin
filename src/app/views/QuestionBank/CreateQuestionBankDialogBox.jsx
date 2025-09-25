import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Typography,
  Autocomplete
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';

export const CreateQuestionBankDialog = ({ open, onClose, onSuccess, editData }) => {
  const { folderId } = useParams(); 
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    chapterName: '',
    topic: '',
    level: 'easy',
  });

  // API data states
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const isEditMode = Boolean(editData);

  // Fetch subjects when dialog opens
  useEffect(() => {
    if (open) {
      fetchSubjects();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          title: editData.title || '',
          description: editData.description || '',
          subject: editData.subject || '',
          chapterName: editData.chapterName || '',
          topic: editData.topic || '',
          level: editData.level || 'easy',
        });
        
        // If edit mode, we need to load the related data
        if (editData.subject) {
          fetchChapters(editData.subject);
        }
        if (editData.chapterName) {
          fetchTopics(editData.chapterName);
        }
      } else {
        setFormData({
          title: '',
          description: '',
          subject: '',
          chapterName: '',
          topic: '',
          level: 'easy',
        });
        setChapters([]);
        setTopics([]);
      }
    }
  }, [open, editData]);

  // Fetch subjects
  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/subject`);
      setSubjects(response.data.data || []);
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

  // Fetch chapters based on selected subject
  const fetchChapters = async (subjectId) => {
    if (!subjectId) return;
    
    setLoadingChapters(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/chapter/subject/${subjectId}`);
      setChapters(response.data.data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load chapters. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingChapters(false);
    }
  };

  // Fetch topics based on selected chapter
  const fetchTopics = async (chapterId) => {
    if (!chapterId) return;
    
    setLoadingTopics(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/topic/chapter/${chapterId}`);
      setTopics(response.data.data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load topics. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Handle cascading dropdowns
    if (field === 'subject') {
      // Reset chapter and topic when subject changes
      setFormData(prev => ({
        ...prev,
        chapterName: '',
        topic: ''
      }));
      setChapters([]);
      setTopics([]);
      
      // Fetch chapters for the selected subject
      if (value) {
        fetchChapters(value);
      }
    }

    if (field === 'chapterName') {
      // Reset topic when chapter changes
      setFormData(prev => ({
        ...prev,
        topic: ''
      }));
      setTopics([]);
      
      // Fetch topics for the selected chapter
      if (value) {
        fetchTopics(value);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Title is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (!formData.subject.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Subject is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (!formData.chapterName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Chapter name is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (!formData.topic.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Topic is required',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        subject: formData.subject,
        chapterName: formData.chapterName,
        topic: formData.topic,
        level: formData.level,
        createdBy: "admin"
      };
      
      if (!isEditMode && folderId) {
        payload.parentId = folderId;
      }

      let response;
      let successMessage;

      if (isEditMode) {
        response = await axios.patch(`${BASE_URL}/api/admin/question-bank/${editData._id}`, payload);
        successMessage = 'Question bank updated successfully!';
      } else {
        response = await axios.post(`${BASE_URL}/api/admin/question-bank`, payload);
        successMessage = 'Question bank created successfully!';
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
            title: '',
            description: '',
            subject: '',
            chapterName: '',
            topic: '',
            level: 'easy',
          });
          setChapters([]);
          setTopics([]);
        }
        
        onSuccess(); 
        onClose();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} question bank:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} question bank. Please try again.`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        title: '',
        description: '',
        subject: '',
        chapterName: '',
        topic: '',
        level: 'easy',
      });
      setSubjects([]);
      setChapters([]);
      setTopics([]);
      onClose();
    }
  };

  const getSelectedChapter = () => {
    return chapters.find(c => c._id === formData.chapterName) || null;
  };

  // Get selected topic object for Autocomplete
  const getSelectedTopic = () => {
    return topics.find(t => t._id === formData.topic) || null;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle>
        {isEditMode ? 'Edit Question Bank' : 'Create New Question Bank'}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>Loading...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              helperText="This field is optional"
            />

            <FormControl fullWidth variant="outlined" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                label="Subject"
                disabled={loadingSubjects}
              >
                {loadingSubjects ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading subjects...
                  </MenuItem>
                ) : (
                  subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.subject}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Chapter Name with Search */}
            <Autocomplete
              options={chapters}
              getOptionLabel={(option) => option.chapterName || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={getSelectedChapter()}
              onChange={(event, newValue) => {
                handleInputChange('chapterName', newValue ? newValue._id : '');
              }}
              disabled={!formData.subject || loadingChapters}
              loading={loadingChapters}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chapter Name"
                  variant="outlined"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingChapters ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText={
                    !formData.subject ? 'Select a subject first' :
                    loadingChapters ? 'Loading chapters...' :
                    chapters.length === 0 ? 'No chapters available' : ''
                  }
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {option.chapterName}
                </Box>
              )}
              noOptionsText={
                !formData.subject ? 'Select a subject first' :
                loadingChapters ? 'Loading...' : 'No chapters found'
              }
            />

            {/* Topic with Search */}
            <Autocomplete
              options={topics}
              getOptionLabel={(option) => option.topic || ''}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              value={getSelectedTopic()}
              onChange={(event, newValue) => {
                handleInputChange('topic', newValue ? newValue._id : '');
              }}
              disabled={!formData.chapterName || loadingTopics}
              loading={loadingTopics}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Topic"
                  variant="outlined"
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTopics ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  helperText={
                    !formData.chapterName ? 'Select a chapter first' :
                    loadingTopics ? 'Loading topics...' :
                    topics.length === 0 ? 'No topics available' : ''
                  }
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {option.topic}
                </Box>
              )}
              noOptionsText={
                !formData.chapterName ? 'Select a chapter first' :
                loadingTopics ? 'Loading...' : 'No topics found'
              }
            />
{/* 
            <FormControl fullWidth variant="outlined" required>
              <InputLabel>Level</InputLabel>
              <Select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                label="Level"
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="difficult">Difficult</MenuItem>
              </Select>
            </FormControl> */}
          </Box>
        )}
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
          disabled={loading || submitting || loadingSubjects || loadingChapters || loadingTopics}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting 
            ? (isEditMode ? 'Updating...' : 'Creating...') 
            : (isEditMode ? 'Update Question Bank' : 'Create Question Bank')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateQuestionBankDialog;