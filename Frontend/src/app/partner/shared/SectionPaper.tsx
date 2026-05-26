import type { ReactNode } from 'react';
import { Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface SectionPaperProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

export default function SectionPaper({ children, sx }: SectionPaperProps) {
  return (
    <Paper sx={{ p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', ...sx }}>
      {children}
    </Paper>
  );
}
