
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, IconButton, Button, GlobalStyles, Divider, Grid, Avatar } from '@mui/material';
import styled from '@emotion/styled';
import katex from "katex"
import 'katex/dist/katex.min.css';
import { Add, Delete, Edit, Quiz, School as SchoolIcon, Book as BookIcon, Topic as TopicIcon, Schedule as ScheduleIcon, Star as StarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MathJax, MathJaxContext } from "better-react-mathjax";


const mathJaxConfig = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
  },
};


const katexGlobalStyles = (
  <GlobalStyles
    styles={{
      '.katex': {
        fontSize: 'inherit !important',
        lineHeight: 'inherit !important',
      },
      '.katex-display': {
        margin: '0.2em 0 !important',
        textAlign: 'left !important',
      },
      '.katex-display > .katex': {
        display: 'inline !important',
        textAlign: 'left !important',
      },
      '.katex .base': {
        display: 'inline !important',
      },
      '.katex .strut': {
        display: 'inline !important',
      },
    }}
  />
);

const QuestionCard = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
}));

const QuestionsContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[50],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: theme.palette.grey[400],
    },
  },
}));

const CenteredContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '300px',
  padding: '20px',
});

const SectionHeading = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[600],
  fontWeight: 500,
  fontSize: '0.875rem',
  marginBottom: theme.spacing(0.5),
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const QuestionSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
});

const SolutionSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
});

const HorizontalDivider = styled(Divider)({
  margin: '16px 0',
});

const SolutionStep = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

const AddSolutionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: '8px',
  border: `2px dashed ${theme.palette.grey[300]}`,
  backgroundColor: 'transparent',
  color: theme.palette.grey[600],
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
}));

export const renderTextWithLatex = (html) => {
  if (!html) return null;

  // Strip unsafe tags but keep math delimiters + plain text
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const safeText = tmp.textContent || tmp.innerText || "";

  return (
    <MathJax dynamic>
      {safeText}
    </MathJax>
  );
};




// Helper function to render images with custom styles
const renderImages = (imageArray, altPrefix = "Image") => {
  if (!Array.isArray(imageArray) || imageArray.length === 0) return null;

  return (
    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {imageArray.map((imageObj, idx) => {
        const url = typeof imageObj === 'string' ? imageObj : imageObj.url;
        const style = imageObj.style || {};
        
        // Parse style string if it exists
        const parsedStyle = {};
        if (typeof style === 'string') {
          style.split(';').forEach(declaration => {
            const [property, value] = declaration.split(':').map(s => s.trim());
            if (property && value) {
              // Convert CSS property names to camelCase for React
              const camelProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
              parsedStyle[camelProperty] = value;
            }
          });
        }
        return (
          <img
            key={idx}
            src={url}
            alt={`${altPrefix} ${idx + 1}`}
            style={{
              ...parsedStyle,
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        );
      })}
    </Box>
  );
};

export const QuestionsDisplay = ({
  questions,
  loading,
  onEditQuestion,
  onDeleteSolution,
  fetchData,
  onDeleteQuestion,
  isImporting = false,
}) => {
  const navigate = useNavigate();
  console.log(questions);
  const question = questions[0];
  const solution =  questions[0].solution;

  const renderQuestionContent = (question) => {
    switch (question.type) {
      case 'mcq':
        return (
          <Box sx={{ mb: 2 }}>
            {question.options?.map((option, idx) => (
              <Box 
                key={option._id || idx} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: option.isCorrect ? 'green.50' : 'grey.50',
                  border: option.isCorrect ? '2px solid' : '1px solid',
                  borderColor: option.isCorrect ? 'success.main' : 'grey.300',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: option.isCorrect ? 600 : 400,
                      color: option.isCorrect ? 'success.dark' : 'text.primary',
                      mb: option.optionUrl?.length > 0 ? 1 : 0
                    }}
                  >
                    {String.fromCharCode(65 + idx)}. {renderTextWithLatex((option.text))}
                    {option.isCorrect && ' ✓'}
                  </Typography>
                  {renderImages(option.optionUrl, `Option ${String.fromCharCode(65 + idx)}`)}
                </Box>
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
                backgroundColor: question.correctAnswer === true ? 'success.light' : 'grey.50',
                border: question.correctAnswer === true ? '2px solid' : '1px solid',
                borderColor: question.correctAnswer === true ? 'success.main' : 'grey.300',
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
                backgroundColor: question.correctAnswer === false ? 'success.light' : 'grey.50',
                border: question.correctAnswer === false ? '2px solid' : '1px solid',
                borderColor: question.correctAnswer === false ? 'success.main' : 'grey.300'
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
                Answer: {renderTextWithLatex(String((question.correctAnswer)))} 
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
                sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'grey.300', mr: 1, mb: 1}}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'success.dark'
                  }}
                >
                 {renderTextWithLatex((blank.correctAnswer))} 
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
                  {renderTextWithLatex((question.passage))}
                </Typography>
              </Box>
            )}
            {question.subQuestions?.map((subQ, idx) => (
              <Box key={subQ._id || idx} sx={{ mb: 2, pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Sub-question {idx + 1}: {renderTextWithLatex((subQ.questionText))}
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
                      {String.fromCharCode(65 + optIdx)}. {renderTextWithLatex((option.text))}
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

  const renderSolutionContent = (question, solution) => {
    const hasStringSolution = question.solution && typeof question.solution === 'string' && question.solution.trim().length > 0;
    const hasStepsSolution = solution && solution.steps && solution.steps.length > 0;
    const hasSolutionUrl = question.solutionUrl && question.solutionUrl.length > 0;
    
    if (hasStringSolution || hasStepsSolution || hasSolutionUrl) {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <SectionHeading>Solution</SectionHeading>
            {!isImporting && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/solution/${question._id}`)}
                  title="Edit Solution"
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDeleteSolution({ solution: question.solution, question })}
                  title="Delete Solution"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
          
          {/* Render solution images first */}
          {renderImages(question.solutionUrl, "Solution")}
          
          <Box sx={{ mt: 1 }}>
            {hasStringSolution ? (
              question.solution.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;
                return (
                  <SolutionStep key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6, flex: 1 }}>
                        {renderTextWithLatex((trimmedLine))}
                      </Typography>
                    </Box>
                  </SolutionStep>
                );
              })
            ) : hasStepsSolution ? (
              solution.steps.map((step, index) => (
                <SolutionStep key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.6, flex: 1 }}>
                      {renderTextWithLatex((step))}
                    </Typography>
                  </Box>
                </SolutionStep>
              ))
            ) : null}
          </Box>
        </Box>
      );
    } else {
      return (
        <Box>
          <SectionHeading>Solution</SectionHeading>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4}}>
            {!isImporting ? (
              <AddSolutionButton
                startIcon={<Add />}
                onClick={() => navigate(`/solution/${question._id}`)}
                fullWidth
              >
                Add Solution
              </AddSolutionButton>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                No solution available
              </Typography>
            )}
          </Box>
        </Box>
      );
    }
  };

  const handleEditClick = (question) => {
    if (onEditQuestion) {
      onEditQuestion(question);
    }
  };

  const handleDeleteClick = (question) => {
    if (onDeleteQuestion) {
      onDeleteQuestion(question);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography color="textSecondary">Loading question...</Typography>
      </Box>
    );
  }

  if (!question) {
    return (
      <CenteredContainer>
        <Quiz sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
        <Typography variant="h5" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
          No question found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center' }}>
          Select a question to view its details
        </Typography>
      </CenteredContainer>
    );
  }

  return (
     <MathJaxContext version={3} config={mathJaxConfig}>
    <Box>
      {katexGlobalStyles}
      <QuestionsContainer>
        <QuestionCard variant="outlined">
          <CardContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
            <QuestionSection>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ fontSize: '0.9rem', color: 'grey.600', fontWeight: 600, mr: 1 }}>
                        Q{question.number || 1}:
                      </Box>
                      <Box sx={{ fontSize: '1.1rem', fontWeight: 400, color: '#333', position: 'relative', top: '-3px' }}>
                        {renderTextWithLatex((question.questionText))}
                      </Box>
                    </Box>
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
                  {!isImporting && (
                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                      <IconButton size="small" color="primary" onClick={() => handleEditClick(question)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(question)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                {/* Render question images */}
                {renderImages(question.questionUrl, "Question")}

                {renderQuestionContent(question)}
              </Box>
              
              <Grid container spacing={1} sx={{ mb: 2, mt: 2 }}>
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
            </QuestionSection>
            
            <HorizontalDivider />
            
            <SolutionSection>
              {renderSolutionContent(question, solution)}
            </SolutionSection>
          </CardContent>
        </QuestionCard>
      </QuestionsContainer>
    </Box>
    </MathJaxContext>
  );
};

export default QuestionsDisplay;