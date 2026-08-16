import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityStyles: Record<Priority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700 animate-pulse',
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const style = priorityStyles[priority] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
