import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  List, ListItemButton, Typography, Paper, Grid, IconButton, Divider, Badge,
  FormControl, InputLabel, Select, MenuItem, Chip, Accordion, AccordionSummary, 
  AccordionDetails, Card, CardContent, Avatar, CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, ArrowForwardIos as ArrowForwardIcon, Close as CloseIcon, 
  Quiz, Edit, Delete, ExpandMore as ExpandMoreIcon, FilterList as FilterListIcon,
  Clear as ClearIcon, Link as LinkIcon, School as SchoolIcon, Book as BookIcon,
  Topic as TopicIcon, Star as StarIcon, Schedule as ScheduleIcon
} from '@mui/icons-material';
import styled from '@emotion/styled';
import axios from 'axios';
import Swal from 'sweetalert2';
import { TrueFalseQuestionDialog } from '../QuestionDialogBox/TrueFalseDialogBox';
import { MCQQuestionDialog } from '../QuestionDialogBox/MCQDialogBox';
import { FillInTheBlankQuestionDialog } from '../QuestionDialogBox/FillInTheBlankQuestionDialog';
import { IntegerQuestionDialog } from '../QuestionDialogBox/IntegerDialogBox';
import { BASE_URL } from 'app/config/config';
import { Link, useParams } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ComprehensiveQuestionDialog from '../QuestionDialogBox/ComprehensiveQuestionDialog';
import { UploadDocDialog } from '../QuestionDialogBox/UploadDocDialog';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
// Styled Components
const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
}));
const katexStyles = {
  inlineMath: {
    margin: '0',
    padding: '0',
    display: 'inline',
    verticalAlign: 'baseline'
  },
  blockMath: {
    margin: '0.2em 0',
    padding: '0',
    textAlign: 'left'
  }
};


const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 3, 0, 3), 
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '50%',
  minHeight: '500px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

const SidebarContainers = styled(Box)(({ theme }) => ({
  height: '10%',
  marginTop: "5px",
  minHeight: '500px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: '16px',
  background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const MainContent = styled(Box)(({ theme }) => ({
  height: '100%',
  minHeight: '500px',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
}));

const CenteredContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '20px',
});

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  }
}));

export const SectionsManager = ({ data, onDataUpdate }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const { fileId } = useParams();
  
  // Data states
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openTrueFalseDialog, setOpenTrueFalseDialog] = useState(false);
  const [openComprehensiveDialog, SetOpenComprehensiveDialog] = useState(false);
  const [openMCQDialog, setOpenMCQDialog] = useState(false);
  const [openFillInTheBlankDialog, setOpenFillInTheBlankDialog] = useState(false);
  const [openIntegerDialog, setOpenIntegerDialog] = useState(false);
  const [isUploadDocDialogOpen, setIsUploadDocDialogOpen] = useState(false);
  
  // Other states
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [editSelectedSection, setEditSelectedSection] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [formData, setFormData] = useState({ name: '', instructions: '' });
  const [loading, setLoading] = useState(false);
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterPreviousYears, setFilterPreviousYears] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    types: [], classes: [], courses: [], subjects: [], chapters: [],
    topics: [], resources: [], difficulties: [], years: []
  });

  // Extract filter options
  const extractFilterOptions = useCallback((questions) => {
    const extract = (field) => [...new Set(questions.map(q => {
      if (field.includes('.')) {
        const [obj, prop] = field.split('.');
        return q[obj]?.[prop];
      }
      return q[field];
    }).filter(Boolean))].sort();

    setFilterOptions({
      types: extract('type'),
      classes: extract('class.class'),
      courses: extract('course.course'),
      subjects: extract('subject.subject'),
      chapters: extract('chapterName.chapterName'),
      topics: extract('topic.topic'),
      resources: extract('resource'),
      difficulties: extract('difficultyLevel'),
      years: extract('year')
    });
  }, []);

  // Client-side filtering
  const applyClientSideFilters = useCallback(() => {
    let filtered = [...originalQuestions];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionText?.toLowerCase().includes(searchLower) ||
        q.subject?.subject?.toLowerCase().includes(searchLower) ||
        q.chapterName?.chapterName?.toLowerCase().includes(searchLower) ||
        q.topic?.topic?.toLowerCase().includes(searchLower)
      );
    }

    const filters = [
      { value: filterType, field: 'type' },
      { value: filterClass, field: 'class.class' },
      { value: filterCourse, field: 'course.course' },
      { value: filterSubject, field: 'subject.subject' },
      { value: filterChapter, field: 'chapterName.chapterName' },
      { value: filterTopic, field: 'topic.topic' },
      { value: filterResource, field: 'resource' },
      { value: filterDifficulty, field: 'difficultyLevel' },
      { value: filterYear, field: 'year' }
    ];

    filters.forEach(({ value, field }) => {
      if (value) {
        filtered = filtered.filter(q => {
          if (field.includes('.')) {
            const [obj, prop] = field.split('.');
            return q[obj]?.[prop] === value;
          }
          return q[field] === value;
        });
      }
    });

    if (filterPreviousYears !== '') {
      const isPreviousYears = filterPreviousYears === 'true';
      filtered = filtered.filter(q => Boolean(q.previousYearsQuestion) === isPreviousYears);
    }

    setFilteredQuestions(filtered);
  }, [originalQuestions, searchText, filterType, filterClass, filterCourse, filterSubject, 
      filterChapter, filterTopic, filterResource, filterPreviousYears, filterDifficulty, filterYear]);

  useEffect(() => {
    applyClientSideFilters();
  }, [applyClientSideFilters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchText(''); setFilterType(''); setFilterClass(''); setFilterCourse('');
    setFilterSubject(''); setFilterChapter(''); setFilterTopic(''); setFilterResource('');
    setFilterPreviousYears(''); setFilterDifficulty(''); setFilterYear('');
  }, []);

  // Get active filters count
  const getActiveFiltersCount = () => {
    return [searchText, filterType, filterClass, filterCourse, filterSubject, filterChapter, 
            filterTopic, filterResource, filterPreviousYears, filterDifficulty, filterYear]
           .filter(filter => filter && filter.toString().trim().length > 0).length;
  };

  // Helper functions
  const getQuestionTypeDisplay = (type) => {
    const typeMap = {
      'mcq': 'MCQ', 'truefalse': 'True/False', 'integerType': 'Integer',
      'fillintheblank': 'Fill in the Blank', 'comprehension': 'Comprehensive'
    };
    return typeMap[type] || type;
  };

  // Fetch section questions
  const fetchSectionById = async (id) => {
    try {
      setQuestionsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/global-library/questions/${id}`);
      if (res.status === 200) {
        const questions = res.data.questions || [];
        setOriginalQuestions(questions);
        setFilteredQuestions(questions);
        extractFilterOptions(questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load questions. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Section management
  const handleSectionClick = (section) => {
    setSelectedSection(section);
    fetchSectionById(section._id);
  };

  const handleCreateSection = async () => {
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Section name is required.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        instructions: formData.instructions.trim(),
        parentId: data._id
      };

      const response = editSelectedSection && editSelectedSection._id
        ? await axios.patch(`${BASE_URL}/api/global-library/sections/${editSelectedSection._id}`, payload)
        : await axios.post(`${BASE_URL}/api/global-library/add-new-section/`, payload);

      if (response.status === 200 || response.status === 201) {
        onDataUpdate();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Section ${editSelectedSection?._id ? 'updated' : 'created'} successfully!`,
          confirmButtonColor: '#28a745'
        });
        setOpenDialog(false);
        setFormData({ name: '', instructions: '' });
        setEditSelectedSection(null);
      }
    } catch (error) {
      console.error('Error with section:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to process section. Please try again!',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  // Question management
  const handleQuestionCreated = async (questionData) => {
    if (!selectedSection?._id) {
      Swal.fire({
        icon: 'warning',
        title: 'No Section Selected',
        text: 'Please select a section first before adding questions.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    try {
      const response = editQuestion?._id
        ? await axios.patch(`${BASE_URL}/api/global-library/questions/${editQuestion._id}`, questionData)
        : await axios.post(`${BASE_URL}/api/global-library/add-new-question`, {
            sectionIds: [selectedSection._id],
            questions: [questionData]
          });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Question ${editQuestion?._id ? 'updated' : 'added'} successfully!`,
          confirmButtonColor: '#28a745'
        });
        
        // Close all dialogs
        setOpenTrueFalseDialog(false);
        setOpenMCQDialog(false);
        setOpenFillInTheBlankDialog(false);
        setOpenIntegerDialog(false);
        setEditQuestion(null);
        fetchSectionById(selectedSection._id);
      }
    } catch (error) {
      console.error('Error with question:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to process question. Please try again.',
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleEditQuestion = (question) => {
    setEditQuestion(question);
    if (question.type === "truefalse") setOpenTrueFalseDialog(true);
    else if (question.type === "mcq") setOpenMCQDialog(true);
    else if (question.type === "integerType") setOpenIntegerDialog(true);
    else if (question.type === "fillintheblank") setOpenFillInTheBlankDialog(true);
  };

  const handleDeleteQuestion = async (question) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/library/questions/${question._id}/${selectedSection._id}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Question has been deleted.',
          confirmButtonColor: '#28a745'
        });
        fetchSectionById(selectedSection._id);
      } catch (error) {
        console.error('Error deleting question:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete question. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  // Question Card Component
const QuestionCardComponent = ({ question, index }) => {
  // Helper function to render question content based on type
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <Box sx={{ mb: 2 }}>
            {question.options?.map((option, idx) => (
              <Box 
                key={option._id || idx} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: option.isCorrect ? 600 : 400,
                    color: option.isCorrect ? 'success.dark' : 'text.primary',
                    flex: 1
                  }}
                >
                  {String.fromCharCode(65 + idx)}. {renderTextWithLatex(option.text)}
                  {option.isCorrect && ' ✓'}
                </Typography>
                
                {/* Option Image */}
                {option.optionUrl?.startsWith('https://') && (
                  <Box sx={{ ml: 2 }}>
                    <img 
                      src={option.optionUrl} 
                      alt={`Option ${String.fromCharCode(65 + idx)}`} 
                      style={{
                        maxWidth: '250px',
                        height: 'auto',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        );
      
      case 'truefalse':
        return (
          <Box sx={{ mb: 2 }}>
            <Box>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 1,
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.300',
                mb: 1
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: question.correctAnswer === true ? 600 : 400,
                    color: question.correctAnswer === true ? 'success.dark' : 'text.primary'
                  }}
                >
                  True {question.correctAnswer === true && '✓'}
                </Typography>
              </Box>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 1,
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.300'
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: question.correctAnswer === false ? 600 : 400,
                    color: question.correctAnswer === false ? 'success.dark' : 'text.primary'
                  }}
                >
                  False {question.correctAnswer === false && '✓'}
                </Typography>
              </Box>
            </Box>
          </Box>
        );
      
      case 'integerType':
        return (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 1,
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.300'
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'success.dark'
                }}
              >
                Answer: {renderTextWithLatex(String(question.correctAnswer))}
              </Typography>
            </Box>
          </Box>
        );
      
      case 'fillintheblank':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, ml: 1, fontWeight: 500 }}>
              Answer(s):
            </Typography>
            {question.blanks?.map((blank, idx) => (
              <Box 
                key={blank._id || idx}
                sx={{ 
                  p: 1.5, 
                  borderRadius: 1,
                  backgroundColor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  mr: 1,
                  mb: 1
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'success.dark'
                  }}
                >
                  {renderTextWithLatex(blank.correctAnswer)}
                </Typography>
              </Box>
            ))}
          </Box>
        );
      
      case 'comprehension':
        return (
          <Box sx={{ mb: 2 }}>
            {question.passage && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                borderRadius: 1, 
                mb: 2,
                border: '1px solid',
                borderColor: 'grey.300'
              }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, fontWeight: 500 }}>
                  Passage:
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {renderTextWithLatex(question.passage)}
                </Typography>
              </Box>
            )}
            
            {question.subQuestions?.map((subQ, idx) => (
              <Box key={subQ._id || idx} sx={{ mb: 2, pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Sub-question {idx + 1}: {renderTextWithLatex(subQ.questionText)}
                </Typography>
                {subQ.type === 'mcq' && subQ.options?.map((option, optIdx) => (
                  <Box 
                    key={option._id || optIdx} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 0.5,
                      mb: 0.5,
                      borderRadius: 0.5,
                      backgroundColor: option.isCorrect ? 'success.light' : 'transparent',
                      ml: 1
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: option.isCorrect ? 600 : 400,
                        color: option.isCorrect ? 'success.dark' : 'text.secondary'
                      }}
                    >
                      {String.fromCharCode(65 + optIdx)}. {renderTextWithLatex(option.text)}
                      {option.isCorrect && ' ✓'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        );
      
      default:
        return null;
    }
  };
const renderTextWithLatex = (text) => {
  if (!text) return text;
  
  // Convert string to string if it's not already
  const textStr = String(text);
  
  // Pattern for $$ blocks and $ inline math
  const latexBlockPattern = /\$\$(.*?)\$\$/g;
  const latexInlinePattern = /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g;
  
  // Pattern for backslash LaTeX commands (like \sqrt{}, \frac{}{}, etc.)
  const backslashLatexPattern = /\\[a-zA-Z]+(?:\{[^}]*\})*(?:\[[^\]]*\])?/g;
  
  // Check if text contains any LaTeX
  const hasBlockLatex = latexBlockPattern.test(textStr);
  const hasInlineLatex = latexInlinePattern.test(textStr);
  const hasBackslashLatex = backslashLatexPattern.test(textStr);
  
  // Reset regex
  latexBlockPattern.lastIndex = 0;
  latexInlinePattern.lastIndex = 0;
  backslashLatexPattern.lastIndex = 0;
  
  if (!hasBlockLatex && !hasInlineLatex && !hasBackslashLatex) {
    return textStr;
  }
  
  // Get all matches and their positions
  const blockMatches = [...textStr.matchAll(latexBlockPattern)];
  const inlineMatches = [...textStr.matchAll(latexInlinePattern)];
  const backslashMatches = [...textStr.matchAll(backslashLatexPattern)];
  
  // Combine all matches and sort by position
  const allMatches = [
    ...blockMatches.map(m => ({ ...m, type: 'block' })),
    ...inlineMatches.map(m => ({ ...m, type: 'inline' })),
    ...backslashMatches.map(m => ({ ...m, type: 'backslash', latexContent: m[0] }))
  ].sort((a, b) => a.index - b.index);
  
  // Filter out overlapping matches (prioritize block > inline > backslash)
  const filteredMatches = [];
  let lastEnd = 0;
  
  for (const match of allMatches) {
    if (match.index >= lastEnd) {
      // Check if this match overlaps with any higher priority matches
      const isOverlapping = filteredMatches.some(existing => 
        (match.index < existing.index + existing[0].length && 
         match.index + match[0].length > existing.index)
      );
      
      if (!isOverlapping) {
        filteredMatches.push(match);
        lastEnd = match.index + match[0].length;
      }
    }
  }
  
  // Build the result
  const parts = [];
  let currentIndex = 0;
  
  filteredMatches.forEach((match, index) => {
    // Add text before this LaTeX match
    if (match.index > currentIndex) {
      const textBefore = textStr.substring(currentIndex, match.index);
      if (textBefore) {
        parts.push(
          <span key={`text-${index}`}>
            {textBefore}
          </span>
        );
      }
    }
    
    // Add LaTeX part
    try {
      let mathContent;
      
      if (match.type === 'block') {
        mathContent = match[1].trim();
      } else if (match.type === 'inline') {
        mathContent = match[1].trim();
      } else if (match.type === 'backslash') {
        mathContent = match.latexContent;
      }
      
      if (mathContent) {
        const isStandalone = match.index === 0 && match.index + match[0].length === textStr.length;
        const useBlockStyle = match.type === 'block' && isStandalone;
        
        parts.push(
          <span 
            key={`latex-${match.type}-${index}`} 
            style={useBlockStyle ? katexStyles.blockMath : katexStyles.inlineMath}
          >
            <InlineMath math={mathContent} />
          </span>
        );
      }
    } catch (error) {
      console.warn('LaTeX rendering error:', error, 'Content:', match[0]);
      parts.push(
        <span 
          key={`error-${index}`} 
          style={{ 
            color: 'red', 
            fontFamily: 'monospace',
            backgroundColor: '#ffebee',
            padding: '2px 4px',
            borderRadius: '3px',
            fontSize: '0.9em'
          }}
          title={`LaTeX Error: ${error.message}`}
        >
          {match[0]}
        </span>
      );
    }
    
    currentIndex = match.index + match[0].length;
  });
  
  // Add remaining text
  if (currentIndex < textStr.length) {
    const remainingText = textStr.substring(currentIndex);
    if (remainingText) {
      parts.push(
        <span key="text-end">
          {remainingText}
        </span>
      );
    }
  }
  
  return parts.length > 0 ? (
    <span style={{ display: 'inline', lineHeight: 'inherit' }}>
      {parts}
    </span>
  ) : textStr;
};
  return (
    <QuestionCard>
      <CardContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
        {/* Header with question number, type, and actions */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, p: 2 }}>
          {/* Question Number and Text */}
          <Box sx={{ flex: 1, mr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ fontSize: '0.9rem', color: 'grey.600', fontWeight: 600, mr: 1 }}>
                Q{question.number || index + 1}:
              </Box>
              <Box sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'black', position: 'relative', top: '-3px' }}>
                {renderTextWithLatex(question.questionText)}
              </Box>
            </Box>
            
            {/* Marks and Difficulty - Secondary info in new line */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip label={`Marks: ${question.marks || 0}`} size="small" color="success" variant="outlined" />
              {question.negativeMarking && (
                <Chip label={`-${question.negativeMarksValue || 0}`} size="small" color="error" variant="outlined" />
              )}
              <Chip 
                icon={<StarIcon />}
                label={question.difficultyLevel || 'Unknown'} 
                size="small" 
                color={question.difficultyLevel === 'easy' ? 'success' : question.difficultyLevel === 'medium' ? 'warning' : 'error'}
                variant="filled"
              />
            </Box>
          </Box>

          {/* Action buttons on the right */}
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(question)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ px: 2 }}>
          {/* Question Image */}
          {question.questionUrl?.startsWith('https://') && (
            <Box sx={{ mb: 2 }}>
              <img 
                src={question.questionUrl} 
                alt="Question" 
                style={{
                  maxWidth: '40%',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              />
            </Box>
          )}

          {/* Question Content (Options, Answers, etc.) */}
          {renderQuestionContent()}

          {/* Solution if available */}
          {question.solution && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.600', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Solution:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {question.solution.split('\n').map((line, index) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  return (
                    <Box key={index} sx={{ padding: '4px 0' }}>
                      <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6 }}>
                        {renderTextWithLatex(trimmedLine)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Additional metadata */}
          <Grid container spacing={1} sx={{ mb: 2, mt: 12 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <SchoolIcon sx={{ fontSize: 12, mr: 0.5 }} />
                <strong>Class:</strong> {question.class?.class || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <BookIcon sx={{ fontSize: 12, mr: 0.5 }} />
                <strong>Course:</strong> {question.course?.course || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <strong>Subject:</strong> {question.subject?.subject || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <strong>Chapter:</strong> {question.chapterName?.chapterName || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <TopicIcon sx={{ fontSize: 12, mr: 0.5 }} />
                <strong>Topic:</strong> {question.topic?.topic || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                <strong>Resource:</strong> {question.resource || 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          {/* Tags and year info */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
            {question.previousYearsQuestion && (
              <Typography variant="caption" sx={{ color: 'grey.600', fontWeight: 500 }}>
                Previous Years Question
              </Typography>
            )}
            {question.year && (
              <Typography variant="caption" sx={{ color: 'grey.600', fontWeight: 500 }}>
                Year: {question.year}
              </Typography>
            )}
            {question.titles?.map((title, idx) => (
              <Typography key={idx} variant="caption" sx={{ color: 'grey.600', fontWeight: 500 }}>
                {title}
              </Typography>
            ))}
          </Box>
        </Box>
      </CardContent>
    </QuestionCard>
  );
};

const handleUpload = async (id) =>{
  setIsUploadDocDialogOpen(true);
}

  // Effects
  useEffect(() => {
    if (data.sections?.length > 0 && !selectedSection) {
      setSelectedSection(data.sections[0]);
      fetchSectionById(data.sections[0]._id);
    } else if (data.sections && selectedSection) {
      const updatedSelected = data.sections.find(s => s._id === selectedSection._id);
      if (updatedSelected) {
        setSelectedSection(updatedSelected);
      } else if (data.sections[0]) {
        setSelectedSection(data.sections[0]);
        fetchSectionById(data.sections[0]._id);
      } else {
        setSelectedSection(null);
        setOriginalQuestions([]);
        setFilteredQuestions([]);
      }
    }
  }, [data.sections, selectedSection]);

  useEffect(() => {
    if (editSelectedSection) {
      setFormData({
        name: editSelectedSection.name || '',
        instructions: editSelectedSection.instructions || ''
      });
    } else {
      setFormData({ name: '', instructions: '' });
    }
  }, [openDialog, editSelectedSection]);

  return (
    <Container>
      <Grid container spacing={2}>
        {/* Sidebar */}
         <Box sx={{ mb: 3, backgroundColor: 'background.paper', borderRadius: 1, boxShadow: 2, width: '100%' }}>
                  <Accordion expanded={filterExpanded} onChange={(event, isExpanded) => setFilterExpanded(isExpanded)} elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                      <FilterListIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Filter & Search Questions
                        {getActiveFiltersCount() > 0 && (
                          <Chip label={`${getActiveFiltersCount()} active`} size="small" sx={{ ml: 2, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        )}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Search by Question Text"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Enter keywords..."
                          />
                        </Grid>

                        {[
                          { label: 'Question Type', value: filterType, setter: setFilterType, options: filterOptions.types.map(t => ({ value: t, label: getQuestionTypeDisplay(t) })) },
                          { label: 'Class', value: filterClass, setter: setFilterClass, options: filterOptions.classes.map(c => ({ value: c, label: `Class ${c}` })) },
                          { label: 'Course', value: filterCourse, setter: setFilterCourse, options: filterOptions.courses.map(c => ({ value: c, label: c })) },
                          { label: 'Subject', value: filterSubject, setter: setFilterSubject, options: filterOptions.subjects.map(s => ({ value: s, label: s })) },
                          { label: 'Chapter', value: filterChapter, setter: setFilterChapter, options: filterOptions.chapters.map(c => ({ value: c, label: c })) },
                          { label: 'Topic', value: filterTopic, setter: setFilterTopic, options: filterOptions.topics.map(t => ({ value: t, label: t })) },
                          { label: 'Resource', value: filterResource, setter: setFilterResource, options: filterOptions.resources.map(r => ({ value: r, label: r })) },
                          { label: 'Difficulty', value: filterDifficulty, setter: setFilterDifficulty, options: filterOptions.difficulties.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })) },
                          { label: 'Year', value: filterYear, setter: setFilterYear, options: filterOptions.years.map(y => ({ value: y, label: y })) }
                        ].map(({ label, value, setter, options }) => (
                          <Grid item xs={12} sm={6} md={4} key={label}>
                            <FormControl variant="outlined" size="small" fullWidth>
                              <InputLabel>{label}</InputLabel>
                              <Select value={value} onChange={(e) => setter(e.target.value)} label={label}>
                                <MenuItem value=""><em>All {label}s</em></MenuItem>
                                {options.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        ))}

                        <Grid item xs={12} sm={6} md={4}>
                          <FormControl variant="outlined" size="small" fullWidth>
                            <InputLabel>Previous Years</InputLabel>
                            <Select
                              value={filterPreviousYears}
                              onChange={(e) => setFilterPreviousYears(e.target.value)}
                              label="Previous Years"
                            >
                              <MenuItem value=""><em>All Questions</em></MenuItem>
                              <MenuItem value="true">Previous Years Only</MenuItem>
                              <MenuItem value="false">Non-Previous Years</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button variant="outlined" onClick={resetFilters} startIcon={<ClearIcon />} size="small">
                          Reset All Filters
                        </Button>
                        <Typography variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                          Showing {filteredQuestions.length} of {originalQuestions.length} questions
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>

        <Grid item xs={12} md={4}>
          <SidebarContainer>
            <SidebarHeader>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sections</Typography>
              <IconButton size="small" onClick={() => setOpenDialog(true)} sx={{ color: 'inherit' }}>
                <AddIcon />
              </IconButton>
            </SidebarHeader>

            {data.sections?.length > 0 ? (
              <List sx={{ padding: 0 }}>
                {data.sections.map((section, index) => (
                  <React.Fragment key={section._id || index}>
                    <ListItemButton
                      onClick={() => handleSectionClick(section)}
                      selected={selectedSection?._id === section._id}
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        padding: 1.25,
                        '&:hover .action-icons': { opacity: 1, visibility: 'visible', transform: 'translateY(0)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                          {section.name}
                        </Typography>
                        <ArrowForwardIcon sx={{ color: 'action.active', fontSize: 18 }} />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left', fontSize: '0.775rem' }}>
                        {section.instructions ? `Instructions: ${section.instructions.substring(0, 50)}${section.instructions.length > 50 ? '...' : ''}` : 'No instructions'}
                      </Typography>

                      <Box className="action-icons" sx={{ display: 'flex', gap: 0.5, opacity: 0, visibility: 'hidden', transform: 'translateY(-8px)', transition: 'all 0.2s ease' }}>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); setEditSelectedSection(section); setOpenDialog(true); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); /* handleDeleteSection(section) */; }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemButton>
                    {index < data.sections.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <CenteredContainer>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                  No sections available
                </Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                  Create New Section
                </Button>
              </CenteredContainer>
            )}
          </SidebarContainer>

          {selectedSection && (
            <SidebarContainers>
              <SidebarHeader>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Import</Typography>
              </SidebarHeader>
              <Box sx={{ p: 2 }}>
                <Link to={`/importing/${selectedSection._id}`}>
                  <Button variant="outlined" color="primary" fullWidth startIcon={<LibraryBooksIcon />}>
                    Question Bank
                  </Button>
                </Link>
              </Box>
               <Box sx={{ p: 2 }}>
                
                  <Button variant="outlined" color="primary" fullWidth startIcon={<LibraryBooksIcon />} onClick={()=>handleUpload(selectedSection._id)}>
                    Upload Documents
                  </Button>
                
              </Box>
            </SidebarContainers>
          )}
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <MainContent>
            {selectedSection ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{selectedSection.name}</Typography>
                  <Badge badgeContent={filteredQuestions.length} color="primary"><Quiz /></Badge>
                </Box>

                {selectedSection.instructions && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography variant="body1" color="textSecondary">Instructions:</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{selectedSection.instructions}</Typography>
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                {/* Filter Section */}
               
                {/* Questions Display */}
                {questionsLoading ? (
                  <CenteredContainer>
                    <CircularProgress />
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                      Loading questions...
                    </Typography>
                  </CenteredContainer>
                ) : filteredQuestions.length === 0 ? (
                  <CenteredContainer>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                      {originalQuestions.length === 0 ? 'No questions available' : 'No questions match your criteria'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {originalQuestions.length === 0 ? 'Add some questions to get started' : 'Adjust your filters or create new questions'}
                    </Typography>
                  </CenteredContainer>
                ) : (
                  <Box sx={{ maxHeight: '130vh', overflow: 'auto' }}>
                    {filteredQuestions.map((question, index) => (
                   
  <Box
    key={question._id}
    sx={{
      backgroundColor: index % 2 === 0 ? 'white' : 'grey.100',
    }}
  >
    <QuestionCardComponent question={question} index={index} />
  </Box>
))}

                
                  </Box>
                )}
              </>
            ) : (
              <CenteredContainer>
                <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                  Select a section to view details
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Choose a section from the sidebar to get started
                </Typography>
              </CenteredContainer>
            )}
          </MainContent>
        </Grid>
      </Grid>

      {/* Dialog Components */}
      {openTrueFalseDialog && (
        <TrueFalseQuestionDialog
          open={openTrueFalseDialog}
          onClose={() => { setOpenTrueFalseDialog(false); setEditQuestion(null); }}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openMCQDialog && (
        <MCQQuestionDialog
          open={openMCQDialog}
          onClose={() => { setOpenMCQDialog(false); setEditQuestion(null); }}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openFillInTheBlankDialog && (
        <FillInTheBlankQuestionDialog
          open={openFillInTheBlankDialog}
          onClose={() => { setOpenFillInTheBlankDialog(false); setEditQuestion(null); }}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openIntegerDialog && (
        <IntegerQuestionDialog
          open={openIntegerDialog}
          onClose={() => { setOpenIntegerDialog(false); setEditQuestion(null); }}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openComprehensiveDialog && (
        <ComprehensiveQuestionDialog
          open={openComprehensiveDialog}
          onClose={() => { SetOpenComprehensiveDialog(false); setEditQuestion(null); }}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {isUploadDocDialogOpen && (
        <UploadDocDialog
          open={isUploadDocDialogOpen}
          onClose={() => setIsUploadDocDialogOpen(false)}
          onUploadSuccess={() => selectedSection && fetchSectionById(selectedSection._id)}
          sectionIds={selectedSection?._id}
          fetchSectionById={fetchSectionById}
        />
      )}

      {/* Section Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => { setOpenDialog(false); setFormData({ name: '', instructions: '' }); setEditSelectedSection(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}
      >
        <StyledDialogTitle>
          <Typography variant="h6" component="div">
            {editSelectedSection ? "Edit Section" : "Create New Section"}
          </Typography>
          <IconButton
            onClick={() => { setOpenDialog(false); setFormData({ name: '', instructions: '' }); setEditSelectedSection(null); }}
            sx={{ color: 'inherit' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <Divider />
        <DialogContent sx={{ pt: 1, px: 3, pb: 3 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Section Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter section name"
            error={formData.name !== '' && !formData.name.trim()}
            helperText={formData.name !== '' && !formData.name.trim() ? 'Section name is required' : ''}
            required
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="Instructions"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="Enter section instructions (optional)"
          />
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setOpenDialog(false); setFormData({ name: '', instructions: '' }); setEditSelectedSection(null); }} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateSection}
            variant="contained"
            color="primary"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? (editSelectedSection ? 'Updating...' : 'Creating...') : (editSelectedSection ? 'Update Section' : 'Create Section')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SectionsManager;