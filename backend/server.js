const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');
const cookieParser = require('cookie-parser');

dotenv.config();

const db = require('./config/db');

// Import routes
const authRoutes       = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRoutes    = require('./routes/medicalRoutes');
const adminRoutes      = require('./routes/adminRoutes');
const patientRoutes    = require('./routes/patientRoutes');
const doctorRoutes     = require('./routes/doctorRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical',      medicalRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/patient',      patientRoutes);
app.use('/api/doctor',       doctorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🏥 HEA Healthcare API is running!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 4000
  });
});

// Frontend fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('\n==========================================');
  console.log('✅ HEA Healthcare Server Started');
  console.log('🌐 Port: ' + PORT);
  console.log('💚 Health: http://localhost:' + PORT + '/api/health');
  console.log('==========================================\n');
});

module.exports = app;
