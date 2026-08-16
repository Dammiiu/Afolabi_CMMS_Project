import React from 'react';
import { RequestStatus, WorkOrderStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus | WorkOrderStatus;
}

const statusStyles: Record<string, string> = {
  submitted: 'bg-slate-100 text-slate-700',
  triaged: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700';
  const label = status.replace('_', ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
