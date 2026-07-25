# ZenFlow - Enterprise Workforce Management & Project Collaboration Platform

> **"Where Teams Work Better."**  
> *Empowering Modern Workplaces.*

![ZenFlow Platform](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=400&q=80)

ZenFlow is a commercial-grade Enterprise Workforce Management and Project Collaboration Platform engineered using the MERN Stack (MongoDB Atlas, Express.js, React 19, Node.js). ZenFlow unifies employee records, department structures, project tracking, Kanban drag-and-drop boards, attendance clocking, leave request workflows, payroll breakdowns, real-time Socket.IO chat, automated Excel/PDF analytics reporting, and system audit logs within a calm, dark-mode-enabled glassmorphic dashboard.

---

## 🏗️ System Architecture & Diagram Specifications

```
+-----------------------------------------------------------------------------------+
|                                  ZENFLOW CLIENT                                   |
|               (React 19 + Vite + Redux Toolkit + RTK Query + Tailwind)            |
+-----------------------------------------------------------------------------------+
                                         │
                   REST APIs (HTTP/S)    │    Socket.IO (WSS)
                                         ▼
+-----------------------------------------------------------------------------------+
|                                 ZENFLOW EXPRESS API                               |
|        (Node.js + Express + Helmet + Morgan + JWT Auth + Express Validator)       |
+-----------------------------------------------------------------------------------+
         │                               │                               │
         ▼                               ▼                               ▼
+-----------------+             +-----------------+             +-----------------+
|  MONGODB ATLAS  |             | SOCKET.IO ROOMS |             | EXPORTS / MAIL  |
|  (Mongoose ODM) |             |  (Realtime Chat)|             | (ExcelJS / PDF) |
+-----------------+             +-----------------+             +-----------------+
```

### Entity Relationship (ER) Diagram Description
1. **User (Employee)**: Primary entity storing hashed passwords (`bcrypt`), role (`Super Admin`, `HR Admin`, `Project Manager`, `Employee`), skills, salary, joining date, and emergency contacts. Referenced by Department (`manager`), Project (`manager`, `members`), Task (`assignedTo`), Attendance (`user`), Leave (`user`), Chat (`participants`), and ActivityLog (`user`).
2. **Department**: Linked to `User` lead manager; tracks departmental employee count aggregations.
3. **Project**: Linked to `User` project manager and array of `User` members; tracks timelines, budget, priority, status, and progress percentages.
4. **Task**: Belongs to `Project`; assigned to `User`; stores Kanban status (`Backlog`, `To Do`, `In Progress`, `Testing`, `Completed`), estimated vs. actual hours, labels, tags, and dependencies (`Task` refs).
5. **Attendance**: Belongs to `User`; stores clock-in/out timestamps, break arrays, working hours computation, and late entry status.
6. **Leave**: Belongs to `User`; stores leave type, date ranges, status (`Pending`, `Approved`, `Rejected`), and reviewer `User` ref.
7. **Chat & Message**: Real-time 1-on-1 private messaging and group channels between `User` participants.
8. **ActivityLog**: System audit trail capturing user ID, action, details, and timestamps.

---

## 🌟 Role-Based Access Control (RBAC) Matrix

| Module / Feature | Super Admin | HR Admin | Project Manager | Employee |
| :--- | :---: | :---: | :---: | :---: |
| **System Dashboard & Analytics** | Full | Full | Departmental | Personal |
| **Employee Directory & Profiles** | CRUD | CRUD | View / Edit | View / Self-Edit |
| **Department Management** | CRUD | CRUD | View | View |
| **Project & Task Kanban** | Full | View / Edit | CRUD | Assigned Tasks |
| **Attendance Clocking & Logs** | Full | Manage | Team Logs | Clock In / Out |
| **Leave Request Approvals** | Approve / Reject | Approve / Reject | Approve / Reject | Apply / History |
| **Payroll Overview & Paystubs** | Full | Full | View | Self-View |
| **Excel & PDF Exports** | Full | Full | Full | Restricted |
| **Audit Logs & Settings** | Full | Full | Settings | Profile Settings |

---

## 🔑 Demo Credentials

| Role | Email | Password | Verification Status |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@workflowx.com` | `Admin123` | ✅ **HTTP 200 OK** |
| **HR Admin** | `hr@workflowx.com` | `Hradmin123` | ✅ **HTTP 200 OK** |
| **Project Manager** | `pm@workflowx.com` | `Project123` | ✅ **HTTP 200 OK** |
| **Employee** | `employee@workflowx.com` | `Employee123` | ✅ **HTTP 200 OK** |

---

## ⚡ Local Quickstart Guide

### 1. Database & Backend API
```powershell
cd backend
npm.cmd install
npm.cmd run seed
npm.cmd start
```
*Runs backend server on `http://localhost:5000`*

### 2. Frontend Application
```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host
```
*Runs Vite dev server on `http://localhost:5173` and network host `http://10.0.39.213:5173`*

---

## 🛠️ Production Deployment Manifests

- **Frontend Deployment**: Configured via [vercel.json](file:///d:/mern%20stack%20project/frontend/vercel.json) for Vercel SPA routing and caching headers.
- **Backend Deployment**: Configured via [render.yaml](file:///d:/mern%20stack%20project/backend/render.yaml) for Render Web Services.
- **Deployment Guide**: Step-by-step instructions available in [DEPLOYMENT_GUIDE.md](file:///d:/mern%20stack%20project/DEPLOYMENT_GUIDE.md).

---

## 📄 License
Licensed under the [MIT License](LICENSE).
