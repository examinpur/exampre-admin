import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  List, 
  Button, 
  ListItemButton, 
  Typography, 
  CircularProgress, 
  TextField,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  Tooltip,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import QuestionsDisplay from '../global/QuestionDisplay';
import Swal from 'sweetalert2';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import { useParams } from 'react-router-dom';
import { TrueFalseQuestionDialog } from '../QuestionDialogBox/TrueFalseDialogBox';
import { MCQQuestionDialog } from '../QuestionDialogBox/MCQDialogBox';
import { FillInTheBlankQuestionDialog } from '../QuestionDialogBox/FillInTheBlankQuestionDialog';
import { IntegerQuestionDialog } from '../QuestionDialogBox/IntegerDialogBox';
import ComprehensiveQuestionDialog from '../QuestionDialogBox/ComprehensiveQuestionDialog';
import { UploadDocDialog } from '../QuestionDialogBox/UploadDocDialog';
import { UploadJsonDialog } from '../QuestionDialogBox/UploadJsonDialogBox';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  }
}));

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(200vh - 200px)',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const LeftPanel = styled(Paper)(({ theme }) => ({
  width: '400px',
  display: 'flex',
  overflowY: 'auto',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const RightPanel = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  background: 'linear-gradient(135deg, #c3cfe2 100% , #f5f7fa 0%)',
}));

const QuestionsList = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: 0,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '4px',
  },
}));

const QuestionListItem = styled(ListItemButton)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  backgroundColor: selected ? theme.palette.primary.main + '20' : 'transparent',
  borderLeft: selected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '10',
    transform: 'translateX(4px)',
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.palette.text.secondary,
  gap: theme.spacing(2),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '200px',
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  mb: 3, 
  backgroundColor: 'background.paper', 
  borderRadius: theme.shape.borderRadius, 
  boxShadow: theme.shadows[2],
  overflow: 'hidden'
}));

export const QuestionManagement = ({ data, fetchData }) => {
  const [originalData, setOriginalData] = useState(data);
  const [filteredData, setFilteredData] = useState(data);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState(null);
  const { folderId } = useParams();
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openTrueFalseDialog, setOpenTrueFalseDialog] = useState(false);
  const [openComprehensiveDialog, SetOpenComprehensiveDialog] = useState(false);
  const [openMCQDialog, setOpenMCQDialog] = useState(false);
  const [openFillInTheBlankDialog, setOpenFillInTheBlankDialog] = useState(false);
  const [openIntegerDialog, setOpenIntegerDialog] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [isUploadDocDialogOpen, setIsUploadDocDialogOpen] = useState(false);
  const [isUploadJsonDialogOpen,setIsUploadJsonDialogOpen] = useState(false)
  const [solution, setSolution] = useState(null);
  const [filterExpanded, setFilterExpanded] = useState(false);
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
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    classes: [],
    courses: [],
    subjects: [],
    chapters: [],
    topics: [],
    resources: [],
    difficulties: []
  });
  useEffect(() => {
    setOriginalData(data);
    setFilteredData(data);
    extractFilterOptions(data);
  }, [data]);
  const extractFilterOptions = useCallback((questions) => {
    const types = [...new Set(questions.map(q => q.type).filter(Boolean))];
    const classes = [...new Set(questions.map(q => q.class?.class).filter(Boolean))];
    const courses = [...new Set(questions.map(q => q.course?.course).filter(Boolean))];
    const subjects = [...new Set(questions.map(q => q.subject?.subject).filter(Boolean))];
    const chapters = [...new Set(questions.map(q => q.chapterName?.chapterName).filter(Boolean))];
    const topics = [...new Set(questions.map(q => q.topic?.topic).filter(Boolean))];
    const resources = [...new Set(questions.map(q => q.resource).filter(Boolean))];
    const difficulties = [...new Set(questions.map(q => q.difficultyLevel).filter(Boolean))];

    setFilterOptions({
      types: types.sort(),
      classes: classes.sort(),
      courses: courses.sort(),
      subjects: subjects.sort(),
      chapters: chapters.sort(),
      topics: topics.sort(),
      resources: resources.sort(),
      difficulties: difficulties.sort()
    });
  }, []);
  const applyClientSideFilters = useCallback(() => {
    let filtered = [...originalData];

    // Apply search text filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(question => {
        const questionText = question.questionText?.toLowerCase() || '';
        const subject = question.subject?.subject?.toLowerCase() || '';
        const chapter = question.chapterName?.chapterName?.toLowerCase() || '';
        const topic = question.topic?.topic?.toLowerCase() || '';
        
        return questionText.includes(searchLower) ||
               subject.includes(searchLower) ||
               chapter.includes(searchLower) ||
               topic.includes(searchLower);
      });
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(question => question.type === filterType);
    }

    // Apply class filter
    if (filterClass) {
      filtered = filtered.filter(question => question.class?.class === filterClass);
    }

    // Apply course filter
    if (filterCourse) {
      filtered = filtered.filter(question => question.course?.course === filterCourse);
    }

    // Apply subject filter
    if (filterSubject) {
      filtered = filtered.filter(question => question.subject?.subject === filterSubject);
    }

    // Apply chapter filter
    if (filterChapter) {
      filtered = filtered.filter(question => question.chapterName?.chapterName === filterChapter);
    }

    // Apply topic filter
    if (filterTopic) {
      filtered = filtered.filter(question => question.topic?.topic === filterTopic);
    }

    // Apply resource filter
    if (filterResource) {
      filtered = filtered.filter(question => question.resource === filterResource);
    }

    // Apply previous years filter
    if (filterPreviousYears !== '') {
      const isPreviousYears = filterPreviousYears === 'true';
      filtered = filtered.filter(question => 
        Boolean(question.previousYearsQuestion) === isPreviousYears
      );
    }

    // Apply difficulty filter
    if (filterDifficulty) {
      filtered = filtered.filter(question => question.difficultyLevel === filterDifficulty);
    }

    setFilteredData(filtered);

    // Update selected question if it's no longer in filtered results
    if (selectedQuestion && !filtered.find(q => q._id === selectedQuestion._id)) {
      setSelectedQuestion(filtered.length > 0 ? filtered[0] : null);
    }
  }, [
    originalData, searchText, filterType, filterClass, filterCourse, 
    filterSubject, filterChapter, filterTopic, filterResource, 
    filterPreviousYears, filterDifficulty, selectedQuestion
  ]);

  const handleToggleLeftPanel = () => {
  setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
};

  useEffect(() => {
    applyClientSideFilters();
  }, [applyClientSideFilters]);

  const resetFilters = useCallback(() => {
    setSearchText('');
    setFilterType('');
    setFilterClass('');
    setFilterCourse('');
    setFilterSubject('');
    setFilterChapter('');
    setFilterTopic('');
    setFilterResource('');
    setFilterPreviousYears('');
    setFilterDifficulty('');
  }, []);
  const getActiveFiltersCount = () => {
    const filters = [
      searchText, filterType, filterClass, filterCourse, filterSubject,
      filterChapter, filterTopic, filterResource, filterPreviousYears, filterDifficulty
    ];
    return filters.filter(filter => filter && filter.toString().trim().length > 0).length;
  };

  const getQuestionTypeDisplay = (type) => {
    const typeMap = {
      'mcq': 'MCQ',
      'truefalse': 'True/False',
      'integerType': 'Integer',
      'fillintheblank': 'Fill in the Blank',
      'comprehension': 'Comprehensive'
    };
    return typeMap[type] || type;
  };
  const refreshData = useCallback(() => {
    if (fetchData) {
      fetchData();
    }
  }, [fetchData]);

  const handleOpenTrueFalseDialog = (question = null) => {
    setEditQuestion(question);
    setOpenTrueFalseDialog(true);
  };

  const handleCloseTrueFalseDialog = () => {
    setOpenTrueFalseDialog(false);
    setEditQuestion(null);
  };

  const handleQuestionCreated = async (questionData) => {
    try {
      let response;
      if (editQuestion && editQuestion._id) {
        response = await axios.patch(`${BASE_URL}/api/admin/questions/${editQuestion._id}`, questionData);
      } else {
        const payload = {
          questions: [questionData],
          questionBankParentId: folderId,
          createdBy: "admin",
        };
        response = await axios.post(`${BASE_URL}/api/admin/questions`, payload);
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Question ${editQuestion && editQuestion._id ? 'updated' : 'added'} successfully!`,
          confirmButtonColor: '#28a745'
        });
        setOpenTrueFalseDialog(false);
        setOpenMCQDialog(false);
        setOpenFillInTheBlankDialog(false);
        setOpenIntegerDialog(false);
        setEditQuestion(null);
        refreshData(); // Refresh data from API
      }
    } catch (error) {
      console.error(`Error ${editQuestion ? 'updating' : 'adding'} question:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || `Failed to ${editQuestion ? 'update' : 'add'} question. Please try again.`,
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleEditQuestion = (question) => {
    if (question.type === "truefalse") {
      handleOpenTrueFalseDialog(question);
    } else if (question.type === "mcq") {
      handleOpenMCQDialog(question);
    } else if (question.type === "integerType") {
      handleOpenIntegerDialog(question);
    } else if (question.type === "fillintheblank") {
      handleOpenFillInTheBlankDialog(question);
    } else {
      console.warn("Unknown question type for editing:", question.type);
    }
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
        const response = await axios.delete(`${BASE_URL}/api/questions/${question._id}`);

        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Question has been deleted.',
            confirmButtonColor: '#28a745'
          });
        }
        refreshData(); // Refresh data from API
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

  const handleCloseUploadDocDialog = () => {
    setIsUploadDocDialogOpen(false);
  };

  const handleUploadDoc = () => {
    setIsUploadDocDialogOpen(true);
  };

  const handleCloseUploadJsonDialog = () => {
    setIsUploadJsonDialogOpen(false);
  };

  const handleUploadJson = () => {
    setIsUploadJsonDialogOpen(true);
  }

  const handleOpenMCQDialog = (question = null) => {
    setEditQuestion(question);
    setOpenMCQDialog(true);
  };

  const handleCloseMCQDialog = () => {
    setOpenMCQDialog(false);
    setEditQuestion(null);
  };

  const onDeleteSolution = async ({ solution, question }) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this solution?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${BASE_URL}/api/solutions/delete/${solution._id}`);
        if (res.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted',
            text: `Solution Deleted successfully!`,
            confirmButtonColor: '#28a745'
          });
          if (selectedQuestion && selectedQuestion._id) {
            fetchQuestionDetails(selectedQuestion._id);
          }
        }
      } catch (error) {
        console.error('Error deleting solution:', error);
        Swal.fire({
          icon: 'error',
          text: `Failed to delete the solution!`,
          confirmButtonColor: '#A72828FF'
        });
      }
    }
  };

  const handleOpenFillInTheBlankDialog = (question = null) => {
    setEditQuestion(question);
    setOpenFillInTheBlankDialog(true);
  };

  const handleCloseFillInTheBlankDialog = () => {
    setOpenFillInTheBlankDialog(false);
    setEditQuestion(null);
  };

  const handleOpenIntegerDialog = (question = null) => {
    setEditQuestion(question);
    setOpenIntegerDialog(true);
  };

  const handleCloseIntegerDialog = () => {
    setOpenIntegerDialog(false);
    setEditQuestion(null);
  };

  const handleOpenComprehensiveDialog = () => {
    SetOpenComprehensiveDialog(true);
  };

  const handleCloseComprehensiveDialog = () => {
    SetOpenComprehensiveDialog(false);
    setEditQuestion(null);
  };

  // Auto-select first question when filtered data changes
  useEffect(() => {
    if (filteredData.length > 0 && !selectedQuestion) {
      setSelectedQuestion(filteredData[0]);
    } else if (filteredData.length === 0) {
      setSelectedQuestion(null);
    }
  }, [filteredData, selectedQuestion]);

  useEffect(() => {
    if (selectedQuestion) {
      fetchQuestionDetails(selectedQuestion._id);
    } else {
      setSelectedQuestionDetails(null);
    }
  }, [selectedQuestion]);

  const fetchQuestionDetails = async (questionId) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/questions/${questionId}`);
      if (response.status === 200) {
        setSelectedQuestionDetails(response.data.data.question);
        setSolution(response.data.data.solution);
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
      setSelectedQuestionDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
  };

  const handleDocUploadSuccess = (responseData) => {
    console.log("Document uploaded successfully:", responseData);
  };

  return (
    <Box>
      <ButtonContainer>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenMCQDialog()}
        >
         MCQ
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenTrueFalseDialog()}
        >
          True-False
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenIntegerDialog()}
        >
          Integer
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenFillInTheBlankDialog()}
        >
          Fill In The Blank
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenComprehensiveDialog()}
        >
          Comprehensive
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleUploadDoc()}
        >
          Upload Document
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleUploadJson()}
        >
          Upload JSON
        </StyledButton>
      </ButtonContainer>

      <FilterContainer>
        <Accordion 
          expanded={filterExpanded} 
          onChange={(event, isExpanded) => setFilterExpanded(isExpanded)}
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white',
              '& .MuiAccordionSummary-content': {
                alignItems: 'center'
              }
            }}
          >
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filter & Search Questions
              {getActiveFiltersCount() > 0 && (
                <Chip 
                  label={`${getActiveFiltersCount()} active`} 
                  size="small" 
                  sx={{ ml: 2, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {/* Search Text */}
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

              {/* Question Type */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Question Type"
                  >
                    <MenuItem value=""><em>All Types</em></MenuItem>
                    {filterOptions.types.map((type) => (
                      <MenuItem key={type} value={type}>
                        {getQuestionTypeDisplay(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Class */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    label="Class"
                  >
                    <MenuItem value=""><em>All Classes</em></MenuItem>
                    {filterOptions.classes.map((className) => (
                      <MenuItem key={className} value={className}>
                        Class {className}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Course */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    label="Course"
                  >
                    <MenuItem value=""><em>All Courses</em></MenuItem>
                    {filterOptions.courses.map((course) => (
                      <MenuItem key={course} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Subject */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    label="Subject"
                  >
                    <MenuItem value=""><em>All Subjects</em></MenuItem>
                    {filterOptions.subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Chapter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Chapter</InputLabel>
                  <Select
                    value={filterChapter}
                    onChange={(e) => setFilterChapter(e.target.value)}
                    label="Chapter"
                  >
                    <MenuItem value=""><em>All Chapters</em></MenuItem>
                    {filterOptions.chapters.map((chapter) => (
                      <MenuItem key={chapter} value={chapter}>
                        {chapter}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Topic */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Topic</InputLabel>
                  <Select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    label="Topic"
                  >
                    <MenuItem value=""><em>All Topics</em></MenuItem>
                    {filterOptions.topics.map((topic) => (
                      <MenuItem key={topic} value={topic}>
                        {topic}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Resource */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Resource</InputLabel>
                  <Select
                    value={filterResource}
                    onChange={(e) => setFilterResource(e.target.value)}
                    label="Resource"
                  >
                    <MenuItem value=""><em>All Resources</em></MenuItem>
                    {filterOptions.resources.map((resource) => (
                      <MenuItem key={resource} value={resource}>
                        {resource}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Previous Years Question */}
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

              {/* Difficulty Level */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    label="Difficulty"
                  >
                    <MenuItem value=""><em>All Levels</em></MenuItem>
                    {filterOptions.difficulties.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                Reset All Filters
              </Button>
              <Typography variant="body2" sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                Showing {filteredData.length} of {originalData.length} questions
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </FilterContainer>

  <MainContainer>
    <LeftPanel 
      elevation={3} 
      sx={{ 
        width: isLeftPanelCollapsed ? '60px' : '400px', // Adjust width as needed
        transition: 'width 0.3s ease-in-out',
        minWidth: isLeftPanelCollapsed ? '60px' : '350px'
      }}
    >
      {/* Header with Toggle Button */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider', 
        background: 'linear-gradient(135deg, #848485FF 0%, #DCCEEAFF 100%)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Collapse in={!isLeftPanelCollapsed} orientation="horizontal">
          <Typography variant="h6" fontWeight={600}>
            Questions ({filteredData.length})
          </Typography>
        </Collapse>
        
        <Tooltip title={isLeftPanelCollapsed ? "Expand panel" : "Collapse panel"}>
          <IconButton 
            onClick={handleToggleLeftPanel}
            sx={{ 
              color: 'white',
              ml: isLeftPanelCollapsed ? 0 : 1
            }}
            size="small"
          >
            {isLeftPanelCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : filteredData.length === 0 ? (
        <EmptyState>
          <QuizIcon sx={{ fontSize: isLeftPanelCollapsed ? 24 : 48, opacity: 0.5 }} />
          <Collapse in={!isLeftPanelCollapsed}>
            <Typography variant="body1">No questions match your criteria</Typography>
            <Typography variant="body2" color="text.secondary">
              Adjust your filters or create new questions
            </Typography>
          </Collapse>
        </EmptyState>
      ) : (
        <QuestionsList>
          {filteredData.map((question, index) => (
            <QuestionListItem
              key={question._id}
              selected={selectedQuestion?._id === question._id}
              onClick={() => handleQuestionSelect(question)}
              sx={{
                padding: isLeftPanelCollapsed ? '8px 4px' : '8px 16px',
                minHeight: isLeftPanelCollapsed ? '40px' : 'auto'
              }}
            >
              {isLeftPanelCollapsed ? (
                // Collapsed view - only show question number
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={800} 
                    color="text.secondary" 
                    fontSize={14}
                  >
                    {question.number || index + 1}
                  </Typography>
                </Box>
              ) : (
                // Expanded view - full question details
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>
                  {/* Question Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={800} color="text.secondary" fontSize={16}>
                      # {question.number || index + 1}
                    </Typography>
                    <Chip 
                      label={getQuestionTypeDisplay(question.type)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* Subject, Chapter, Topic */}
                    <Typography variant="caption" color="text.secondary">
                      <strong>Subject:</strong> {question.subject?.subject || 'N/A'} | 
                      <strong> Chapter:</strong> {question.chapterName?.chapterName || 'N/A'} | 
                      <strong> Topic:</strong> {question.topic?.topic || 'N/A'}
                    </Typography>

                    {/* Class, Course */}
                    <Typography variant="caption" color="text.secondary">
                      <strong>Class:</strong> {question.class?.class || 'N/A'} | 
                      <strong> Course:</strong> {question.course?.course || 'N/A'}
                    </Typography>

                    {/* Resource, Difficulty */}
                    <Typography variant="caption" color="text.secondary">
                      <strong>Resource:</strong> {question.resource || 'N/A'} | 
                      <strong> Difficulty:</strong> {question.difficultyLevel || 'N/A'}
                    </Typography>

                    {/* Previous Years Badge */}
                    {question.previousYearsQuestion && (
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label="Previous Years" 
                          size="small" 
                          color="secondary" 
                          variant="filled"
                          sx={{ fontSize: '0.7rem', height: '18px' }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </QuestionListItem>
          ))}
        </QuestionsList>
      )}
    </LeftPanel>
    
    <RightPanel elevation={3}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', background: 'linear-gradient(135deg, #848485FF 0%, #DCCEEAFF 100%)', color: 'white' }}>
        <Typography variant="h6" fontWeight={600}>
          Question Detailssss
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {detailsLoading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : selectedQuestionDetails ? (
          <QuestionsDisplay
            questions={[selectedQuestionDetails]}
            loading={false}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            isImporting={false}
            fetchData = {fetchData}
            solution={solution}
            onDeleteSolution={onDeleteSolution} 
          />
        ) : (
          <EmptyState>
            <QuizIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant="body1">Select a question to view details</Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a question from the list to see its full content
            </Typography>
          </EmptyState>
        )}
      </Box>
    </RightPanel>
  </MainContainer>

      {openTrueFalseDialog && (
        <TrueFalseQuestionDialog
          open={openTrueFalseDialog}
          onClose={handleCloseTrueFalseDialog}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openMCQDialog && (
        <MCQQuestionDialog
          open={openMCQDialog}
          onClose={handleCloseMCQDialog}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openFillInTheBlankDialog && (
        <FillInTheBlankQuestionDialog
          open={openFillInTheBlankDialog}
          onClose={handleCloseFillInTheBlankDialog}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openIntegerDialog && (
        <IntegerQuestionDialog
          open={openIntegerDialog}
          onClose={handleCloseIntegerDialog}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {openComprehensiveDialog && (
        <ComprehensiveQuestionDialog
          open={openComprehensiveDialog}
          onClose={handleCloseComprehensiveDialog}
          onCreateQuestion={handleQuestionCreated}
          editQuestion={editQuestion}
          comprehensive={false}
        />
      )}
      
      {isUploadDocDialogOpen && (
        <UploadDocDialog
          open={isUploadDocDialogOpen}
          onClose={handleCloseUploadDocDialog}
          onUploadSuccess={handleDocUploadSuccess}
          fetchSectionById={refreshData}
        />
      )}
      {isUploadJsonDialogOpen && (
        <UploadJsonDialog
          open={isUploadJsonDialogOpen}
          onClose={handleCloseUploadJsonDialog}
          onUploadSuccess={handleDocUploadSuccess}
          fetchSectionById={fetchData}
        />
      )}
    </Box>
  );
};

export default QuestionManagement;