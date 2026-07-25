import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetTodayStatusQuery,
  useClockInMutation,
  useClockOutMutation,
  useToggleBreakMutation,
  useGetAttendanceHistoryQuery,
} from '../../redux/api/attendanceApi';
import { useGetEmployeesQuery } from '../../redux/api/employeeApi';
import { Clock, Calendar, Play, Square, Coffee } from 'lucide-react';

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [selectedUser, setSelectedUser] = useState('');

  // Queries
  const { data: todayData } = useGetTodayStatusQuery();
  const { data: historyData, isLoading } = useGetAttendanceHistoryQuery(selectedUser || undefined);
  const { data: empData } = useGetEmployeesQuery({ limit: 100 });

  // Mutations
  const [clockIn] = useClockInMutation();
  const [clockOut] = useClockOutMutation();
  const [toggleBreak] = useToggleBreakMutation();

  const isClockedIn = todayData?.attendance && !todayData.attendance.clockOut;
  const isOnBreak = todayData?.attendance?.breaks?.some((b) => b.end === null);
  const isHrOrAdmin = user?.role === 'Super Admin' || user?.role === 'HR Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Attendance Manager</h1>
          <p className="text-sm text-slate-500">Record daily clock times, breaks, and inspect monthly working logs.</p>
        </div>

        {isHrOrAdmin && (
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="rounded-xl border-slate-200 bg-white dark:bg-darkCard py-2.5 px-4 text-sm font-semibold dark:text-white border border-slate-200/50 dark:border-darkBorder/20"
          >
            <option value="">Inspect My Attendance</option>
            {empData?.employees?.map((emp) => (
              <option key={emp._id} value={emp._id}>
                Employee: {emp.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Clock Controls Card */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <Clock size={32} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
              {isClockedIn ? (isOnBreak ? 'On Break' : 'Active Workday') : 'Not Clocked In'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Today's Date: <strong>{new Date().toLocaleDateString()}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isClockedIn ? (
            <button
              onClick={() => clockIn()}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition"
            >
              <Play size={16} />
              Clock In
            </button>
          ) : (
            <>
              <button
                onClick={() => toggleBreak()}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition ${
                  isOnBreak ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                <Coffee size={16} />
                {isOnBreak ? 'End Break' : 'Start Break'}
              </button>
              <button
                onClick={() => clockOut()}
                className="flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition"
              >
                <Square size={16} />
                Clock Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* History Log Table */}
      <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attendance Logs</h3>

        <div className="custom-table-container">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-darkBorder/20 text-xs uppercase font-extrabold text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Working Hours</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">Loading attendance history...</td>
                </tr>
              ) : historyData?.logs?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">No attendance records found.</td>
                </tr>
              ) : (
                historyData?.logs?.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-darkBorder/10">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white">{log.date}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {log.clockIn ? new Date(log.clockIn).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-500">
                      {log.workingHours ? `${log.workingHours} hrs` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          log.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : log.status === 'Late'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
