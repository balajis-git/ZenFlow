# ZenFlow API Documentation

All API requests must be prefixed with `/api`.
For protected endpoints, include the access token in the request header:
`Authorization: Bearer <your_jwt_access_token>`

---

## 🔑 Authentication Endpoints (`/api/auth`)

### 1. Register User
- **POST** `/api/auth/register`
- **Access**: Public / Admin
- **Payload**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@company.com",
    "password": "Password123",
    "role": "HR Admin",
    "designation": "HR Director",
    "salary": 90000
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "User registered successfully. A verification link has been sent to your email."
  }
  ```

### 2. Login User
- **POST** `/api/auth/login`
- **Access**: Public
- **Payload**:
  ```json
  {
    "email": "admin@workflowx.com",
    "password": "Admin123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "_id": "66a3...",
      "name": "John Doe (Admin)",
      "email": "admin@workflowx.com",
      "role": "Super Admin"
    }
  }
  ```

### 3. Get Current User Profile
- **GET** `/api/auth/me`
- **Access**: Private (Bearer Token)

### 4. Refresh Access Token
- **POST** `/api/auth/refresh`
- **Access**: Public (Cookie/RefreshToken)

---

## 👥 Employee Management (`/api/employees`)

### 1. Get Employees List
- **GET** `/api/employees?page=1&limit=10&search=john&role=Employee`
- **Access**: Private

### 2. Create Employee
- **POST** `/api/employees` (Multipart Form)
- **Access**: Private (Super Admin, HR Admin)

---

## 🏢 Department Management (`/api/departments`)

### 1. Get Departments
- **GET** `/api/departments`
- **Access**: Private

### 2. Create Department
- **POST** `/api/departments`
- **Access**: Private (Super Admin, HR Admin)

---

## 📁 Project Management (`/api/projects`)

### 1. Get Projects List
- **GET** `/api/projects`
- **Access**: Private

### 2. Create Project
- **POST** `/api/projects`
- **Access**: Private (Admin, HR, PM)
- **Payload**:
  ```json
  {
    "name": "ZenFlow Enterprise Platform",
    "description": "Enterprise Workforce Platform",
    "manager": "66a3...",
    "members": ["66a3..."],
    "startDate": "2026-07-01",
    "endDate": "2026-10-30",
    "budget": 75000,
    "priority": "High"
  }
  ```

---

## 📋 Task & Kanban Management (`/api/tasks`)

### 1. Get Project Tasks
- **GET** `/api/tasks/project/:projectId`
- **Access**: Private

### 2. Update Task Status (Kanban Drag-and-Drop)
- **PATCH** `/api/tasks/:id/status`
- **Access**: Private

---

## ⏱️ Attendance Module (`/api/attendance`)

### 1. Clock In
- **POST** `/api/attendance/clock-in`
- **Access**: Private

### 2. Clock Out
- **POST** `/api/attendance/clock-out`
- **Access**: Private

---

## 🌴 Leave Management (`/api/leaves`)

### 1. Apply for Leave
- **POST** `/api/leaves`
- **Access**: Private

---

## 📊 Reports & Exports (`/api/reports`)

### 1. Get Dashboard Analytics
- **GET** `/api/reports/dashboard-analytics`
- **Access**: Private

### 2. Export Excel / PDF Reports
- **GET** `/api/reports/export/:type/:format`
  - `type`: `attendance` \| `employees` \| `projects` \| `tasks` \| `leaves`
  - `format`: `excel` \| `pdf`
- **Access**: Private (Admin, HR, PM)
