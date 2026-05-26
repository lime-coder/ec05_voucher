import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

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
    <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: iconBackground ?? `${iconColor}20`,
            color: iconColor,
          }}
        >
          {icon}
        </div>
        {change && (
          <div
            className="px-3 py-1 rounded flex items-center gap-1 text-sm font-semibold"
            style={{
              backgroundColor: isPositive ? '#e8f5e9' : '#fff3e0',
              color: isNegative ? '#f44336' : isPositive ? '#4caf50' : '#ff9800',
            }}
          >
            {isNegative ? <TrendingDown className="w-4 h-4" /> : isPositive ? <TrendingUp className="w-4 h-4" /> : null}
            {change}
          </div>
        )}
      </div>
      <p className={`font-bold mb-1 ${valueVariant === 'h4' ? 'text-2xl' : 'text-xl'}`}>
        {value}
      </p>
      <p className="text-sm text-gray-500">
        {title}
      </p>
    </div>
  );
}
