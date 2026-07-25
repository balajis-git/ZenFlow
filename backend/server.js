require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require('./socket/socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Connect to database
connectDB();

// Initialize Socket.IO events
initSocket(io);

// Pass io instance to request objects so controllers can trigger socket events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware Configurations
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom simple cookie-parser middleware to avoid extra npm packages
app.use((req, res, next) => {
  req.cookies = {};
  const rawCookieHeader = req.headers.cookie;
  if (rawCookieHeader) {
    rawCookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts.shift().trim();
      const val = decodeURIComponent(parts.join('='));
      req.cookies[name] = val;
    });
  }
  next();
});

// Rate limiting (100 requests per 15 minutes for security)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Serve uploads folder static
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);

// Base route for server status check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'WorkFlowX API is running smoothly' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] WorkFlowX running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
