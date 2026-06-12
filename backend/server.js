const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health Check - Test this first
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'HEA System is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: '🏥 HEA Hospital Management System API',
        version: '1.0.0',
        team: 'Synapse'
    });
});

// Routes - Load one by one to find the problem
try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('✅ authRoutes loaded');
} catch(e) {
    console.log('❌ authRoutes failed:', e.message);
}

try {
    const appointmentRoutes = require('./routes/appointmentRoutes');
    app.use('/api/appointments', appointmentRoutes);
    console.log('✅ appointmentRoutes loaded');
} catch(e) {
    console.log('❌ appointmentRoutes failed:', e.message);
}

try {
    const medicalRoutes = require('./routes/medicalRoutes');
    app.use('/api/medical', medicalRoutes);
    console.log('✅ medicalRoutes loaded');
} catch(e) {
    console.log('❌ medicalRoutes failed:', e.message);
}

try {
    const adminRoutes = require('./routes/adminRoutes');
    app.use('/api/admin', adminRoutes);
    console.log('✅ adminRoutes loaded');
} catch(e) {
    console.log('❌ adminRoutes failed:', e.message);
}

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Something went wrong.'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║   🏥 HEA Hospital System Server     ║
║   Running on port: ${PORT}              ║
║   Team: Synapse                      ║
╚══════════════════════════════════════╝
    `);
});

module.exports = app;