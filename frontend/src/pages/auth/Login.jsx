import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../../redux/api/authApi';
import { useGetDepartmentsQuery } from '../../redux/api/departmentApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import { ShieldCheck, Mail, Lock, User, Phone, Briefcase, Building2, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'

  // LOGIN FORM STATE
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('Super Admin');

  // SIGNUP FORM STATE
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [skills, setSkills] = useState('');
  const [signupRole, setSignupRole] = useState('Employee');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ALERTS
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // API MUTATIONS
  const [loginUser, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const { data: deptData } = useGetDepartmentsQuery();

  const departments = deptData?.departments || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Role Redirection Map
  const getRoleDashboardPath = (role) => {
    switch (role) {
      case 'Super Admin':
        return '/admin/dashboard';
      case 'HR Admin':
        return '/hr/dashboard';
      case 'Project Manager':
        return '/manager/dashboard';
      case 'Employee':
        return '/employee/dashboard';
      default:
        return '/';
    }
  };

  // HANDLE LOGIN SUBMIT
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginUser({
        email: loginEmail,
        password: loginPassword,
        role: loginRole,
      }).unwrap();

      dispatch(setCredentials(res));

      const targetPath = getRoleDashboardPath(res.user?.role || loginRole);
      navigate(targetPath);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  // HANDLE SIGNUP SUBMIT
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (signupPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Phone Validation: 10 digits
    const cleanPhone = phone.replace(/\D/g, '');
    if (phone && cleanPhone.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const res = await registerUser({
        name,
        employeeId: employeeId || undefined,
        email: signupEmail,
        phone: cleanPhone,
        department: department || undefined,
        designation: designation || undefined,
        skills: skills ? skills.split(',').map((s) => s.trim()) : [],
        role: signupRole,
        password: signupPassword,
        confirmPassword,
      }).unwrap();

      setSuccessMsg('Account created successfully! Redirecting...');
      dispatch(setCredentials(res));

      setTimeout(() => {
        const targetPath = getRoleDashboardPath(res.user?.role || signupRole);
        navigate(targetPath);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Registration failed. Please try again.');
    }
  };

  // DEMO ACCOUNT QUICK SELECT
  const fillDemoAccount = (roleName, emailStr, passStr) => {
    setActiveTab('login');
    setLoginRole(roleName);
    setLoginEmail(emailStr);
    setLoginPassword(passStr);
    setErrorMsg('');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Dynamic Background Glow FX */}
      <div className="absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-lg space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl transition-all">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-purple-600 to-cyan-500 shadow-xl shadow-brand-500/30">
            <span className="text-3xl font-black text-white tracking-tighter">Z</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">ZENFLOW</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Where Teams Work Better</p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'signup'
                ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 font-medium">
            {successMsg}
          </div>
        )}

        {/* LOGIN TAB CONTENT */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-brand-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Role Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Select Role</label>
              <div className="relative">
                <UserCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Super Admin">▼ Super Admin</option>
                  <option value="HR Admin">▼ HR Admin</option>
                  <option value="Project Manager">▼ Project Manager</option>
                  <option value="Employee">▼ Employee</option>
                </select>
              </div>
            </div>

            {/* Submit Login Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 mt-6"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Login <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* SIGNUP TAB CONTENT */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            {/* Full Name & Employee ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="EMP-1001"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Phone (10 digits)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Department & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
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
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Software Dev"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Skills & Role Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node, Mongo"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Role Dropdown</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="Super Admin">▼ Super Admin</option>
                  <option value="HR Admin">▼ HR Admin</option>
                  <option value="Project Manager">▼ Project Manager</option>
                  <option value="Employee">▼ Employee</option>
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Create Account Button */}
            <button
              type="submit"
              disabled={isRegistering}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition-all hover:opacity-90 focus:outline-none disabled:opacity-50 mt-4"
            >
              {isRegistering ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs font-semibold text-slate-400 hover:text-white underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Demo Quick Accounts Bar */}
        <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Demo One-Click Fill</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('Super Admin', 'admin@workflowx.com', 'Admin123')}
              className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-brand-400 hover:bg-brand-500/10 transition-all"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('HR Admin', 'hr@workflowx.com', 'Hradmin123')}
              className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-purple-400 hover:bg-purple-500/10 transition-all"
            >
              HR Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('Project Manager', 'pm@workflowx.com', 'Project123')}
              className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/10 transition-all"
            >
              PM
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('Employee', 'employee@workflowx.com', 'Employee123')}
              className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
