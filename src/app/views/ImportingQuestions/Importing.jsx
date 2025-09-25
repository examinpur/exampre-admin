import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {Box, Typography, Paper,TextField,InputAdornment, IconButton, Accordion, AccordionSummary,AccordionDetails, Chip, Checkbox,FormControlLabel, CircularProgress, Alert, Divider, Card, CardContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText,Container, Grid, Stack, Button,} from '@mui/material';
import {  ExpandMore as ExpandMoreIcon,  Search as SearchIcon, Clear as ClearIcon, Description as DescriptionIcon, CheckBox as CheckBoxIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, MenuBook as MenuBookIcon, Science as ScienceIcon, Calculate as CalculateIcon, Biotech as BiotechIcon, ErrorOutline as ErrorOutlineIcon, CheckCircle as CheckCircleIcon} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from 'app/config/config';
import axios from 'axios';
import Swal from 'sweetalert2';
import QuestionsDisplay from '../global/QuestionDisplay';
import { useTheme } from '@mui/material/styles';

const SUBJECT_CONFIG = {
  physics: { icon: ScienceIcon, color: 'primary' },
  chemistry: { icon: BiotechIcon, color: 'success' },
  mathematics: { icon: CalculateIcon, color: 'secondary' },
  default: { icon: MenuBookIcon, color: 'default' }
};

const TYPE_COLORS = {
  mcq: 'primary',
  truefalse: 'success',
  integertype: 'warning',
  fillintheblank: 'secondary',
  comprehension: 'error',
  default: 'default'
};

const useQuestionBank = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BASE_URL}/api/question-bank/get-all-data`);
      
      if (response.status === 200 && response.data?.data) {
        setData(response.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load question bank data');
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load content. Please try again.',
        confirmButtonColor: '#d33'
      });
      
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};

const useQuestionDetails = () => {
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchQuestionDetails = useCallback(async (questionId) => {
    if (!questionId) return;
    
    setDetailsLoading(true);
    
    try {
      const response = await axios.get(`${BASE_URL}/api/questions/${questionId}`);
      
      if (response.status === 200 && response.data?.data.question) {
        setSelectedQuestionDetails(response.data.data.question);
      } else {
        setSelectedQuestionDetails(null);
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
      setSelectedQuestionDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const clearDetails = useCallback(() => {
    setSelectedQuestionDetails(null);
  }, []);

  return { 
    selectedQuestionDetails, 
    detailsLoading, 
    fetchQuestionDetails, 
    clearDetails 
  };
};

const getSubjectConfig = (subject) => {
  const key = subject?.toLowerCase() || 'default';
  return SUBJECT_CONFIG[key] || SUBJECT_CONFIG.default;
};

const LoadingSpinner = () => {
  const theme = useTheme();
  
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      height="100%" 
      minHeight="200px"
    >
      <CircularProgress size={40} />
    </Box>
  );
};

const EmptyState = ({ title, description, icon: Icon }) => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    height="100%" 
    textAlign="center" 
    p={4}
    minHeight="200px"
  >
    <Icon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6" color="text.primary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

const SubjectBadge = ({ subject, classInfo }) => {
  const config = getSubjectConfig(subject);
  const IconComponent = config.icon;
  
  return (
    <Chip
      icon={<IconComponent />}
      label={`Class ${classInfo?.class || 'Unknown'} ${subject?.charAt(0).toUpperCase() + subject?.slice(1) || 'Unknown'}`}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
};

const getTypeColor = (type) => {
 const colors = {
   'mcq': 'success',
   'truefalse': 'warning', 
   'fillintheblank': 'error',
   'integerType': 'success',
   'comprehension': 'warning'
 };
 return colors[type] || 'default';
};

const formatQuestionType = (type) => {
 const formats = {
   'mcq': 'MCQ',
   'truefalse': 'True & False',
   'fillintheblank': 'Fill in the Blank',
   'integerType': 'Integer Type',
   'comprehension': 'Comprehension'
 };
 return formats[type] || type;
};

const QuestionItem = ({ 
  question, 
  isSelected, 
  onToggleSelection, 
  onQuestionClick 
}) => (
  <ListItem
    disablePadding
    sx={{
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' }
    }}
  >
    <ListItemButton
      onClick={() => onQuestionClick(question._id)}
      sx={{ py: 1.5 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        <IconButton
          edge="start"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(question._id);
          }}
          size="small"
        >
          {isSelected ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon />}
        </IconButton>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" component="span">
              #{question.number}
            </Typography>

            <Typography variant="body2" sx={{
  fontWeight: 600,
  color: getTypeColor(question.type) === 'success' ? '#2e7d32' :
         getTypeColor(question.type) === 'warning' ? '#ef6c00' : '#c62828'
}}>
  {formatQuestionType(question.type)}
</Typography>
          </Stack>
        }
      />
    </ListItemButton>
  </ListItem>
);

const SectionCard = ({ 
  section, 
  isExpanded, 
  onToggleExpansion, 
  selectedQuestions,
  onToggleQuestionSelection,
  onQuestionClick,
  onSelectAllQuestions 
}) => {
  const theme = useTheme();
  const allQuestionsSelected = section.questions?.length > 0 && 
    section.questions.every(q => selectedQuestions.has(q._id));
    
  const someQuestionsSelected = section.questions?.some(q => selectedQuestions.has(q._id));
  
  return (
    <Accordion 
      expanded={isExpanded} 
      sx={{ mb: 1 }}
    >
      <AccordionSummary
        sx={{
          backgroundColor: theme.palette.grey[50],
          '&.Mui-expanded': {
            backgroundColor: theme.palette.grey[100]
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 1 }}>
            <SubjectBadge 
              subject={section.subject?.subject} 
              classInfo={section.subject?.classId}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <Box component="span" fontWeight="medium">Chapter:</Box> {section.chapterName?.chapterName || 'Unknown'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <Box component="span" fontWeight="medium">Topic:</Box> {section.topic?.topic || 'Unknown'}
          </Typography>
          
          <Card 
            variant="outlined" 
            sx={{ 
              backgroundColor: theme.palette.warning.light + '20',
              cursor: 'pointer'
            }}
            onClick={() => onToggleExpansion(section._id)}
          >
            <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DescriptionIcon color="warning" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight="medium">
                    {section.title || 'Untitled Section'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({section.questions?.length || 0} questions)
                  </Typography>
                </Stack>
                <ExpandMoreIcon 
                  sx={{ 
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 0 }}>
        {!section.questions || section.questions.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No questions available
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.25' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allQuestionsSelected}
                    indeterminate={someQuestionsSelected && !allQuestionsSelected}
                    onChange={() => onSelectAllQuestions(section._id, section.questions)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="medium">
                    Select All Questions
                  </Typography>
                }
              />
            </Box>
            
            <List disablePadding>
              {section.questions.map((question) => (
                <QuestionItem
                  key={question._id}
                  question={question}
                  isSelected={selectedQuestions.has(question._id)}
                  onToggleSelection={onToggleQuestionSelection}
                  onQuestionClick={onQuestionClick}
                />
              ))}
            </List>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const SearchAndFilter = ({ searchTerm, onSearchChange, onClearSearch, classFilter, onClassFilterChange, availableClasses }) => (
  <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search sections, chapters, or topics..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={onClearSearch} size="small" edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        size="small"
      />
      
      <Box>
        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
          Filter by Class:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label="All Classes"
            variant={classFilter === '' ? 'filled' : 'outlined'}
            color={classFilter === '' ? 'primary' : 'default'}
            onClick={() => onClassFilterChange('')}
            size="small"
            clickable
          />
          {availableClasses.map((cls) => (
            <Chip
              key={cls}
              label={`Class ${cls}`}
              variant={classFilter === cls ? 'filled' : 'outlined'}
              color={classFilter === cls ? 'primary' : 'default'}
              onClick={() => onClassFilterChange(cls)}
              size="small"
              clickable
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  </Paper>
);

// Main component
export const Importing = () => {
  const { sectionId } = useParams();
  const { data, loading, error, fetchData } = useQuestionBank();
  const navigate = useNavigate();
  const { 
    selectedQuestionDetails, 
    detailsLoading, 
    fetchQuestionDetails, 
    clearDetails 
  } = useQuestionDetails();
  
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Get available classes for filtering
  const availableClasses = useMemo(() => {
    const classes = new Set();
    data.forEach(section => {
      if (section.subject?.classId?.class) {
        classes.add(section.subject.classId.class);
      }
    });
    return Array.from(classes).sort();
  }, [data]);

  // Filter data based on search term and class filter
  const filteredData = useMemo(() => {
    let filtered = data;
    
    // Filter by class if selected
    if (classFilter) {
      filtered = filtered.filter(section => 
        section.subject?.classId?.class === classFilter
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(section => 
        section.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.chapterName?.chapterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.topic?.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.subject?.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [data, searchTerm, classFilter]);

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log('Section ID:', sectionId);
  }, [sectionId]);

  // Event handlers
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const toggleQuestionSelection = useCallback((questionId) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const handleQuestionClick = useCallback((questionId) => {
    fetchQuestionDetails(questionId);
  }, [fetchQuestionDetails]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleClassFilterChange = useCallback((selectedClass) => {
    setClassFilter(selectedClass);
  }, []);

  const handleSelectAllQuestions = useCallback((sectionId, questions) => {
    const questionIds = questions.map(q => q._id);
    const allSelected = questionIds.every(id => selectedQuestions.has(id));
    
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        questionIds.forEach(id => newSet.delete(id));
      } else {
        questionIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  }, [selectedQuestions]);

  const handleImportQuestions = useCallback(async () => {
    if (selectedQuestions.size === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Questions Selected',
        text: 'Please select at least one question to import.',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Import Questions',
        text: `Are you sure you want to import ${selectedQuestions.size} selected question(s)?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Import!'
      });

      if (result.isConfirmed) {
        const questionIds = Array.from(selectedQuestions);
       const res = await axios.patch(`${BASE_URL}/api/global-Library/import/${sectionId}`,{questionIds});
       if(res.status === 200){
         Swal.fire({
          icon: 'success',
          title: 'Import Successful',
          text: `Successfully imported ${selectedQuestions.size} question(s)!`,
          confirmButtonColor: '#1976d2'
        });
        
        setSelectedQuestions(new Set());
        navigate(-1);
      }
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Import Failed',
        text: 'Failed to import questions. Please try again.',
        confirmButtonColor: '#d33'
      });
    }
  }, [selectedQuestions, sectionId, navigate]);
console.log('question:', selectedQuestionDetails);
  // Loading state
  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', bgcolor: 'grey.50' }}>
        <LoadingSpinner />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', bgcolor: 'grey.50' }}>
        <Alert severity="error" sx={{ m: 2, alignSelf: 'flex-start' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: 'grey.50' }}>
      {/* Left Panel - Question Bank */}
      <Paper 
        sx={{ 
          width: '33.333%', 
          borderRadius: 0, 
          borderRight: 1, 
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Question Bank
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select questions to view details
          </Typography>
        </Box>
        
        <SearchAndFilter 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={handleClearSearch}
          classFilter={classFilter}
          onClassFilterChange={handleClassFilterChange}
          availableClasses={availableClasses}
        />
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {filteredData.length === 0 ? (
            <EmptyState 
              title={searchTerm || classFilter ? "No matching sections" : "No sections available"}
              description={searchTerm || classFilter ? "Try adjusting your search terms or filters" : "No question bank data found"}
              icon={DescriptionIcon}
            />
          ) : (
            filteredData.map((section) => (
              <SectionCard
                key={section._id}
                section={section}
                isExpanded={expandedSections[section._id]}
                onToggleExpansion={toggleSection}
                selectedQuestions={selectedQuestions}
                onToggleQuestionSelection={toggleQuestionSelection}
                onQuestionClick={handleQuestionClick}
                onSelectAllQuestions={handleSelectAllQuestions}
              />
            ))
          )}
        </Box>
      </Paper>
      
      {/* Right Panel - Question Details */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper 
          elevation={0} 
          sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Question Details
              </Typography>
              {selectedQuestions.size > 0 && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {selectedQuestions.size} question(s) selected
                  </Typography>
                </Stack>
              )}
            </Box>
            
            {selectedQuestions.size > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleImportQuestions}
                startIcon={<CheckCircleIcon />}
                sx={{ minWidth: 120 }}
              >
                Import ({selectedQuestions.size})
              </Button>
            )}
          </Stack>
        </Paper>
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {detailsLoading ? (
            <LoadingSpinner />
          ) : selectedQuestionDetails ? (
            <QuestionsDisplay
              questions={[selectedQuestionDetails]}
              loading={false}
              isImporting={true}
            />
          ) : (
            <EmptyState
              title="Select a question to view details"
              description="Choose a question from the list to see its full content"
              icon={DescriptionIcon}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};