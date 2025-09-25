import React, { useState, useEffect } from 'react'; // Import useEffect
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Divider,
  Chip,
  Menu, // For sub-question type selection
  CircularProgress,
  Autocomplete,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  HelpOutline as HelpOutlineIcon, // For general question icon
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import styled from '@emotion/styled';
import Swal from 'sweetalert2';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import { TrueFalseQuestionDialog } from './TrueFalseDialogBox';
import { MCQQuestionDialog } from './MCQDialogBox';
import { IntegerQuestionDialog } from './IntegerDialogBox';
import { FillInTheBlankQuestionDialog } from './FillInTheBlankQuestionDialog';

// Import KaTeX components and CSS
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// The PERFECT Helper function to render text with LaTeX support
const renderTextWithLatex = (text) => {
    if (!text) return null;

    const textStr = String(text);
    const latexRegex = /(\$\$[\s\S]*?\$\$)|(\$((?:\\.|[^$])*?)\$)/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = latexRegex.exec(textStr)) !== null) {
        const fullMatch = match[0];
        const blockMathFull = match[1];
        const inlineMathFull = match[2];
        const inlineMathContent = match[3];
        const offset = match.index;

        if (offset > lastIndex) {
            const textBefore = textStr.substring(lastIndex, offset);
            if (textBefore) {
                parts.push(<span key={`text-${lastIndex}`}>{textBefore}</span>);
            }
        }

        try {
            if (blockMathFull) {
                const mathContent = blockMathFull.slice(2, -2).trim();
                parts.push(
                    <span key={`block-${offset}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                        <InlineMath math={mathContent} />
                    </span>
                );
            } else if (inlineMathFull) {
                const mathContent = inlineMathContent.trim();
                parts.push(<InlineMath key={`inline-${offset}`} math={mathContent} />);
            }
        } catch (error) {
            console.warn('LaTeX rendering error:', error, 'Content:', fullMatch);
            parts.push(
                <span
                    key={`error-${offset}`}
                    className="latex-error"
                    title={`LaTeX Error: ${error.message}`}
                    style={{ color: 'red', fontFamily: 'monospace', background: '#ffebee', padding: '2px 4px', borderRadius: '3px', fontSize: '0.9em' }}
                >
                    {fullMatch}
                </span>
            );
        }

        lastIndex = offset + fullMatch.length;
    }

    if (lastIndex < textStr.length) {
        const remainingText = textStr.substring(lastIndex);
        if (remainingText) {
            parts.push(<span key={`text-${lastIndex}`}>{remainingText}</span>);
        }
    }

    if (parts.length === 0 && textStr.length > 0) {
        return <span>{textStr}</span>;
    } else if (parts.length === 0 && textStr.length === 0) {
        return null;
    }

    return (
        <div style={{
            display: 'inline',
            lineHeight: 'normal',
            whiteSpace: 'pre-wrap'
        }}>
            {parts}
        </div>
    );
};

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

const SubQuestionDisplayCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: '8px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

/**
 * Renders a dialog for creating or editing a comprehensive question.
 * A comprehensive question includes a passage and an array of sub-questions
 * of various types (MCQ, True/False, Integer, Fill-in-the-Blank).
 *
 * @param {object} props - The component props.
 * @param {boolean} props.open - Controls the visibility of the dialog.
 * @param {function} props.onClose - Callback fired when the dialog is requested to be closed.
 * @param {function} props.onCreateQuestion - Callback fired when the comprehensive question is saved.
 * Receives the comprehensive question payload. This function is expected to handle API calls and
 * overall success messages.
 * @param {object} [props.editQuestion] - The comprehensive question object to pre-fill the form for editing.
 */
export const ComprehensiveQuestionDialog = ({ open, onClose, onCreateQuestion, editQuestion }) => {
  const [formData, setFormData] = useState({
    questionText: '', // Main question text (e.g., "Read the following passage...")
    questionUrl: '',
    passage: '',
    marks: '', // Total marks for the comprehensive question
    negativeMarking: false,
    negativeMarksValue: '',
    difficultyLevel: 'easy',
    subject: '',
    chapterName: '',
    topic: '',
    previousYearsQuestion: false,
    year: '',
    titles: [],
    resource: '',
    solution: '',
    class : "",
    course : "",
    subQuestions: [], // Array to hold sub-question objects
  });

  // API data states
  const [formOptions, setFormOptions] = useState({
    courses: [],
    subjects: [],
    classes: []
  });
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingFormOptions, setLoadingFormOptions] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Preview states
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [showPassagePreview, setShowPassagePreview] = useState(false);

  // State for managing the sub-question editing/creation dialog
  const [isSubQuestionDialogOpen, setIsSubQuestionDialogOpen] = useState(false);
  const [currentSubQuestionData, setCurrentSubQuestionData] = useState(null); // Data of the sub-question being edited
  const [editingSubQuestionIndex, setEditingSubQuestionIndex] = useState(-1); // Index in subQuestions array, -1 for new
  const [currentSubQuestionType, setCurrentSubQuestionType] = useState(''); // Type of sub-question being added/edited

  // State for the "Add Sub-Question" type selection menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openSubQuestionMenu = Boolean(anchorEl);

  // Fetch form options when dialog opens
  useEffect(() => {
    if (open) {
      fetchFormOptions();
    }
  }, [open]);

  // Effect to populate form data when editing an existing question or reset for a new one
  useEffect(() => {
    if (editQuestion) {
      setFormData({
        questionText: editQuestion.questionText || '',
        questionUrl: editQuestion.questionUrl || '',
        passage: editQuestion.passage || '',
        marks: editQuestion.marks || '',
        negativeMarking: editQuestion.negativeMarking || false,
        negativeMarksValue: editQuestion.negativeMarksValue || '',
        difficultyLevel: editQuestion.difficultyLevel || 'easy',
        subject: editQuestion.subject || '',
        chapterName: editQuestion.chapterName || '',
        topic: editQuestion.topic || '',
        previousYearsQuestion: editQuestion.previousYearsQuestion || false,
        year: editQuestion.year || '',
        titles: editQuestion.titles || [],
        resource: editQuestion.resource || '',
        solution: editQuestion.solution || '',
        subQuestions: editQuestion.subQuestions ? JSON.parse(JSON.stringify(editQuestion.subQuestions)) : [],
      });

      // Load related data for edit mode
      if (editQuestion.subject) {
        fetchChapters(editQuestion.subject);
      }
      if (editQuestion.chapterName) {
        fetchTopics(editQuestion.chapterName);
      }
    } else {
      // Reset form for new question creation
      setFormData({
        questionText: '',
        questionUrl: '',
        passage: '',
        marks: '',
        negativeMarking: false,
        negativeMarksValue: '',
        difficultyLevel: 'easy',
        subject: '',
        chapterName: '',
        topic: '',
        previousYearsQuestion: false,
        year: '',
        titles: [],
        resource: '',
        solution: '',
        subQuestions: [],
      });
      setChapters([]);
      setTopics([]);
    }
    // Reset preview states
    setShowQuestionPreview(false);
    setShowPassagePreview(false);
  }, [editQuestion, open]);

  // Fetch form options from API
  const fetchFormOptions = async () => {
    setLoadingFormOptions(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/form`);
      if (response.data && response.data.data) {
        const { courses = [], subject = [], classs = [] } = response.data.data;
        setFormOptions({
          courses: courses,
          subjects: subject,
          classes: classs
        });
      }
    } catch (error) {
      console.error('Error fetching form options:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load form options. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingFormOptions(false);
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

  // General input change handler for text fields
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // General switch change handler for boolean fields
  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => {
      const newState = {
        ...prev,
        [field]: event.target.checked
      };
      if (field === 'previousYearsQuestion' && !event.target.checked) {
        newState.year = '';
        newState.titles = [];
      }
      return newState;
    });
  };

  // Handler for select changes
  const handleSelectChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      
      // Handle cascading dropdowns
      if (field === 'subject') {
        newState.chapterName = '';
        newState.topic = '';
        setChapters([]);
        setTopics([]);
        
        if (value) {
          fetchChapters(value);
        }
      }
      
      if (field === 'chapterName') {
        newState.topic = '';
        setTopics([]);
        
        if (value) {
          fetchTopics(value);
        }
      }
      
      return newState;
    });
  };

  const handleTitlesChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      titles: newValue
    }));
  };

  // Helper functions for Autocomplete
  const getSelectedChapter = () => {
    return chapters.find(c => c._id === formData.chapterName) || null;
  };

  const getSelectedTopic = () => {
    return topics.find(t => t._id === formData.topic) || null;
  };

  // Toggle preview functions
  const toggleQuestionPreview = () => {
    setShowQuestionPreview(prev => !prev);
  };

  const togglePassagePreview = () => {
    setShowPassagePreview(prev => !prev);
  };

  // Opens the menu for selecting sub-question type
  const handleOpenSubQuestionMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Closes the menu for selecting sub-question type
  const handleCloseSubQuestionMenu = () => {
    setAnchorEl(null);
  };

  // Initiates adding a new sub-question of the selected type
  const handleAddSubQuestionClick = (type) => {
    setCurrentSubQuestionType(type);
    setCurrentSubQuestionData(null); // No data for new sub-question
    setEditingSubQuestionIndex(-1); // Indicate new sub-question
    setIsSubQuestionDialogOpen(true);
    handleCloseSubQuestionMenu(); // Close the menu after selection
  };

  // Initiates editing an existing sub-question
  const handleEditSubQuestion = (subQ, index) => {
    setCurrentSubQuestionType(subQ.type);
    setCurrentSubQuestionData(JSON.parse(JSON.stringify(subQ))); // Deep copy the sub-question data
    setEditingSubQuestionIndex(index);
    setIsSubQuestionDialogOpen(true);
  };

  // Handles deletion of a sub-question with a confirmation dialog
  const handleDeleteSubQuestion = (indexToRemove) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prev => ({
          ...prev,
          subQuestions: prev.subQuestions.filter((_, i) => i !== indexToRemove)
        }));
        Swal.fire(
          'Deleted!',
          'Your sub-question has been deleted.',
          'success'
        );
      }
    });
  };

  // Callback for when a sub-question dialog saves its data
  const handleSaveSubQuestion = (subQuestionPayload) => {
    setFormData(prev => {
      const newSubQuestions = [...prev.subQuestions];
      if (editingSubQuestionIndex !== -1) {
        // Editing existing sub-question
        newSubQuestions[editingSubQuestionIndex] = subQuestionPayload;
      } else {
        // Adding new sub-question; assign a temporary _id if not present for React list key
        newSubQuestions.push({
            ...subQuestionPayload,
            _id: subQuestionPayload._id || `temp-${Date.now()}-${Math.random()}`
        });
      }
      return {
        ...prev,
        subQuestions: newSubQuestions
      };
    });
    // Close the sub-question dialog and reset states
    setIsSubQuestionDialogOpen(false);
    setCurrentSubQuestionData(null);
    setEditingSubQuestionIndex(-1);
    setCurrentSubQuestionType('');
  };

  // Closes the sub-question dialog without saving
  const handleCloseSubQuestionDialog = () => {
    setIsSubQuestionDialogOpen(false);
    setCurrentSubQuestionData(null);
    setEditingSubQuestionIndex(-1);
    setCurrentSubQuestionType('');
  };

  // Handles saving the entire comprehensive question
  const handleSaveComprehensiveQuestion = async () => {
    // --- Validation Logic for Comprehensive Question ---
    if (!formData.questionText.trim() && !formData.passage.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Either Main Question Text or Passage is required.',
            confirmButtonColor: '#f39c12'
        });
        return;
    }
    if (formData.subQuestions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'At least one sub-question is required for a comprehensive question.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }
    if (isNaN(parseFloat(formData.marks)) || parseFloat(formData.marks) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Total marks must be a positive number.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }
    if (formData.negativeMarking && (isNaN(parseFloat(formData.negativeMarksValue)) || parseFloat(formData.negativeMarksValue) <= 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Negative marks value must be a positive number if negative marking is enabled.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    // Subject, Chapter, Topic validation
    if (!formData.subject) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Subject is required.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (!formData.chapterName) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Chapter is required.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (!formData.topic) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Topic is required.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    // Previous years question validation
    if (formData.previousYearsQuestion && (!formData.year.trim() || formData.titles.length === 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Year and at least one title are required when marking as previous years question.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }
    // --- End Validation Logic ---

    setLoading(true);
    try {
      const payload = {
        type: "comprehension",
        questionText: formData.questionText.trim(),
        questionUrl: formData.questionUrl.trim() || undefined,
        passage: formData.passage.trim(),
        marks: parseFloat(formData.marks),
        negativeMarking: formData.negativeMarking,
        negativeMarksValue: formData.negativeMarking ? parseFloat(formData.negativeMarksValue) : 0,
        difficultyLevel: formData.difficultyLevel,
        subject: formData.subject,
        chapterName: formData.chapterName,
        topic: formData.topic,
        previousYearsQuestion: formData.previousYearsQuestion,
        year: formData.previousYearsQuestion ? formData.year.trim() : '',
        titles: formData.previousYearsQuestion ? formData.titles : [],
        resource: formData.resource.trim() || undefined,
        solution: formData.solution.trim() || undefined,
        subQuestions: formData.subQuestions.map(subQ => {
            const { _id, ...rest } = subQ; 
            return rest;
        }),
      };
      await onCreateQuestion(payload);
      onClose();
    } catch (error) {
      console.error(`Error ${editQuestion ? 'updating' : 'creating'} comprehensive question:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${editQuestion ? 'update' : 'create'} question. Please try again.`,
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get a user-friendly label for sub-question types
  const getSubQuestionTypeLabel = (type) => {
    switch (type) {
      case 'mcq': return 'Multiple Choice Question';
      case 'truefalse': return 'True/False Question';
      case 'integerType': return 'Integer Type Question';
      case 'fillintheblank': return 'Fill-in-the-Blank Question';
      default: return 'Unknown Type';
    }
  };

 
  const renderSubQuestionDialog = () => {
    switch (currentSubQuestionType) {
      case 'truefalse':
        return (
          <TrueFalseQuestionDialog
            open={isSubQuestionDialogOpen}
            onClose={handleCloseSubQuestionDialog}
            onSaveSubQuestion={handleSaveSubQuestion}
            comprehensive = {true}
            editQuestion={currentSubQuestionData}
          />
        );
      case 'mcq':
        return (
          <MCQQuestionDialog
            open={isSubQuestionDialogOpen}
            onClose={handleCloseSubQuestionDialog}
            onSaveSubQuestion={handleSaveSubQuestion}
            comprehensive = {true}
            editQuestion={currentSubQuestionData}
          />
        );
      case 'integerType':
        return (
          <IntegerQuestionDialog
            open={isSubQuestionDialogOpen}
            onClose={handleCloseSubQuestionDialog}
            onSaveSubQuestion={handleSaveSubQuestion}
            comprehensive = {true}
            editQuestion={currentSubQuestionData}
          />
        );
      case 'fillintheblank':
        return (
          <FillInTheBlankQuestionDialog
            open={isSubQuestionDialogOpen}
            onClose={handleCloseSubQuestionDialog}
            comprehensive = {true}
            onSaveSubQuestion={handleSaveSubQuestion}
            editQuestion={currentSubQuestionData}
          />
        );
      default:
        return (
          <Dialog open={isSubQuestionDialogOpen} onClose={handleCloseSubQuestionDialog}>
            <DialogTitle>Sub-Question Form (Placeholder)</DialogTitle>
            <DialogContent>
              <Typography>
                Form for "{getSubQuestionTypeLabel(currentSubQuestionType)}" will be rendered here.
                Please ensure specific dialog components are imported and used.
              </Typography>
              <TextField
                label="Question Text"
                fullWidth
                multiline
                rows={2}
                value={currentSubQuestionData?.questionText || ''}
                onChange={(e) => setCurrentSubQuestionData({...currentSubQuestionData, questionText: e.target.value})}
                sx={{mt: 2}}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseSubQuestionDialog}>Cancel</Button>
              <Button
                onClick={() => handleSaveSubQuestion(currentSubQuestionData || {})}
                variant="contained"
              >
                Save Sub-Question (Placeholder)
              </Button>
            </DialogActions>
          </Dialog>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          <HelpOutlineIcon /> {/* Icon for comprehensive question */}
          {editQuestion ? 'Edit Comprehensive Question' : 'Create Comprehensive Question'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'inherit' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loadingFormOptions && (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading form options...</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Main Question Text Input/Preview Section */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, position: 'relative' }}>
            {showQuestionPreview ? (
              <Box
                sx={{
                  flexGrow: 1,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  p: 2,
                  minHeight: '60px',
                  overflowY: 'auto',
                  backgroundColor: '#f5f5f5',
                  lineHeight: '1.6',
                  fontSize: '1rem',
                  color: '#333',
                }}
              >
                {renderTextWithLatex(formData.questionText)}
              </Box>
            ) : (
              <TextField
                margin="dense"
                label="Main Question Text (Optional, e.g., 'Read the passage below...')"
                type="text"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={formData.questionText}
                onChange={handleInputChange('questionText')}
                helperText="Use $...$ for inline math, $$...$$ for display math"
              />
            )}
            <IconButton
              onClick={toggleQuestionPreview}
              title={showQuestionPreview ? 'Hide Preview' : 'Show Preview'}
              size="small"
              sx={{
                position: 'absolute',
                right: 0,
                top: 8,
                zIndex: 1
              }}
            >
              {showQuestionPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Box>

          {/* Question URL */}
          <TextField
            margin="dense"
            label="Question URL (Optional)"
            type="url"
            fullWidth
            variant="outlined"
            value={formData.questionUrl}
            onChange={handleInputChange('questionUrl')}
            helperText="Optional image or media URL for the question"
          />

          {/* Passage Input Field with Preview */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, position: 'relative' }}>
            {showPassagePreview ? (
              <Box
                sx={{
                  flexGrow: 1,
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  p: 2,
                  minHeight: '140px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  backgroundColor: '#f5f5f5',
                  lineHeight: '1.6',
                  fontSize: '1rem',
                  color: '#333',
                }}
              >
                {renderTextWithLatex(formData.passage)}
              </Box>
            ) : (
              <TextField
                autoFocus
                margin="dense"
                label="Passage"
                type="text"
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                value={formData.passage}
                onChange={handleInputChange('passage')}
                required
                error={formData.passage !== '' && !formData.passage.trim()}
                helperText={
                    formData.passage !== '' && !formData.passage.trim()
                    ? 'Passage text is required'
                    : 'Use $...$ for inline math, $$...$$ for display math'
                }
              />
            )}
            <IconButton
              onClick={togglePassagePreview}
              title={showPassagePreview ? 'Hide Preview' : 'Show Preview'}
              size="small"
              sx={{
                position: 'absolute',
                right: 0,
                top: 8,
                zIndex: 1
              }}
            >
              {showPassagePreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Box>
 <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Course</InputLabel>
                <Select
                  value={formData.course}
                  onChange={handleSelectChange('course')}
                  label="Course"
                  disabled={loadingFormOptions}
                >
                  {formOptions.courses.map((clas) => (
                    <MenuItem key={clas._id} value={clas._id}>
                      {clas.course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.class}
                  onChange={handleSelectChange('class')}
                  label="Class"
                  disabled={loadingFormOptions}
                >
                  {formOptions.classes.map((clas) => (
                    <MenuItem key={clas._id} value={clas._id}>
                      {clas.class}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          {/* Subject, Chapter, Topic Selection */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  onChange={handleSelectChange('subject')}
                  label="Subject"
                  disabled={loadingFormOptions}
                >
                  {formOptions.subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={chapters}
                getOptionLabel={(option) => option.chapterName || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={getSelectedChapter()}
                onChange={(event, newValue) => {
                  handleSelectChange('chapterName')({ target: { value: newValue ? newValue._id : '' } });
                }}
                disabled={!formData.subject || loadingChapters}
                loading={loadingChapters}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chapter *"
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
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={topics}
                getOptionLabel={(option) => option.topic || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={getSelectedTopic()}
                onChange={(event, newValue) => {
                  handleSelectChange('topic')({ target: { value: newValue ? newValue._id : '' } });
                }}
                disabled={!formData.chapterName || loadingTopics}
                loading={loadingTopics}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Topic *"
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
              />
            </Grid>
          </Grid>

          {/* Resource */}
          <TextField
            margin="dense"
            label="Resource (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.resource}
            onChange={handleInputChange('resource')}
            helperText="Source or reference for the question (e.g., NCERT, Resnick Halliday)"
          />

          {/* Total Marks for the Comprehensive Question */}
          <TextField
            margin="dense"
            label="Total Marks for Comprehensive Question"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.marks}
            onChange={handleInputChange('marks')}
            required
            inputProps={{ min: 0 }}
            error={formData.marks !== '' && (isNaN(parseFloat(formData.marks)) || parseFloat(formData.marks) <= 0)}
            helperText={
              formData.marks !== '' && (isNaN(parseFloat(formData.marks)) || parseFloat(formData.marks) <= 0)
                ? 'Please enter a valid positive number for marks'
                : ''
            }
          />

          {/* Negative Marking Switch for Comprehensive Question */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.negativeMarking}
                onChange={handleSwitchChange('negativeMarking')}
                name="negativeMarking"
                color="primary"
              />
            }
            label="Enable Negative Marking for Comprehensive Question"
          />

          {/* Negative Marks Value Field (conditionally rendered) */}
          {formData.negativeMarking && (
            <TextField
              margin="dense"
              label="Negative Marks Value (for Comprehensive Question)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.negativeMarksValue}
              onChange={handleInputChange('negativeMarksValue')}
              required={formData.negativeMarking}
              inputProps={{ min: 0 }}
              error={formData.negativeMarksValue !== '' && (isNaN(parseFloat(formData.negativeMarksValue)) || parseFloat(formData.negativeMarksValue) <= 0)}
              helperText={
                formData.negativeMarksValue !== '' && (isNaN(parseFloat(formData.negativeMarksValue)) || parseFloat(formData.negativeMarksValue) <= 0)
                  ? 'Please enter a valid positive number for negative marks'
                  : ''
              }
            />
          )}

          {/* Previous Years Question */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.previousYearsQuestion}
                onChange={handleSwitchChange('previousYearsQuestion')}
                name="previousYearsQuestion"
                color="primary"
              />
            }
            label="Previous Years Question"
          />

          {formData.previousYearsQuestion && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  margin="dense"
                  label="Year *"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.year}
                  onChange={handleInputChange('year')}
                  required={formData.previousYearsQuestion}
                  placeholder="e.g., 2022-2023"
                  error={formData.previousYearsQuestion && !formData.year.trim()}
                  helperText={
                    formData.previousYearsQuestion && !formData.year.trim()
                      ? 'Year is required for previous years questions.'
                      : 'Enter the academic year (e.g., 2022-2023)'
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formData.titles}
                  onChange={handleTitlesChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Titles *"
                      variant="outlined"
                      required={formData.previousYearsQuestion}
                      error={formData.previousYearsQuestion && formData.titles.length === 0}
                      helperText={
                        formData.previousYearsQuestion && formData.titles.length === 0
                          ? 'At least one title is required for previous years questions.'
                          : 'Press Enter to add multiple titles (e.g., JEE Main, NEET)'
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Difficulty Level Select for Comprehensive Question */}
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="difficulty-level-label">Difficulty Level</InputLabel>
            <Select
              labelId="difficulty-level-label"
              id="difficulty-level-select"
              value={formData.difficultyLevel}
              onChange={handleSelectChange('difficultyLevel')}
              label="Difficulty Level"
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          {/* Solution */}
          <TextField
            margin="dense"
            label="Solution (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.solution}
            onChange={handleInputChange('solution')}
            helperText="Detailed explanation of the comprehensive question. Use $...$ for inline math, $...$ for display math"
          />

          <Divider sx={{ my: 3 }} />

          {/* Sub-Questions Management Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Sub-Questions ({formData.subQuestions.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenSubQuestionMenu}
              id="add-sub-question-button" // Add an ID for accessibility/anchor
              aria-controls={openSubQuestionMenu ? 'sub-question-type-menu' : undefined}
              aria-haspopup="true"
            >
              Add Sub-Question
            </Button>
            {/* Menu for selecting sub-question type */}
            <Menu
              id="sub-question-type-menu"
              anchorEl={anchorEl}
              open={openSubQuestionMenu}
              onClose={handleCloseSubQuestionMenu}
              MenuListProps={{
                'aria-labelledby': 'add-sub-question-button',
              }}
            >
              <MenuItem onClick={() => handleAddSubQuestionClick('mcq')}>Multiple Choice</MenuItem>
              <MenuItem onClick={() => handleAddSubQuestionClick('truefalse')}>True/False</MenuItem>
              <MenuItem onClick={() => handleAddSubQuestionClick('integerType')}>Integer Type</MenuItem>
              <MenuItem onClick={() => handleAddSubQuestionClick('fillintheblank')}>Fill-in-the-Blank</MenuItem>
            </Menu>
          </Box>

          {/* Display message if no sub-questions are added */}
          {formData.subQuestions.length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', ml: 1 }}>
              No sub-questions added yet. Click "Add Sub-Question" to begin.
            </Typography>
          )}

          {/* List of added sub-questions */}
          <Box sx={{ maxHeight: '300px', overflowY: 'auto', p: 1 }}>
            {formData.subQuestions.map((subQ, index) => (
              <SubQuestionDisplayCard key={subQ._id || `subQ-${index}`}>
                <Box sx={{ flexGrow: 1 }}>
                  <Chip
                    label={getSubQuestionTypeLabel(subQ.type)}
                    size="small"
                    color="primary"
                    sx={{ mb: 1, fontWeight: 500 }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {index + 1}. {subQ.questionText.length > 100 ? `${subQ.questionText.substring(0, 100)}...` : subQ.questionText}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditSubQuestion(subQ, index)}
                    title="Edit Sub-Question"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSubQuestion(index)}
                    title="Delete Sub-Question"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </SubQuestionDisplayCard>
            ))}
          </Box>

          {/* Render the sub-question specific dialog based on `currentSubQuestionType` */}
          {isSubQuestionDialogOpen && renderSubQuestionDialog()}

        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSaveComprehensiveQuestion}
          variant="contained"
          color="primary"
        >
          {loading ? (editQuestion ? 'Saving...' : 'Creating...') : (editQuestion ? 'Save Changes' : 'Create Question')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComprehensiveQuestionDialog;