import React, { useEffect, useState } from 'react';
import { getRequests } from '../../api/requests';
import { MaintenanceRequest } from '../../types';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';

const RequestHistory = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState<MaintenanceRequest | null>(null);

  useEffect(() => {
    getRequests().then(res => {
      setRequests(res.items);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const filtered = requests.filter(r => 
    r.description.toLowerCase().includes(search.toLowerCase()) || 
    r.id.toString().includes(search)
  );

  const columns = [
    { header: 'ID', accessor: (r: MaintenanceRequest) => `REQ-${r.id.toString().padStart(4, '0')}` },
    { header: 'Category', accessor: (r: MaintenanceRequest) => <span className="capitalize">{r.category}</span> },
    { header: 'Location', accessor: (r: MaintenanceRequest) => r.location?.name || `Loc ${r.location_id}` },
    { header: 'Priority', accessor: (r: MaintenanceRequest) => <PriorityBadge priority={r.priority} /> },
    { header: 'Status', accessor: (r: MaintenanceRequest) => <StatusBadge status={r.status} /> },
    { header: 'Date', accessor: (r: MaintenanceRequest) => new Date(r.submitted_at).toLocaleDateString() },
  ];

  return (
    <div>
      <PageHeader title="My Requests" description="View and track all your maintenance requests." />
      
      <div className="card p-6">
        <div className="mb-6 max-w-sm">
          <SearchBar value={search} onChange={setSearch} placeholder="Search requests..." />
        </div>
        
        <DataTable 
          columns={columns} 
          data={filtered} 
          loading={loading} 
          onRowClick={(row) => setSelectedReq(row)} 
        />
      </div>

      <Modal isOpen={!!selectedReq} onClose={() => setSelectedReq(null)} title="Request Details" size="md">
        {selectedReq && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500">Request ID</p>
                <p className="font-semibold text-slate-900">REQ-{selectedReq.id.toString().padStart(4, '0')}</p>
              </div>
              <StatusBadge status={selectedReq.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Category</p>
                <p className="font-medium capitalize">{selectedReq.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <PriorityBadge priority={selectedReq.priority} />
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="font-medium">{selectedReq.location?.name || `Location ${selectedReq.location_id}`}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Description</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mt-1">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedReq.description}</p>
              </div>
            </div>

            {selectedReq.photo_attachment && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Attached Photo</p>
                <img src={selectedReq.photo_attachment} alt="Attachment" className="max-h-48 rounded-lg border border-slate-200" />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RequestHistory;
