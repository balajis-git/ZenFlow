import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
} from '../../redux/api/departmentApi';
import { useGetEmployeesQuery } from '../../redux/api/employeeApi';
import { Building2, Plus, Users, Trash2, X } from 'lucide-react';

const Departments = () => {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manager, setManager] = useState('');

  // Queries
  const { data: deptData, isLoading } = useGetDepartmentsQuery();
  const { data: empData } = useGetEmployeesQuery({ limit: 100 });

  // Mutations
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createDepartment({ name, description, manager: manager || null }).unwrap();
      setIsOpen(false);
      setName('');
      setDescription('');
      setManager('');
    } catch (err) {
      alert(err.data?.message || 'Failed to create department.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department? Associated employees will be unassigned.')) {
      try {
        await deleteDepartment(id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete department.');
      }
    }
  };

  const isHrOrAdmin = user?.role === 'Super Admin' || user?.role === 'HR Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Departments</h1>
          <p className="text-sm text-slate-500">Configure organizational units, team structures, and leadership roles.</p>
        </div>

        {isHrOrAdmin && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 transition"
          >
            <Plus size={16} />
            Create Department
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200 dark:bg-darkBorder/40"></div>
          ))}
        </div>
      ) : deptData?.departments?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500">No departments configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deptData?.departments?.map((dept) => (
            <div
              key={dept._id}
              className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                      <Building2 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{dept.name}</h3>
                  </div>

                  {isHrOrAdmin && (
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{dept.description || 'No description provided.'}</p>
              </div>

              <div className="border-t border-slate-100 dark:border-darkBorder/10 pt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {dept.manager ? (
                    <>
                      <img
                        src={dept.manager.profileImage}
                        alt={dept.manager.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{dept.manager.name}</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-medium">No Lead Assigned</span>
                  )}
                </div>

                <span className="flex items-center gap-1 font-bold text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-full">
                  <Users size={12} />
                  {dept.employeesCount || 0} Members
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-3xl p-6 border border-slate-200/50 dark:border-darkBorder/30 shadow-2xl relative">
            <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">New Department</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of duties..."
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Department Lead / Manager</label>
                <select
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                >
                  <option value="">Select Lead</option>
                  {empData?.employees?.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition mt-4"
              >
                {isCreating ? 'Saving...' : 'Create Department'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
