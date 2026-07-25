import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, RoleRoute } from './guards';

// Layouts
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));

// Guest Views
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Authenticated Views
const Dashboard = lazy(() => import('../pages/Dashboard'));
const EmployeeDirectory = lazy(() => import('../pages/employees/EmployeeDirectory'));
const EmployeeProfile = lazy(() => import('../pages/employees/EmployeeProfile'));
const PendingRegistrations = lazy(() => import('../pages/employees/PendingRegistrations'));
const Departments = lazy(() => import('../pages/departments/Departments'));
const Projects = lazy(() => import('../pages/projects/Projects'));
const ProjectDetails = lazy(() => import('../pages/projects/ProjectDetails'));
const Tasks = lazy(() => import('../pages/tasks/Tasks'));
const Attendance = lazy(() => import('../pages/attendance/Attendance'));
const Leaves = lazy(() => import('../pages/leaves/Leaves'));
const Chat = lazy(() => import('../pages/chat/Chat'));
const Reports = lazy(() => import('../pages/reports/Reports'));
const ActivityLogs = lazy(() => import('../pages/activity/ActivityLogs'));
const CompanySettings = lazy(() => import('../pages/settings/CompanySettings'));
const UserSettings = lazy(() => import('../pages/settings/UserSettings'));
const CalendarView = lazy(() => import('../pages/calendar/CalendarView'));

const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-darkBg">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Guest Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Private Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Employee Directory & Registration Requests */}
            <Route path="/employees" element={<EmployeeDirectory />} />
            <Route path="/employees/:id" element={<EmployeeProfile />} />
            <Route
              path="/registration-requests"
              element={
                <RoleRoute roles={['Super Admin', 'HR Admin']}>
                  <PendingRegistrations />
                </RoleRoute>
              }
            />
            
            {/* Departments: HR Admin and Super Admin can manage */}
            <Route path="/departments" element={<Departments />} />
            
            {/* Projects & Details */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            
            {/* Tasks / Kanban */}
            <Route path="/tasks" element={<Tasks />} />
            
            {/* Attendance tracking */}
            <Route path="/attendance" element={<Attendance />} />
            
            {/* Leaves manager */}
            <Route path="/leaves" element={<Leaves />} />
            
            {/* Real-time socket chat room */}
            <Route path="/chat" element={<Chat />} />

            {/* Calendar & Audit Logs */}
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/settings/profile" element={<UserSettings />} />
            <Route path="/settings/company" element={<CompanySettings />} />

            {/* Excel / PDF reports generation: Admin, HR, PM */}
            <Route element={<RoleRoute allowedRoles={['Super Admin', 'HR Admin', 'Project Manager']} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
