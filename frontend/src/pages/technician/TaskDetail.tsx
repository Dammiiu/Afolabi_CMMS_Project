import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkOrder, startWorkOrder, completeWorkOrder } from '../../api/workOrders';
import { getInventory } from '../../api/inventory';
import { WorkOrder, InventoryItem, Priority } from '../../types';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../../components/Modal';
import { MapPin, Clock, Calendar, Wrench, Package, Plus, Trash2, ClipboardList, PenTool } from 'lucide-react';

interface PartUsedSelection {
  inventory_item_id: number;
  name: string;
  quantity: number;
}

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [task, setTask] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Completion modal state
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [hoursSpent, setHoursSpent] = useState('1');
  const [minutesSpent, setMinutesSpent] = useState('0');
  
  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [partsUsed, setPartsUsed] = useState<PartUsedSelection[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const fetchTaskDetails = () => {
    if (!id) return;
    setLoading(true);
    getWorkOrder(parseInt(id))
      .then((res) => setTask(res))
      .catch((err) => {
        console.error(err);
        addToast('Work order not found', 'error');
        navigate('/technician/tasks');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTaskDetails();
    // Fetch inventory items to log parts used
    getInventory()
      .then((res) => setInventory(res))
      .catch((err) => console.error('Failed to load inventory', err));
  }, [id]);

  const handleStart = async () => {
    if (!task) return;
    try {
      await startWorkOrder(task.id);
      addToast('Task successfully marked as In Progress', 'success');
      fetchTaskDetails(); // Refetch complete object
    } catch (e: any) {
      addToast(e.response?.data?.detail || 'Failed to start task', 'error');
    }
  };

  const handleAddPart = () => {
    if (!selectedItemId) return;
    const item = inventory.find((i) => i.id === parseInt(selectedItemId));
    if (!item) return;

    const qty = parseInt(itemQuantity);
    if (isNaN(qty) || qty <= 0) {
      return addToast('Specify a valid quantity', 'error');
    }

    if (qty > item.quantity_in_stock) {
      return addToast(`Insufficent stock. Only ${item.quantity_in_stock} ${item.unit} available.`, 'warning');
    }

    // Check if item is already added
    const existsIdx = partsUsed.findIndex((p) => p.inventory_item_id === item.id);
    if (existsIdx > -1) {
      const updated = [...partsUsed];
      updated[existsIdx].quantity += qty;
      setPartsUsed(updated);
    } else {
      setPartsUsed([...partsUsed, { inventory_item_id: item.id, name: item.name, quantity: qty }]);
    }
    
    setSelectedItemId('');
    setItemQuantity('1');
  };

  const handleRemovePart = (itemId: number) => {
    setPartsUsed(partsUsed.filter((p) => p.inventory_item_id !== itemId));
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const totalMinutes = parseInt(hoursSpent) * 60 + parseInt(minutesSpent);
    if (isNaN(totalMinutes) || totalMinutes <= 0) {
      return addToast('Please enter a valid duration', 'error');
    }

    setSubmitting(true);
    try {
      await completeWorkOrder(task.id, {
        completion_notes: completionNotes.trim() || undefined,
        time_spent_minutes: totalMinutes,
        parts_used: partsUsed.map((p) => ({
          item_id: p.inventory_item_id,
          name: p.name,
          quantity: p.quantity,
        })),
      });

      addToast('Task marked as Completed successfully', 'success');
      setCompleteOpen(false);
      fetchTaskDetails();
    } catch (e: any) {
      addToast(e.response?.data?.detail || 'Failed to complete task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="h-40 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title={`Work Order WO-${task.id}`} 
          description={`Fault Ticket REQ-${task.request_id}`} 
        />
        <div className="flex items-center gap-3">
          <PriorityBadge priority={task.priority as Priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request description card */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <ClipboardList className="h-5 w-5 mr-1.5 text-primary-700" />
              Fault Details
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
              {task.request?.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center p-3 rounded-lg border border-slate-100 bg-white">
                <MapPin className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Location</p>
                  <p className="font-semibold text-slate-800">
                    {task.request?.location?.name || `Location ${task.request_id}`}
                    {task.request?.location?.block && ` (Block ${task.request.location.block})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 rounded-lg border border-slate-100 bg-white">
                <Clock className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Date Dispatched</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {task.request?.photo_attachment && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-600">Attached Photo:</h4>
                <a 
                  href={task.request.photo_attachment} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl border border-slate-200 max-w-md hover:shadow-md transition-shadow"
                >
                  <img 
                    src={task.request.photo_attachment} 
                    alt="Fault attachment" 
                    className="max-h-64 object-cover w-full" 
                  />
                </a>
              </div>
            )}
          </div>

          {/* Action Log / Completion Notes (if completed) */}
          {task.maintenance_record && (
            <div className="card p-6 space-y-4 bg-emerald-50/20 border-emerald-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <PenTool className="h-5 w-5 mr-1.5 text-emerald-600" />
                Maintenance Record
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Completion Notes</p>
                  <p className="text-slate-800 font-medium mt-0.5">
                    {task.maintenance_record.completion_notes || 'No notes logged.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Time Logged</p>
                    <p className="text-slate-800 font-medium mt-0.5">
                      {task.maintenance_record.time_spent_minutes 
                        ? `${Math.floor(task.maintenance_record.time_spent_minutes / 60)}h ${task.maintenance_record.time_spent_minutes % 60}m`
                        : 'Not logged'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Completed At</p>
                    <p className="text-slate-800 font-medium mt-0.5">
                      {new Date(task.maintenance_record.completed_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {task.maintenance_record.parts_used && task.maintenance_record.parts_used.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-1.5">Materials / Parts Used</p>
                    <div className="flex flex-wrap gap-2">
                      {task.maintenance_record.parts_used.map((part: any, idx: number) => (
                        <span key={idx} className="bg-emerald-100/50 text-emerald-800 border border-emerald-200/50 text-xs font-semibold px-2.5 py-1 rounded-md">
                          {part.name} (x{part.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Execution Status</h3>
            
            {task.status === 'pending' || task.status === 'assigned' ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  This work order is currently waiting to be started. Review the details above and start when ready.
                </p>
                <button 
                  onClick={handleStart}
                  className="w-full btn-primary bg-amber-600 hover:bg-amber-700 flex justify-center py-2.5"
                >
                  Start Work
                </button>
              </div>
            ) : task.status === 'in_progress' ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  You are actively working on this task. Log materials and notes to complete it.
                </p>
                <button 
                  onClick={() => setCompleteOpen(true)}
                  className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 flex justify-center py-2.5"
                >
                  Mark Complete
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-500">
                  This task has been resolved and closed.
                </p>
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200">
                  Task Completed successfully
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <Modal
        isOpen={completeOpen}
        onClose={() => setCompleteOpen(false)}
        title="Log Work Completion"
        size="md"
      >
        <form onSubmit={handleComplete} className="space-y-5">
          <div>
            <label className="label">Completion Notes</label>
            <textarea
              required
              rows={3}
              placeholder="E.g. Repaired loose wires, replaced socket case, tested load successfully."
              className="input-field resize-none"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hours Spent</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Minutes Spent</label>
              <input
                type="number"
                min="0"
                max="59"
                className="input-field"
                value={minutesSpent}
                onChange={(e) => setMinutesSpent(e.target.value)}
              />
            </div>
          </div>

          {/* Parts Used Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center">
              <Package className="h-4 w-4 mr-1.5 text-slate-400" />
              Material Logged
            </h4>

            {partsUsed.length > 0 && (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden text-sm bg-slate-50">
                {partsUsed.map((part) => (
                  <div key={part.inventory_item_id} className="p-3 flex justify-between items-center">
                    <span>
                      {part.name} <strong className="text-slate-900 ml-1">x{part.quantity}</strong>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => handleRemovePart(part.inventory_item_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Select part controls */}
            <div className="flex gap-2">
              <div className="flex-1">
                <select
                  className="input-field"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                >
                  <option value="">Choose material item...</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity_in_stock} {item.unit} in stock)
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-20">
                <input
                  type="number"
                  min="1"
                  className="input-field text-center"
                  placeholder="Qty"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleAddPart}
                className="btn-secondary px-3 py-2 flex items-center hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setCompleteOpen(false)} 
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
              {submitting ? 'Submitting...' : 'Complete Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TaskDetail;
