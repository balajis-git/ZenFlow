import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLoginMutation } from '../../redux/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import { Mail, Lock, UserCheck, ArrowRight, UserPlus } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Super Admin');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.successNotice) {
      setSuccessMsg(location.state.successNotice);
    }
  }, [location.state]);

  const getRoleDashboardPath = (roleName) => {
    switch (roleName) {
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginUser({
        email,
        password,
        role,
      }).unwrap();

      dispatch(setCredentials(res));

      const targetPath = getRoleDashboardPath(res.user?.role || role);
      navigate(targetPath);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Invalid email, password, or role selection.');
    }
  };

  const fillDemoAccount = (roleName, demoEmail, demoPass) => {
    setRole(roleName);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Background Glow FX */}
      <div className="absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-brand-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-md space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl transition-all">
        {/* ZenFlow Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-purple-600 to-cyan-500 shadow-xl shadow-brand-500/30">
            <span className="text-3xl font-black text-white tracking-tighter">Z</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">ZENFLOW</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Where Teams Work Better</p>
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

        {/* LOGIN FORM */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zenflow.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Password */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Role</label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="Super Admin">▼ Super Admin</option>
                <option value="HR Admin">▼ HR Admin</option>
                <option value="Project Manager">▼ Project Manager</option>
                <option value="Employee">▼ Employee</option>
              </select>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/25 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 mt-6"
          >
            {isLoading ? (
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

        {/* Divider & Create Employee Account Link */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800/80"></div>
          </div>
          <div className="relative inline-block bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            New Employee?
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/register')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all shadow-sm"
        >
          <UserPlus size={15} className="text-brand-400" /> Create Employee Account
        </button>

        {/* Quick System Credentials Bar */}
        <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Default Admin Quick Fill</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('Super Admin', 'admin@zenflow.com', 'Admin@123')}
              className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-brand-400 hover:bg-brand-500/10 transition-all"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('HR Admin', 'hr@zenflow.com', 'HR@123')}
              className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-purple-400 hover:bg-purple-500/10 transition-all"
            >
              HR Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('Project Manager', 'pm@zenflow.com', 'PM@123')}
              className="px-2 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/10 transition-all"
            >
              PM
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('Employee', 'employee@zenflow.com', 'Employee@123')}
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
