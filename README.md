# 🏥 HEA — Hospital Management System

> A lightweight, web-based hospital management platform built for efficiency, clarity, and ease of use.

**Software Engineering** 
**Year:** 2025/2026  
**University:** University of Trento — Department of Information Engineering and Computer Science  
**Version:** 1.0

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Scope & Limitations](#scope--limitations)

---

## Overview

HEA is a browser-based Hospital Management System designed to replace slow, paper-based workflows with a fast, user-friendly digital alternative. It gives patients, doctors, nurses, and administrators a single platform to manage appointments, medical records, staff schedules, and hospital resources — all in real time.

Traditional hospital systems suffer from long waiting times, poor scheduling, and weak communication between staff and patients. HEA solves this by digitising the entire appointment and record-keeping process, accessible from any device on a 3G/4G or local hospital network connection.

---

## Features

### For Patients
- Register and log in securely
- Book, reschedule, or cancel appointments online
- View medical history, prescriptions, and test results
- View past appointment history

### For Doctors & Nurses
- Access and update patient medical records in real time
- Manage personal schedules and availability
- Receive alerts for urgent/triage cases
- Input triage data for automatic urgent case detection

### For Administrators
- Full dashboard with live staff schedules, patient activity, and resource usage
- Register and manage patient and staff accounts
- Handle billing and payment records
- Generate performance and resource reports
- Role-based access control across all user types

### System-wide
- Real-time availability of doctors, rooms, and equipment (beds, rooms, devices)
- Conflict-free scheduling — no double bookings
- Centralised data sharing across departments
- Audit logging of all user actions
- Data encryption in storage and transmission
- 24/7 system availability target

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | HTML, CSS, JavaScript       |
| Backend    | JavaScript (API-based)      |
| Database   | To be confirmed             |
| Hosting    | AWS / Azure (cloud)         |
| Security   | Role-based access, encryption, session management |

---

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Active internet or local hospital network connection
- Git installed on your machine

### Clone the repository

```bash
git clone https://github.com/your-username/hea-hospital-system.git
cd hea-hospital-system
```

### Run locally

Since HEA is a pure HTML/CSS/JS project, no build step is needed. Simply open `index.html` in your browser:

```bash
# Option 1 — open directly
open index.html

# Option 2 — use VS Code Live Server extension (recommended)
# Right-click index.html → "Open with Live Server"
```

---

## Project Structure

```
hea-hospital-system/
│
├── index.html              # Entry point / login page
├── styles.css              # Global styles
│
├── appointments/
│   ├── appointments.html
│   └── appointments.js     # Booking, rescheduling, cancellation logic
│
├── patients/
│   ├── registration.html
│   ├── records.html
│   └── records.js          # Medical history, prescriptions, test results
│
├── dashboard/
│   ├── dashboard.html
│   └── dashboard.js        # Admin dashboard, reports, resource overview
│
├── staff/
│   ├── schedule.html
│   └── schedule.js         # Staff scheduling and conflict prevention
│
└── README.md
```

---

## User Roles

| Role            | Key Permissions                                                      |
|-----------------|----------------------------------------------------------------------|
| Patient         | Register, log in, book/cancel appointments, view own records         |
| Doctor / Nurse  | View & update patient records, manage schedule, flag urgent cases    |
| Administrator   | Full access — manage accounts, billing, reports, and system settings |
| Anonymous       | View public info only (registration page, system availability)       |

> Access is enforced via role-based access control (RBAC). Only administrators have full read/write/modify privileges across all data.

---

## Scope & Limitations

### In scope
- Patient registration and profile management
- Appointment booking, rescheduling, and cancellation
- Electronic medical records storage and updating
- Prescription and treatment plan management
- Bill and payment record management
- Staff scheduling and resource tracking (beds, rooms, equipment)
- Administrative reporting and dashboard
- Role-based access control

### Out of scope (v1.0)
- AI-based medical diagnosis
- Telemedicine / video consultation
- Ambulance tracking
- National health database integration
- OTP authentication
- Push notification management
- Insurance claims processing

### Known limitations
- Requires a constant internet or local network connection (no offline mode)
- Does not interface with medical diagnostic hardware
- Security features are academic-level and not production-hardened
- Not stress-tested for high concurrent load across multiple hospitals

---

## Contributing

1. Clone the repo and create your feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "Add: description of change"`
3. Push to your branch: `git push origin feature/your-feature`
4. Open a Pull Request on GitHub and tag a teammate for review

