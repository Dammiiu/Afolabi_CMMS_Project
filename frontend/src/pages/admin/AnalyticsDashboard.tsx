import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { FileText, Clock, CheckCircle, Wrench, BarChart2, TrendingUp, Users, Layers } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  getOverview, 
  getRequestsByCategory, 
  getRequestsByLocation, 
  getTechnicianWorkload, 
  getResponseTimeTrends, 
  getMonthlyTrends 
} from '../../api/analytics';
import { AnalyticsOverview, CategoryCount, TechnicianWorkload, ResponseTimeTrend, MonthlyTrend } from '../../types';

const COLORS = ['#0f766e', '#14b8a6', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [locationData, setLocationData] = useState<{location_name: string, count: number}[]>([]);
  const [workloadData, setWorkloadData] = useState<TechnicianWorkload[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeTrend[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Analytics | AATU CMMS';
    
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [
          overRes, 
          catRes, 
          locRes, 
          workRes, 
          timeRes, 
          trendRes
        ] = await Promise.all([
          getOverview(),
          getRequestsByCategory(),
          getRequestsByLocation(),
          getTechnicianWorkload(),
          getResponseTimeTrends(),
          getMonthlyTrends()
        ]);
        
        setOverview(overRes);
        setCategoryData(catRes);
        setLocationData(locRes);
        setWorkloadData(workRes);
        setResponseTimeData(timeRes);
        setMonthlyTrendData(trendRes);
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, []);

  if (loading || !overview) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics Dashboard" description="Loading real-time facilities performance metrics..." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-80 animate-pulse bg-slate-100 rounded-xl" />
          <div className="card h-80 animate-pulse bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title="System Analytics" 
          description="Evaluate the effectiveness of the digital CMMS compared with the manual paper-based approach." 
        />
        <div className="text-sm font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          Live Data Syncing
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Logged Faults" 
          value={overview.total_requests} 
          icon={FileText} 
          color="bg-primary-500" 
          trend={{ value: 12.4, isPositive: true }}
        />
        <StatCard 
          title="Average Response Speed" 
          value={`${overview.avg_response_time_hours} hrs`} 
          icon={Clock} 
          color="bg-blue-500" 
          trend={{ value: 85.7, isPositive: true }} // before was 168 hours
        />
        <StatCard 
          title="Repair Completion Rate" 
          value={`${overview.completion_rate_percent}%`} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
          trend={{ value: 4.2, isPositive: true }}
        />
        <StatCard 
          title="Active Work Orders" 
          value={overview.active_work_orders} 
          icon={Wrench} 
          color="bg-amber-500" 
        />
      </div>

      {/* Primary Research/Defense Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Objective: Baseline Manual vs Digital Response Time */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <BarChart2 className="h-5 w-5 mr-1.5 text-primary-700" />
              Response Time Comparison (Hours)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical evidence comparing manual paper process against the new automated workflow.
            </p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} />
                <YAxis label={{ value: 'Average Time (Hours)', angle: -90, position: 'insideLeft', offset: 10 }} />
                <RechartsTooltip />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                  {responseTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#0f766e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by category */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <Layers className="h-5 w-5 mr-1.5 text-primary-700" />
              Logged Faults by Category
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of maintenance requests categorized by building utility types.
            </p>
          </div>
          <div className="h-64 mt-6 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60}
                  outerRadius={80} 
                  fill="#8884d8" 
                  dataKey="count" 
                  nameKey="category"
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-1.5 text-primary-700" />
              Monthly Fault Volume Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison of submitted tickets against successfully completed work orders over last 3 months.
            </p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} name="Logged Faults" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed Actions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technician Workload */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <Users className="h-5 w-5 mr-1.5 text-primary-700" />
              Technician Activity & Workload
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribution of active tasks and historical completed work orders per assigned staff.
            </p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="technician_name" type="category" width={100} tickLine={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="active_orders" stackId="a" fill="#f59e0b" name="Active Tasks" />
                <Bar dataKey="completed_orders" stackId="a" fill="#14b8a6" name="Completed Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
