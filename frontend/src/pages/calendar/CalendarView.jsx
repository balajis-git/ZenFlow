import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Award, Users, CheckCircle2 } from 'lucide-react';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Events Data Mapping
  const events = [
    { day: 4, title: 'Independence Day Holiday', type: 'holiday', badge: 'Company Holiday' },
    { day: 10, title: 'Figma Wireframe Deadline', type: 'deadline', badge: 'Task Deadline' },
    { day: 15, title: 'Jane Smith - Medical Leave', type: 'leave', badge: 'Approved Leave' },
    { day: 20, title: 'Q3 Enterprise All-Hands Meeting', type: 'event', badge: 'Company Event' },
    { day: 30, title: 'ZenFlow Platform Release', type: 'deadline', badge: 'Project Deadline' },
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="text-brand-500" size={26} />
            Enterprise Calendar & Events Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consolidated timeline for project deadlines, approved leaves, company holidays, and team meetings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200 dark:hover:bg-darkBorder/60 text-slate-700 dark:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-base font-extrabold text-slate-800 dark:text-white min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-100 dark:bg-darkBorder/40 hover:bg-slate-200 dark:hover:bg-darkBorder/60 text-slate-700 dark:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 space-y-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-darkBorder/10 pb-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 rounded-2xl bg-slate-50/50 dark:bg-darkBg/20 opacity-30"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = events.filter((e) => e.day === dayNum);

            return (
              <div
                key={dayNum}
                className="h-28 rounded-2xl bg-white/70 dark:bg-darkCard/50 border border-slate-100 dark:border-darkBorder/20 p-2 overflow-y-auto hover:border-brand-500/40 transition"
              >
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{dayNum}</span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((evt, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 rounded-lg text-[10px] font-bold ${
                        evt.type === 'holiday'
                          ? 'bg-rose-500/10 text-rose-500'
                          : evt.type === 'deadline'
                          ? 'bg-purple-500/10 text-purple-500'
                          : evt.type === 'leave'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      <p className="truncate">{evt.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
