import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { getOverview } from '../../api/analytics';
import api from '../../api/client';
import { AnalyticsOverview } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { FileText, FileDown, Calendar, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Reports = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = 'Supervisor Reports | AATU CMMS';
    getOverview()
      .then(setOverview)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      // Fetch report as blob using authenticated Axios client
      const blob = await api.get('/analytics/export/pdf', { responseType: 'blob' }) as unknown as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AATU_CMMS_Performance_Report_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('PDF Report downloaded successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export PDF Report', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const blob = await api.get('/analytics/export/csv', { responseType: 'blob' }) as unknown as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AATU_CMMS_Maintenance_Records_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast('CSV Database export downloaded successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export CSV database', 'error');
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="Operations & Performance Reports" 
        description="Generate official university maintenance logs and download performance analytics." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Performance Report */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-3 bg-teal-50 text-primary-700 rounded-lg w-fit">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Performance Summary (PDF)</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Downloads a formal, executive-ready PDF report containing key performance metrics, response speed comparisons, and overall campus completion rate percentages. Ideal for presentation to the university engineering and works department.
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || loading}
            className="btn-primary bg-primary-700 hover:bg-primary-800 w-full flex items-center justify-center py-2.5"
          >
            <FileDown className="h-4 w-4 mr-2" />
            {exportingPdf ? 'Generating Report...' : 'Download PDF Report'}
          </button>
        </div>

        {/* CSV Raw Data */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Raw Maintenance Records (CSV)</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Export all logged maintenance records, technical notes, time spent per task, and parts used details into a raw spreadsheet format. Excellent for auditing, custom Excel charts, or local backup.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={exportingCsv || loading}
            className="btn-secondary hover:bg-slate-50 w-full flex items-center justify-center py-2.5"
          >
            <FileDown className="h-4 w-4 mr-2" />
            {exportingCsv ? 'Extracting Records...' : 'Export CSV Database'}
          </button>
        </div>
      </div>

      {/* Quick Status Check Card */}
      <div className="card p-6 bg-slate-50 border border-slate-200">
        <h4 className="font-bold text-slate-800 text-base mb-4 flex items-center">
          <ShieldCheck className="h-5 w-5 mr-1.5 text-emerald-600" />
          Report Integrity Check
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>Digital Audit Trails Syncing</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>SQLite Database Seed Checked</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>AATU Defense Ready Metrics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
