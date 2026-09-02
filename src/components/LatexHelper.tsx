import type { FC } from 'react';

interface LatexHelperProps {
  onInsert: (tex: string) => void;
}

const LATEX_PRESETS = [
  { label: '분수', tex: '\\frac{a}{b}', preview: 'a/b' },
  { label: '적분', tex: '\\int_{a}^{b} f(x) dx', preview: '∫' },
  { label: '편미분', tex: '\\frac{\\partial u}{\\partial t}', preview: '∂u/∂t' },
  { label: '극한', tex: '\\lim_{x \\to 0} f(x)', preview: 'lim' },
  { label: '합 (시그마)', tex: '\\sum_{i=1}^{n} x_i', preview: '∑' },
  { label: '나블라 (기울기)', tex: '\\nabla f(\\mathbf{x})', preview: '∇' },
  { label: '2x2 행렬', tex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', preview: '[Matrix]' },
  { label: '루트', tex: '\\sqrt{x^2 + y^2}', preview: '√' },
  { label: '알파/베타', tex: '\\alpha, \\beta, \\gamma', preview: 'α,β,γ' },
  { label: '오일러 등식', tex: 'e^{i\\pi} + 1 = 0', preview: 'e^{iπ}' },
  { label: '슈뢰딩거', tex: 'i\\hbar \\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi', preview: 'Schrödinger' },
];

export const LatexHelper: FC<LatexHelperProps> = ({ onInsert }) => {
  return (
    <div className="latex-helper-bar flex flex-wrap items-center gap-1.5 p-2 bg-stone-900/60 border border-stone-800 rounded-lg text-xs">
      <span className="text-amber-400 font-semibold px-1 flex items-center gap-1">
        <span>∑ 수식 템플릿:</span>
      </span>
      {LATEX_PRESETS.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onInsert(`$${item.tex}$`)}
          className="px-2 py-1 bg-stone-800 hover:bg-amber-900/50 hover:text-amber-200 text-stone-300 rounded border border-stone-700/60 transition-colors text-xs font-mono"
          title={`삽입: $${item.tex}$`}
        >
          {item.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onInsert('$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$')}
        className="px-2 py-1 bg-amber-950/40 text-amber-300 hover:bg-amber-900/80 rounded border border-amber-800/60 text-xs"
        title="블록 수식 삽입"
      >
        + 블록 수식($$)
      </button>
    </div>
  );
};
