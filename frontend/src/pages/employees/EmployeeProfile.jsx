import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetEmployeeByIdQuery,
  useUpdateEmployeeMutation,
} from '../../redux/api/employeeApi';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Building,
  Calendar,
  Award,
  Shield,
  FileText,
  Edit,
  Save,
  X,
  ArrowLeft,
} from 'lucide-react';

const EmployeeProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);

  const { data, isLoading } = useGetEmployeeByIdQuery(id);
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();

  const employee = data?.employee;

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  const startEdit = () => {
    if (employee) {
      setPhone(employee.phone || '');
      setSkills(employee.skills ? employee.skills.join(', ') : '');
      setEmergencyName(employee.emergencyContact?.name || '');
      setEmergencyPhone(employee.emergencyContact?.phone || '');
      setEmergencyRelation(employee.emergencyContact?.relation || '');
      setIsEditing(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('skills', JSON.stringify(skills.split(',').map((s) => s.trim())));
    formData.append(
      'emergencyContact',
      JSON.stringify({ name: emergencyName, phone: emergencyPhone, relation: emergencyRelation })
    );

    try {
      await updateEmployee({ id, formData }).unwrap();
      setIsEditing(false);
    } catch (err) {
      alert(err.data?.message || 'Failed to update profile.');
    }
  };

  const canEdit =
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'HR Admin' ||
    currentUser?._id === id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-darkBorder/40"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Employee profile not found.</p>
        <Link to="/employees" className="text-brand-500 text-sm font-semibold mt-2 inline-block">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Link */}
      <div>
        <Link to="/employees" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400">
          <ArrowLeft size={16} />
          Back to Employees
        </Link>
      </div>

      {/* Header Banner Card */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={employee.profileImage}
            alt={employee.name}
            className="h-24 w-24 rounded-2xl object-cover ring-4 ring-brand-500/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">{employee.name}</h1>
              <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-500">
                {employee.role}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">{employee.designation}</p>
            <p className="text-xs text-slate-400">
              Department: <strong className="text-slate-600 dark:text-slate-300">{employee.department?.name || 'Unassigned'}</strong>
            </p>
          </div>
        </div>

        {canEdit && !isEditing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-darkBorder/40 dark:hover:bg-darkBorder/60 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-white transition"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Info Details Grid */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="glass p-6 rounded-2xl space-y-4 border border-slate-200/50 dark:border-darkBorder/10 md:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-darkBorder/10 pb-3">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  {employee.email}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone Number</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  {employee.phone || 'Not provided'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Joining Date</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  {new Date(employee.joiningDate).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Status</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Shield size={16} className="text-emerald-500" />
                  {employee.status}
                </p>
              </div>
            </div>

            {/* Skills Badges */}
            <div className="pt-4 border-t border-slate-100 dark:border-darkBorder/10">
              <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {employee.skills?.length > 0 ? (
                  employee.skills.map((skill, idx) => (
                    <span key={idx} className="rounded-lg bg-slate-100 dark:bg-darkBorder/40 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No skills listed yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact & Resume */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl space-y-4 border border-slate-200/50 dark:border-darkBorder/10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-darkBorder/10 pb-3">
                Emergency Contact
              </h3>
              {employee.emergencyContact?.name ? (
                <div className="space-y-2 text-sm">
                  <p className="font-bold text-slate-700 dark:text-slate-200">{employee.emergencyContact.name}</p>
                  <p className="text-xs text-slate-500">Relation: {employee.emergencyContact.relation}</p>
                  <p className="text-xs text-slate-500">Phone: {employee.emergencyContact.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No emergency details specified.</p>
              )}
            </div>

            {/* Resume Upload Link */}
            <div className="glass p-6 rounded-2xl space-y-3 border border-slate-200/50 dark:border-darkBorder/10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Documents</h3>
              {employee.resumeUrl ? (
                <a
                  href={employee.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-darkBorder/40 dark:hover:bg-darkBorder/60 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                >
                  <FileText size={18} className="text-brand-500" />
                  View Uploaded Resume
                </a>
              ) : (
                <p className="text-xs text-slate-400">No resume attached.</p>
              )}
            </div>

            {/* Payroll & Compensation Overview Card */}
            <div className="glass p-6 rounded-2xl space-y-4 border border-slate-200/50 dark:border-darkBorder/10">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder/10 pb-3">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Payroll Overview</h3>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500">
                  Active Salary
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-darkBorder/10">
                  <span className="text-slate-400 font-medium">Base Salary (Annual):</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">${(employee.salary || 85000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-darkBorder/10">
                  <span className="text-slate-400 font-medium">Monthly Gross:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">${Math.round((employee.salary || 85000) / 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-darkBorder/10">
                  <span className="text-slate-400 font-medium">Allowances (Housing & Transport):</span>
                  <span className="font-bold text-emerald-500">+$650</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-darkBorder/10">
                  <span className="text-slate-400 font-medium">Est. Deductions (Tax & Benefits):</span>
                  <span className="font-bold text-rose-400">-${Math.round((employee.salary || 85000) / 12 * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 pt-3 font-bold text-sm text-slate-800 dark:text-white border-t border-slate-200 dark:border-darkBorder/20">
                  <span>Net Monthly Salary:</span>
                  <span className="text-brand-500">${(Math.round((employee.salary || 85000) / 12) + 650 - Math.round((employee.salary || 85000) / 12 * 0.18)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkBorder/10 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Update Details</h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills (Comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, Project Management"
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              />
            </div>

            <div className="border-t border-slate-100 dark:border-darkBorder/10 pt-4 space-y-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Emergency Contact Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
                <input
                  type="text"
                  placeholder="Relation (e.g. Spouse)"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition mt-6"
            >
              <Save size={16} />
              {isUpdating ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
