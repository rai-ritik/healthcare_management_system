# Synapse HealthCore

A scalable and modern Hospital Management System designed to streamline healthcare operations including appointment scheduling, patient record management, staff coordination, and administrative monitoring.

Built as a Software Engineering project focused on usability, security, real-time operations, and efficient healthcare workflows.

---

## Overview

Synapse HealthCore is a web-based healthcare management platform that enables:

- Patients to book and manage appointments
- Doctors and nurses to manage schedules and medical records
- Administrators to monitor hospital operations
- Multi-department coordination through centralized data access

The project focuses on improving efficiency, reducing scheduling conflicts, and enhancing the overall healthcare experience.

---

## Features

### Patient Features
- User registration & secure login
- Appointment booking/rescheduling/cancellation
- Medical history access
- Patient profile management
- Appointment history tracking

### Doctor & Medical Staff Features
- Access patient medical records
- Update diagnosis & treatment plans
- Manage schedules and availability
- Real-time appointment monitoring

### Administrative Features
- Staff schedule management
- Resource monitoring
- Hospital analytics dashboard
- Billing and payment records
- Reporting system

### System Features
- Role-based access control
- Secure authentication
- Real-time data synchronization
- Multi-department support
- Audit logging
- Data encryption
- Error handling and monitoring

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Prisma ORM

### Authentication & Security
- JWT Authentication
- bcrypt Password Hashing

### Deployment
- Vercel (Frontend)
- Railway / Render (Backend & Database)

---

## System Architecture

```text
Client (React Frontend)
        ↓
REST API (Express Backend)
        ↓
PostgreSQL Database
        ↓
Authentication & Role Management
