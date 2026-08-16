import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest, uploadPhoto } from '../../api/requests';
import { getLocations } from '../../api/locations';
import { RequestCategory, Location } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import PageHeader from '../../components/PageHeader';
import FileUpload from '../../components/FileUpload';
import { Zap, Droplets, Wind, Building, Wifi, MoreHorizontal } from 'lucide-react';

const categories: { id: RequestCategory; label: string; icon: React.FC<any> }[] = [
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'plumbing', label: 'Plumbing', icon: Droplets },
  { id: 'hvac', label: 'HVAC', icon: Wind },
  { id: 'structural', label: 'Structural', icon: Building },
  { id: 'it', label: 'IT & Network', icon: Wifi },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
];

const NewRequest = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    location_id: '',
    category: '' as RequestCategory | '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    getLocations().then(res => setLocations(res as unknown as Location[])).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return addToast('Please select a category', 'error');
    if (formData.description.length < 20) return addToast('Description must be at least 20 characters', 'error');

    setLoading(true);
    try {
      const reqData = {
        location_id: parseInt(formData.location_id),
        category: formData.category,
        description: formData.description,
        priority: 'low', // default, backend triage will update
      };
      const newReq = await createRequest(reqData);
      
      if (file) {
        await uploadPhoto(newReq.id, file);
      }
      
      addToast('Request submitted successfully', 'success');
      navigate('/requestor/requests');
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Failed to submit request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Report a Fault" description="Provide details about the maintenance issue." />
      
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Location</label>
            <select
              required
              className="input-field"
              value={formData.location_id}
              onChange={e => setFormData({ ...formData, location_id: e.target.value })}
            >
              <option value="">Select a location...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.building_type}) - {loc.block || ''} {loc.room || ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label mb-3">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mb-2 ${isSelected ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span className="font-medium text-sm">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Please describe the issue in detail (minimum 20 characters)..."
              className="input-field resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.description.length}/200 characters (min 20)
            </p>
          </div>

          <div>
            <label className="label mb-2">Photo Attachment (Optional)</label>
            <FileUpload onFileSelect={setFile} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;
