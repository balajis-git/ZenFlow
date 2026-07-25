import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
} from '../../redux/api/projectApi';
import { useGetEmployeesQuery } from '../../redux/api/employeeApi';
import { FolderGit2, Plus, Calendar, DollarSign, ArrowRight, Trash2, X } from 'lucide-react';

const Projects = () => {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manager, setManager] = useState('');
  const [members, setMembers] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(10000);
  const [priority, setPriority] = useState('Medium');

  // Queries
  const { data: projData, isLoading } = useGetProjectsQuery();
  const { data: empData } = useGetEmployeesQuery({ limit: 100 });

  // Mutations
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject({
        name,
        description,
        manager: manager || user._id,
        members,
        startDate,
        endDate,
        budget,
        priority,
      }).unwrap();
      setIsOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      alert(err.data?.message || 'Failed to create project.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id).unwrap();
      } catch (err) {
        alert(err.data?.message || 'Failed to delete project.');
      }
    }
  };

  const canManage = user?.role === 'Super Admin' || user?.role === 'HR Admin' || user?.role === 'Project Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Projects Dashboard</h1>
          <p className="text-sm text-slate-500">Monitor active projects, assign teams, track budgets, and manage deadlines.</p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 transition"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-200 dark:bg-darkBorder/40"></div>
          ))}
        </div>
      ) : projData?.projects?.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500">No active projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projData?.projects?.map((project) => (
            <div
              key={project._id}
              className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      project.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-500'
                        : project.priority === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {project.priority} Priority
                  </span>

                  {canManage && (
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">{project.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{project.description || 'No description provided.'}</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-brand-500 font-bold">{project.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${project.progress || 0}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-darkBorder/10 pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(project.startDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                    <DollarSign size={14} />
                    {project.budget ? project.budget.toLocaleString() : '0'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Members avatars */}
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members?.slice(0, 4).map((m) => (
                      <img
                        key={m._id}
                        src={m.profileImage}
                        alt={m.name}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-darkCard object-cover"
                      />
                    ))}
                    {project.members?.length > 4 && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                        +{project.members.length - 4}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:text-brand-600"
                  >
                    Details
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg rounded-3xl p-6 border border-slate-200/50 dark:border-darkBorder/30 shadow-2xl relative">
            <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Create New Project</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. WorkFlowX SaaS Redesign"
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project scope and goals..."
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Manager</label>
                  <select
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  >
                    <option value="">Select Manager</option>
                    {empData?.employees?.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition mt-4"
              >
                {isCreating ? 'Saving...' : 'Save Project'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
