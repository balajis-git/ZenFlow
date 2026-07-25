import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FileSpreadsheet, FileText, Download, BarChart3, Users, Calendar, FolderGit2, CheckSquare } from 'lucide-react';
import axios from 'axios';

const Reports = () => {
  const { token } = useSelector((state) => state.auth);
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type, format) => {
    setDownloading(`${type}-${format}`);
    try {
      const response = await axios.get(`/api/reports/export/${type}/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type:
          format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report document.');
    } finally {
      setDownloading(null);
    }
  };

  const reportModules = [
    {
      type: 'attendance',
      title: 'Attendance Report',
      desc: 'Complete history of employee clock-in, clock-out, break hours, and monthly logs.',
      icon: Calendar,
      color: 'text-brand-500 bg-brand-500/10',
    },
    {
      type: 'employees',
      title: 'Employee Directory Report',
      desc: 'Comprehensive employee roster detailing roles, salaries, designations, and contact numbers.',
      icon: Users,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      type: 'projects',
      title: 'Projects Analytics Report',
      desc: 'Overall progress metrics, timelines, budgets, assigned managers, and status values.',
      icon: FolderGit2,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      type: 'tasks',
      title: 'Tasks Backlog Report',
      desc: 'Sprint breakdowns, priority ratings, estimated vs actual hours, and task status logs.',
      icon: CheckSquare,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      type: 'leaves',
      title: 'Leave Requests Report',
      desc: 'List of leave applications, approved time-off counts, emergency leave notes, and reviewers.',
      icon: BarChart3,
      color: 'text-rose-500 bg-rose-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Reports & Data Exports</h1>
        <p className="text-sm text-slate-500">Download formatted Excel spreadsheets and PDF documents for audits and executive reviews.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportModules.map((item) => (
          <div
            key={item.type}
            className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold ${item.color}`}>
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-darkBorder/10">
              <button
                disabled={downloading === `${item.type}-excel`}
                onClick={() => handleDownload(item.type, 'excel')}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-2.5 px-3 text-xs font-bold transition disabled:opacity-50"
              >
                <FileSpreadsheet size={16} />
                Excel (.xlsx)
              </button>

              <button
                disabled={downloading === `${item.type}-pdf`}
                onClick={() => handleDownload(item.type, 'pdf')}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 py-2.5 px-3 text-xs font-bold transition disabled:opacity-50"
              >
                <FileText size={16} />
                PDF (.pdf)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
