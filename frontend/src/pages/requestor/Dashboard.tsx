import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getRequests } from '../../api/requests';
import { MaintenanceRequest } from '../../types';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { AlertCircle, CheckCircle, FileText, Plus } from 'lucide-react';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRequests({ limit: 5 }).then(res => setRequests(res.items)).finally(() => setLoading(false));
  }, []);

  const openCount = requests.filter(r => !['completed', 'closed', 'rejected'].includes(r.status)).length;
  const completedCount = requests.filter(r => ['completed', 'closed'].includes(r.status)).length;

  return (
    <div>
      <PageHeader 
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'User'}!`}
        description="Here is an overview of your maintenance requests."
        actions={<button onClick={() => navigate('/requestor/new-request')} className="btn-primary flex items-center"><Plus className="h-4 w-4 mr-2" /> Report New Fault</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Open Requests" value={openCount} icon={AlertCircle} color="bg-blue-500" />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Total Submitted" value={requests.length} icon={FileText} color="bg-slate-500" />
      </div>
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Recent Requests</h3>
          <button onClick={() => navigate('/requestor/requests')} className="text-sm font-medium text-primary-600">View All</button>
        </div>
        {loading ? <div className="p-6"><LoadingSkeleton variant="table" /></div> : requests.length === 0 ? <EmptyState title="No requests" description="No requests" icon={<FileText />} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-3">ID</th><th className="px-6 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map(req => (<tr key={req.id} className="hover:bg-slate-50"><td className="px-6 py-4">REQ-{req.id}</td><td className="px-6 py-4"><StatusBadge status={req.status} /></td></tr>))}</tbody></table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
