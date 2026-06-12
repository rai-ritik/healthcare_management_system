const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

const adminOnly = authorize('admin');
const doctorOnly = authorize('doctor');
const patientOnly = authorize('patient');
const medicalStaff = authorize('doctor', 'nurse');
const staffAndAdmin = authorize('doctor', 'nurse', 'admin');

module.exports = {
    authorize,
    adminOnly,
    doctorOnly,
    patientOnly,
    medicalStaff,
    staffAndAdmin
};