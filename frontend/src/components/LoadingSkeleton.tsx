import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'stat';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card' }) => {
  if (variant === 'stat') {
    return (
      <div className="card p-6 h-32 flex flex-col justify-between animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="w-full animate-pulse bg-white rounded-lg border border-slate-200">
        <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-white border-b border-slate-100"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="card p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
