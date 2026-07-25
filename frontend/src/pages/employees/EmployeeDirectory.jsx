import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
} from '../../redux/api/employeeApi';
import { useGetDepartmentsQuery } from '../../redux/api/departmentApi';
import { Search, Plus, Filter, Trash2, ArrowRight } from 'lucide-react';

const EmployeeDirectory = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [designation, setDesignation] = useState('Junior Engineer');
  const [salary, setSalary] = useState(60000);
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  // Queries
  const { data: empData, isLoading } = useGetEmployeesQuery({
    search,
    role: roleFilter,
    department: deptFilter,
    page,
    limit: 8,
  });
  const { data: deptData } = useGetDepartmentsQuery();

  // Mutations
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    formData.append('designation', designation);
    formData.append('salary', salary);
    formData.append('phone', phone);
    if (department) formData.append('department', department);

    try {
      await createEmployee(formData).unwrap();
      setIsOpen(false);
      // Reset fields
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } catch (err) {
      alert(err.data?.message || 'Failed to create employee.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        await deleteEmployee(id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete employee.');
      }
    }
  };

  const isHrOrAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Employees Directory</h1>
          <p className="text-sm text-slate-500">Manage organizational members, departments, and payroll credentials.</p>
        </div>

        {isHrOrAdmin && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 transition"
          >
            <Plus size={16} />
            Add Employee
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 border border-slate-200/50 dark:border-darkBorder/10">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 pl-10 pr-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border-slate-200 bg-slate-100/50 dark:bg-darkBg py-2.5 px-4 text-sm dark:text-white border-0 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
          >
            <option value="">All Roles</option>
            <option value="HR Admin">HR Admin</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Employee">Employee</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border-slate-200 bg-slate-100/50 dark:bg-darkBg py-2.5 px-4 text-sm dark:text-white border-0 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
          >
            <option value="">All Departments</option>
            {deptData?.departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-darkBorder/40"></div>
          ))}
        </div>
      ) : empData?.employees?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500">No employees match this query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {empData?.employees?.map((emp) => (
            <div
              key={emp._id}
              className="glass p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-darkBorder/10 hover:shadow-md transition-all duration-150 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.profileImage}
                    alt={emp.name}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-brand-500/10"
                  />
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-white truncate">{emp.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{emp.designation}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-400 uppercase tracking-wider font-bold text-[9px] mr-1">Email:</strong> {emp.email}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-400 uppercase tracking-wider font-bold text-[9px] mr-1">Dept:</strong> {emp.department?.name || 'Unassigned'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-400 uppercase tracking-wider font-bold text-[9px] mr-1">Role:</strong> {emp.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-darkBorder/10 pt-4 mt-5">
                <Link
                  to={`/employees/${emp._id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-600"
                >
                  View Profile
                  <ArrowRight size={14} />
                </Link>

                {isHrOrAdmin && emp._id !== currentUser._id && (
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {empData?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 dark:text-white"
          >
            Prev
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Page {page} of {empData.pagination.pages}
          </span>
          <button
            disabled={page === empData.pagination.pages}
            onClick={() => setPage(p => Math.min(empData.pagination.pages, p + 1))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 dark:text-white"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Employee Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg rounded-3xl p-6 border border-slate-200/50 dark:border-darkBorder/30 shadow-2xl relative">
            <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Create New Employee</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Temporary Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="HR Admin">HR Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  >
                    <option value="">Select Department</option>
                    {deptData?.departments?.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Job Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Annual Salary ($)</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition mt-4"
              >
                {isCreating ? 'Creating Profile...' : 'Save Employee'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
export const X = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
