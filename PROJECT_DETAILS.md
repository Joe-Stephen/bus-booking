# Bus Booking Application

## 1. What is this project?
This project is a comprehensive **Bus Booking Web Application** that facilitates the online reservation of bus tickets, real-time bus tracking, and administrative management of bus fleets, routes, and schedules.

## 2. What does this do?
The application serves two main types of users, providing an end-to-end solution for bus network management and passenger travel:
- **Passengers (Users):** Can securely sign up, browse available bus routes, search for trip schedules, book tickets seamlessly, manage their bookings, and track the live location of their buses via an interactive map.
- **Administrators:** Have full control over the system's core data. They can manage the bus fleet, define new transit routes, create and manage trip schedules with pricing, monitor all passenger bookings, and track any active bus in real-time.

## 3. Architecture
The project follows a modern, scalable **Client-Server (3-Tier) Architecture**:
- **Frontend (Client Tier):** Built as a **Single Page Application (SPA)** using React and Vite. It communicates with the backend via RESTful APIs for standard CRUD operations and establishes WebSockets (Socket.io) connections for receiving real-time GPS location updates of buses.
- **Backend (Application Tier):** A robust **Node.js and Express.js REST API server** written in TypeScript. It handles all business logic, role-based authorization, JWT authentication, and request validation. It also runs a Socket.io server to broadcast real-time location updates continuously.
- **Database (Data Tier):** A **PostgreSQL** relational database. The backend interfaces with the database exclusively using the **Prisma Object-Relational Mapper (ORM)** for type-safe queries and schema migrations.

## 4. Technologies Used

### Frontend
- **Core Framework:** React 19, TypeScript, Vite (Build Tool)
- **Styling UI:** Tailwind CSS v4, styling utilities (`clsx`, `tailwind-merge`)
- **Routing:** React Router DOM v7
- **State Management & Data Fetching:** React Query (TanStack Query v5), Axios
- **Maps & Real-time Tracking:** React Leaflet, Leaflet.js, Socket.io-client
- **Authentication:** JWT Decode

### Backend
- **Core Framework:** Node.js, Express.js v5, TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Real-time Communication:** Socket.io
- **Security & Authentication:** JSON Web Tokens (JWT), `bcryptjs` (Password Hashing), Google Auth Library (for OAuth)
- **Validation:** Zod (Schema Validation)
- **Utilities:** Nodemailer (Email Services), Morgan (HTTP Logging), CORS
- **Development & Scripts:** Nodemon, `ts-node` (for running DB seeds and Bus Simulator scripts)

## 5. Workflows for Each Role

### User Workflow
1. **Authentication:** Users register/login using email and password or via Google Authentication. Email verification is supported.
2. **Dashboard/Home:** Access a personalized user dashboard showing upcoming trips.
3. **Search & Browse:** Browse all available routes and search for specific bus schedules by route.
4. **Booking:** Select an available schedule, review the price, and book a ticket.
5. **Manage Bookings:** View a history of past bookings and details for upcoming bookings.
6. **Live Tracking:** On the day of the journey, view an interactive map tracking the exact real-time location of the bus.

### Admin Workflow
1. **Dashboard:** View high-level system statistics and quick links to management modules.
2. **Manage Buses:** Add new buses to the fleet, edit details (e.g., total seat capacity), and toggle real-time tracking capabilities on/off for specific buses.
3. **Manage Routes:** Define network routes by setting origin, destination, and approximate distance.
4. **Manage Schedules:** Assign buses to routes, set precise departure and arrival times, and establish ticket pricing.
5. **Monitoring & Tracking:** View all system-wide passenger bookings and utilize an administrative map to track the real-time location of every active bus in the fleet.

## 6. How to Host This Project

### 6.1 Database Hosting
1. Provision a PostgreSQL database instance (e.g., using Supabase, Neon, AWS RDS, or Render PostgreSQL).
2. Obtain the database connection string.

### 6.2 Backend Hosting
1. Choose a Node.js hosting platform (e.g., Render, Railway, Heroku, or a Linux VPS like DigitalOcean/AWS EC2).
2. Define the following Environment Variables (`.env`) on the host:
   - `DATABASE_URL`: The PostgreSQL connection string.
   - `PORT`: Usually provided dynamically by the host (default `5000`).
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`: Strong secret keys for signing tokens.
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Your Google Cloud Console OAuth credentials.
   - `FRONTEND_URL`: The URL of your deployed frontend (to configure CORS).
   - Email Provider SMTP settings (for Nodemailer functionality).
3. Build and Deployment commands for the backend provider:
   - Install dependencies: `npm install`
   - Generate Prisma Client: `npx prisma generate`
   - Apply Database schema: `npx prisma migrate deploy`
   - Build TypeScript code: `npm run build`
   - Start the server: `npm start` (which runs `node dist/server.js`)

### 6.3 Frontend Hosting
1. Choose a modern static site hosting provider (e.g., Vercel, Netlify, Cloudflare Pages) which is ideal for SPA Vite apps.
2. Define the required Environment Variables on the host:
   - `VITE_API_URL`: The public-facing URL of your deployed backend API.
3. Build and Deployment configuration:
   - Base Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory / Output Directory: `dist`
   - **Important Routing Fix:** Ensure the hosting provider is configured to rewrite all 404/fallback requests to `index.html` to allow React Router to handle client-side routing properly (e.g., using a `vercel.json` file on Vercel or a `_redirects` file on Netlify).
