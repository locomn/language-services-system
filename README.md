# Language Services Management System

A comprehensive system for managing language services including scheduling, billing, and human resources.

## Features

- **Scheduling System**
  - Appointment management
  - Calendar integration
  - Availability tracking
  - Service provider scheduling

- **Billing System**
  - Invoice generation
  - Payment processing
  - Rate management
  - Financial reporting

- **HR Management**
  - Employee profiles
  - Qualification tracking
  - Performance management
  - Document management

## Tech Stack

- **Backend:** Node.js with Express.js
- **Frontend:** React
- **Database:** MongoDB
- **Authentication:** JWT

## Setup Instructions

1. Install Node.js 16+ and MongoDB
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Set up MongoDB database
5. Start the backend server: `cd backend && npm run dev`
6. Start the frontend: `cd frontend && npm start`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/language_services
JWT_SECRET=your_jwt_secret
PORT=5000
```
