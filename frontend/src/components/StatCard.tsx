import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-').replace('-500', '-600')}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend.isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={trend.isPositive ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
            {trend.value}%
          </span>
          <span className="text-slate-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
