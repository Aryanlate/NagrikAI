import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle2,
  TrendingUp,
  Inbox,
  HardHat,
  Flame,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { fetchTickets, escalateTicket, fetchStats, checkBreaches } from '../api/client';
import EscalationModal from './EscalationModal';

export default function DashboardView({ setCurrentView }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'on-track' | 'approaching' | 'breached'
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [departmentStats, setDepartmentStats] = useState([]);

  // Sorting state
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Escalation modal state
  const [escalatingTicket, setEscalatingTicket] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Fetch initial dashboard data using useEffect
  const loadData = async () => {
    setLoading(true);
    setStatsLoading(true);
    setLoadError(null);
    try {
      const [ticketData, statsData] = await Promise.all([
        fetchTickets(),
        fetchStats().catch((err) => {
          console.warn('Stats not available:', err.message);
          return { byDepartment: [], byCategory: [] };
        }),
      ]);
      setTickets(ticketData);
      setDepartmentStats(statsData.byDepartment || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setLoadError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Show temporary toast message
  const triggerToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle ticket escalation confirmation
  const handleConfirmEscalation = async (ticketId, reason) => {
    try {
      await escalateTicket(ticketId, reason);
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId || t.ticket_id === ticketId
            ? {
                ...t,
                escalated: true,
                statusText: `Escalated to Zonal Authority`,
                escalation_action: reason || 'Escalated to Zonal Authority',
              }
            : t
        )
      );
      triggerToast(`Ticket #${ticketId} escalated successfully with high-priority dispatch!`);
    } catch (err) {
      console.error('Escalation failed:', err);
      setNotification(null);
      triggerToast(`Escalation failed: ${err.message || 'Please try again.'}`);
    }
  };

  // Wrapper for refresh button: run breach check + reload data
  const handleRefresh = async () => {
    try {
      await checkBreaches();
    } catch (err) {
      console.warn('Breach check note:', err.message);
    }
    await loadData();
  };

  // Filtered & Sorted rows calculation
  const processedTickets = useMemo(() => {
    let result = [...tickets];

    // Status filter
    if (selectedStatusFilter !== 'all') {
      result = result.filter((t) => t.slaStatus === selectedStatusFilter);
    }

    // Department filter
    if (selectedDeptFilter !== 'all') {
      result = result.filter((t) => t.department === selectedDeptFilter);
    }

    // Search query filter (matches ID, summary, category, location, department)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle custom timestamp sorting
      if (sortField === 'createdAt') {
        aVal = a.timestamp || 0;
        bVal = b.timestamp || 0;
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tickets, selectedStatusFilter, selectedDeptFilter, searchQuery, sortField, sortDirection]);

  // Derived KPI metrics
  const totalCount = tickets.length;
  const onTrackCount = tickets.filter((t) => t.slaStatus === 'on-track').length;
  const approachingCount = tickets.filter((t) => t.slaStatus === 'approaching').length;
  const breachedCount = tickets.filter((t) => t.slaStatus === 'breached').length;

  // Render sorting arrow icon
  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* Escalation Modal */}
      {escalatingTicket && (
        <EscalationModal
          ticket={escalatingTicket}
          onClose={() => setEscalatingTicket(null)}
          onConfirm={handleConfirmEscalation}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Dashboard Top Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Municipal Governance Dashboard
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">BBMP Central Command Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NagrikAi — Staff Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unified Civic Grievance Triage &amp; Real-Time SLA Monitoring
          </p>
        </div>

        {/* Action button & refresh */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh tickets &amp; run breach check"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loading || statsLoading) ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('citizen')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <span>+ New Citizen Ticket</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Received */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
            <span>Total Intake Today</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all 198 BBMP wards</p>
        </div>

        {/* Card 2: On Track */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
            <span>On Track (Normal SLA)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{onTrackCount}</span>
            <span className="text-xs font-medium text-slate-500">
              {totalCount ? Math.round((onTrackCount / totalCount) * 100) : 0}% of volume
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${totalCount ? (onTrackCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Approaching Deadline */}
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wide">
            <span>Approaching Deadline</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-800">{approachingCount}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              &lt; 2h Remaining
            </span>
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Requires supervisor follow-up</p>
        </div>

        {/* Card 4: SLA Breached */}
        <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-red-800 uppercase tracking-wide">
            <span>SLA Breached</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-red-700">{breachedCount}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 uppercase tracking-wide">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-red-600 font-semibold mt-1">
            Escalation triggers active
          </p>
        </div>
      </div>

      {/* Analytics: Recharts Bar Chart "Complaints by Department" */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Complaints by Department
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of incoming citizen grievances across municipal agencies
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Real-time Feed
          </span>
        </div>

        {/* Clean Responsive Bar Chart */}
        <div className="w-full h-56 pt-2 relative">
          {statsLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
              <span className="text-xs text-slate-500 font-medium">Loading analytics…</span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentStats.length > 0 ? departmentStats : []}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="department"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                        <p className="font-bold">{data.department}</p>
                        <p className="text-blue-300">
                          Complaints: <span className="font-semibold text-white">{data.count}</span>
                        </p>
                        {data.resolvedRate && (
                          <p className="text-emerald-400">
                            SLA Adherence: {data.resolvedRate}%
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(departmentStats.length > 0 ? departmentStats : []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {!statsLoading && departmentStats.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">No department data yet — submit a ticket to populate the chart.</span>
            </div>
          )}
        </div>
      </div>

      {/* Load Error Banner */}
      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="text-xs font-bold text-red-800">Dashboard Load Error</p>
            <p className="text-xs text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Ticket Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        {/* Table Toolbar & Filters */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: `All (${tickets.length})` },
              { id: 'on-track', label: `On Track (${onTrackCount})` },
              { id: 'approaching', label: `Approaching (${approachingCount})` },
              { id: 'breached', label: `Breached (${breachedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Department Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, ward, keyword..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Departments</option>
              <option value="BWSSB">BWSSB</option>
              <option value="BBMP Works">BBMP Works</option>
              <option value="BESCOM">BESCOM</option>
              <option value="BBMP SWM">BBMP SWM</option>
              <option value="Health & Safety">Health & Safety</option>
            </select>
          </div>
        </div>

        {/* The Sortable Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-600 text-[11px] font-bold uppercase tracking-wider select-none border-b border-slate-200">
                {/* Column 1: Ticket ID */}
                <th
                  scope="col"
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ticket ID</span>
                    {renderSortIndicator('id')}
                  </div>
                </th>

                {/* Column 2: Complaint Summary */}
                <th
                  scope="col"
                  onClick={() => handleSort('summary')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Complaint Summary</span>
                    {renderSortIndicator('summary')}
                  </div>
                </th>

                {/* Column 3: Category */}
                <th
                  scope="col"
                  onClick={() => handleSort('category')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    {renderSortIndicator('category')}
                  </div>
                </th>

                {/* Column 4: Location */}
                <th
                  scope="col"
                  onClick={() => handleSort('location')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Location</span>
                    {renderSortIndicator('location')}
                  </div>
                </th>

                {/* Column 5: Department */}
                <th
                  scope="col"
                  onClick={() => handleSort('department')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    {renderSortIndicator('department')}
                  </div>
                </th>

                {/* Column 6: Urgency */}
                <th
                  scope="col"
                  onClick={() => handleSort('urgency')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Urgency</span>
                    {renderSortIndicator('urgency')}
                  </div>
                </th>

                {/* Column 7: SLA Status */}
                <th
                  scope="col"
                  onClick={() => handleSort('slaStatus')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>SLA Status</span>
                    {renderSortIndicator('slaStatus')}
                  </div>
                </th>

                {/* Column 8: Created At */}
                <th
                  scope="col"
                  onClick={() => handleSort('createdAt')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created At</span>
                    {renderSortIndicator('createdAt')}
                  </div>
                </th>

                {/* Action Column */}
                <th scope="col" className="py-3 px-4 text-right">
                  <span>Action</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading municipal ticket records...
                  </td>
                </tr>
              ) : processedTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No tickets found matching your filters.
                  </td>
                </tr>
              ) : (
                processedTickets.map((ticket) => {
                  // STRICT ROW STYLING LOGIC:
                  // Green (`bg-green-50`) = On track
                  // Amber (`bg-yellow-50`) = Approaching deadline
                  // Red (`bg-red-50`) = SLA breached
                  let rowBgClass = 'bg-green-50 hover:bg-green-100/60 border-l-4 border-green-500';
                  if (ticket.slaStatus === 'approaching') {
                    rowBgClass = 'bg-yellow-50 hover:bg-yellow-100/60 border-l-4 border-amber-500';
                  } else if (ticket.slaStatus === 'breached') {
                    rowBgClass = 'bg-red-50 hover:bg-red-100/60 border-l-4 border-red-500';
                  }

                  return (
                    <tr
                      key={ticket.id}
                      className={`transition-colors font-medium text-slate-800 ${rowBgClass}`}
                    >
                      {/* Ticket ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {ticket.id}
                      </td>

                      {/* Complaint Summary */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 line-clamp-1">
                            {ticket.summary}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {ticket.details}
                          </span>
                          {ticket.escalated && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 mt-0.5">
                              <ShieldAlert className="w-3 h-3" />
                              {ticket.statusText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700 text-[11px] font-medium">
                          {ticket.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-700">{ticket.location}</span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">
                          {ticket.department}
                        </span>
                      </td>

                      {/* Urgency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ticket.urgency === 'Critical'
                              ? 'bg-red-600 text-white'
                              : ticket.urgency === 'High'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {ticket.urgency}
                        </span>
                      </td>

                      {/* SLA Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {ticket.slaStatus === 'breached' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-red-800 bg-red-100 text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              {ticket.slaRemaining}
                            </span>
                          )}
                          {ticket.slaStatus === 'approaching' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-amber-800 bg-amber-100 text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              {ticket.slaRemaining}
                            </span>
                          )}
                          {ticket.slaStatus === 'on-track' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-emerald-800 bg-emerald-100 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {ticket.slaRemaining}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {ticket.createdAt}
                      </td>

                      {/* Escalation Action Button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {ticket.slaStatus === 'breached' ? (
                          <button
                            type="button"
                            id={`escalate-btn-${ticket.id}`}
                            onClick={() => setEscalatingTicket(ticket)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 animate-pulse hover:animate-none"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Escalate</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Monitoring
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{processedTickets.length}</strong> of <strong>{tickets.length}</strong> municipal dockets
          </span>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> On Track
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Approaching SLA
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> SLA Breached
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
