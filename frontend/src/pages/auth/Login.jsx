import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../redux/api/authApi';
import { setCredentials } from '../../redux/slices/authSlice';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      if (response.success) {
        dispatch(setCredentials({ user: response.user, token: response.token }));
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      {/* Login Card */}
      <div className="glass w-full max-w-[440px] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-2xl mb-3 glow-blue">
            Z
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">ZenFlow</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Where Teams Work Better.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-950/30 bg-rose-950/20 p-4 text-sm text-rose-400">
            <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full rounded-xl bg-slate-950/40 border border-slate-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-blue-400 hover:text-purple-400">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl bg-slate-950/40 border border-slate-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-bold text-white hover:opacity-95 active:opacity-90 disabled:opacity-50 shadow-lg shadow-purple-600/20 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              'Sign In to ZenFlow'
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
            Create an Account / Sign Up
          </Link>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Demo Login Details:</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/30">
            <div>Admin: admin@workflowx.com / Admin123</div>
            <div>Dev: employee@workflowx.com / Employee123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
