import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkOrders } from '../../api/workOrders';
import { WorkOrder } from '../../types';
import PageHeader from '../../components/PageHeader';
import PriorityBadge from '../../components/PriorityBadge';
import { Clock } from 'lucide-react';

const MyTasks = () => {
  const [tasks, setTasks] = useState<WorkOrder[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getWorkOrders().then(res => setTasks(res.items)).catch(console.error);
  }, []);

  const cols = [
    { id: 'pending', title: 'Pending', bg: 'bg-amber-50', header: 'bg-amber-500', items: tasks.filter(t => t.status === 'assigned' || t.status === 'pending') },
    { id: 'in_progress', title: 'In Progress', bg: 'bg-blue-50', header: 'bg-blue-500', items: tasks.filter(t => t.status === 'in_progress') },
    { id: 'completed', title: 'Completed', bg: 'bg-emerald-50', header: 'bg-emerald-500', items: tasks.filter(t => t.status === 'completed' || t.status === 'closed') }
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="My Tasks" description="Manage your assigned maintenance tasks." />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-[500px]">
        {cols.map(col => (
          <div key={col.id} className={`${col.bg} rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden`}>
            <div className={`${col.header} text-white px-4 py-3 font-semibold flex justify-between`}>
              {col.title} <span className="bg-white/20 px-2 rounded-full text-xs flex items-center">{col.items.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {col.items.map(task => (
                <div key={task.id} onClick={() => navigate(`/technician/tasks/${task.id}`)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-700 text-sm">WO-{task.id}</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-sm font-medium text-slate-900 line-clamp-2 mb-2">{task.request?.description}</p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="h-3 w-3 mr-1" /> {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {col.items.length === 0 && <div className="text-center p-4 text-sm text-slate-400">No tasks</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasks;
