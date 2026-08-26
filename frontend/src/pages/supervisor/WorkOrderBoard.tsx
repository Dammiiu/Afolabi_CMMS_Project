import React, { useEffect, useState } from 'react';
import { getWorkOrders, assignWorkOrder, suggestTechnician } from '../../api/workOrders';
import { getUsers } from '../../api/users';
import { WorkOrder, User, TechnicianScore, Priority } from '../../types';
import PageHeader from '../../components/PageHeader';
import DataTable, { Column } from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { Wrench, UserCheck, Calendar, FileText, ClipboardList, Info } from 'lucide-react';

const WorkOrderBoard = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'assigned' | 'in_progress' | 'completed'>('all');
  
  // Modal / Drawer state
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<TechnicianScore[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [assignedTechId, setAssignedTechId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchOrders = () => {
    setLoading(true);
    getWorkOrders()
      .then((res) => setOrders(res.items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // Pre-fetch all technicians for the manual assignment dropdown list
    getUsers({ role: 'technician', limit: 100 })
      .then((res) => setTechnicians(res.items))
      .catch((err) => console.error(err));
  }, []);

  const handleRowClick = async (order: WorkOrder) => {
    setSelectedOrder(order);
    setAssignedTechId(order.assigned_technician_id?.toString() || '');
    setSuggestions([]);
    
    // Auto-fetch suggestions if request category is present
    if (order.request?.category) {
      setSuggestLoading(true);
      suggestTechnician(order.request.category)
        .then(setSuggestions)
        .catch(console.error)
        .finally(() => setSuggestLoading(false));
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !assignedTechId) return;

    setSubmitting(true);
    try {
      await assignWorkOrder(selectedOrder.id, parseInt(assignedTechId));
      addToast('Technician assigned successfully', 'success');
      fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Assignment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders
    .filter((o) => {
      const matchesSearch = 
        o.id.toString().includes(searchTerm) || 
        (o.request?.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      if (!matchesSearch) return false;
      if (activeTab === 'all') return true;
      if (activeTab === 'pending') return o.status === 'pending';
      if (activeTab === 'assigned') return o.status === 'assigned';
      if (activeTab === 'in_progress') return o.status === 'in_progress';
      if (activeTab === 'completed') return o.status === 'completed' || o.status === 'closed';
      return true;
    })
    .sort((a, b) => {
      // Sort by newest first
      return b.id - a.id;
    });

  const columns: Column<WorkOrder>[] = [
    { 
      header: 'ID', 
      accessor: (row) => (
        <span className="font-semibold text-primary-700">WO-{row.id}</span>
      ) 
    },
    { 
      header: 'Fault Description', 
      accessor: (row) => (
        <span className="line-clamp-1 max-w-md font-medium text-slate-900">
          {row.request?.description || `Request #${row.request_id}`}
        </span>
      ) 
    },
    { 
      header: 'Assigned Technician', 
      accessor: (row) => (
        <span className="text-slate-600 font-medium">
          {row.technician?.full_name || (
            <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-semibold flex items-center w-fit">
              Unassigned
            </span>
          )}
        </span>
      ) 
    },
    { 
      header: 'Priority', 
      accessor: (row) => <PriorityBadge priority={row.priority as Priority} /> 
    },
    { 
      header: 'Status', 
      accessor: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'Date Created', 
      accessor: (row) => new Date(row.created_at).toLocaleDateString() 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Work Orders" 
        description="Monitor, schedule, and assign maintenance work orders to facilities technicians." 
      />

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border border-slate-200 bg-slate-50 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
          {(['all', 'pending', 'assigned', 'in_progress', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-md capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-primary-700 shadow border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search by ID or description..."
            className="input-field w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-6">
        <DataTable 
          columns={columns} 
          data={filteredOrders} 
          loading={loading}
          onRowClick={handleRowClick}
          emptyMessage={`No ${activeTab !== 'all' ? activeTab : ''} work orders found.`}
        />
      </div>

      {/* Detail & Assignment Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Work Order Management"
        size="lg"
      >
        {selectedOrder && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side: details */}
            <div className="space-y-4 pr-0 lg:pr-6 lg:border-r lg:border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Order ID</h4>
                  <p className="text-xl font-bold text-slate-800">WO-{selectedOrder.id}</p>
                </div>
                <StatusBadge status={selectedOrder.status} />
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</h4>
                <p className="text-sm font-bold text-slate-700 capitalize flex items-center mt-0.5">
                  <Wrench className="h-4 w-4 mr-1 text-slate-400" />
                  {selectedOrder.request?.category || 'General'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fault Description</h4>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mt-1 text-sm text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {selectedOrder.request?.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</h4>
                  <div className="mt-1">
                    <PriorityBadge priority={selectedOrder.priority as Priority} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Date</h4>
                  <p className="text-sm font-semibold text-slate-700 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                    {selectedOrder.scheduled_date ? new Date(selectedOrder.scheduled_date).toLocaleDateString() : 'Not Scheduled'}
                  </p>
                </div>
              </div>

              {selectedOrder.request?.photo_attachment && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Photo Attachment</h4>
                  <a 
                    href={selectedOrder.request.photo_attachment} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block overflow-hidden rounded-lg border border-slate-200 hover:border-primary-500 transition-colors"
                  >
                    <img 
                      src={selectedOrder.request.photo_attachment} 
                      alt="Fault attachment" 
                      className="max-h-36 w-full object-cover" 
                    />
                  </a>
                </div>
              )}
            </div>

            {/* Right side: assignment */}
            <div className="space-y-4 flex flex-col justify-between h-full">
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-2 flex items-center">
                  <UserCheck className="h-5 w-5 mr-1.5 text-primary-700" />
                  Staff Assignment
                </h3>

                {/* Intelligent suggestions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Automated Recommendations
                  </h4>
                  {suggestLoading ? (
                    <div className="space-y-2 animate-pulse">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-10 bg-slate-100 rounded-lg"></div>
                      ))}
                    </div>
                  ) : suggestions.length === 0 ? (
                    <p className="text-xs text-slate-400">No recommended technicians available.</p>
                  ) : (
                    <div className="space-y-2">
                      {suggestions.slice(0, 3).map((score) => (
                        <div 
                          key={score.technician_id}
                          onClick={() => setAssignedTechId(score.technician_id.toString())}
                          className={`p-3 rounded-lg border text-sm flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50 ${
                            assignedTechId === score.technician_id.toString()
                              ? 'border-primary-500 bg-primary-50/50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div>
                            <p className="font-semibold text-slate-700">{score.technician_name}</p>
                            <p className="text-xs text-slate-400">
                              Skill matches category | Workload Score: {score.workload_score}/10
                            </p>
                          </div>
                          <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-md">
                            {score.total_score.toFixed(0)} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Selection Form */}
              <form onSubmit={handleAssign} className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="label">Select Technician</label>
                  <select
                    required
                    className="input-field"
                    value={assignedTechId}
                    onChange={(e) => setAssignedTechId(e.target.value)}
                  >
                    <option value="">Choose technician...</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.full_name} ({tech.skill_tags?.join(', ') || 'Generalist'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setSelectedOrder(null)} 
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 bg-primary-700 hover:bg-primary-800"
                    disabled={submitting || !assignedTechId}
                  >
                    {submitting ? 'Assigning...' : 'Assign Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkOrderBoard;
