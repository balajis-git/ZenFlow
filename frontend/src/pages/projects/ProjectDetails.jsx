import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetProjectByIdQuery,
  useUploadProjectAttachmentMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
} from '../../redux/api/projectApi';
import { useGetTasksByProjectQuery } from '../../redux/api/taskApi';
import {
  FolderGit2,
  Calendar,
  DollarSign,
  Users,
  Paperclip,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Plus,
  Send,
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('tasks');
  const [commentText, setCommentText] = useState('');

  // Queries
  const { data: projData, isLoading } = useGetProjectByIdQuery(id);
  const { data: taskData } = useGetTasksByProjectQuery(id);
  const { data: commentData } = useGetCommentsQuery({ entityType: 'Project', entityId: id });

  // Mutations
  const [uploadAttachment, { isLoading: isUploading }] = useUploadProjectAttachmentMutation();
  const [addComment, { isLoading: isSubmittingComment }] = useAddCommentMutation();

  const project = projData?.project;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('attachment', file);

    try {
      await uploadAttachment({ id, formData }).unwrap();
    } catch (err) {
      alert(err.data?.message || 'File upload failed.');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({ entityType: 'Project', entityId: id, content: commentText }).unwrap();
      setCommentText('');
    } catch (err) {
      alert(err.data?.message || 'Failed to post comment.');
    }
  };

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-darkBorder/40"></div>;
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project details not found.</p>
        <Link to="/projects" className="text-brand-500 font-semibold text-sm">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Link */}
      <div>
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
      </div>

      {/* Header Banner */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{project.name}</h1>
              <span className="rounded-full bg-brand-500/10 px-3 py-0.5 text-xs font-bold text-brand-500">
                {project.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">{project.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Manager:</span>
            <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-darkBg p-1.5 px-3 rounded-xl border border-slate-200/40">
              <img
                src={project.manager?.profileImage}
                alt={project.manager?.name}
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{project.manager?.name}</span>
            </div>
          </div>
        </div>

        {/* Details Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-darkBorder/10 pt-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Start Date</span>
            <p className="font-semibold text-slate-700 dark:text-slate-200">{new Date(project.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Deadline</span>
            <p className="font-semibold text-slate-700 dark:text-slate-200">{new Date(project.endDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Budget</span>
            <p className="font-semibold text-slate-700 dark:text-slate-200">${project.budget ? project.budget.toLocaleString() : '0'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Overall Progress</span>
            <p className="font-bold text-brand-500">{project.progress || 0}%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-darkBorder/40 gap-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'tasks'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Tasks ({taskData?.tasks?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'comments'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Discussion ({commentData?.comments?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('attachments')}
          className={`pb-3 text-sm font-bold transition border-b-2 ${
            activeTab === 'attachments'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Attachments ({project.attachments?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Project Tasks</h3>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:underline"
            >
              Open Kanban Board
            </Link>
          </div>

          <div className="glass rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 divide-y divide-slate-100 dark:divide-darkBorder/10">
            {taskData?.tasks?.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-10">No tasks created for this project yet.</p>
            ) : (
              taskData?.tasks?.map((t) => (
                <div key={t._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-darkBorder/10">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{t.title}</h4>
                    <p className="text-xs text-slate-500 truncate">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'
                      }`}
                    >
                      {t.status}
                    </span>
                    {t.assignedTo && (
                      <img
                        src={t.assignedTo.profileImage}
                        alt={t.assignedTo.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-6">
          {/* Post Form */}
          <form onSubmit={handlePostComment} className="flex gap-3">
            <input
              type="text"
              placeholder="Post a comment or update..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-3 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-md transition flex items-center gap-2"
            >
              <Send size={16} />
              Post
            </button>
          </form>

          {/* List */}
          <div className="space-y-4">
            {commentData?.comments?.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-10">No comments posted yet.</p>
            ) : (
              commentData?.comments?.map((c) => (
                <div key={c._id} className="glass p-4 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 flex items-start gap-3">
                  <img src={c.user?.profileImage} alt={c.user?.name} className="h-8 w-8 rounded-full object-cover" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{c.user?.name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Project Files</h3>
            <label className="cursor-pointer rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center gap-2">
              <Paperclip size={14} />
              {isUploading ? 'Uploading...' : 'Upload Attachment'}
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {project.attachments?.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-10 col-span-3">No attachments uploaded yet.</p>
            ) : (
              project.attachments?.map((att, i) => (
                <a
                  key={i}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass p-4 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 flex items-center gap-3 hover:shadow-md transition"
                >
                  <Paperclip size={20} className="text-brand-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{att.fileName}</p>
                    <p className="text-[10px] text-slate-400">{new Date(att.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
