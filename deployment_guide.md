# Deployment Guide - TVK Constituency Portal

This guide provides instructions for deploying the **Constituency Complaint & Civic Engagement Portal** for free using Next.js, Vercel, Supabase, and Resend.

---

## 1. Supabase Setup (Database, Storage & Auth)

Supabase provides a generous free tier including a PostgreSQL database, Authentication, and S3-compatible Object Storage.

### A. Database Tables & Triggers
1. Sign up/Log in to [Supabase](https://supabase.com/).
2. Create a new project (e.g., `tvk-madurai-east`).
3. Go to the **SQL Editor** in the left sidebar.
4. Click **New Query**, copy the contents of the `schema.sql` file located in the root of this project, paste it into the editor, and click **Run**.
5. This initializes the 11 tables, inserts the Tamil & English ward/category seed data, and compiles the automatic triggers for:
   * Unique ticket generation (`TVK-2026-XXXXX`).
   * Priority score calculation ($Score = Support \times 2 + Similar \times 3 + Age$).
   * High priority zone triggers.

### B. Storage Buckets (For Photo & Document uploads)
1. Go to the **Storage** section in the Supabase sidebar.
2. Create two new buckets:
   * `complaints` (Make it **Public** so photos can be viewed by anyone).
   * `documents` (Make it **Private** or Public depending on access rules).
3. If using Supabase Storage in production, update `/api/upload/route.ts` to utilize the Supabase client upload API instead of saving files to the local disk.

---

## 2. Environment Variables Configuration

Create a file named `.env.local` in the root of your project directory and add the following keys:

```bash
# Supabase Keys (Found in Supabase Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...

# Resend Email Integration (Get a free API key at resend.com)
RESEND_API_KEY=re_123456789abcde...
CONSTITUENCY_EMAIL=office@tvkmaduraieast.in
```

> [!NOTE]
> **No-Config Fallback Mode**: If these keys are not set, the portal automatically operates in **Mock Database Mode** using a local file database (`mock_db.json`) and prints email notifications directly to the developer console. This makes testing instant and free.

---

## 3. Local Development

To run the project locally on your machine:

1. Install all dependencies:
   ```bash
   npm install
   ```
2. Start the hot-reloading development server:
   ```bash
   npm run dev
   ```
3. Open your browser to [http://localhost:3000](http://localhost:3000) to view the public portal.
4. Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the Admin Dashboard.
   * **Username**: `admin`
   * **Password**: `tvk2026`

---

## 4. Vercel Deployment

Deploying the Next.js app to Vercel is free and takes less than a minute.

1. Install the Vercel CLI globally or use the Vercel GitHub integration:
   * **GitHub Integration (Recommended)**: Push your code to a GitHub repository, log into Vercel, click **Add New Project**, import the repo, add your Environment Variables, and click **Deploy**.
   * **CLI Deployment**:
     ```bash
     npx vercel
     ```
2. Vercel will automatically build the Next.js production bundle, configure routing, and serve the application globally.
