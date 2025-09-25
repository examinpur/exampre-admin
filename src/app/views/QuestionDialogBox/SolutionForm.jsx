import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import axios from 'axios';
import { BASE_URL } from 'app/config/config'; // Assuming this path is correct
import Swal from 'sweetalert2';

// Helper function to render text with LaTeX support
const renderTextWithLatex = (text) => {
  if (!text) return null; // Return null if text is null or undefined

  const textStr = String(text); // Ensure text is a string

  // Regex to find all $$...$$ blocks and $...$ inline math
  // This regex captures both block and inline math, prioritizing block math
  const latexRegex = /(\$\$[\s\S]*?\$\$)|(\$((?:\\.|[^$])*?)\$)/g;

  let lastIndex = 0;
  const parts = [];

  textStr.replace(latexRegex, (match, blockMathContent, inlineMathContent, offset) => {
    // Add the text before the current LaTeX match
    if (offset > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{textStr.substring(lastIndex, offset)}</span>);
    }

    // Add the LaTeX content
    try {
      if (blockMathContent) {
        // It's a $$...$$ block
        parts.push(<BlockMath key={`block-${offset}`} math={blockMathContent.slice(2, -2).trim()} />);
      } else if (inlineMathContent) {
        // It's a $...$ inline math
        parts.push(<InlineMath key={`inline-${offset}`} math={inlineMathContent.trim()} />);
      }
    } catch (error) {
      console.warn('LaTeX rendering error:', error, 'Content:', match);
      parts.push(
        <span
          key={`error-${offset}`}
          className="latex-error"
          title={`LaTeX Error: ${error.message}`}
        >
          {match}
        </span>
      );
    }

    lastIndex = offset + match.length;
    return match; // Return the match to satisfy replace callback
  });

  // Add any remaining text after the last LaTeX match
  if (lastIndex < textStr.length) {
    parts.push(<span key={`text-${lastIndex}`}>{textStr.substring(lastIndex)}</span>);
  }

  return parts;
};

const SolutionForm = () => {
  const [solutionText, setSolutionText] = useState('');
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const { questionId } = useParams();
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState(null);
  const textareaRef = useRef(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getStepsFromText = () => {
    return solutionText
      .split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0);
  };

  const handleTextChange = (e) => {
    setSolutionText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const textBefore = solutionText.substring(0, cursorPos);
      const textAfter = solutionText.substring(cursorPos);

      setSolutionText(textBefore + '\n' + textAfter);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPos + 1;
        textarea.focus();
      }, 0);
    }
  };

  const fetchQuestionDetails = async () => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/questions/${questionId}`);
      if (response.status === 200) {
        setSelectedQuestionDetails(response.data.data.question);
        // Check if solution exists and set initial text and isEditing state
        if (response.data.data.solution && response.data.data.solution.steps) {
          setSolutionText(response.data.data.solution.steps.join('\n'));
          setIsEditing(true);
        } else {
          setSolutionText(''); // No existing solution
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load question details.',
        confirmButtonColor: '#d33'
      });
      setSelectedQuestionDetails(null);
      setSolutionText('');
      setIsEditing(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionDetails();
  }, [questionId]); // Depend on questionId to refetch if it changes

  const handleSave = async () => {
    const steps = getStepsFromText();
    if (steps.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Steps',
            text: 'Please add at least one step to the solution.',
            confirmButtonColor: '#ffc107'
        });
        return;
    }

    const payload = {
      questionId: questionId,
      steps: steps,
      createdBy: "admin" // Assuming 'admin' as default for now
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/solutions/create-or-update`, payload);
      if (res.status === 200 || res.status === 201) {
        Swal.fire({
          icon: 'success',
          title: isEditing ? 'Updated!' : 'Created!',
          text: `Solution ${isEditing ? 'updated' : 'created'} successfully!`,
          confirmButtonColor: '#28a745'
        });
        navigate(-1); // Go back to previous page
      } else {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to save solution. Please try again.',
              confirmButtonColor: '#d33'
          });
      }
    } catch (error) {
      console.error('Error saving solution:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `An error occurred: ${error.response?.data?.message || error.message}`,
        confirmButtonColor: '#d33'
      });
    }
  };

  const handleClear = () => {
    setSolutionText('');
    setShowPreview(false);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const latexExamples = [
    { label: 'Pi', code: '$$\\pi$$' },
    { label: 'Fraction', code: '$$\\frac{a}{b}$$' },
    { label: 'Square Root', code: '$$\\sqrt{x}$$' },
    { label: 'Power', code: '$$x^2$$' },
    { label: 'Subscript', code: '$$x_1$$' },
    { label: 'Sum', code: '$$\\sum_{i=1}^{n}$$' },
    { label: 'Integral', code: '$$\\int_{a}^{b}$$' },
    { label: 'Alpha', code: '$$\\alpha$$' },
  ];

  const steps = getStepsFromText();

  return (
    <div className="solution-form">
      <style jsx>{`
        .solution-form {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .form-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 32px;
        }

        .header {
          margin-bottom: 24px;
        }

        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .question-text {
          color: #4a4a4a;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 16px;
          padding: 8px 0;
          border-left: 4px solid #1976d2;
          padding-left: 12px;
          background-color: #e3f2fd;
          border-radius: 4px;
        }

        .divider {
          height: 1px;
          background: #e0e0e0;
          border: none;
          margin: 16px 0;
        }

        .latex-hint {
          background: #fff3e0;
          border: 1px solid #ff9800;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .latex-hint-title {
          font-weight: 600;
          color: #e65100;
          margin-bottom: 8px;
        }

        .latex-hint-text {
          color: #bf360c;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .latex-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .latex-example {
          font-size: 12px;
          font-family: Monaco, Consolas, monospace;
          color: #bf360c;
          background: white;
          border: 1px solid #ff9800;
          border-radius: 4px;
          padding: 4px 8px;
        }

        .input-section {
          margin-bottom: 24px;
        }

        .input-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .preview-btn {
          background: white;
          border: 1px solid #1976d2;
          color: #1976d2;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .preview-btn:hover {
          background: #f5f5f5;
        }

        .solution-textarea {
          width: 100%;
          min-height: 200px;
          padding: 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-family: Monaco, Consolas, 'Courier New', monospace;
          font-size: 15px;
          line-height: 1.6;
          resize: vertical;
          background: white;
          transition: border-color 0.2s;
        }

        .solution-textarea:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
        }

        .preview-section {
          margin-bottom: 24px;
          border-top: 1px solid #e0e0e0;
          padding-top: 24px;
        }

        .preview-container {
          /* No background, border, padding to match image */
        }

        .step-item {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
          text-align: left;
        }

        .step-item:last-child {
          margin-bottom: 0;
        }

        .step-content {
          color: #333;
          line-height: 1.8;
          font-size: 1rem;
        }

        .no-steps {
          color: #666;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
        }

        .actions-right {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          min-width: 100px;
        }

        .btn-secondary {
          background: white;
          color: #666;
          border: 1px solid #ccc;
        }

        .btn-secondary:hover {
          background: #f5f5f5;
        }

        .btn-outline {
          background: white;
          color: #1976d2;
          border: 1px solid #1976d2;
        }

        .btn-outline:hover {
          background: #f5f5f5;
        }

        .btn-primary {
          background: #1976d2;
          color: white;
          border: 1px solid #1976d2;
        }

        .btn-primary:hover {
          background: #1565c0;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* KaTeX specific styles to ensure natural flow */
        .katex {
          font-family: 'KaTeX_Main', 'Times New Roman', serif;
          font-style: normal;
          color: inherit;
          background: none;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }

        .katex-display {
          display: block;
          margin: 0.8em 0;
          text-align: left; /* Default to left-align for block math */
        }

        /* Ensures inline math behaves inline */
        .katex:not(.katex-display) {
          display: inline-block; /* Helps with vertical alignment */
          white-space: nowrap; /* Prevents line breaks within inline math */
          vertical-align: middle; /* Adjust vertical alignment if needed */
          line-height: 1.2; /* Tweak line height for better integration */
        }

        .latex-error {
          color: red;
          font-family: monospace;
          background: #ffebee;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.9em;
        }
      `}</style>

      <div className="form-container">
        <div className="header">
          <h1 className="title">
            {isEditing ? 'Edit Solution' : 'Add Solution'}
          </h1>
          {/* Display question text if available */}
          {detailsLoading ? (
            <p>Loading question...</p>
          ) : selectedQuestionDetails && selectedQuestionDetails.questionText ? (
            <>
              <hr className="divider" />
              <div className="question-text">
                {renderTextWithLatex(selectedQuestionDetails.questionText)}
              </div>
            </>
          ) : (
            <>
              <hr className="divider" />
              <p className="question-text" style={{ fontStyle: 'italic', color: '#888' }}>
                Question text not available or loading.
              </p>
            </>
          )}
          <hr className="divider" />
        </div>

        {/* LaTeX Hint */}
        <div className="latex-hint">
          <div className="latex-hint-title">
            💡 LaTeX Support & Auto-Steps
          </div>
          <div className="latex-hint-text">
            • Each new line becomes a new step automatically<br/>
            • Use `$formula$` for inline math or `$$formula$$` for display math<br/>
            • Press Enter to create a new step
          </div>
          <div className="latex-examples">
            {latexExamples.map((example, index) => (
              <span key={index} className="latex-example">
                {example.label}: {example.code}
              </span>
            ))}
          </div>
        </div>

        {/* Solution Input */}
        <div className="input-section">
          <div className="input-header">
            <h2 className="section-title">
              Solution Steps ({steps.length} steps)
            </h2>
            <button
              className="preview-btn"
              onClick={togglePreview}
            >
              {showPreview ? '👁️‍🗨️ Hide' : '👁️ Show'} Preview
            </button>
          </div>

          <textarea
            ref={textareaRef}
            className="solution-textarea"
            value={solutionText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your solution here. Each line will become a step,

            Supports LaTeX: $x^2$, $\frac{a}{b}$, $\pi$, etc."
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="preview-section">
            <h2 className="section-title" style={{marginBottom: '16px'}}>
              SOLUTION
            </h2>
            <div className="preview-container">
              {steps.length > 0 ? (
                steps.map((step, index) => (
                  <div key={index} className="step-item">
                    <div className="step-content">
                      {renderTextWithLatex(step)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-steps">
                  Start typing your solution above. Each line will become a step.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="actions">
          <button
            className="btn btn-secondary"
            onClick={handleClear}
          >
            🗑️ Clear All
          </button>

          <div className="actions-right">
            <button
              className="btn btn-outline"
              onClick={()=>navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={steps.length === 0}
            >
              💾 {isEditing ? 'Update' : 'Save'} Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionForm;