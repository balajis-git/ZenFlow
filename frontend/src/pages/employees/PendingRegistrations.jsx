import React, { useState } from 'react';
import {
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useGetRegistrationStatsQuery,
} from '../../redux/api/employeeApi';
import { useGetDepartmentsQuery } from '../../redux/api/departmentApi';
import {
  UserCheck,
  UserX,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react';

const PendingRegistrations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectingUser, setRejectingUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const { data, isLoading, isError, refetch } = useGetPendingUsersQuery({
    search: searchTerm,
    department: departmentFilter,
  });

  const { data: deptData } = useGetDepartmentsQuery();
  const { data: statsData } = useGetRegistrationStatsQuery();

  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();

  const pendingUsers = data?.pendingUsers || [];
  const departments = deptData?.departments || [];
  const stats = statsData?.stats || {};

  const handleApprove = async (id, name) => {
    try {
      await approveUser(id).unwrap();
      setActionSuccess(`Employee ${name} approved successfully.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.data?.message || 'Failed to approve employee.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingUser) return;
    try {
      await rejectUser({ id: rejectingUser._id, reason: rejectionReason }).unwrap();
      setActionSuccess(`Registration request for ${rejectingUser.name} rejected.`);
      setRejectingUser(null);
      setRejectionReason('');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.data?.message || 'Failed to reject employee request.');
    }
  };

  const handleApproveAll = async () => {
    if (!pendingUsers.length) return;
    if (!window.confirm(`Are you sure you want to approve all ${pendingUsers.length} pending registration requests?`)) return;
    try {
      for (const u of pendingUsers) {
        await approveUser(u._id).unwrap();
      }
      setActionSuccess('All pending registration requests approved successfully.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.data?.message || 'Failed to approve all users.');
    }
  };

  const exportRequestsCSV = () => {
    if (!pendingUsers.length) return;
    const headers = ['Employee ID,Name,Email,Role,Designation,Department,Registration Date\n'];
    const rows = pendingUsers.map(
      (u) =>
        `"${u.employeeId || ''}","${u.name}","${u.email}","${u.role}","${u.designation || ''}","${
          u.department?.name || 'Unassigned'
        }","${new Date(u.createdAt).toLocaleDateString()}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZenFlow_Registration_Requests_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Registration Requests
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock size={12} className="mr-1.5" />
              {stats.pendingCount || pendingUsers.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review, approve, or reject new employee account registration requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportRequestsCSV}
            disabled={!pendingUsers.length}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-darkBorder/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkBorder/50 transition-all disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={handleApproveAll}
            disabled={!pendingUsers.length || isApproving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={14} /> Approve All
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-emerald-200">
            ×
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Pending Approval</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {stats.pendingCount ?? pendingUsers.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Clock size={22} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Active Approved</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {stats.approvedCount ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-500">Rejected Requests</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
              {stats.rejectedCount ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <UserX size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass p-4 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 pl-10 pr-4 text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-3 text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20 w-full sm:w-auto"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pending Requests Table / List */}
      <div className="glass rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserCheck size={40} className="mx-auto text-emerald-500/40 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No pending registration requests</p>
            <p className="text-xs text-slate-400 mt-1">All employee signups have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 dark:bg-darkBg/50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-darkBorder/10">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department & Designation</th>
                  <th className="py-3.5 px-4">Skills & Contact</th>
                  <th className="py-3.5 px-4">Requested On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/10">
                {pendingUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/30 dark:hover:bg-darkBg/30 transition-colors">
                    {/* Employee Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profileImage || 'http://localhost:5000/uploads/male_employee_avatar.jpg'}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-darkBorder/20 shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-500">
                              {user.employeeId || 'EMP-TEMP'}
                            </span>
                            <span className="text-[11px] text-slate-400">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Designation */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {user.designation || 'Team Member'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {user.department?.name || 'Unassigned Department'}
                      </p>
                    </td>

                    {/* Skills & Contact */}
                    <td className="py-3.5 px-4">
                      <p className="text-slate-600 dark:text-slate-300 font-medium">{user.phone || 'N/A'}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.skills && user.skills.length > 0 ? (
                          user.skills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-darkBorder/40 text-slate-500 dark:text-slate-400">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">No skills specified</span>
                        )}
                      </div>
                    </td>

                    {/* Requested On */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(user)}
                          title="View Details"
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-darkBorder/20 transition-all"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => handleApprove(user._id, user.name)}
                          disabled={isApproving}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs transition-all shadow-sm"
                        >
                          <UserCheck size={14} /> Approve
                        </button>

                        <button
                          onClick={() => setRejectingUser(user)}
                          disabled={isRejecting}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs transition-all shadow-sm"
                        >
                          <UserX size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-2xl border border-slate-200/50 dark:border-darkBorder/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder/10 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Employee Request Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedUser.profileImage || 'http://localhost:5000/uploads/male_employee_avatar.jpg'}
                alt={selectedUser.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-brand-500"
              />
              <div>
                <h4 className="font-bold text-lg text-slate-800 dark:text-white">{selectedUser.name}</h4>
                <p className="text-xs text-brand-500 font-bold">{selectedUser.designation} • {selectedUser.department?.name || 'General'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedUser.email} • {selectedUser.phone || 'No Phone'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between border-b border-slate-100 dark:border-darkBorder/10 pb-1.5">
                <span className="font-bold text-slate-400">Employee ID:</span>
                <span className="font-mono font-bold text-brand-500">{selectedUser.employeeId || 'EMP-AUTO'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-darkBorder/10 pb-1.5">
                <span className="font-bold text-slate-400">System Role:</span>
                <span>{selectedUser.role}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-darkBorder/10 pb-1.5">
                <span className="font-bold text-slate-400">Joining Date:</span>
                <span>{new Date(selectedUser.joiningDate || selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block mb-1">Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.skills?.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {selectedUser.resumeUrl && (
                <div className="pt-2">
                  <a
                    href={`http://localhost:5000/${selectedUser.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-500 font-bold hover:bg-brand-500 hover:text-white transition-all"
                  >
                    <FileText size={14} /> Download Resume PDF
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleApprove(selectedUser._id, selectedUser.name);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Approve Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl border border-red-500/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder/10 pb-3">
              <h3 className="font-bold text-red-500 text-base flex items-center gap-2">
                <AlertCircle size={18} /> Reject Registration Request
              </h3>
              <button onClick={() => setRejectingUser(null)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide a clear reason for declining <strong>{rejectingUser.name}</strong>'s request. An automated email with this reason will be sent to the employee.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Information provided does not match HR records..."
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 p-3 text-xs dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500/30"
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-darkBorder/40 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/20 hover:bg-red-500 transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRegistrations;
