import React, { useEffect, useState } from 'react';
import { getLocations, createLocation, updateLocation } from '../../api/locations';
import { Location } from '../../types';
import PageHeader from '../../components/PageHeader';
import DataTable, { Column } from '../../components/DataTable';
import Modal from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { MapPin, Plus, Edit2 } from 'lucide-react';

const LocationManagement = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    building_type: 'academic_block',
    block: '',
    room: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { addToast } = useToast();

  const fetchLocations = () => {
    setLoading(true);
    getLocations()
      .then(res => setLocations(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingLoc(null);
    setFormData({ name: '', building_type: 'academic_block', block: '', room: '' });
    setModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name,
      building_type: loc.building_type,
      block: loc.block || '',
      room: loc.room || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...formData,
      block: formData.block.trim() || null,
      room: formData.room.trim() || null,
    };

    try {
      if (editingLoc) {
        await updateLocation(editingLoc.id, payload);
        addToast('Location updated successfully', 'success');
      } else {
        await createLocation(payload);
        addToast('Location created successfully', 'success');
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const cols: Column<Location>[] = [
    { header: 'ID', accessor: (r) => <span className="text-slate-500 font-medium">#{r.id}</span> },
    { 
      header: 'Name', 
      accessor: (r) => (
        <span className="font-semibold text-slate-900 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary-500" />
          {r.name}
        </span>
      ) 
    },
    { 
      header: 'Building Type', 
      accessor: (r) => (
        <span className="capitalize bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-semibold">
          {r.building_type.replace('_', ' ')}
        </span>
      ) 
    },
    { header: 'Block', accessor: (r) => r.block || <span className="text-slate-400">-</span> },
    { header: 'Room', accessor: (r) => r.room || <span className="text-slate-400">-</span> },
    {
      header: 'Actions',
      accessor: (r) => (
        <button
          onClick={() => openEditModal(r)}
          className="text-primary-600 hover:text-primary-800 p-2 rounded-lg hover:bg-primary-50 transition-colors"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="Location Management" 
          description="Manage campus buildings, blocks, and rooms for maintenance requests." 
        />
        <button onClick={openAddModal} className="btn-primary flex items-center justify-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </button>
      </div>

      <div className="card">
        <DataTable columns={cols} data={locations} loading={loading} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLoc ? "Edit Location" : "Add New Location"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Location Name</label>
            <input
              required
              type="text"
              className="input-field"
              placeholder="e.g. Engineering Lab 3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Building Type</label>
            <select
              className="input-field"
              value={formData.building_type}
              onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
            >
              <option value="hostel">Hostel</option>
              <option value="lab">Laboratory</option>
              <option value="admin_block">Admin Block</option>
              <option value="academic_block">Academic Block</option>
              <option value="faculty">Faculty Building</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Block (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Block A"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Room (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 101"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving...' : editingLoc ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LocationManagement;
