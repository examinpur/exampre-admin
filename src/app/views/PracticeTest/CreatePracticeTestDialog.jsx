import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Chip,
  OutlinedInput,
  Typography
} from '@mui/material';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateQuestionBankDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    chapterName: '',
    topic: '',
    level: 'easy',
    isPaid: false,
    price: 0,
    test: []
  });

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch tests data when dialog opens
  useEffect(() => {
    if (open) {
      fetchTests();
    }
  }, [open]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/practice-test/all-tests`);
      if (response.status === 200 && response.data.tests) {
        setTests(response.data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load tests. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIsPaidChange = (event) => {
    const isPaid = event.target.checked;
    setFormData(prev => ({
      ...prev,
      isPaid,
      price: isPaid ? prev.price : 0
    }));
  };

  const handleTestChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      test: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
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

    if (formData.isPaid && (!formData.price || formData.price <= 0)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Price must be greater than 0 for paid question banks',
        confirmButtonColor: '#d33'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: formData.isPaid ? Number(formData.price) : 0
      };

      const response = await axios.post(`${BASE_URL}/api/practice-test`, payload);
      
      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Question bank created successfully!',
          confirmButtonColor: '#3085d6'
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          subject: '',
          chapterName: '',
          topic: '',
          level: 'easy',
          isPaid: false,
          price: 0,
          test: []
        });
        
        onSuccess(); // Callback to refresh parent data
        onClose(); // Close dialog
      }
    } catch (error) {
      console.error('Error creating question bank:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create question bank. Please try again.',
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
        isPaid: false,
        price: 0,
        test: []
      });
      onClose();
    }
  };

  const getTestDisplayName = (test) => {
    if (test.parentId) {
      return `${test.parentId.name} -> ${test.name}`;
    }
    return test.name;
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
      <DialogTitle>Create New Test</DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>Loading tests...</Typography>
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
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />

            <FormControl fullWidth variant="outlined" required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                label="Subject"
              >
                <MenuItem value="physics">Physics</MenuItem>
                <MenuItem value="chemistry">Chemistry</MenuItem>
                <MenuItem value="mathematics">Mathematics</MenuItem>
                <MenuItem value="biology">Biology</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Chapter Name"
              value={formData.chapterName}
              onChange={(e) => handleInputChange('chapterName', e.target.value)}
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Topic"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              fullWidth
              variant="outlined"
            />

            <FormControl fullWidth variant="outlined">
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
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPaid}
                  onChange={handleIsPaidChange}
                  color="primary"
                />
              }
              label="Is Paid"
            />

            {formData.isPaid && (
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                fullWidth
                variant="outlined"
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
            )}

            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Tests</InputLabel>
              <Select
                multiple
                value={formData.test}
                onChange={handleTestChange}
                input={<OutlinedInput label="Select Tests" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const test = tests.find(t => t._id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={test ? getTestDisplayName(test) : value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {tests.map((test) => (
                  <MenuItem key={test._id} value={test._id}>
                    {getTestDisplayName(test)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          disabled={loading || submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Creating...' : 'Create Question Bank'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateQuestionBankDialog;