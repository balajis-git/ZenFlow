import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLoginMutation } from '../../redux/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      }).unwrap();

      dispatch(setCredentials(res));

      const targetPath = getRoleDashboardPath(res.user?.role);
      navigate(targetPath);
    } catch (err) {
      setErrorMsg(err.data?.message || 'Invalid email or password. Please try again.');
    }
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
                placeholder="you@company.com"
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

        {/* Divider & Create Employee Account Button */}
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
      </div>
    </div>
  );
};

export default Login;
