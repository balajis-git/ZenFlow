import React, { useState } from 'react';
import { useGetActivityLogsQuery } from '../../redux/api/reportApi';
import { Activity, User, Shield, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ActivityLogs = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetActivityLogsQuery({ page, limit: 10 });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Activity className="text-brand-500" size={26} />
            System Activity & Audit Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time audit trail of user actions, system modifications, logins, and operations.
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading audit history...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No activity logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 dark:bg-darkBorder/30 text-xs uppercase text-slate-500 font-bold border-b border-slate-200/50 dark:border-darkBorder/10">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/10 text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-darkBorder/10 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={log.user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt="User"
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-500/20"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{log.user?.name || 'System / Guest'}</p>
                        <p className="text-xs text-slate-400">{log.user?.role || 'System Process'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-500">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-darkBorder/10 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 dark:border-darkBorder/40 disabled:opacity-40 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 dark:border-darkBorder/40 disabled:opacity-40 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
