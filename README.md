# Franklin Photo 📸

**Franklin Photo** is a premium, secure full-stack client gallery portal and admin dashboard designed for professional event and portrait photographers (e.g., school ceremonies, private events, portraits). 

This platform allows photographers to manage school directories, bulk upload event photos via a secure admin dashboard, and distribute private gallery access keys to clients for viewing and downloading their individual high-resolution photos.

🔗 **Live Demo:** [https://franklin-photo.vercel.app/](https://franklin-photo.vercel.app/)

---

## 🚀 Key Features

* **Premium UI/UX:** A visually stunning, modern dark-themed landing page featuring responsive design, custom glassmorphism components, and fluid micro-animations (built with Motion/Tailwind v4).
* **Private Client Galleries:** Clients can log in using unique secure school or event codes to view their dedicated media portfolio.
* **Bulk Photo Downloads:** Features server-side ZIP compilation (`archiver`) to allow clients to download their complete high-resolution galleries with a single click.
* **Admin Control Center:** A fully protected admin route (`/admin`) for photographers to:
  * Manage school/event directories.
  * Create, update, or delete galleries.
  * Bulk upload high-resolution images directly to Vercel Blob.
* **Drizzle ORM & PostgreSQL:** Relational database schema with Drizzle ORM, ensuring type-safe, highly optimized SQL queries for rapid client-side loading.
* **Firebase authentication:** Secured admin backend utilizing Firebase Admin SDK and client-side Firebase Auth.

---

## 🛠️ Tech Stack

* **Frontend Framework:** Next.js 15 (App Router) & React 19
* **Styling & Animations:** TailwindCSS v4 & Motion (Framer Motion)
* **Database & ORM:** PostgreSQL & Drizzle ORM
* **Authentication:** Firebase Client SDK & Firebase Admin SDK
* **Image Hosting:** Vercel Blob Storage
* **Backend Utility:** Node.js stream-based ZIP archiver (`archiver`), `busboy` for handling multipart form uploads.

---

## 📂 Project Structure

```
├── app/
│   ├── admin/                # Admin Panel views (dashboard, school listings)
│   ├── api/
│   │   ├── admin/            # Admin API endpoints (uploads, school CRUD, photo management)
│   │   └── client/           # Client API endpoints (auth, gallery retrieval, zip downloads)
│   ├── client/               # Client Gallery entry point
│   ├── globals.css           # Global Tailwind CSS configurations
│   └── layout.tsx            # Global layout configuration
├── src/
│   ├── db/
│   │   ├── drizzle.config.ts # Drizzle configuration
│   │   ├── index.ts          # DB connection client
│   │   └── schema.ts         # PostgreSQL database schemas (Drizzle definitions)
│   └── lib/
│       ├── auth.ts           # Authentication logic
│       ├── firebase.ts       # Firebase client initializer
│       └── firebase-admin.ts # Firebase Admin SDK wrapper
├── components/               # Highly reusable UI components
└── package.json              # Project dependencies and run scripts
```

---

## 💻 Local Setup & Installation

### Prerequisites

Ensure you have **Node.js (v18+)** installed. You will also need:
* A PostgreSQL database instance (local or hosted on Supabase/Neon).
* A Firebase Project (with Auth enabled).
* A Vercel Blob Storage token.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/franklin-photo.git
cd franklin-photo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and configure the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_PROJECT_ID=your_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_email
FIREBASE_PRIVATE_KEY="your_firebase_admin_private_key"
```

### 4. Run DB Migrations
To push the database schema to your PostgreSQL instance:
```bash
npx drizzle-kit push:pg
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the running application.

---

## 🛡️ License

This project is private and proprietary. All rights reserved.