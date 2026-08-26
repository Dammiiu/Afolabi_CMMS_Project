import React, { useEffect, useState } from 'react';
import { getInventory, createInventoryItem, adjustStock } from '../../api/inventory';
import { InventoryItem } from '../../types';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { Package, AlertTriangle, ArrowUpDown, Plus, PenTool, Layers } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState('0');
  const [adjustReason, setAdjustReason] = useState('');
  
  const [addOpen, setAddOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Electrical',
    unit: 'pieces',
    reorder_threshold: '5',
    quantity_in_stock: '0',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchInventory = () => {
    setLoading(true);
    getInventory()
      .then((res) => setItems(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    const change = parseInt(adjustQty);
    if (isNaN(change) || change === 0) {
      return addToast('Please enter a valid non-zero quantity change', 'error');
    }

    setSubmitting(true);
    try {
      await adjustStock(adjustItem.id, change, adjustReason);
      addToast('Stock level adjusted successfully', 'success');
      fetchInventory();
      setAdjustItem(null);
      setAdjustQty('0');
      setAdjustReason('');
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Failed to adjust stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const threshold = parseInt(newItem.reorder_threshold);
    const stock = parseInt(newItem.quantity_in_stock);

    if (isNaN(threshold) || threshold < 0 || isNaN(stock) || stock < 0) {
      return addToast('Please specify valid numbers for stock and threshold', 'error');
    }

    setSubmitting(true);
    try {
      await createInventoryItem({
        name: newItem.name,
        category: newItem.category,
        unit: newItem.unit,
        reorder_threshold: threshold,
        quantity_in_stock: stock,
      });

      addToast('New item added to inventory', 'success');
      fetchInventory();
      setAddOpen(false);
      setNewItem({
        name: '',
        category: 'Electrical',
        unit: 'pieces',
        reorder_threshold: '5',
        quantity_in_stock: '0',
      });
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Failed to add item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase());
    const isLow = item.quantity_in_stock <= item.reorder_threshold;
    return matchesSearch && (!filterLowStock || isLow);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Inventory Management" 
          description="Track stock levels, monitor low items, and adjust supply records for university repairs." 
        />
        <button 
          onClick={() => setAddOpen(true)}
          className="btn-primary flex items-center justify-center w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Supply Item
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search supplies or categories..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center text-sm font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded mr-2"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
            />
            Show Low Stock Only
          </label>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          No inventory items found. Try adjusting filters or search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isLow = item.quantity_in_stock <= item.reorder_threshold;
            return (
              <div 
                key={item.id} 
                className={`card p-6 flex flex-col justify-between transition-all hover:shadow-md border-l-4 ${
                  isLow ? 'border-l-red-500 bg-red-50/10' : 'border-l-primary-500'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="text-lg font-bold text-slate-800 mt-1">{item.name}</h4>
                    </div>
                    {isLow && (
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-md flex items-center border border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">{item.quantity_in_stock}</span>
                    <span className="text-sm font-semibold text-slate-500">{item.unit}</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isLow ? 'bg-red-500' : 'bg-primary-600'}`} 
                      style={{ width: `${Math.min(100, (item.quantity_in_stock / Math.max(1, item.reorder_threshold * 2)) * 100)}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-400">
                    Reorder Threshold: {item.reorder_threshold} {item.unit}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                  <button 
                    onClick={() => {
                      setAdjustItem(item);
                      setAdjustQty('0');
                      setAdjustReason('');
                    }}
                    className="w-full btn-secondary text-xs flex items-center justify-center py-2"
                  >
                    <PenTool className="h-3.5 w-3.5 mr-1" /> Adjust Stock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        title="Adjust Supply Stock Level"
        size="md"
      >
        {adjustItem && (
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase">Item Name</p>
              <p className="font-bold text-slate-800 text-lg">{adjustItem.name}</p>
              <p className="text-sm text-slate-500 mt-1">
                Current Level: <strong className="text-slate-800">{adjustItem.quantity_in_stock} {adjustItem.unit}</strong>
              </p>
            </div>

            <div>
              <label className="label">Quantity Change (+ to Add, - to Restock/Deduct)</label>
              <input
                type="number"
                required
                className="input-field"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                New predicted total:{' '}
                <strong>
                  {adjustItem.quantity_in_stock + (parseInt(adjustQty) || 0)} {adjustItem.unit}
                </strong>
              </p>
            </div>

            <div>
              <label className="label">Reason / Notes</label>
              <input
                type="text"
                required
                placeholder="E.g. Restocked monthly order, damaged item write-off"
                className="input-field"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setAdjustItem(null)} 
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary bg-primary-700 hover:bg-primary-800 min-w-[120px]"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Save Adjustments'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add New Item Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Supply Item"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="label">Item Name</label>
            <input
              type="text"
              required
              placeholder="E.g. Circuit Breakers (30A), Door Closers"
              className="input-field"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input-field"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Structural">Structural</option>
                <option value="IT">IT & Network</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="label">Measurement Unit</label>
              <input
                type="text"
                required
                placeholder="E.g. pieces, meters, buckets"
                className="input-field"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Starting Stock Quantity</label>
              <input
                type="number"
                min="0"
                required
                className="input-field"
                value={newItem.quantity_in_stock}
                onChange={(e) => setNewItem({ ...newItem, quantity_in_stock: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                required
                className="input-field"
                value={newItem.reorder_threshold}
                onChange={(e) => setNewItem({ ...newItem, reorder_threshold: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setAddOpen(false)} 
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary bg-primary-700 hover:bg-primary-800 min-w-[120px]"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Create Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
