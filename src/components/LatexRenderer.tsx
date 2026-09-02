import { useMemo } from 'react';
import type { FC } from 'react';

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: any) => string;
    };
  }
}

interface LatexRendererProps {
  content: string;
  className?: string;
}

export const LatexRenderer: FC<LatexRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // KaTeX 사용 가능 여부 확인
    const katex = window.katex;

    const renderTex = (tex: string, displayMode: boolean): string => {
      if (!katex) {
        return displayMode ? `<div class="latex-fallback-block">${tex}</div>` : `<span class="latex-fallback-inline">${tex}</span>`;
      }
      try {
        return katex.renderToString(tex, {
          displayMode,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
      } catch (err) {
        console.error('KaTeX render error:', err);
        return `<span class="latex-error">[수식 에러: ${tex}]</span>`;
      }
    };

    // 1. 블록 수식 치환: $$ ... $$
    let parsed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      return `<div class="latex-block-wrapper my-3">${renderTex(tex.trim(), true)}</div>`;
    });

    // 2. 인라인 수식 치환: $ ... $ (단, $$ 또는 빈 문자열 제외)
    parsed = parsed.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (_, prefix, tex) => {
      return `${prefix}${renderTex(tex.trim(), false)}`;
    });

    // 3. 줄바꿈 처리 및 굵은 글씨 등 기본 서식 지원
    // 코드 블록 (``` ... ```)
    parsed = parsed.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="code-block"><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    // 인라인 코드 (`...`)
    parsed = parsed.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

    // 볼드 (**...**)
    parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 일반 개행을 <br />로 (블록 수식이나 코드 블록 외부에서)
    const lines = parsed.split('\n');
    return lines.join('<br />');
  }, [content]);

  return (
    <div
      className={`latex-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
