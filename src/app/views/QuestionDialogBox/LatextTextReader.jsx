import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export const renderTextWithLatex = (text) => {
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