import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useApplyLeaveMutation,
  useGetMyLeaveRequestsQuery,
  useGetAllLeaveRequestsQuery,
  useUpdateLeaveStatusMutation,
} from '../../redux/api/leaveApi';
import { CalendarRange, Plus, Check, X, ShieldAlert } from 'lucide-react';

const Leaves = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('my-requests');
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Queries
  const { data: myData, isLoading: myLoading } = useGetMyLeaveRequestsQuery();
  const { data: allData, isLoading: allLoading } = useGetAllLeaveRequestsQuery(undefined, {
    skip: user?.role === 'Employee' && activeTab === 'my-requests',
  });

  // Mutations
  const [applyLeave, { isLoading: isApplying }] = useApplyLeaveMutation();
  const [updateLeaveStatus] = useUpdateLeaveStatusMutation();

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await applyLeave({ leaveType, startDate, endDate, reason }).unwrap();
      setIsOpen(false);
      setReason('');
    } catch (err) {
      alert(err.data?.message || 'Failed to submit leave application.');
    }
  };

  const handleReview = async (id, status) => {
    try {
      await updateLeaveStatus({ id, status }).unwrap();
    } catch (err) {
      alert(err.data?.message || 'Failed to update leave status.');
    }
  };

  const canReview = user?.role === 'Super Admin' || user?.role === 'HR Admin' || user?.role === 'Project Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Leave Management</h1>
          <p className="text-sm text-slate-500">Submit leave applications, track balances, and approve time-off requests.</p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 transition"
        >
          <Plus size={16} />
          Apply Leave
        </button>
      </div>

      {/* Tabs */}
      {canReview && (
        <div className="flex border-b border-slate-200 dark:border-darkBorder/40 gap-6">
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`pb-3 text-sm font-bold transition border-b-2 ${
              activeTab === 'my-requests'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            My Applications ({myData?.leaves?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 text-sm font-bold transition border-b-2 ${
              activeTab === 'approvals'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Review Approvals ({allData?.leaves?.filter((l) => l.status === 'Pending').length || 0})
          </button>
        </div>
      )}

      {/* My Requests Table */}
      {activeTab === 'my-requests' && (
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4">
          <div className="custom-table-container">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-darkBorder/20 text-xs uppercase font-extrabold text-slate-400">
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/10">
                {myLoading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">Loading applications...</td>
                  </tr>
                ) : myData?.leaves?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">No leave applications submitted.</td>
                  </tr>
                ) : (
                  myData?.leaves?.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-darkBorder/10">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{leave.leaveType}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : leave.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approvals Table */}
      {activeTab === 'approvals' && (
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4">
          <div className="custom-table-container">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-darkBorder/20 text-xs uppercase font-extrabold text-slate-400">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder/10">
                {allLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">Loading requests...</td>
                  </tr>
                ) : allData?.leaves?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">No leave requests to review.</td>
                  </tr>
                ) : (
                  allData?.leaves?.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-darkBorder/10">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={leave.user?.profileImage}
                            alt={leave.user?.name}
                            className="h-7 w-7 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-800 dark:text-white">{leave.user?.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">{leave.leaveType}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3.5 px-4">
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReview(leave._id, 'Approved')}
                              className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition flex items-center gap-1"
                            >
                              <Check size={12} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(leave._id, 'Rejected')}
                              className="rounded-lg bg-rose-500 hover:bg-rose-600 px-3 py-1 text-xs font-bold text-white transition flex items-center gap-1"
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              leave.status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {leave.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-3xl p-6 border border-slate-200/50 dark:border-darkBorder/30 shadow-2xl relative">
            <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Apply for Leave</h3>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Work From Home">Work From Home</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reason</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context for approval..."
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isApplying}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition mt-4"
              >
                {isApplying ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
