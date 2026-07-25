import React, { useState } from 'react';
import { Building2, Save, Globe, Mail, Phone, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';

const CompanySettings = () => {
  const [saved, setSaved] = useState(false);
  const [companyName, setCompanyName] = useState('ZenFlow Enterprise Inc.');
  const [email, setEmail] = useState('contact@zenflow.com');
  const [phone, setPhone] = useState('+1 (800) 555-0199');
  const [address, setAddress] = useState('100 Technology Plaza, San Francisco, CA');
  const [website, setWebsite] = useState('https://zenflow.com');
  const [workingHours, setWorkingHours] = useState('09:00 AM - 06:00 PM (EST)');
  const [timezone, setTimezone] = useState('America/New_York (UTC-5)');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
            <Building2 className="text-brand-500" size={26} />
            Company Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage organization branding, contact details, working hours, and leave policies.
          </p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm font-bold text-emerald-500 border border-emerald-500/20">
          <CheckCircle2 size={18} />
          Company settings saved successfully!
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass p-6 rounded-2xl border border-slate-200/50 dark:border-darkBorder/10 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-darkBorder/10 pb-3">
            General Organization Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Headquarters Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-darkBorder/10 pb-3 pt-4">
            Workday & Timezone Schedules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Working Hours</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">System Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-2.5 px-4 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              >
                <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
                <option value="Europe/London (UTC+0)">Europe/London (UTC+0)</option>
                <option value="Asia/Kolkata (UTC+5:30)">Asia/Kolkata (UTC+5:30)</option>
                <option value="Asia/Tokyo (UTC+9)">Asia/Tokyo (UTC+9)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 hover:opacity-95 transition"
            >
              <Save size={18} />
              Save Company Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
