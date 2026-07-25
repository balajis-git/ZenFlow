import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../../redux/api/authApi';
import { Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!token) {
      setErrorMsg('Missing validation token from query params.');
      return;
    }

    try {
      const res = await resetPassword({ token, newPassword }).unwrap();
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'Password update failed. The token may be expired.');
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      <div className="glass w-full max-w-[440px] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create New Password</h2>
          <p className="text-sm text-slate-400 mt-2">Secure your ZenFlow workspace account credentials.</p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/30 text-emerald-400">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">Password Updated!</h3>
            <p className="text-sm text-slate-400">
              Redirecting you to the ZenFlow Sign In panel in a few moments...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-955/30 bg-rose-955/20 p-4 text-sm text-rose-400">
                <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-slate-950/40 border border-slate-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-slate-950/40 border border-slate-800 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-bold text-white hover:opacity-95 active:opacity-90 disabled:opacity-50 shadow-lg shadow-purple-600/20 transition-all mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                'Save Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
