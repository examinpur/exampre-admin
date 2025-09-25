import React, { useState, useEffect } from 'react';
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
  Checkbox,
  Radio,
  CircularProgress,
  Autocomplete,
  Grid,
  Paper,
  Tooltip,
  ButtonGroup
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Functions as FunctionsIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import styled from '@emotion/styled';
import Swal from 'sweetalert2';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';

// Import KaTeX components and CSS
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Import MathQuill
import { addStyles, EditableMathField } from 'react-mathquill';

// Add MathQuill styles
addStyles();

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

const LaTeXEditorContainer = styled(Paper)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: '#fafafa',
  marginBottom: theme.spacing(2),
  '& .mq-editable-field': {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '16px',
    fontSize: '18px',
    minHeight: '80px',
    maxHeight: '200px',
    width: '100%',
    backgroundColor: 'white',
    overflowY: 'auto',
    lineHeight: '1.5',
    '&:focus': {
      border: '2px solid #1976d2',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    },
    '&:hover': {
      border: '1px solid #999'
    }
  },
  '& .mq-math-mode': {
    fontSize: '20px'
  },
  '& .mq-root-block': {
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center'
  }
}));

const SymbolButton = styled(Button)(({ theme }) => ({
  minWidth: '40px',
  height: '40px',
  margin: '2px',
  fontSize: '16px',
  fontFamily: 'KaTeX_Math, serif',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: 'white'
  }
}));

// Common mathematical symbols
const symbols = [
  { symbol: 'x²', latex: 'x^2', tooltip: 'Superscript' },
  { symbol: 'x₂', latex: 'x_2', tooltip: 'Subscript' },
  { symbol: '√', latex: '\\sqrt{}', tooltip: 'Square root' },
  { symbol: '∛', latex: '\\sqrt[3]{}', tooltip: 'Cube root' },
  { symbol: '∫', latex: '\\int', tooltip: 'Integral' },
  { symbol: '∑', latex: '\\sum', tooltip: 'Summation' },
  { symbol: '∏', latex: '\\prod', tooltip: 'Product' },
  { symbol: '∂', latex: '\\partial', tooltip: 'Partial derivative' },
  { symbol: '∞', latex: '\\infty', tooltip: 'Infinity' },
  { symbol: '≤', latex: '\\leq', tooltip: 'Less than or equal' },
  { symbol: '≥', latex: '\\geq', tooltip: 'Greater than or equal' },
  { symbol: '≠', latex: '\\neq', tooltip: 'Not equal' },
  { symbol: '±', latex: '\\pm', tooltip: 'Plus minus' },
  { symbol: '×', latex: '\\times', tooltip: 'Multiplication' },
  { symbol: '÷', latex: '\\div', tooltip: 'Division' },
  { symbol: 'α', latex: '\\alpha', tooltip: 'Alpha' },
  { symbol: 'β', latex: '\\beta', tooltip: 'Beta' },
  { symbol: 'γ', latex: '\\gamma', tooltip: 'Gamma' },
  { symbol: 'δ', latex: '\\delta', tooltip: 'Delta' },
  { symbol: 'θ', latex: '\\theta', tooltip: 'Theta' },
  { symbol: 'π', latex: '\\pi', tooltip: 'Pi' },
  { symbol: 'sin', latex: '\\sin', tooltip: 'Sine' },
  { symbol: 'cos', latex: '\\cos', tooltip: 'Cosine' },
  { symbol: 'tan', latex: '\\tan', tooltip: 'Tangent' },
  { symbol: 'log', latex: '\\log', tooltip: 'Logarithm' },
  { symbol: 'ln', latex: '\\ln', tooltip: 'Natural log' },
  { symbol: 'lim', latex: '\\lim_{x \\to a}', tooltip: 'Limit' }
];

// LaTeX Editor Component
const LaTeXEditor = ({ value, onChange, onBlur, placeholder = "Enter mathematical expression...", compact = false }) => {
  const [mathField, setMathField] = useState(null);
  const [showSymbols, setShowSymbols] = useState(false);

  const insertSymbol = (latex) => {
    if (mathField) {
      mathField.write(latex);
      mathField.focus();
      const newLatex = mathField.latex();
      onChange(newLatex);
    }
  };

  return (
    <LaTeXEditorContainer elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          LaTeX Math Editor
        </Typography>
        <Tooltip title="Toggle Symbol Palette">
          <IconButton
            size="small"
            onClick={() => setShowSymbols(!showSymbols)}
            color={showSymbols ? 'primary' : 'default'}
          >
            <FunctionsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ mb: 2 }}>
        <EditableMathField
          latex={value}
          onChange={(mathField) => {
            const latex = mathField.latex();
            onChange(latex);
          }}
          onBlur={onBlur}
          mathquillDidMount={(mathField) => {
            setMathField(mathField);
          }}
          config={{
            spaceBehavesLikeTab: true,
            leftRightIntoCmdGoes: 'up',
            restrictMismatchedBrackets: true,
            sumStartsWithNEquals: true,
            supSubsRequireOperand: true,
            charsThatBreakOutOfSupSub: '+-=<>',
            autoSubscriptNumerals: true,
            autoCommands: 'pi theta sqrt sum prod int infty alpha beta gamma delta epsilon phi lambda mu sigma omega',
            autoOperatorNames: 'sin cos tan log ln exp det max min gcd lcm',
            maxDepth: 10
          }}
          style={{
            width: '100%',
            minHeight: compact ? '60px' : '80px',
            fontSize: compact ? '16px' : '18px'
          }}
        />
        
        <Typography variant="caption" sx={{ 
          display: 'block', 
          mt: 1, 
          color: '#666',
          fontSize: '0.75rem'
        }}>
          Use Tab to navigate • Arrow keys to move cursor • Click symbols below to insert
        </Typography>
      </Box>

      {showSymbols && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            Click symbols to insert:
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.5,
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 1,
            backgroundColor: 'white'
          }}>
            {symbols.map((item, index) => (
              <Tooltip key={index} title={`${item.tooltip} (${item.latex})`}>
                <SymbolButton
                  variant="outlined"
                  size="small"
                  onClick={() => insertSymbol(item.latex)}
                >
                  {item.symbol}
                </SymbolButton>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}
    </LaTeXEditorContainer>
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

const ensureMinOptions = (options, minCount = 4) => {
  const newOptions = options ? [...options] : [];
  while (newOptions.length < minCount) {
    newOptions.push({ 
      id: `opt-${Date.now()}-${newOptions.length}-${Math.random()}`, 
      text: '', 
      isCorrect: false,
      optionUrl: ''
    });
  }
  return newOptions.map(opt => ({
    ...opt,
    id: opt.id || `opt-${Date.now()}-${Math.random()}`,
    optionUrl: opt.optionUrl || ''
  }));
};

export const MCQQuestionDialog = ({ open, onClose, onCreateQuestion, editQuestion, onSaveSubQuestion, comprehensive }) => {
  const [formData, setFormData] = useState({
    type: 'mcq',
    questionText: '',
    questionUrl: '',
    marks: '',
    negativeMarking: false,
    negativeMarksValue: '',
    difficultyLevel: 'easy',
    subject: '',
    class: "",
    course: "",
    chapterName: '',
    topic: '',
    previousYearsQuestion: false,
    resource: '',
    year: '',
    titles: [],
    options: ensureMinOptions([]),
    answerType: 'single',
    solution: ''
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

  // LaTeX Editor states
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [showQuestionLatexEditor, setShowQuestionLatexEditor] = useState(false);
  const [showSolutionLatexEditor, setShowSolutionLatexEditor] = useState(false);
  const [showOptionLatexEditor, setShowOptionLatexEditor] = useState({});
  const [questionLatex, setQuestionLatex] = useState('');
  const [solutionLatex, setSolutionLatex] = useState('');
  const [optionLatex, setOptionLatex] = useState({});

  // Fetch form options when dialog opens
  useEffect(() => {
    if (open) {
      fetchFormOptions();
    }
  }, [open]);

  useEffect(() => {
    if (editQuestion) {
      setFormData({
        type: editQuestion.type || 'mcq',
        questionText: editQuestion.questionText || '',
        questionUrl: editQuestion.questionUrl || '',
        marks: editQuestion.marks || '',
        negativeMarking: editQuestion.negativeMarking || false,
        negativeMarksValue: editQuestion.negativeMarksValue || '',
        difficultyLevel: editQuestion.difficultyLevel || 'easy',
        subject: editQuestion.subject || '',
        chapterName: editQuestion.chapterName || '',
        topic: editQuestion.topic || '',
        previousYearsQuestion: editQuestion.previousYearsQuestion || false,
        resource: editQuestion.resource || '',
        year: editQuestion.year || '',
        titles: editQuestion.titles || [],
        options: ensureMinOptions(editQuestion.options),
        answerType: editQuestion.answerType || 'single',
        solution: editQuestion.solution || ''
      });

      if (editQuestion.subject) {
        fetchChapters(editQuestion.subject);
      }
      if (editQuestion.chapterName) {
        fetchTopics(editQuestion.chapterName);
      }
    } else {
      setFormData({
        type: 'mcq',
        questionText: '',
        questionUrl: '',
        marks: '',
        negativeMarking: false,
        negativeMarksValue: '',
        difficultyLevel: 'easy',
        subject: '',
        chapterName: '',
        topic: '',
        previousYearsQuestion: false,
        resource: '',
        year: '',
        titles: [],
        options: ensureMinOptions([]),
        answerType: 'single',
        solution: ''
      });
      setChapters([]);
      setTopics([]);
    }
    
    // Reset LaTeX states
    setShowQuestionPreview(false);
    setShowQuestionLatexEditor(false);
    setShowSolutionLatexEditor(false);
    setShowOptionLatexEditor({});
    setQuestionLatex('');
    setSolutionLatex('');
    setOptionLatex({});
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

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

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

  const handleSelectChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      
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
      
      if (field === 'answerType' && value === 'single') {
        const correctOptions = newState.options.filter(opt => opt.isCorrect);
        if (correctOptions.length > 1) {
          newState.options = newState.options.map((opt, index) => ({
            ...opt,
            isCorrect: index === newState.options.findIndex(o => o.isCorrect)
          }));
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

  const handleOptionTextChange = (index) => (event) => {
    const newOptions = [...formData.options];
    newOptions[index].text = event.target.value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleOptionUrlChange = (index) => (event) => {
    const newOptions = [...formData.options];
    newOptions[index].optionUrl = event.target.value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleOptionCorrectChange = (index) => (event) => {
    const newOptions = [...formData.options];
    if (formData.answerType === 'single') {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = (i === index) ? event.target.checked : false;
      });
    } else {
      newOptions[index].isCorrect = event.target.checked;
    }
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { 
        id: `opt-${Date.now()}-${prev.options.length}-${Math.random()}`, 
        text: '', 
        isCorrect: false,
        optionUrl: ''
      }]
    }));
  };

  const handleRemoveOption = (indexToRemove) => () => {
    const newOptions = formData.options.filter((_, i) => i !== indexToRemove);
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // LaTeX Editor Handlers
  const handleQuestionLatexChange = (latex) => {
    setQuestionLatex(latex);
  };

  const handleSolutionLatexChange = (latex) => {
    setSolutionLatex(latex);
  };

  const handleOptionLatexChange = (index) => (latex) => {
    setOptionLatex(prev => ({
      ...prev,
      [index]: latex
    }));
  };

  const insertLatexIntoQuestion = () => {
    if (questionLatex.trim()) {
      setFormData(prev => ({
        ...prev,
        questionText: `${prev.questionText} $${questionLatex}$`
      }));
    }
  };

  const insertLatexIntoSolution = () => {
    if (solutionLatex.trim()) {
      setFormData(prev => ({
        ...prev,
        solution: `${prev.solution} $${solutionLatex}$`
      }));
    }
  };

  const insertLatexIntoOption = (index) => () => {
    const latex = optionLatex[index];
    if (latex && latex.trim()) {
      const newOptions = [...formData.options];
      newOptions[index].text = `${newOptions[index].text} $${latex}$`;
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const toggleQuestionPreview = () => {
    setShowQuestionPreview(prev => !prev);
  };

  const toggleOptionLatexEditor = (index) => () => {
    setShowOptionLatexEditor(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper functions for Autocomplete
  const getSelectedChapter = () => {
    return chapters.find(c => c._id === formData.chapterName) || null;
  };

  const getSelectedTopic = () => {
    return topics.find(t => t._id === formData.topic) || null;
  };

  const handleSaveQuestion = async () => {
    // Validation
    if (!formData.questionText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Question text is required.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (!comprehensive && (isNaN(parseFloat(formData.marks)) || parseFloat(formData.marks) <= 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Marks must be a positive number.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

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

    if (formData.negativeMarking && !comprehensive && (isNaN(parseFloat(formData.negativeMarksValue)) || parseFloat(formData.negativeMarksValue) <= 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Negative marks value must be a positive number if negative marking is enabled.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (formData.options.length < 2 || formData.options.some(option => !option.text.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'At least two options are required, and all option texts must be filled.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (formData.options.filter(opt => opt.isCorrect).length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'At least one correct answer must be selected.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (formData.answerType === 'single' && formData.options.filter(opt => opt.isCorrect).length > 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'For "Single Correct" answer type, only one option can be marked as correct.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    if (formData.previousYearsQuestion && (!formData.year.trim() || formData.titles.length === 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Year and at least one title are required when marking as previous years question.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type: "mcq",
        questionText: formData.questionText.trim(),
        questionUrl: formData.questionUrl.trim() || undefined,
        marks: comprehensive ? null : parseFloat(formData.marks),
        negativeMarking: formData.negativeMarking,
        negativeMarksValue: formData.negativeMarking && !comprehensive ? parseFloat(formData.negativeMarksValue) : 0,
        difficultyLevel: formData.difficultyLevel,
        subject: formData.subject,
        chapterName: formData.chapterName,
        topic: formData.topic,
        previousYearsQuestion: formData.previousYearsQuestion,
        resource: formData.resource.trim() || undefined,
        year: formData.previousYearsQuestion ? formData.year.trim() : '',
        titles: formData.previousYearsQuestion ? formData.titles : [],
        options: formData.options.map(option => ({
          text: option.text.trim(),
          isCorrect: option.isCorrect,
          optionUrl: option.optionUrl.trim() || undefined
        })),
        answerType: formData.answerType,
        solution: formData.solution.trim() || undefined
      };

      if (comprehensive) {
        onSaveSubQuestion(payload);
      } else {
        await onCreateQuestion(payload);
      }
      onClose();
    } catch (error) {
      console.error(`Error ${editQuestion ? 'updating' : 'creating'} MCQ question:`, error);
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '95vh'
        },
      }}
    >
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          {editQuestion ? 'Edit Multiple Choice Question' : 'Create Multiple Choice Question'}
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

      <DialogContent sx={{ p: 3, maxHeight: '80vh', overflowY: 'auto' }}>
        {loadingFormOptions && (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading form options...</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Question Text Section with LaTeX Editor */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Question Text *
              </Typography>
              <ButtonGroup size="small" variant="outlined">
                <Tooltip title="Toggle LaTeX Editor">
                  <Button
                    onClick={() => setShowQuestionLatexEditor(!showQuestionLatexEditor)}
                    startIcon={<EditIcon />}
                    color={showQuestionLatexEditor ? 'primary' : 'inherit'}
                  >
                    LaTeX
                  </Button>
                </Tooltip>
                <Tooltip title="Toggle Preview">
                  <Button
                    onClick={toggleQuestionPreview}
                    startIcon={showQuestionPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    color={showQuestionPreview ? 'primary' : 'inherit'}
                  >
                    Preview
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Box>

            {showQuestionLatexEditor && (
              <Box sx={{ mb: 2 }}>
                <LaTeXEditor
                  value={questionLatex}
                  onChange={handleQuestionLatexChange}
                  placeholder="Enter mathematical expressions for your question..."
                  compact={false}
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={insertLatexIntoQuestion}
                    disabled={!questionLatex.trim()}
                  >
                    Insert into Question
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setQuestionLatex('')}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}

            {showQuestionPreview ? (
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  p: 2,
                  minHeight: '100px',
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
                autoFocus
                margin="dense"
                label="Question Text"
                type="text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={formData.questionText}
                onChange={handleInputChange('questionText')}
                required
                error={formData.questionText !== '' && !formData.questionText.trim()}
                helperText={
                  formData.questionText !== '' && !formData.questionText.trim()
                    ? 'Question text is required'
                    : 'Use $...$ for inline math, $...$ for display math, or use the LaTeX editor above'
                }
              />
            )}
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

          {/* Course and Class Selection */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Course</InputLabel>
                <Select
                  value={formData.course}
                  onChange={handleSelectChange('course')}
                  label="Course"
                  disabled={loadingFormOptions}
                >
                  {formOptions.courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.class}
                  onChange={handleSelectChange('class')}
                  label="Class"
                  disabled={loadingFormOptions}
                >
                  {formOptions.classes.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      {cls.class}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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

          {/* Resource Field */}
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

          {/* Marks and Difficulty */}
          {!comprehensive && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  margin="dense"
                  label="Marks"
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
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="dense" variant="outlined">
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    value={formData.difficultyLevel}
                    onChange={handleSelectChange('difficultyLevel')}
                    label="Difficulty Level"
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          {!comprehensive && (
            <>
              {/* Negative Marking */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.negativeMarking}
                    onChange={handleSwitchChange('negativeMarking')}
                    name="negativeMarking"
                    color="primary"
                  />
                }
                label="Enable Negative Marking"
              />

              {formData.negativeMarking && (
                <TextField
                  margin="dense"
                  label="Negative Marks Value"
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
            </>
          )}

          {/* Answer Type */}
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel id="answer-type-label">Answer Type</InputLabel>
            <Select
              labelId="answer-type-label"
              id="answer-type-select"
              value={formData.answerType}
              onChange={handleSelectChange('answerType')}
              label="Answer Type"
            >
              <MenuItem value="single">Single Correct</MenuItem>
              <MenuItem value="multiple">Multiple Correct</MenuItem>
            </Select>
          </FormControl>

          {/* Options Section with LaTeX Support */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
            Options:
          </Typography>
          {showQuestionPreview ? (
            // Preview Mode for Options
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {formData.options.map((option, index) => (
                <Box
                  key={option.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 1,
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    p: 1.5,
                    backgroundColor: option.isCorrect ? '#e8f5e9' : '#fff',
                    boxShadow: option.isCorrect ? '0px 0px 5px rgba(76, 175, 80, 0.3)' : 'none',
                  }}
                >
                  {formData.answerType === 'single' ? (
                    <Radio checked={option.isCorrect} disabled color="primary" sx={{ p: 0.5 }} />
                  ) : (
                    <Checkbox checked={option.isCorrect} disabled color="primary" sx={{ p: 0.5 }} />
                  )}
                  <Box sx={{ flexGrow: 1, lineHeight: '1.6', color: '#333' }}>
                    <Typography component="span" sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                      {`${String.fromCharCode(65 + index)}. `}
                    </Typography>
                    {renderTextWithLatex(option.text)}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            // Edit Mode for Options with LaTeX Support
            <>
              {formData.options.map((option, index) => (
                <Box key={option.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Checkbox
                      checked={option.isCorrect}
                      onChange={handleOptionCorrectChange(index)}
                      color="primary"
                      sx={{ p: 0.5 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Option {String.fromCharCode(65 + index)}
                    </Typography>
                    <Tooltip title="Toggle LaTeX Editor">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={toggleOptionLatexEditor(index)}
                        startIcon={<EditIcon />}
                        color={showOptionLatexEditor[index] ? 'primary' : 'inherit'}
                      >
                        LaTeX
                      </Button>
                    </Tooltip>
                    {formData.options.length > 4 && (
                      <IconButton onClick={handleRemoveOption(index)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  {showOptionLatexEditor[index] && (
                    <Box sx={{ mb: 2 }}>
                      <LaTeXEditor
                        value={optionLatex[index] || ''}
                        onChange={handleOptionLatexChange(index)}
                        placeholder={`Enter mathematical expressions for option ${String.fromCharCode(65 + index)}...`}
                        compact={true}
                      />
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={insertLatexIntoOption(index)}
                          disabled={!optionLatex[index] || !optionLatex[index].trim()}
                        >
                          Insert into Option
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setOptionLatex(prev => ({ ...prev, [index]: '' }))}
                        >
                          Clear
                        </Button>
                      </Box>
                    </Box>
                  )}

                  <TextField
                    margin="dense"
                    label={`Option ${String.fromCharCode(65 + index)} Text`}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={option.text}
                    onChange={handleOptionTextChange(index)}
                    required
                    error={option.text !== '' && !option.text.trim()}
                    helperText={
                      option.text !== '' && !option.text.trim()
                        ? 'Option text is required'
                        : 'Use $...$ for mathematical expressions or use LaTeX editor above'
                    }
                  />
                  <TextField
                    margin="dense"
                    label="Option URL (Optional)"
                    type="url"
                    fullWidth
                    variant="outlined"
                    value={option.optionUrl}
                    onChange={handleOptionUrlChange(index)}
                    helperText="Optional image or media URL for this option"
                  />
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddOption}
                sx={{ alignSelf: 'flex-start', mt: 1 }}
              >
                Add Another Option
              </Button>
            </>
          )}

          {/* Solution Section with LaTeX Editor */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Solution (Optional)
              </Typography>
              <Tooltip title="Toggle LaTeX Editor for Solution">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setShowSolutionLatexEditor(!showSolutionLatexEditor)}
                  color={showSolutionLatexEditor ? 'primary' : 'inherit'}
                >
                  LaTeX
                </Button>
              </Tooltip>
            </Box>

            {showSolutionLatexEditor && (
              <Box sx={{ mb: 2 }}>
                <LaTeXEditor
                  value={solutionLatex}
                  onChange={handleSolutionLatexChange}
                  placeholder="Enter mathematical expressions for your solution..."
                  compact={false}
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={insertLatexIntoSolution}
                    disabled={!solutionLatex.trim()}
                  >
                    Insert into Solution
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setSolutionLatex('')}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}

            <TextField
              margin="dense"
              label="Solution (Optional)"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={formData.solution}
              onChange={handleInputChange('solution')}
              helperText="Detailed explanation of the answer. Use $...$ for inline math, $...$ for display math"
            />

            {/* Solution Preview */}
            {formData.solution && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Solution Preview:
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    lineHeight: '1.6',
                    fontSize: '0.95rem',
                    color: '#333',
                  }}
                >
                  {renderTextWithLatex(formData.solution)}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSaveQuestion}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (editQuestion ? 'Saving...' : 'Creating...') : (editQuestion ? 'Save Changes' : 'Create Question')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};