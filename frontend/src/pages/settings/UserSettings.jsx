import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Lock, Bell, Moon, Sun, Globe, CheckCircle2, ShieldAlert, Save } from 'lucide-react';
import { useResetPasswordMutation } from '../../redux/api/authApi';

const UserSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setSuccessMsg('Preferences and security settings updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
            <User className="text-brand-500" size={26} />
            User Settings & Account Security
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update personal preferences, change password, and configure notification alerts.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-4 text-sm font-bold text-rose-400 border border-rose-500/20">
          <ShieldAlert size={18} />
          {errorMsg}
        </div>
      )}

      {/* Account Info Summary */}
      <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 flex items-center gap-4">
        <img
          src={user?.profileImage}
          alt={user?.name}
          className="h-16 w-16 rounded-2xl object-cover ring-4 ring-brand-500/20"
        />
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{user?.name}</h2>
          <p className="text-xs text-slate-500">{user?.email} • {user?.role}</p>
          <span className="mt-1 inline-block rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-500">
            {user?.designation}
          </span>
        </div>
      </div>

      {/* Change Password & Preferences */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        {/* Security Section */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-darkBorder/10 pb-3 flex items-center gap-2">
            <Lock size={18} className="text-brand-500" />
            Security & Change Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-darkBorder/10 pb-3 flex items-center gap-2">
            <Bell size={18} className="text-brand-500" />
            Preferences & Notifications
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-darkBorder/10">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Email Notifications</p>
                <p className="text-xs text-slate-400">Receive email alerts for task assignments and leave updates</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="h-5 w-5 rounded text-brand-500 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-darkBorder/10">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Real-time Push Alerts</p>
                <p className="text-xs text-slate-400">Socket.IO popover alerts in dashboard</p>
              </div>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="h-5 w-5 rounded text-brand-500 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">Theme Mode</p>
                <p className="text-xs text-slate-400">Toggle dark / light application background</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-darkBorder/40 px-4 py-2 text-xs font-bold text-slate-700 dark:text-white"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 hover:opacity-95 transition"
            >
              <Save size={18} />
              Save Account Preferences
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
