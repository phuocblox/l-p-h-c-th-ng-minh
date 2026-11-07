import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50/80 hover:bg-blue-50',
      iconBg: 'bg-blue-600 text-white',
      border: 'border-blue-100',
    },
    purple: {
      bg: 'bg-purple-50/80 hover:bg-purple-50',
      iconBg: 'bg-purple-600 text-white',
      border: 'border-purple-100',
    },
    emerald: {
      bg: 'bg-emerald-50/80 hover:bg-emerald-50',
      iconBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50/80 hover:bg-amber-50',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50/80 hover:bg-rose-50',
      iconBg: 'bg-rose-500 text-white',
      border: 'border-rose-100',
    },
    slate: {
      bg: 'bg-slate-50 hover:bg-slate-100/80',
      iconBg: 'bg-slate-700 text-white',
      border: 'border-slate-200',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${colorStyles.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
