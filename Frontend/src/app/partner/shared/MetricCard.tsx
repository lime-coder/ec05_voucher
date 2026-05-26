import type { ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { TrendingDown, TrendingUp } from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: ReactNode;
  iconColor: string;
  iconBackground?: string;
  trend?: 'up' | 'down' | 'neutral';
  valueVariant?: 'h4' | 'h5';
}

export default function MetricCard({
  title,
  value,
  change,
  icon,
  iconColor,
  iconBackground,
  trend = 'neutral',
  valueVariant = 'h4',
}: MetricCardProps) {
  const isPositive = trend === 'up' || change?.includes('+');
  const isNegative = trend === 'down';

  return (
    <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: iconBackground ?? `${iconColor}20`,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          {change && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isPositive ? '#e8f5e9' : '#fff3e0',
                color: isNegative ? '#f44336' : isPositive ? '#4caf50' : '#ff9800',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {isNegative ? <TrendingDown sx={{ fontSize: 16 }} /> : isPositive ? <TrendingUp sx={{ fontSize: 16 }} /> : null}
              {change}
            </Box>
          )}
        </Box>
        <Typography variant={valueVariant} sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}
