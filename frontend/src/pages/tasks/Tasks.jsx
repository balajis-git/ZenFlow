import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetTasksByProjectQuery,
  useUpdateTaskStatusMutation,
  useCreateTaskMutation,
} from '../../redux/api/taskApi';
import { useGetProjectsQuery } from '../../redux/api/projectApi';
import { useGetEmployeesQuery } from '../../redux/api/employeeApi';
import { Plus, Calendar, Clock, CheckSquare, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const COLUMNS = ['Backlog', 'To Do', 'In Progress', 'Testing', 'Completed'];

const Tasks = () => {
  const { user } = useSelector((state) => state.auth);

  const [selectedProject, setSelectedProject] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [estimatedTime, setEstimatedTime] = useState(8);

  // Queries
  const { data: projData } = useGetProjectsQuery();
  const activeProjectId = selectedProject || (projData?.projects?.length > 0 ? projData.projects[0]._id : '');

  const { data: taskData, isLoading } = useGetTasksByProjectQuery(activeProjectId, {
    skip: !activeProjectId,
  });
  const { data: empData } = useGetEmployeesQuery({ limit: 100 });

  // Mutations
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await updateTaskStatus({ id: taskId, status: targetStatus }).unwrap();
      
      // If task is completed, trigger celebratory confetti!
      if (targetStatus === 'Completed') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err) {
      alert(err.data?.message || 'Failed to update task status.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!activeProjectId) {
      alert('Please select or create a project first.');
      return;
    }

    try {
      await createTask({
        title,
        description,
        project: activeProjectId,
        assignedTo: assignedTo || null,
        deadline,
        priority,
        estimatedTime,
      }).unwrap();

      setIsOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert(err.data?.message || 'Failed to create task.');
    }
  };

  const canManage = user?.role === 'Super Admin' || user?.role === 'HR Admin' || user?.role === 'Project Manager';

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Kanban Board</h1>
          <p className="text-sm text-slate-500">Drag and drop cards across columns to update workflow statuses in real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Selector */}
          <select
            value={activeProjectId}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-xl border-slate-200 bg-white dark:bg-darkCard py-2.5 px-4 text-sm font-semibold dark:text-white border border-slate-200/50 dark:border-darkBorder/20 focus:outline-none"
          >
            {projData?.projects?.map((p) => (
              <option key={p._id} value={p._id}>
                Project: {p.name}
              </option>
            ))}
          </select>

          {canManage && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 transition"
            >
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = taskData?.tasks?.filter((t) => t.status === col) || [];

          return (
            <div
              key={col}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
              className="glass p-3.5 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 kanban-column flex flex-col gap-3 min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100 dark:border-darkBorder/10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {col}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/60 dark:bg-darkBorder/40 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {colTasks.map((t) => (
                  <div
                    key={t._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t._id)}
                    className="p-4 rounded-xl bg-white dark:bg-darkCard border border-slate-200/60 dark:border-darkBorder/40 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          t.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-500'
                            : t.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2">{t.title}</h4>
                    {t.description && <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>}

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-darkBorder/10 pt-2.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(t.deadline).toLocaleDateString()}
                      </span>

                      {t.assignedTo && (
                        <img
                          src={t.assignedTo.profileImage}
                          alt={t.assignedTo.name}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-3xl p-6 border border-slate-200/50 dark:border-darkBorder/30 shadow-2xl relative">
            <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-600" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Create New Task</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement OAuth Flow"
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assign To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  >
                    <option value="">Unassigned</option>
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
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated (Hours)</label>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition mt-4"
              >
                {isCreating ? 'Creating Task...' : 'Save Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
