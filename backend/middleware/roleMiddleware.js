// ============================================
// ROLE BASED ACCESS CONTROL MIDDLEWARE
// ============================================

// Allow specific roles only
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Admin only
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

// Doctor only
const doctorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'doctor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctors only.'
    });
  }
  next();
};

// Patient only
const patientOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Patients only.'
    });
  }
  next();
};

// Doctor or Admin
const doctorOrAdmin = (req, res, next) => {
  if (!req.user || !['doctor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Doctors and Admins only.'
    });
  }
  next();
};

// Patient or Doctor (for medical records)
const medicalAccess = (req, res, next) => {
  if (!req.user || !['patient', 'doctor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied.'
    });
  }
  next();
};

module.exports = {
  authorize,
  adminOnly,
  doctorOnly,
  patientOnly,
  doctorOrAdmin,
  medicalAccess
};