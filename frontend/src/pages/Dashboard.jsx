import React from 'react';
import { useSelector } from 'react-redux';
import { useGetDashboardAnalyticsQuery } from '../redux/api/reportApi';
import {
  useGetTodayStatusQuery,
  useClockInMutation,
  useClockOutMutation,
  useToggleBreakMutation,
} from '../redux/api/attendanceApi';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  CalendarDays,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3b62e7', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Queries
  const { data: analyticsData, isLoading: analyticsLoading } = useGetDashboardAnalyticsQuery();
  const { data: attendanceData } = useGetTodayStatusQuery();

  // Mutations
  const [clockIn] = useClockInMutation();
  const [clockOut] = useClockOutMutation();
  const [toggleBreak] = useToggleBreakMutation();

  const isClockedIn = attendanceData?.attendance && !attendanceData.attendance.clockOut;
  const isOnBreak = attendanceData?.attendance?.breaks?.some((b) => b.end === null);

  // Calculate stats from query
  const stats = analyticsData?.analytics || {
    totalProjects: 0,
    completedProjects: 0,
    pendingTasks: 0,
    completedTasks: 0,
    pendingLeaves: 0,
    attendanceToday: { present: 0, total: 1 },
    projectsList: [],
    activityLogs: [],
  };

  // Format Recharts data
  const projectCompletionData = [
    { name: 'Completed', value: stats.completedProjects },
    { name: 'Pending', value: Math.max(0, stats.totalProjects - stats.completedProjects) },
  ];

  const tasksOverviewData = [
    { name: 'Completed Tasks', count: stats.completedTasks },
    { name: 'Pending Tasks', count: stats.pendingTasks },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' },
    }),
  };

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-darkBorder/40"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-darkBorder/40"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Hello, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what is happening at the company today.
          </p>
        </div>

        {/* Clock Control Widget */}
        <div className="glass flex flex-wrap items-center gap-4 p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-darkBorder/20">
          <div className="flex items-center gap-2">
            <Clock className="text-brand-500" size={20} />
            <span className="text-sm font-semibold dark:text-slate-200">
              {isClockedIn ? (isOnBreak ? 'On Break' : 'Working') : 'Not Clocked In'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isClockedIn ? (
              <button
                onClick={() => clockIn()}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
              >
                Clock In
              </button>
            ) : (
              <>
                <button
                  onClick={() => toggleBreak()}
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition ${
                    isOnBreak ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-500 hover:bg-slate-600'
                  }`}
                >
                  {isOnBreak ? 'Resume Work' : 'Take Break'}
                </button>
                <button
                  onClick={() => clockOut()}
                  className="rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
                >
                  Clock Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Projects', value: stats.totalProjects, sub: `${stats.completedProjects} Completed`, icon: FolderKanban, color: 'text-brand-500 bg-brand-500/10' },
          { title: 'Task Backlog', value: stats.pendingTasks, sub: `${stats.completedTasks} Done`, icon: CheckSquare, color: 'text-emerald-500 bg-emerald-500/10' },
          { title: 'Leaves Pending', value: stats.pendingLeaves, sub: 'Needs Review', icon: CalendarDays, color: 'text-amber-500 bg-amber-500/10' },
          { title: 'Present Today', value: `${stats.attendanceToday.present}/${stats.attendanceToday.total}`, sub: 'Employees Active', icon: Activity, color: 'text-indigo-500 bg-indigo-500/10' },
        ].map((c, i) => (
          <motion.div
            key={c.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="glass p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-darkBorder/10 flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{c.title}</p>
              <h3 className="text-2xl font-extrabold tracking-tight dark:text-white">{c.value}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.sub}</p>
            </div>
            <div className={`p-3.5 rounded-xl ${c.color}`}>
              <c.icon size={22} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graphs & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Productivity Bar Chart */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-darkBorder/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tasks Overview</h3>
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              <TrendingUp size={12} />
              Sprint Status
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksOverviewData} barSize={45}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(229, 231, 235, 0.1)' }} />
                <Bar dataKey="count" fill="#3b62e7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Completion Pie Chart */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-darkBorder/10">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Project Statuses</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalProjects}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs & Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Progress Lists */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-darkBorder/10 lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Active Projects</h3>
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {stats.projectsList.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-10">No active projects found.</p>
            ) : (
              stats.projectsList.map((p) => (
                <div key={p.name} className="space-y-2 border-b border-slate-100 dark:border-darkBorder/10 pb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">{p.name}</span>
                    <span className="text-xs text-brand-500 font-bold">{p.progress}%</span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Logs Timeline */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-darkBorder/10 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent System Logs</h3>
          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {stats.activityLogs.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-10">No system activity logged today.</p>
            ) : (
              stats.activityLogs.map((log) => (
                <div key={log._id} className="flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Activity size={14} className="text-slate-500" />
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <p className="font-semibold text-slate-700 dark:text-slate-100">
                      {log.user ? log.user.name : 'Unknown User'} - <span className="text-slate-500 font-normal">{log.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{log.details || 'System status update'}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
