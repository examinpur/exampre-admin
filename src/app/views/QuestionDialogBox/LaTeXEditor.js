// LaTeXEditor.js - Reusable LaTeX Editor Component
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  ButtonGroup,
  TextField
} from '@mui/material';
import {
  Functions as FunctionsIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import styled from '@emotion/styled';

// Import MathQuill
import { addStyles, EditableMathField } from 'react-mathquill';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Add MathQuill styles
addStyles();

const LaTeXEditorContainer = styled(Paper)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: '#fafafa',
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

// Common mathematical symbols and their LaTeX commands
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
  { symbol: '∈', latex: '\\in', tooltip: 'Element of' },
  { symbol: '∉', latex: '\\notin', tooltip: 'Not element of' },
  { symbol: '⊂', latex: '\\subset', tooltip: 'Subset' },
  { symbol: '⊃', latex: '\\supset', tooltip: 'Superset' },
  { symbol: '∩', latex: '\\cap', tooltip: 'Intersection' },
  { symbol: '∪', latex: '\\cup', tooltip: 'Union' },
  { symbol: '∅', latex: '\\emptyset', tooltip: 'Empty set' },
  { symbol: 'α', latex: '\\alpha', tooltip: 'Alpha' },
  { symbol: 'β', latex: '\\beta', tooltip: 'Beta' },
  { symbol: 'γ', latex: '\\gamma', tooltip: 'Gamma' },
  { symbol: 'δ', latex: '\\delta', tooltip: 'Delta' },
  { symbol: 'ε', latex: '\\epsilon', tooltip: 'Epsilon' },
  { symbol: 'θ', latex: '\\theta', tooltip: 'Theta' },
  { symbol: 'λ', latex: '\\lambda', tooltip: 'Lambda' },
  { symbol: 'μ', latex: '\\mu', tooltip: 'Mu' },
  { symbol: 'π', latex: '\\pi', tooltip: 'Pi' },
  { symbol: 'σ', latex: '\\sigma', tooltip: 'Sigma' },
  { symbol: 'φ', latex: '\\phi', tooltip: 'Phi' },
  { symbol: 'ω', latex: '\\omega', tooltip: 'Omega' },
  { symbol: 'sin', latex: '\\sin', tooltip: 'Sine' },
  { symbol: 'cos', latex: '\\cos', tooltip: 'Cosine' },
  { symbol: 'tan', latex: '\\tan', tooltip: 'Tangent' },
  { symbol: 'log', latex: '\\log', tooltip: 'Logarithm' },
  { symbol: 'ln', latex: '\\ln', tooltip: 'Natural log' },
  { symbol: '( )', latex: '\\left(\\right)', tooltip: 'Parentheses' },
  { symbol: '[ ]', latex: '\\left[\\right]', tooltip: 'Brackets' },
  { symbol: '{ }', latex: '\\left\\{\\right\\}', tooltip: 'Braces' },
  { symbol: 'f(x)', latex: 'f\\left(x\\right)', tooltip: 'Function' },
  { symbol: 'lim', latex: '\\lim_{x \\to a}', tooltip: 'Limit' },
  { symbol: '∠', latex: '\\angle', tooltip: 'Angle' },
  { symbol: '°', latex: '^\\circ', tooltip: 'Degree' },
  { symbol: '‖', latex: '\\parallel', tooltip: 'Parallel' },
  { symbol: '⊥', latex: '\\perp', tooltip: 'Perpendicular' },
  { symbol: '≅', latex: '\\cong', tooltip: 'Congruent' },
  { symbol: '≈', latex: '\\approx', tooltip: 'Approximately equal' },
  { symbol: '∴', latex: '\\therefore', tooltip: 'Therefore' },
  { symbol: '∵', latex: '\\because', tooltip: 'Because' },
  { symbol: '½', latex: '\\frac{1}{2}', tooltip: 'Fraction 1/2' },
  { symbol: '¼', latex: '\\frac{1}{4}', tooltip: 'Fraction 1/4' },
  { symbol: '¾', latex: '\\frac{3}{4}', tooltip: 'Fraction 3/4' }
];

// LaTeX Editor Component
const LaTeXEditor = ({ 
  value, 
  onChange, 
  onBlur, 
  placeholder = "Enter mathematical expression...",
  showTitle = true,
  title = "LaTeX Math Editor",
  compact = false
}) => {
  const [mathField, setMathField] = useState(null);
  const [showSymbols, setShowSymbols] = useState(false);

  const insertSymbol = (latex) => {
    if (mathField) {
      mathField.write(latex);
      mathField.focus();
      // Trigger onChange after inserting symbol
      const newLatex = mathField.latex();
      onChange(newLatex);
    }
  };

  const handleKeyDown = (e) => {
    // Handle some common shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertSymbol('\\mathbf{}');
          break;
        case 'i':
          e.preventDefault();
          insertSymbol('\\mathit{}');
          break;
        default:
          break;
      }
    }
  };

  return (
    <LaTeXEditorContainer elevation={compact ? 0 : 1}>
      {showTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
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
      )}

      {/* MathQuill Editor */}
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
          onKeyDown={handleKeyDown}
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
            maxDepth: 10,
            handlers: {
              enter: function() {
                // Allow multiline input
                return true;
              }
            }
          }}
          style={{
            width: '100%',
            minHeight: compact ? '60px' : '80px',
            fontSize: compact ? '16px' : '18px'
          }}
        />
        
        {/* Input size info */}
        <Typography variant="caption" sx={{ 
          display: 'block', 
          mt: 1, 
          color: '#666',
          fontSize: '0.75rem'
        }}>
          {compact ? 'Use Tab to navigate • Arrow keys to move cursor' : 'Large input area for complex expressions • Use Tab to navigate • Arrow keys to move cursor'}
        </Typography>
      </Box>

      {/* Symbol Palette */}
      {showSymbols && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            Click symbols to insert:
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.5,
            maxHeight: compact ? '150px' : '200px',
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

      {/* Quick Help */}
      {!compact && (
        <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
            Quick Tips:
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem', color: '#666' }}>
            • Use ^ for superscript (x^2) • Use _ for subscript (x_2) • Use \sqrt{} for square root<br/>
            • Use \frac numerator denominator for fractions • Use \int for integrals • Use \sum for summations<br/>
            • Press Tab to move between fields • Use arrow keys to navigate • Ctrl+B for bold, Ctrl+I for italic
          </Typography>
        </Box>
      )}
    </LaTeXEditorContainer>
  );
};

// Enhanced Text Field with LaTeX Support
const LaTeXTextField = ({ 
  value, 
  onChange, 
  onLatexChange,
  renderTextWithLatex,
  label,
  placeholder,
  rows = 4,
  showPreview = false,
  onTogglePreview,
  showLatexEditor = false,
  onToggleLatexEditor,
  latexValue = '',
  onInsertLatex,
  required = false,
  error = false,
  helperText = '',
  ...textFieldProps
}) => {
  return (
    <Box>
      {/* Control Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {label} {required && '*'}
        </Typography>
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Toggle LaTeX Editor">
            <Button
              onClick={onToggleLatexEditor}
              startIcon={<EditIcon />}
              color={showLatexEditor ? 'primary' : 'inherit'}
            >
              LaTeX
            </Button>
          </Tooltip>
          <Tooltip title="Toggle Preview">
            <Button
              onClick={onTogglePreview}
              startIcon={showPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
              color={showPreview ? 'primary' : 'inherit'}
            >
              Preview
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>

      {/* LaTeX Editor */}
      {showLatexEditor && (
        <Box sx={{ mb: 2 }}>
          <LaTeXEditor
            value={latexValue}
            onChange={onLatexChange}
            placeholder={`Enter mathematical expressions for ${label.toLowerCase()}...`}
            showTitle={false}
            compact={true}
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={onInsertLatex}
              disabled={!latexValue.trim()}
            >
              Insert into {label}
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => onLatexChange('')}
            >
              Clear
            </Button>
          </Box>
        </Box>
      )}

      {/* Preview or Text Field */}
      {showPreview ? (
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            p: 2,
            minHeight: `${rows * 20 + 40}px`,
            overflowY: 'auto',
            backgroundColor: '#f5f5f5',
            lineHeight: '1.6',
            fontSize: '1rem',
            color: '#333',
          }}
        >
          {renderTextWithLatex(value)}
        </Box>
      ) : (
        <TextField
          {...textFieldProps}
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          multiline
          rows={rows}
          variant="outlined"
          fullWidth
          required={required}
          error={error}
          helperText={helperText || 'Use $...$ for inline math, $$...$$ for display math, or use the LaTeX editor above'}
        />
      )}
    </Box>
  );
};

// Preview Component for LaTeX rendered text
const LaTeXPreview = ({ text, renderTextWithLatex, title = "Preview" }) => {
  if (!text) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {title}:
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
        {renderTextWithLatex(text)}
      </Box>
    </Box>
  );
};


export { LaTeXEditor, LaTeXTextField, LaTeXPreview };
export default LaTeXEditor;