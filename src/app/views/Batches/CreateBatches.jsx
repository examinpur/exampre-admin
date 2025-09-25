import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  CircularProgress,
  OutlinedInput,
  ListItemText,
  Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  AutoAwesome, 
  CloudUpload, 
  DeleteOutline, 
  GetApp,
  Group,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
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

export const CreateBatches = ({ 
  open,
  onClose,
  onSuccess,
  editData
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batchCode: '',
    startingDate: null,
    createdBy: 'admin',
    students: [],
    currentEnrollment: 0,
    subject: [], // Changed to array for multi-select
    course: [], // Changed to array for multi-select
    test: [], // Added for tests
    fees: {
      amount: 0,
      currency: 'INR'
    },
    isActive: true
  });

  const [feeType, setFeeType] = useState('free');
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  
  // New state for dynamic data
  const [formOptions, setFormOptions] = useState({
    courses: [],
    subjects: [],
    tests: []
  });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  
  const fileInputRef = useRef(null);

  // Fetch form options from API
  const fetchFormOptions = async () => {
    setLoadingOptions(true);
    setOptionsError('');
    
    try {
      // Fetch form data (courses and subjects)
      const formResponse = await axios.get(`${BASE_URL}/api/form`);
      
      // Fetch tests data
      const testResponse = await axios.get(`${BASE_URL}/api/library/get-global-test`);
      
      if (formResponse.data && formResponse.data.data && testResponse.data) {
        const { courses = [], subject = [] } = formResponse.data.data;
        const { testGlo = [] } = testResponse.data;
        
        setFormOptions({
          courses: courses,
          subjects: subject,
          tests: testGlo
        });
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching form options:', error);
      setOptionsError('Failed to load form options. Please refresh and try again.');
      
      // Fallback to default options
      setFormOptions({
        courses: [
          { _id: 'default1', course: 'JEE MAINS' },
          { _id: 'default2', course: 'JEE ADVANCE' },
          { _id: 'default3', course: 'NEET' },
          { _id: 'default4', course: 'OLYMPIAD' }
        ],
        subjects: [
          { _id: 'default1', subject: 'PHYSICS' },
          { _id: 'default2', subject: 'CHEMISTRY' },
          { _id: 'default3', subject: 'MATHEMATICS' },
          { _id: 'default4', subject: 'BIOLOGY' }
        ],
        tests: []
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  // Fetch options when component mounts or dialog opens
  useEffect(() => {
    if (open) {
      fetchFormOptions();
    }
  }, [open]);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        startingDate: new Date(editData.startingDate),
        subject: editData.subject || [],
        course: editData.course || [],
        test: editData.test || []
      });
      setFeeType(editData.fees.amount === 0 ? 'free' : 'paid');
      setCsvData(editData.students || []);
    } else {
      // Reset form when creating new batch
      setFormData({
        title: '',
        description: '',
        batchCode: '',
        startingDate: null,
        createdBy: 'admin',
        students: [],
        currentEnrollment: 0,
        subject: [],
        course: [],
        test: [],
        fees: {
          amount: 0,
          currency: 'INR'
        },
        isActive: true
      });
      setFeeType('free');
      setCsvData([]);
      setCsvFile(null);
      setCsvError('');
    }
  }, [editData, open]);

  const generateBatchCode = (title, subjects, startDate) => {
    if (!title || !subjects.length || !startDate) return '';
    
    const titleCode = title.substring(0, 3).toUpperCase();
    const subjectCode = subjects[0].substring(0, 3).toUpperCase();
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    
    return `${titleCode}-${subjectCode}-${year}-${month}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleAutoGenerateBatchCode = () => {
    if (formData.title && formData.subject.length > 0 && formData.startingDate) {
      const generatedCode = generateBatchCode(formData.title, formData.subject, formData.startingDate);
      handleInputChange('batchCode', generatedCode);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in Title, Subject, and Starting Date first to generate batch code',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleFeeTypeChange = (event) => {
    const type = event.target.value;
    setFeeType(type);
    
    if (type === 'free') {
      setFormData(prev => ({
        ...prev,
        fees: {
          ...prev.fees,
          amount: 0
        }
      }));
    }
  };

  const handleFeeAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      fees: {
        ...prev.fees,
        amount: amount
      }
    }));
  };

  // Function to get display names for selected items
  const getSelectedNames = (selectedIds, optionsArray, nameField) => {
    return selectedIds.map(id => {
      const item = optionsArray.find(option => option._id === id);
      return item ? item[nameField] : id;
    });
  };

  // CSV File Upload Functions
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const validateCsvHeaders = (headers) => {
    const requiredHeaders = ['name', 'email'];
    const optionalHeaders = ['phone', 'rollNumber', 'studentId'];
    const allowedHeaders = [...requiredHeaders, ...optionalHeaders];
    
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const missingRequired = requiredHeaders.filter(header => 
      !normalizedHeaders.includes(header)
    );
    
    if (missingRequired.length > 0) {
      return {
        valid: false,
        error: `Missing required columns: ${missingRequired.join(', ')}`
      };
    }

    const invalidHeaders = normalizedHeaders.filter(header => 
      !allowedHeaders.includes(header)
    );
    
    if (invalidHeaders.length > 0) {
      return {
        valid: true,
        warning: `Unknown columns will be ignored: ${invalidHeaders.join(', ')}`
      };
    }

    return { valid: true };
  };

  const processCsvData = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const validation = validateCsvHeaders(headers);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const students = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const student = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase();
        if (['name', 'email', 'phone', 'rollnumber', 'studentid'].includes(normalizedHeader)) {
          student[normalizedHeader === 'rollnumber' ? 'rollNumber' : 
                   normalizedHeader === 'studentid' ? 'studentId' : normalizedHeader] = values[index];
        }
      });

      // Validate required fields
      if (!student.name || !student.email) {
        errors.push(`Row ${i + 1}: Missing required fields (name or email)`);
        continue;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(student.email)) {
        errors.push(`Row ${i + 1}: Invalid email format`);
        continue;
      }

      students.push({
        ...student,
        id: Date.now() + Math.random(), // Temporary ID for display
        enrollmentDate: new Date().toISOString(),
        status: 'active'
      });
    }

    if (errors.length > 0) {
      throw new Error(`CSV processing errors:\n${errors.join('\n')}`);
    }

    return students;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    setCsvError('');
    setIsProcessingCsv(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      
      // Simulate progress for better UX
      setUploadProgress(30);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setUploadProgress(60);
      const students = processCsvData(text);
      
      setUploadProgress(90);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setCsvData(students);
      setFormData(prev => ({
        ...prev,
        students: students,
        currentEnrollment: students.length
      }));
      
      setUploadProgress(100);
      
      Swal.fire({
        icon: 'success',
        title: 'CSV Uploaded Successfully!',
        text: `Successfully imported ${students.length} students`,
        confirmButtonColor: '#3085d6'
      });
      
    } catch (error) {
      setCsvError(error.message);
      setCsvFile(null);
      setCsvData([]);
    } finally {
      setIsProcessingCsv(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    setCsvData([]);
    setCsvError('');
    setFormData(prev => ({
      ...prev,
      students: [],
      currentEnrollment: 0
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent = 'name,email\n' +
                      'John Doe,john@example.com\n' +
                      'Jane Smith,jane@example.com';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (formData.subject.length === 0) errors.push('At least one subject is required');
    if (formData.course.length === 0) errors.push('At least one course is required');
    if (!formData.batchCode.trim()) errors.push('Batch code is required');
    if (!formData.startingDate) errors.push('Starting date is required');
    
    if (feeType === 'paid' && formData.fees.amount <= 0) {
      errors.push('Fee amount must be greater than 0 for paid batches');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        html: errors.map(error => `• ${error}`).join('<br>'),
        confirmButtonColor: '#d33'
      });
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        startingDate: formData.startingDate.toISOString(),
        students: csvData.map(student => ({
          name: student.name,
          email: student.email,
        }))
      };

      let response;
      if (editData) {
        response = await axios.patch(`${BASE_URL}/api/batch/${editData._id}`, submitData);
      } else {
        response = await axios.post(`${BASE_URL}/api/admin/batch`, submitData);
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Batch ${editData ? 'updated' : 'created'} successfully`,
          confirmButtonColor: '#3085d6'
        });
        
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving batch:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${editData ? 'update' : 'create'} batch`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          {editData ? 'Edit Batch' : 'Create New Batch'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Show loading or error for form options */}
            {loadingOptions && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Loading form options...</Typography>
              </Box>
            )}
            
            {optionsError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {optionsError}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title *"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Web Development Bootcamp"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Starting Date *"
                  value={formData.startingDate}
                  onChange={(date) => handleInputChange('startingDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the batch..."
                />
              </Grid>
              
              {/* Course and Subject Selection */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Course & Subject Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Courses *</InputLabel>
                  <Select
                    multiple
                    value={formData.course}
                    onChange={handleMultiSelectChange('course')}
                    input={<OutlinedInput label="Courses *" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {getSelectedNames(selected, formOptions.courses, 'course').map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                    disabled={loadingOptions}
                  >
                    {formOptions.courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        <Checkbox checked={formData.course.indexOf(course._id) > -1} />
                        <ListItemText primary={course.course} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Subjects *</InputLabel>
                  <Select
                    multiple
                    value={formData.subject}
                    onChange={handleMultiSelectChange('subject')}
                    input={<OutlinedInput label="Subjects *" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {getSelectedNames(selected, formOptions.subjects, 'subject').map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                    disabled={loadingOptions}
                  >
                    {formOptions.subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        <Checkbox checked={formData.subject.indexOf(subject._id) > -1} />
                        <ListItemText primary={subject.subject} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tests</InputLabel>
                  <Select
                    multiple
                    value={formData.test}
                    onChange={handleMultiSelectChange('test')}
                    input={<OutlinedInput label="Tests" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {getSelectedNames(selected, formOptions.tests, 'name').map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                    disabled={loadingOptions}
                  >
                    {formOptions.tests.map((test) => (
                      <MenuItem key={test._id} value={test._id}>
                        <Checkbox checked={formData.test.indexOf(test._id) > -1} />
                        <ListItemText 
                          primary={test.name} 
                          secondary={`Date: ${test.date}${test.parentId ? ` | Folder: ${test.parentId.name}` : ''}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Schedule Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Batch Code
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Batch Code *"
                  value={formData.batchCode}
                  onChange={(e) => handleInputChange('batchCode', e.target.value.toUpperCase())}
                  placeholder="Enter batch code or use auto-generate"
                  helperText="Unique identifier for this batch"
                />
              </Grid>
              
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                <Tooltip title="Auto-generate batch code from title, subject and start date">
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesome />}
                    onClick={handleAutoGenerateBatchCode}
                    fullWidth
                    sx={{ mt: ["-20px"] }}
                  >
                    Auto Generate
                  </Button>
                </Tooltip>
              </Grid>

              {/* Students Upload Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Students Management
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    }
                  }}
                >
                  {!csvFile ? (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload Student List
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Upload a CSV file containing student information
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          startIcon={<CloudUpload />}
                          onClick={handleFileSelect}
                          sx={{
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                          }}
                        >
                          Choose CSV File
                        </Button>
                        
                        <Button
                          variant="outlined"
                          startIcon={<GetApp />}
                          onClick={downloadCsvTemplate}
                          sx={{ borderColor: '#1976d2', color: '#1976d2' }}
                        >
                          Download Template
                        </Button>
                      </Box>
                      
                      <Typography variant="caption" display="block" sx={{ mt: 2, color: '#666' }}>
                        Required columns: name, email | Optional: phone, rollNumber, studentId
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {isProcessingCsv ? (
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Processing CSV File...
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress} 
                            sx={{ 
                              mt: 2, 
                              height: 8, 
                              borderRadius: 4,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                              }
                            }} 
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {uploadProgress}% Complete
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            File Uploaded Successfully!
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Chip
                              icon={<Group />}
                              label={`${csvData.length} Students`}
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontSize: '1.1rem',
                                height: '40px',
                                '& .MuiChip-label': {
                                  padding: '0 16px',
                                  fontWeight: 500
                                }
                              }}
                            />
                            <Chip
                              label={csvFile.name}
                              color="success"
                              variant="outlined"
                              sx={{
                                fontSize: '1.1rem',
                                height: '40px',
                                '& .MuiChip-label': {
                                  padding: '0 16px',
                                  fontWeight: 500
                                }
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              startIcon={<CloudUpload />}
                              onClick={handleFileSelect}
                              size="small"
                            >
                              Replace File
                            </Button>
                            
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutline />}
                              onClick={handleRemoveFile}
                              size="small"
                            >
                              Remove File
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Paper>

                {csvError && (
                  <Alert 
                    severity="error" 
                    icon={<ErrorIcon />}
                    sx={{ mt: 2 }}
                    onClose={() => setCsvError('')}
                  >
                    {csvError}
                  </Alert>
                )}

                {csvData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert 
                      severity="info"
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">
                        <strong>Students Preview:</strong> {csvData.length} students will be enrolled in this batch
                      </Typography>
                    </Alert>
                    
                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                      {csvData.slice(0, 5).map((student, index) => (
                        <Box key={student.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">
                            {student.name} ({student.email})
                          </Typography>
                          {student.rollNumber && (
                            <Chip label={student.rollNumber} size="small" variant="outlined" />
                          )}
                        </Box>
                      ))}
                      {csvData.length > 5 && (
                        <Typography variant="caption" color="textSecondary">
                          ... and {csvData.length - 5} more students
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  style={{ display: 'none' }}
                />
              </Grid>
              
              {/* Fee Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Fee Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl>
                  <FormLabel>Fee Type</FormLabel>
                  <RadioGroup
                    row
                    value={feeType}
                    onChange={handleFeeTypeChange}
                  >
                    <FormControlLabel 
                      value="free" 
                      control={<Radio />} 
                      label="Free" 
                    />
                    <FormControlLabel 
                      value="paid" 
                      control={<Radio />} 
                      label="Paid" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              {feeType === 'paid' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fee Amount (₹)"
                    type="number"
                    value={formData.fees.amount}
                    onChange={handleFeeAmountChange}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                    placeholder="Enter fee amount"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading || isProcessingCsv}
          >
            {loading ? 'Saving...' : (editData ? 'Update' : 'Create')} Batch
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};