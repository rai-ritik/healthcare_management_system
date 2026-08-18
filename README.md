# 🏥 HEA Healthcare Management System



![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![License](https://img.shields.io/badge/license-MIT-purple)

**A full-stack hospital management system for patients, doctors, and administrators.**

[Features](#features) • [Setup](#setup) • [API](#api-endpoints) • [Team](#team)



---

## 👥 Team Synapse

| Member | Role |
|--------|------|
| 🧑‍💻 **Ritik Kumar Rai** |Database/Stack Developer |
| 👩‍💻 **Miranda Duraku** | Frontend Developer |
| 👩‍💻 **Meliza Bodurri** | Backend Developer |

---

## 📌 About The Project

HEA Healthcare Management System is a comprehensive web application that digitizes hospital operations. It allows patients to book appointments online, doctors to manage their schedules and patient records, and administrators to oversee the entire system with real-time analytics and audit logs.

Built as part of a university project with a focus on security, usability, and real-world healthcare workflows.

---

## ✨ Features

### 🤒 For Patients
- ✅ Register and create personal account
- ✅ Book, reschedule and cancel appointments
- ✅ View complete medical history and records
- ✅ Browse available doctors by specialization
- ✅ Receive appointment notifications
- ✅ Manage emergency contact information
- ✅ View and update personal profile

### 👨‍⚕️ For Doctors
- ✅ View daily and weekly appointment schedule
- ✅ Complete and manage patient appointments
- ✅ Create detailed medical records
- ✅ View full patient history and vitals
- ✅ Manage availability and consultation fees
- ✅ Dashboard with weekly statistics

### 🔑 For Administrators
- ✅ System-wide dashboard with live statistics
- ✅ View and manage all users
- ✅ Complete audit log of all system actions
- ✅ Department and resource management
- ✅ Generate system reports
- ✅ Monitor patient and doctor activity

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js v18+, Express.js v4 |
| **Database** | MySQL 8.0 |
| **Authentication** | JSON Web Tokens (JWT) |
| **Password Security** | bcrypt (salt rounds: 10) |
| **Data Encryption** | AES-256-CBC |
| **Version Control** | Git and GitHub |
| **Runtime** | Node.js |

---

## 📁 Project Structure

healthcare_management_system/
│
├── backend/
│   ├── config/
│   │   ├── db.js                       # MySQL database connection
│   │   └── env.js                      # Environment configuration (optional)
│   │
│   ├── controllers/
│   │   ├── auth.controller.js          # Register, login, logout
│   │   ├── patient.controller.js       # Patient profile and dashboard
│   │   ├── doctor.controller.js        # Doctor dashboard and schedule
│   │   ├── admin.controller.js         # Admin dashboard and user management
│   │   ├── appointment.controller.js   # Appointment operations
│   │   └── medicalRecord.controller.js # Medical-record operations
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js          # JWT verification
│   │   ├── role.middleware.js          # Role-based authorization
│   │   ├── error.middleware.js         # Centralized error handling
│   │   └── validation.middleware.js    # Request validation
│   │
│   ├── models/
│   │   ├── User.js                     # User database operations
│   │   ├── Patient.js                  # Patient database operations
│   │   ├── Doctor.js                   # Doctor database operations
│   │   ├── Appointment.js              # Appointment database operations
│   │   └── MedicalRecord.js            # Medical-record database operations
│   │
│   ├── routes/
│   │   ├── auth.routes.js              # /api/auth routes
│   │   ├── patient.routes.js           # /api/patients routes
│   │   ├── doctor.routes.js            # /api/doctors routes
│   │   ├── admin.routes.js             # /api/admin routes
│   │   ├── appointment.routes.js       # /api/appointments routes
│   │   └── medicalRecord.routes.js     # /api/medical-records routes
│   │
│   ├── services/
│   │   ├── auth.service.js             # Authentication business logic
│   │   ├── patient.service.js          # Patient business logic
│   │   ├── doctor.service.js           # Doctor business logic
│   │   ├── appointment.service.js      # Appointment business logic
│   │   └── medicalRecord.service.js    # Medical-record business logic
│   │
│   ├── utils/
│   │   ├── encryption.js               # Password hashing utilities
│   │   ├── jwt.js                      # JWT generation utilities
│   │   ├── response.js                 # Standard API response helpers
│   │   └── validators.js               # Shared validation helpers
│   │
│   ├── validations/
│   │   ├── auth.validation.js          # Login and registration validation
│   │   ├── appointment.validation.js   # Appointment validation
│   │   └── medicalRecord.validation.js # Medical-record validation
│   │
│   ├── scripts/
│   │   └── createAdmin.js              # Script to create the default admin
│   │
│   ├── app.js                          # Express app configuration
│   └── server.js                       # Application entry point
│
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css               # Global styles
│   │   │   ├── forms.css               # Authentication and form styles
│   │   │   └── dashboard.css           # Dashboard styles
│   │   │
│   │   └── js/
│   │       ├── api.js                  # API request helper functions
│   │       ├── auth.js                 # Authentication client logic
│   │       ├── utils.js                # Shared frontend utilities
│   │       └── dashboard.js            # Shared dashboard logic
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   │
│   │   ├── patient/
│   │   │   ├── dashboard.html
│   │   │   └── profile.html
│   │   │
│   │   ├── doctor/
│   │   │   └── dashboard.html
│   │   │
│   │   ├── admin/
│   │   │   └── dashboard.html
│   │   │
│   │   └── appointments/
│   │       ├── appointments.html
│   │       └── medical-records.html
│   │
│   └── index.html                      # Landing page
│
├── database/
│   ├── schema.sql                      # Database schema
│   ├── seed.sql                        # Optional sample data
│   └── migrations/                     # Future database migrations
│
├── tests/
│   ├── auth.test.js
│   ├── appointment.test.js
│   └── medicalRecord.test.js
│
├── docs/
│   └── API.md                          # Extended API documentation
│
├── .env                                # Local environment variables; do not commit
├── .env.example                        # Environment variable template
├── .gitignore
├── package.json
└── README.md
## ⚙️ Installation and Setup

### Prerequisites
Make sure you have these installed:
- [Node.js](https://nodejs.org/) v16 or higher
- [MySQL](https://mysql.com/) 8.0 or higher
- [Git](https://git-scm.com/)

---

### Step 1 — Clone The Repository

```bash
git clone https://github.com/rai-ritik/healthcare_management_system.git
cd healthcare_management_system
Step 2 — Install Backend Dependencies
cd backend
npm install
Step 3 — Setup MySQL Database
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hea_database;
USE hea_database;

# Exit MySQL
exit
Step 4 — Configure Environment Variables
Create a file called .env inside the backend folder:

PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hea_database
JWT_SECRET=hea_super_secret_key_2025_synapse
JWT_EXPIRES_IN=24h
NODE_ENV=development
Step 5 — Create Admin Account
cd backend
node scripts/createAdmin.js
You should see:

✅ Admin created successfully!
📧 Email:    admin@hea.com
🔑 Password: password
Step 6 — Start The Server
node server.js
You should see:

==========================================
✅ HEA Healthcare Server Started
🌐 Port: 4000
💚 Health: http://localhost:4000/api/health
==========================================
✅ Database connected successfully!
Step 7 — Open The App
Open this file in your browser:

frontend/pages/login.html
🔗 API Endpoints
🔐 Authentication — /api/auth
Method	Endpoint	Description	Auth Required
POST	/api/auth/register	Create new account	❌
POST	/api/auth/login	Login and get token	❌
POST	/api/auth/logout	Logout user	✅
GET	/api/auth/me	Get current user	✅
POST	/api/auth/change-password	Change password	✅
🤒 Patient — /api/patient
Method	Endpoint	Description	Auth Required
GET	/api/patient/dashboard	Dashboard data	✅ Patient
GET	/api/patient/profile	Get profile	✅ Patient
PUT	/api/patient/profile	Update profile	✅ Patient
GET	/api/patient/appointments	Appointment history	✅ Patient
GET	/api/patient/doctors	Browse doctors	✅ Patient
GET	/api/patient/notifications	Notifications	✅ Patient
👨‍⚕️ Doctor — /api/doctor
Method	Endpoint	Description	Auth Required
GET	/api/doctor/dashboard	Dashboard data	✅ Doctor
GET	/api/doctor/profile	Get profile	✅ Doctor
PUT	/api/doctor/profile	Update profile	✅ Doctor
GET	/api/doctor/appointments	View appointments	✅ Doctor
PUT	/api/doctor/appointments/:id/complete	Complete appointment	✅ Doctor
GET	/api/doctor/patients	View my patients	✅ Doctor
📅 Appointments — /api/appointments
Method	Endpoint	Description	Auth Required
POST	/api/appointments/book	Book appointment	✅
PUT	/api/appointments/:id/cancel	Cancel appointment	✅
PUT	/api/appointments/:id/reschedule	Reschedule	✅
GET	/api/appointments/availability	Check availability	✅
📋 Medical Records — /api/medical
Method	Endpoint	Description	Auth Required
GET	/api/medical	Get records	✅
POST	/api/medical	Create record	✅ Doctor
GET	/api/medical/:id	Get record by ID	✅
🔑 Admin — /api/admin
Method	Endpoint	Description	Auth Required
GET	/api/admin/dashboard	System stats	✅ Admin
GET	/api/admin/audit-logs	Audit logs	✅ Admin
GET	/api/admin/reports	Reports	✅ Admin
GET	/api/admin/resources	Resources	✅ Admin
🧪 Test Accounts
Role	Email	Password	Access
🔑 Admin	admin@hea.com	password	Full system access
🤒 Patient	Register at /register.html	your choice	Patient features
👨‍⚕️ Doctor	Register at /register.html	your choice	Doctor features
🗄️ Database Schema
Tables Overview
Table	Description
users	All system users with roles
patients	Patient medical information
doctors	Doctor profiles and availability
appointments	All appointment records
medical_records	Patient medical history
departments	Hospital departments
audit_logs	Complete system activity log
notifications	User notifications
billing	Payment and billing records
resources	Hospital resources
staff_shifts	Staff scheduling
doctor_schedules	Doctor availability slots
🔐 Security Features
JWT Authentication — Stateless token based authentication
bcrypt Hashing — Passwords hashed with salt rounds of 10
AES-256 Encryption — Sensitive patient data encrypted at rest
Role Based Access Control — 4 roles: patient, doctor, nurse, admin
Input Validation — All inputs validated before database queries
Audit Logging — Every action logged with timestamp and user
CORS Protection — Configured cross-origin resource sharing
SQL Injection Prevention — Parameterized queries throughout
📋 Requirements Coverage
ID	Requirement	Status
FR1	Patient Registration	✅ Complete
FR2	User Login	✅ Complete
FR3	Password Management	✅ Complete
FR4	Book Appointment	✅ Complete
FR5	Cancel and Reschedule	✅ Complete
FR8	Real Time Availability	✅ Complete
FR14	View Medical Records	✅ Complete
FR15	Update Medical Records	✅ Complete
FR17	Role Based Access Control	✅ Complete
FR18	Admin Dashboard	✅ Complete
FR20	Audit Logs	✅ Complete
FR22	Patient Profile	✅ Complete
FR24	Appointment History	✅ Complete
FR32	Secure Logout	✅ Complete
NFR1	Security	✅ Complete
NFR3	Encryption	✅ Complete
🚀 Quick Commands
# Start server
cd backend && node server.js

# Test API health
curl http://localhost:4000/api/health

# Test login
curl -X POST http://localhost:4000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d "{"email":"admin@hea.com","password":"password"}"

# Create admin account
node scripts/createAdmin.js

# Kill port 4000 if busy
kill -9 $(lsof -ti:4000)
📸 Pages
Page	Description
/pages/index.html	Landing page
/pages/login.html	Login form
/pages/register.html	Registration form
/pages/patient-dashboard.html	Patient home
/pages/doctor-dashboard.html	Doctor home
/pages/admin-dashboard.html	Admin home
/pages/appointments.html	Book appointments
/pages/medical-records.html	Medical history
/pages/profile.html	Edit profile
🤝 Contributing
Fork the repository
Create your feature branch
git checkout -b feature/amazing-feature
Commit your changes
git commit -m "Add amazing feature"
Push to the branch
git push origin feature/amazing-feature
Open a Pull Request
📄 License
This project was built for educational purposes as part of a university assignment.

🏥 HEA Healthcare Management System

Built with ❤️ by Team Synapse

Miranda • Ritik • Meliza

© 2025 Team Synapse — All Rights Reserved

'''
with open('/Users/ritikkumarrai/Desktop/healthcare_management_system/README.md', 'w') as f: f.write(readme) print('README.md created successfully!') "
---
