import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../redux/api/authApi';
import { Mail, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccess(false);

    try {
      const res = await forgotPassword({ email }).unwrap();
      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to request recovery link.');
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>

      <div className="glass w-full max-w-[440px] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-white/10">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition">
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">ZenFlow Recovery</h2>
          <p className="text-sm text-slate-400 mt-2">Enter your email and we'll send a ZenFlow password reset link.</p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/30 text-emerald-400">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-white">Check Your Email</h3>
            <p className="text-sm text-slate-400">
              We have dispatched a ZenFlow password recovery instruction list to <strong>{email}</strong>.
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-sm font-bold text-white hover:opacity-95 active:opacity-90 disabled:opacity-50 shadow-lg shadow-purple-600/20 transition-all mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                'Send Recovery Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
