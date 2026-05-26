import type { ReactNode, CSSProperties } from 'react';

interface SectionPaperProps {
  children: ReactNode;
  sx?: CSSProperties;
}

export default function SectionPaper({ children, sx }: SectionPaperProps) {
  return (
    <div
      className="p-6 rounded-xl bg-white shadow-sm border border-gray-100"
      style={sx}
    >
      {children}
    </div>
  );
}
