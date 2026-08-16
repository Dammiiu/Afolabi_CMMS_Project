import React from 'react';
import EmptyState from './EmptyState';
import { LayoutList } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

function DataTable<T extends { id: number | string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="animate-pulse flex flex-col">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 border-b border-slate-200 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title="No Records" description={emptyMessage} icon={<LayoutList />} />;
  }

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500 border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, idx) => (
                <td key={idx} className="px-6 py-4">
                  {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
