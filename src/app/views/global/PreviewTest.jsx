import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import { saveAs } from 'file-saver';
import axios from 'axios';

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    ImageRun,
    WidthType,
    BorderStyle,
    TableLayoutType,
    TableBorders,
    PageOrientation,
    AlignmentType, // ✅ Add this
} from "docx";
import { useParams } from 'react-router-dom';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import katex from 'katex';
import { toPng } from 'html-to-image';

// const Question = ({ question, questionNumber, isMeasuring = false }) => {
    
//     // Styling for question elements
//     const questionStyle = {
//         marginBottom: '10px',
//         padding: '5px 0',
//         borderBottom: isMeasuring ? 'none' : '1px dotted #ccc', // No border during measurement
//     };

//     const textStyle = {
//         color: 'black',
//         fontSize: '14px',
//         lineHeight: '1.5',
//     };

//     const imageStyle = {
//         maxWidth: '150px', // Small width for question image
//         height: 'auto',
//         display: 'block',
//         margin: '5px 0',
//     };

//     const optionStyle = {
//         color: 'black',
//         fontSize: '13px',
//         // Removed marginBottom and display: flex for single row
//         alignItems: 'flex-start',
//     };

//     const optionImageRowStyle = {
//         display: 'flex',
//         flexWrap: 'wrap',
//         gap: '10px',
//         marginBottom: '5px',
//     };

//     const optionImageStyle = {
//         maxWidth: '120px', // Small width for option image
//         height: 'auto',
//     };

//     const solutionStyle = {
//         color: 'black',
//         fontSize: '13px',
//         marginTop: '10px',
//         paddingTop: '5px',
//         borderTop: isMeasuring ? 'none' : '1px dashed #eee', // No border during measurement
//     };

//     const blankLineStyle = {
//         display: 'inline-block',
//         width: '50px', // Fixed width for blank line
//         borderBottom: '1px solid black',
//         margin: '0 5px',
//         verticalAlign: 'middle',
//     };

//     // Function to render text, handling LaTeX
//     const renderTextWithLatex = (text) => {
//         if (!text) return null;
//         const parts = text.split(/(\$\$[^$]*\$\$|\$[^$]*\$)/g);
//         return parts.map((part, index) => {
//             if (part.startsWith('$$') && part.endsWith('$$')) {
//                 return <BlockMath key={index}>{part.slice(2, -2)}</BlockMath>;
//             } else if (part.startsWith('$') && part.endsWith('$')) {
//                 return <InlineMath key={index}>{part.slice(1, -1)}</InlineMath>;
//             } else {
//                 return <span key={index}>{part}</span>;
//             }
//         });
//     };

//     // Replace [BLANK] with a line for fill-in-the-blank questions
//     const getQuestionTextForFillInTheBlank = (text) => {
//         return text.split('[BLANK]').map((part, index, array) => (
//             <React.Fragment key={index}>
//                 {renderTextWithLatex(part)}
//                 {index < array.length - 1 && <span style={blankLineStyle}></span>}
//             </React.Fragment>
//         ));
//     };

//     // Calculate the gap for fill-in-the-blank solution
//     const getFillInTheBlankSolutionGap = () => {
//         // This is a rough estimation based on MCQ option height for visual consistency.
//         // A more precise calculation would involve measuring an actual MCQ option.
//         const mcqOptionApproxHeight = 25; // px per option
//         const numMcqOptions = 4; // Typical number of MCQ options
//         return `${mcqOptionApproxHeight * numMcqOptions}px`;
//     };

//     return (
//         <div style={questionStyle}>
//             <p style={textStyle}>
//                 <strong>{questionNumber}.</strong>{' '}
//                 {question.type === 'fillintheblank'
//                     ? getQuestionTextForFillInTheBlank(question.questionText)
//                     : renderTextWithLatex(question.questionText)}
//             </p>

//             {question.questionUrl && (
//                 <img src={question.questionUrl} alt="Question" style={imageStyle} onError={(e) => e.target.style.display = 'none'} />
//             )}

//             {/* Marks, Year, Titles on the right */}
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'black', marginBottom: '5px' }}>
//                 <p style={{ margin: 0 }}>
//                     Marks: +{question.marks}{' '}
//                     {question.negativeMarking && (
//                         <span>(-{question.negativeMarksValue})</span>
//                     )}
//                 </p>
//                 {(question.year || (question.titles && question.titles.length > 0)) && (
//                     <p style={{ margin: 0, textAlign: 'right' }}>
//                         {question.year && ` ${question.year}`}
//                         {question.year && question.titles && question.titles.length > 0 && ' | '}
//                         {question.titles && question.titles.length > 0 && ` ${question.titles.join(', ')}`}
//                     </p>
//                 )}
//             </div>

//             {question.type === 'mcq' && (
//                 // Display MCQ options in one row
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '5px' }}>
//                     {question.options.map((option, index) => (
//                         <div key={option._id} style={{ display: 'inline-flex', alignItems: 'center' }}>
//                             <span style={{ marginRight: '5px' }}>{String.fromCharCode(97 + index)}.</span>
//                             {option.optionUrl ? (
//                                 <img src={option.optionUrl} alt={`Option ${String.fromCharCode(97 + index)}`} style={optionImageStyle} onError={(e) => e.target.style.display = 'none'} />
//                             ) : (
//                                 renderTextWithLatex(option.text)
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {question.type === 'truefalse' && (
//                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '5px' }}>
//                     <div style={{ display: 'inline-flex', alignItems: 'center' }}>a. True</div>
//                     <div style={{ display: 'inline-flex', alignItems: 'center' }}>b. False</div>
//                 </div>
//             )}

//             {question.solution && (
//                 <div
//                     className="solution-block-print"
//                     style={solutionStyle}
//                 >
//                     <p style={textStyle}>
//                         <strong>Solution:</strong>
//                     </p>
//                     {question.type === 'fillintheblank' && (
//                         <div style={{ height: getFillInTheBlankSolutionGap() }}></div>
//                     )}
//                     {question.solution.split('\n').map((line, index) => (
//                         <p key={index} style={{ ...textStyle, margin: 0 }}>
//                             {renderTextWithLatex(line)}
//                         </p>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// Helper: flatten all questions
const flattenQuestions = (testData) => {
    if (!testData.sections || testData.sections.length === 0) return [];
    return testData.sections.reduce((acc, section) => acc.concat(section.questions), []);
};

// Helper to fetch image as base64 with logging
async function fetchImageAsBase64(url) {
    try {
        console.log('Fetching image:', url);
        const response = await fetch(url);
        if (!response.ok) {
            console.warn('Image fetch failed:', url, response.status);
            return null;
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (!reader.result) {
                    console.warn('FileReader result is null for:', url);
                    resolve(null);
                } else {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                }
            };
            reader.onerror = (e) => {
                console.warn('FileReader error for:', url, e);
                reject(e);
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Exception fetching image:', url, e);
        return null;
    }
}

// Helper to check if text contains LaTeX
function containsLatex(text) {
    return /\$\$.*?\$\$|\$.*?\$|\\[a-zA-Z]+(?:\{[^}]*\})*/.test(text);
}
// Helper to render LaTeX to PNG base64
// function containsLatex(text) {
//     return /\$\$?.+?\$\$?/.test(text);
// }

async function latexToPngBase64(latex) {
    try {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '-9999px';
        div.style.fontSize = '20px'; // ensure proper scale
        div.style.background = '#fff';
        div.style.padding = '5px';
        document.body.appendChild(div);

        katex.render(latex.replace(/\$/g, ''), div, { throwOnError: false });

        const dataUrl = await toPng(div);
        document.body.removeChild(div);

        return dataUrl.split(',')[1]; // base64 only
    } catch (e) {
        console.warn('Failed to render LaTeX to image:', latex, e);
        return null;
    }
}

async function textOrLatexToDocxRuns(text, opts = {}) {
    const runs = [];

    const parts = text.split(/(\$\$[^$]*\$\$|\$[^$]*\$)/g);

    for (const part of parts) {
        if (!part) continue;

        if (part.startsWith('$$') && part.endsWith('$$') || part.startsWith('$') && part.endsWith('$')) {
            const latex = part.slice(part.startsWith('$$') ? 2 : 1, part.endsWith('$$') ? -2 : -1);
            const base64 = await latexToPngBase64(latex);
            if (base64) {
                runs.push(new ImageRun({
                    data: Uint8Array.from(atob(base64), c => c.charCodeAt(0)),
                    transformation: {
                        width: opts.width || 120,
                        height: opts.height || 40,
                    },
                }));
                continue;
            }
        }

        runs.push(new TextRun({ text: part, ...opts }));
    }

    return runs;
}


// Helper to generate DOCX (with images)
const A4_WIDTH = 11906; // 21 cm in twips
const A4_HEIGHT = 16838; // 29.7 cm in twips


// Main TestPage component renamed to PreviewTest

const TestPage = ({ testData, isDoubleColumn, setIsDoubleColumn }) => {
    
    const [pages, setPages] = useState([]);
    const contentRef = useRef(null);
    const questionRefs = useRef({});
    const sectionHeaderRef = useRef(null);

    // A4 dimensions in pixels (approximate for 96 DPI)
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;
    const PAGE_PADDING = 30;
    const USABLE_PAGE_HEIGHT = A4_HEIGHT_PX - (PAGE_PADDING * 2);
    const USABLE_COLUMN_WIDTH = (A4_WIDTH_PX / 2) - (PAGE_PADDING * 2);

    // Flatten questions
    const questions = flattenQuestions(testData);

    // Test header block (full width)
    const testHeaderBlock = (
            <>
                <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '20px' }}>EXAMPRE</h1>
                <div style={{ marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '5px' }}>Test Details:</h2>
                    <p style={{ margin: '2px 0' }}>Name: {testData.name}</p>
                    <p style={{ margin: '2px 0' }}>Date: {testData.date}</p>
                    <p style={{ margin: '2px 0' }}>Duration: {testData.duration}</p>
                    <p style={{ margin: '2px 0' }}>Total Sections: {testData.numberOfSections}</p>
                </div>
            </>
    );

    // Section header block (column width)
    const sectionHeaderBlock = {
            type: 'section-header',
        id: 'section-header',
        ref: sectionHeaderRef,
            content: (
            <div style={{ marginBottom: '15px', borderBottom: '1px dashed #ccc', paddingBottom: '5px', width: '100%' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Section 1: {testData.sections[0]?.name}</h3>
                {testData.sections[0]?.instructions && <p style={{ fontSize: '13px', fontStyle: 'italic' }}>Instructions: {testData.sections[0].instructions}</p>}
                <p style={{ fontSize: '13px' }}>Total Questions: {testData.sections[0]?.totalQuestions} | Total Marks: {testData.sections[0]?.totalMarks}</p>
                </div>
            ),
    };

    // Paginate questions
    const paginateQuestions = useCallback(() => {
        // Measure section header height
        const sectionHeaderHeight = sectionHeaderRef.current?.offsetHeight || 0;
        // Measure each question height
        const measuredQuestions = questions.map((q, idx) => ({
            ...q,
            height: questionRefs.current[`question-${q._id}`]?.current?.offsetHeight || 0,
            ref: questionRefs.current[`question-${q._id}`],
            questionNumber: idx + 1,
        }));

    const newPages = [];
        let qIndex = 0;
        // First page: section header + questions
        if (isDoubleColumn) {
            // Double column: section header full width, then columns
            let leftCol = [], rightCol = [];
            let leftHeight = 0, rightHeight = 0;
            let pageHeightLeft = USABLE_PAGE_HEIGHT - sectionHeaderHeight;
            let pageHeightRight = USABLE_PAGE_HEIGHT - sectionHeaderHeight;
            // Fill left column first
            while (qIndex < measuredQuestions.length) {
                const q = measuredQuestions[qIndex];
                if (leftHeight + q.height <= pageHeightLeft) {
                    leftCol.push(q);
                    leftHeight += q.height;
                    qIndex++;
                } else {
                    break;
                }
            }
            // Then right column
            while (qIndex < measuredQuestions.length) {
                const q = measuredQuestions[qIndex];
                if (rightHeight + q.height <= pageHeightRight) {
                    rightCol.push(q);
                    rightHeight += q.height;
                    qIndex++;
                } else {
                    break;
                }
            }
                    newPages.push({
                sectionHeader: sectionHeaderBlock,
                leftColumn: leftCol,
                rightColumn: rightCol,
            });
            // Subsequent pages: just columns
            while (qIndex < measuredQuestions.length) {
                let leftCol = [], rightCol = [];
                let leftHeight = 0, rightHeight = 0;
                // Fill left
                while (qIndex < measuredQuestions.length) {
                    const q = measuredQuestions[qIndex];
                    if (leftHeight + q.height <= USABLE_PAGE_HEIGHT) {
                        leftCol.push(q);
                        leftHeight += q.height;
                        qIndex++;
                    } else {
                        break;
                    }
                }
                // Fill right
                while (qIndex < measuredQuestions.length) {
                    const q = measuredQuestions[qIndex];
                    if (rightHeight + q.height <= USABLE_PAGE_HEIGHT) {
                        rightCol.push(q);
                        rightHeight += q.height;
                        qIndex++;
        } else {
                        break;
                    }
                }
                newPages.push({
                    leftColumn: leftCol,
                    rightColumn: rightCol,
                });
            }
        } else {
            // Single column: section header full width, then questions
            let page = [];
            let pageHeight = USABLE_PAGE_HEIGHT - sectionHeaderHeight;
            let usedHeight = 0;
            // First page
            while (qIndex < measuredQuestions.length) {
                const q = measuredQuestions[qIndex];
                if (usedHeight + q.height <= pageHeight) {
                    page.push(q);
                    usedHeight += q.height;
                    qIndex++;
                } else {
                    break;
                }
            }
            newPages.push({
                sectionHeader: sectionHeaderBlock,
                leftColumn: page,
            });
            // Subsequent pages
            while (qIndex < measuredQuestions.length) {
                let page = [];
                let usedHeight = 0;
                while (qIndex < measuredQuestions.length) {
                    const q = measuredQuestions[qIndex];
                    if (usedHeight + q.height <= USABLE_PAGE_HEIGHT) {
                        page.push(q);
                        usedHeight += q.height;
                        qIndex++;
                    } else {
                        break;
                    }
                }
                newPages.push({
                    leftColumn: page,
                });
            }
        }
    setPages(newPages);
    }, [questions, isDoubleColumn]);

    // Attach refs for measurement
    useEffect(() => {
        questions.forEach(q => {
            if (!questionRefs.current[`question-${q._id}`]) {
                questionRefs.current[`question-${q._id}`] = React.createRef();
            }
        });
    }, [questions]);

    // Measure and paginate after render
   useEffect(() => {
    const timer = setTimeout(() => {
            paginateQuestions();
        }, 300);
    return () => clearTimeout(timer);
    }, [paginateQuestions]);

    // Base style for the A4 page container
    const a4PageStyle = {
        width: `${A4_WIDTH_PX}px`,
        minHeight: `${A4_HEIGHT_PX}px`, // Use minHeight to allow content to push height if needed
        backgroundColor: 'white',
        color: 'black',
        boxShadow: '0 0 8px rgba(0,0,0,0.3)', // Slightly stronger shadow
        margin: '30px auto', // Increased margin for better separation
        padding: `${PAGE_PADDING}px`,
        boxSizing: 'border-box', // Include padding in width/height
        breakAfter: 'page',           // Modern CSS
        pageBreakAfter: 'always', // For print view
        display: 'block',
        flexDirection: undefined, // Remove flex from page container
        flexWrap: undefined,
        justifyContent: undefined,
        // border: '1px solid #ddd', // Keep border if desired
    };

    const columnStyle = {
        width: isDoubleColumn ? `${USABLE_COLUMN_WIDTH}px` : '100%',
        height: '100%', // Columns take full height of the page
        display: 'flex',
        flexDirection: 'column',
        // border: isMeasuring ? '1px dashed blue' : 'none', // For debugging layout
    };

    // Style for the hidden container used for height measurement
    const hiddenContainerStyle = {
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        visibility: 'hidden',
        height: 'auto',
        width: isDoubleColumn ? `${USABLE_COLUMN_WIDTH}px` : `${A4_WIDTH_PX - (PAGE_PADDING * 2)}px`, // Match column width for accurate measurement
        padding: '0',
        margin: '0',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f0f0f0', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => {
                        setPages([]); // Clear pages to force re-pagination
                        setIsDoubleColumn(false); // Update state
                    }}
                    style={{
                        padding: '10px 20px',
                        margin: '0 10px',
                        backgroundColor: !isDoubleColumn ? '#007bff' : '#f8f9fa',
                        color: !isDoubleColumn ? 'white' : 'black',
                        border: '1px solid #007bff',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Single Column
                </button>
                <button
                    onClick={() => {
                        setPages([]); // Clear pages to force re-pagination
                        setIsDoubleColumn(true); // Update state
                    }}
                    style={{
                        padding: '10px 20px',
                        margin: '0 10px',
                        backgroundColor: isDoubleColumn ? '#007bff' : '#f8f9fa',
                        color: isDoubleColumn ? 'white' : 'black',
                        border: '1px solid #007bff',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Double Column
                </button>
                <button
                    onClick={async () => {
                        const blob = await generateDocx({ testData, questions, isDoubleColumn, withSolutions: false });
                        saveAs(blob, 'test-without-solutions.docx');
                    }}
                    style={{
                        padding: '10px 20px',
                        margin: '0 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: '1px solid #007bff',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Download Without Solutions (DOCX)
                </button>
                <button
                    onClick={async () => {
                        const blob = await generateDocx({ testData, questions, isDoubleColumn, withSolutions: true });
                        saveAs(blob, 'test-with-solutions.docx');
                    }}
                    style={{
                        padding: '10px 20px',
                        margin: '0 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: '1px solid #007bff',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Download With Solutions (DOCX)
                </button>
                <button
                    onClick={async () => {
                        const blob = await generateDocx({ testData, questions, isDoubleColumn, withSolutions: false, answerKeyOnly: true });
                        saveAs(blob, 'test-answer-key.docx');
                    }}
                    style={{
                        padding: '10px 20px',
                        margin: '0 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: '1px solid #007bff',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Only Answer Key (DOCX)
                </button>
            </div>

            {/* Hidden container for measuring content heights */}
            <div ref={contentRef} style={hiddenContainerStyle}>
                <div ref={sectionHeaderRef}>{sectionHeaderBlock.content}</div>
                {questions.map((question, qIndex) => (
                            <div key={`q-measure-${question._id}`} ref={questionRefs.current[`question-${question._id}`]}>
                                <Question question={question} questionNumber={qIndex + 1} isMeasuring={true} />
                            </div>
                ))}
            </div>

            {/* Render actual pages */}
            {pages.length > 0 ? (
                pages.map((page, pageIndex) => (
                    <React.Fragment key={`page-fragment-${pageIndex}`}>
                        <div
                            key={`page-${pageIndex}`}
                            className="a4-page-break"
                            style={{
                                ...a4PageStyle,
                                display: 'block',
                                margin: '30px auto 40px auto',
                                border: '2px solid #007bff',
                                boxShadow: '0 0 8px rgba(0,0,0,0.15)',
                                background: 'white',
                                position: 'relative',
                            }}
                        >
                            {/* Full-width test header only on first page */}
                            {pageIndex === 0 && (
                                <div style={{ width: '100%' }}>{testHeaderBlock}</div>
                            )}
                            <div style={{ display: isDoubleColumn ? 'flex' : 'block', width: '100%' }}>
                                <div style={{ width: isDoubleColumn ? `${USABLE_COLUMN_WIDTH}px` : '100%', minHeight: '1px', display: 'flex', flexDirection: 'column' }}>
                                    {/* Section header only on first page, first column */}
                                    {pageIndex === 0 && page.sectionHeader && (
                                        <div style={{ width: '100%' }}>{page.sectionHeader.content}</div>
                                    )}
                                    {page.leftColumn.map((q, idx) => (
                                        <div key={`page-${pageIndex}-left-${q._id}`}>
                                            <Question question={q} questionNumber={q.questionNumber} />
                                        </div>
                            ))}
                        </div>
                        {isDoubleColumn && (
                                    <div style={{ width: `${USABLE_COLUMN_WIDTH}px`, minHeight: '1px', display: 'flex', flexDirection: 'column', marginLeft: '24px' }}>
                                        {/* No section header in right column */}
                                        {page.rightColumn.map((q, idx) => (
                                            <div key={`page-${pageIndex}-right-${q._id}`}>
                                                <Question question={q} questionNumber={q.questionNumber} />
                                            </div>
                                ))}
                            </div>
                        )}
                    </div>
                        </div>
                        {/* Page count below each page */}
                        <div style={{
                            textAlign: 'center',
                            margin: '8px 0 32px 0',
                            color: '#888',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                            userSelect: 'none',
                        }}>
                            Page {pageIndex + 1} of {pages.length}
                        </div>
                    </React.Fragment>
                ))
            ) : (
                <p style={{ textAlign: 'center' }}>Loading content...</p>
            )}
        </div>
    );
};

// Main App component renamed to PreviewTest
const PreviewTest = () => {
    const [isDoubleColumn, setIsDoubleColumn] = useState(false);
    const [testData, setTestData] = useState(null);
    const { id } = useParams();
    useEffect(() => {
        const fetchTest = async (id) => {
            try {
                const res = await axios.get(`${BASE_URL}/api/global-library/sections-with-questions/${id}`);
                if (res.status === 200) {
                    setTestData(res.data.data);
                }
            } catch (error) {
                Swal.fire('Error!', error.response?.data?.message || 'Failed to get test.', 'error');
            }
        };
        if (id) fetchTest(id);
    }, [id]);

    if (!testData || !testData.test) return <div>Loading...</div>;
    return (
        <TestPage testData={testData.test} isDoubleColumn={isDoubleColumn} setIsDoubleColumn={setIsDoubleColumn} />
    );
};

export default PreviewTest;

// Add a style tag for print page breaks
if (typeof window !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            .a4-page-break {
                break-after: page !important;
                page-break-after: always !important;
            }
        }
    `;
    document.head.appendChild(style);
}


const Question = ({ question, questionNumber, isMeasuring = false }) => {
    
    // Styling for question elements
    const questionStyle = {
        marginBottom: '10px',
        padding: '5px 0',
        borderBottom: isMeasuring ? 'none' : '1px dotted #ccc', // No border during measurement
    };

    const textStyle = {
        color: 'black',
        fontSize: '14px',
        lineHeight: '1.5',
    };

    const imageStyle = {
        maxWidth: '150px', // Small width for question image
        height: 'auto',
        display: 'block',
        margin: '5px 0',
    };

    const optionStyle = {
        color: 'black',
        fontSize: '13px',
        // Removed marginBottom and display: flex for single row
        alignItems: 'flex-start',
    };

    const optionImageRowStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '5px',
    };

    const optionImageStyle = {
        maxWidth: '120px', // Small width for option image
        height: 'auto',
    };

    const solutionStyle = {
        color: 'black',
        fontSize: '13px',
        marginTop: '10px',
        paddingTop: '5px',
        borderTop: isMeasuring ? 'none' : '1px dashed #eee', // No border during measurement
    };

    const blankLineStyle = {
        display: 'inline-block',
        width: '50px', // Fixed width for blank line
        borderBottom: '1px solid black',
        margin: '0 5px',
        verticalAlign: 'middle',
    };

    // Function to render text, handling LaTeX
    const renderTextWithLatex = (text) => {
        if (!text) return null;
        const parts = text.split(/(\$\$[^$]*\$\$|\$[^$]*\$)/g);
        return parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                return <BlockMath key={index}>{part.slice(2, -2)}</BlockMath>;
            } else if (part.startsWith('$') && part.endsWith('$')) {
                return <InlineMath key={index}>{part.slice(1, -1)}</InlineMath>;
            } else {
                return <span key={index}>{part}</span>;
            }
        });
    };

    // Replace [BLANK] with a line for fill-in-the-blank questions
    const getQuestionTextForFillInTheBlank = (text) => {
        return text.split('[BLANK]').map((part, index, array) => (
            <React.Fragment key={index}>
                {renderTextWithLatex(part)}
                {index < array.length - 1 && <span style={blankLineStyle}></span>}
            </React.Fragment>
        ));
    };

    // Calculate the gap for fill-in-the-blank solution
    const getFillInTheBlankSolutionGap = () => {
        // This is a rough estimation based on MCQ option height for visual consistency.
        // A more precise calculation would involve measuring an actual MCQ option.
        const mcqOptionApproxHeight = 25; // px per option
        const numMcqOptions = 4; // Typical number of MCQ options
        return `${mcqOptionApproxHeight * numMcqOptions}px`;
    };

    return (
        <div style={questionStyle}>
            <p style={textStyle}>
                <strong>{questionNumber}.</strong>{' '}
                {question.type === 'fillintheblank'
                    ? getQuestionTextForFillInTheBlank(question.questionText)
                    : renderTextWithLatex(question.questionText)}
            </p>

            {question.questionUrl && (
                <img src={question.questionUrl} alt="Question" style={imageStyle} onError={(e) => e.target.style.display = 'none'} />
            )}

            {/* Marks, Year, Titles on the right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'black', marginBottom: '5px' }}>
                <p style={{ margin: 0 }}>
                    Marks: +{question.marks}{' '}
                    {question.negativeMarking && (
                        <span>(-{question.negativeMarksValue})</span>
                    )}
                </p>
                {(question.year || (question.titles && question.titles.length > 0)) && (
                    <p style={{ margin: 0, textAlign: 'right' }}>
                        {question.year && ` ${question.year}`}
                        {question.year && question.titles && question.titles.length > 0 && ' | '}
                        {question.titles && question.titles.length > 0 && ` ${question.titles.join(', ')}`}
                    </p>
                )}
            </div>

            {question.type === 'mcq' && (
                // Display MCQ options in one row
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '5px' }}>
                    {question.options.map((option, index) => (
                        <div key={option._id} style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '5px' }}>{String.fromCharCode(97 + index)}.</span>
                            {option.optionUrl ? (
                                <img src={option.optionUrl} alt={`Option ${String.fromCharCode(97 + index)}`} style={optionImageStyle} onError={(e) => e.target.style.display = 'none'} />
                            ) : (
                                renderTextWithLatex(option.text)
                            )}
                        </div>
                    ))}
                </div>
            )}

            {question.type === 'truefalse' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '5px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>a. True</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>b. False</div>
                </div>
            )}

            {question.solution && (
                <div
                    className="solution-block-print"
                    style={solutionStyle}
                >
                    <p style={textStyle}>
                        <strong>Solution:</strong>
                    </p>
                    {question.type === 'fillintheblank' && (
                        <div style={{ height: getFillInTheBlankSolutionGap() }}></div>
                    )}
                    {question.solution.split('\n').map((line, index) => (
                        <p key={index} style={{ ...textStyle, margin: 0 }}>
                            {renderTextWithLatex(line)}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};







const generateDocx = async ({ testData, isDoubleColumn, withSolutions, answerKeyOnly = false }) => {
    // Use backend API to generate and download DOCX
    const testId = testData._id;
    try {
        const response = await axios.post(
            `${BASE_URL}/api/practice-test/downloaddocx`,
            {
                id: testId,
                withSolution: withSolutions,
                isDoubleColumn: isDoubleColumn,
                AnswerKeyOnly: answerKeyOnly  // Add this parameter
            },
            { responseType: 'blob' }
        );
        // Download the DOCX file
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        return blob;
    } catch (error) {
        console.error('Failed to download DOCX from API:', error);
        throw error;
    }
};