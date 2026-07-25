import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  CheckSquare,
  Clock,
  CalendarRange,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Building2,
  Search,
  Activity,
  UserCheck,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { useGetTodayStatusQuery, useClockInMutation, useClockOutMutation } from '../redux/api/attendanceApi';
import io from 'socket.io-client';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [socket, setSocket] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Clock API Hooks
  const { data: attendanceData } = useGetTodayStatusQuery();
  const [clockIn] = useClockInMutation();
  const [clockOut] = useClockOutMutation();

  const isClockedIn = attendanceData?.attendance && !attendanceData.attendance.clockOut;

  // Toggle theme
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Websocket notifications integration
  useEffect(() => {
    if (user?._id) {
      const socketClient = io(window.location.origin);
      socketClient.emit('setup', user._id);

      socketClient.on('notificationReceived', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
      });

      setSocket(socketClient);
      return () => socketClient.disconnect();
    }
  }, [user?._id]);

  // Sidebar Links based on role permissions
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Employees', path: '/employees', icon: Users, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Registration Requests', path: '/registration-requests', icon: UserCheck, roles: ['Super Admin', 'HR Admin'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['Super Admin', 'HR Admin'] },
    { name: 'Projects', path: '/projects', icon: FolderGit2, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Tasks & Kanban', path: '/tasks', icon: CheckSquare, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Attendance', path: '/attendance', icon: Clock, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Leaves', path: '/leaves', icon: CalendarRange, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Calendar', path: '/calendar', icon: CalendarRange, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Chat', path: '/chat', icon: MessageSquare, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Audit Logs', path: '/activity-logs', icon: Activity, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Company Settings', path: '/settings/company', icon: Building2, roles: ['Super Admin', 'HR Admin'] },
    { name: 'My Settings', path: '/settings/profile', icon: Users, roles: ['Super Admin', 'HR Admin', 'Project Manager', 'Employee'] },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, roles: ['Super Admin', 'HR Admin', 'Project Manager'] },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-darkBg transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/50 bg-white/80 dark:bg-darkCard/80 dark:border-darkBorder/40 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 dark:border-darkBorder/40">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-xl glow-blue">
              Z
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                ZenFlow
              </span>
            </div>
          </Link>
          <button className="p-1 lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-purple-600/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-darkBorder/40'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card info & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-darkBorder/40">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-darkBg/60 border border-slate-100 dark:border-darkBorder/20">
            <img
              src={user?.profileImage}
              alt={user?.name}
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-blue-600/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.designation}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/30 px-4 py-2.5 text-[14px] font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-slate-200/50 bg-white/80 dark:bg-darkCard/80 dark:border-darkBorder/40 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <button
              className="p-1 lg:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            {/* Global Search Bar */}
            <div className="relative hidden md:block w-64 lg:w-80">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Global Search (Employees, Projects, Tasks)..."
                onClick={() => navigate('/employees')}
                className="w-full rounded-xl bg-slate-100 dark:bg-darkBg/60 border border-slate-200/50 dark:border-darkBorder/40 py-2 pl-10 pr-4 text-xs dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/20 cursor-pointer transition-all"
              />
            </div>

            {/* Quick Attendance Clocking Status */}
            <div className="hidden sm:flex items-center gap-3">
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`}></span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {isClockedIn ? 'Active Workday' : 'Not Clocked In'}
              </span>
              {isClockedIn ? (
                <button
                  onClick={() => clockOut()}
                  className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 transition"
                >
                  Clock Out
                </button>
              ) : (
                <button
                  onClick={() => clockIn()}
                  className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition"
                >
                  Clock In
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-darkBorder/40"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-darkBorder/40 relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200/50 bg-white dark:bg-darkCard dark:border-darkBorder/40 shadow-xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-darkBorder/40 pb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    <button
                      className="text-xs text-blue-600 hover:underline font-semibold"
                      onClick={() => setNotifications([])}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-6 dark:text-slate-400">All caught up!</p>
                    ) : (
                      notifications.map((notif, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setNotificationsOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-darkBorder/20 border border-slate-100/50 dark:border-darkBorder/20 cursor-pointer"
                        >
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile image quick link */}
            <Link to={`/employees/${user?._id}`}>
              <img
                src={user?.profileImage}
                alt="Profile"
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-purple-600/30"
              />
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
