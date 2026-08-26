import React, { useEffect, useState } from 'react';
import { getRequests, triageRequest } from '../../api/requests';
import { assignWorkOrder } from '../../api/workOrders';
import { getUsers } from '../../api/users';
import { MaintenanceRequest, Priority, User } from '../../types';
import PageHeader from '../../components/PageHeader';
import { AlertTriangle, Check, X, ShieldAlert, MapPin, Clock, Tag, UserCheck } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import PriorityBadge from '../../components/PriorityBadge';

const TriageQueue = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<MaintenanceRequest | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [reason, setReason] = useState('');
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchRequests = () => {
    setLoading(true);
    getRequests({ status: 'triaged' })
      .then((res) => setRequests(res.items))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    getUsers({ role: 'technician', limit: 100 })
      .then((res) => setTechnicians(res.items))
      .catch(console.error);
  }, []);

  const openApproveModal = (req: MaintenanceRequest) => {
    setSelectedReq(req);
    setPriority(req.priority || 'medium');
    setReason('');
    setSelectedTechId('');
    setModalType('approve');
  };

  const openRejectModal = (req: MaintenanceRequest) => {
    setSelectedReq(req);
    setReason('');
    setModalType('reject');
  };

  const closeModal = () => {
    setSelectedReq(null);
    setModalType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !modalType) return;

    setSubmitting(true);
    try {
      const status = modalType === 'approve' ? 'approved' : 'rejected';
      const response = await triageRequest(selectedReq.id, {
        status,
        priority,
        reason: reason.trim() || undefined,
      }) as any;

      if (status === 'approved' && selectedTechId && response.work_order_id) {
        await assignWorkOrder(response.work_order_id, parseInt(selectedTechId));
      }

      addToast(
        `Request ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
        'success'
      );
      setRequests((prev) => prev.filter((r) => r.id !== selectedReq.id));
      closeModal();
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if there are other open requests at the same location to warning supervisor about potential duplicates
  const isPotentialDuplicate = (req: MaintenanceRequest) => {
    return requests.some(
      (r) => r.id !== req.id && r.location_id === req.location_id && r.category === req.category
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Triage Queue" 
        description="Review, adjust priority, and approve or reject incoming university maintenance requests." 
      />

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse flex flex-col space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto mt-8">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Queue is Clear!</h3>
          <p className="text-slate-500 text-sm">
            All maintenance requests have been successfully triaged.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => {
            const hasDup = isPotentialDuplicate(req);
            return (
              <div 
                key={req.id} 
                className={`card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 transition-all hover:shadow-md ${
                  hasDup ? 'border-l-amber-500' : 'border-l-primary-500'
                }`}
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      REQ-{req.id.toString().padStart(4, '0')}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md capitalize flex items-center">
                      <Tag className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {req.category}
                    </span>
                    <PriorityBadge priority={req.priority} />
                  </div>

                  <p className="text-slate-900 font-medium text-base">{req.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                      {req.location?.name || `Location ${req.location_id}`}
                      {req.location?.block && ` - Block ${req.location.block}`}
                      {req.location?.room && ` Room ${req.location.room}`}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-slate-400" />
                      {new Date(req.submitted_at).toLocaleString()}
                    </span>
                  </div>

                  {hasDup && (
                    <div className="mt-2 flex items-center p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm gap-2">
                      <ShieldAlert className="h-4 w-4 flex-shrink-0 text-amber-600" />
                      <span>
                        <strong>Potential Duplicate:</strong> Another open request exists for the same category and location.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => openRejectModal(req)}
                    className="flex-1 md:flex-none btn-secondary hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center px-4 py-2"
                  >
                    <X className="h-4 w-4 mr-1.5" /> Reject
                  </button>
                  <button 
                    onClick={() => openApproveModal(req)}
                    className="flex-1 md:flex-none btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center px-4 py-2"
                  >
                    <Check className="h-4 w-4 mr-1.5" /> Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve/Triage Modal */}
      <Modal 
        isOpen={modalType === 'approve'} 
        onClose={closeModal} 
        title="Approve & Triage Request" 
        size="md"
      >
        {selectedReq && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-2">
              <p className="text-slate-500 font-medium">Original Description:</p>
              <p className="text-slate-800 italic">"{selectedReq.description}"</p>
            </div>

            <div>
              <label className="label">Determine Work Priority</label>
              <select
                className="input-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low (Cosmetic/Deferred Maintenance)</option>
                <option value="medium">Medium (Routine Operations/Repairs)</option>
                <option value="high">High (Disruptive fault/Lab equipments)</option>
                <option value="critical">Critical (Safety hazard/Immediate attention needed)</option>
              </select>
            </div>

            <div>
              <label className="label">Assign Technician (Optional)</label>
              <div className="relative">
                <select
                  className="input-field pl-10"
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                >
                  <option value="">-- Unassigned (Assign later) --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} {t.skill_tags && t.skill_tags.length ? `(${t.skill_tags.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                You can assign this immediately or leave it unassigned to be handled from the Work Orders page.
              </p>
            </div>

            <div>
              <label className="label">Internal Notes / Instructions (Optional)</label>
              <textarea
                rows={3}
                placeholder="E.g. Assign to electrical specialist Bello. Focus on wiring."
                className="input-field resize-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={closeModal} 
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 min-w-[120px]"
                disabled={submitting}
              >
                {submitting ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal 
        isOpen={modalType === 'reject'} 
        onClose={closeModal} 
        title="Reject Maintenance Request" 
        size="md"
      >
        {selectedReq && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-2">
              <p className="text-slate-800 italic">"{selectedReq.description}"</p>
            </div>

            <div>
              <label className="label">Reason for Rejection</label>
              <textarea
                required
                rows={4}
                placeholder="Specify the reason so the requestor is notified (e.g. duplicate request, insufficient details, outside university building scope)..."
                className="input-field resize-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={closeModal} 
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-danger min-w-[120px]"
                disabled={submitting}
              >
                {submitting ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default TriageQueue;
