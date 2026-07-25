import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../../redux/api/authApi';
import { useGetDepartmentsQuery } from '../../redux/api/departmentApi';
import { useDispatch } from 'react-redux';
import { ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [skills, setSkills] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [registerUser, { isLoading }] = useRegisterMutation();
  const { data: deptData } = useGetDepartmentsQuery();
  const departments = deptData?.departments || [];

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (phone && cleanPhone.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      await registerUser({
        name,
        employeeId: employeeId || undefined,
        email,
        phone: cleanPhone,
        department: department || undefined,
        designation: designation || undefined,
        skills: skills ? skills.split(',').map((s) => s.trim()) : [],
        role: 'Employee', // Automatically set to Employee
        password,
        confirmPassword,
      }).unwrap();

      setSuccessMsg('Employee account created successfully. Please login using your Email and Password.');

      setTimeout(() => {
        navigate('/login', {
          state: {
            successNotice: 'Employee account created successfully. Please login using your Email and Password.',
          },
        });
      }, 1500);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Background Glow FX */}
      <div className="absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-xl space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl transition-all">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-purple-600 to-cyan-500 shadow-xl shadow-brand-500/30">
            <span className="text-3xl font-black text-white tracking-tighter">Z</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">ZENFLOW</h1>
          <p className="text-sm font-bold text-slate-300">Create Employee Account</p>
          <p className="text-xs text-slate-500">Employee Registration System</p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 font-medium text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Employee ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-1005"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Phone Number (10 digits)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Software Engineer"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Skills (Comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, Express, MongoDB"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition-all hover:opacity-90 focus:outline-none disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating Employee Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Employee Account <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
