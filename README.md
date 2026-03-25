# Ecommercely - Frontend
Modern e-commerce platform interfaces composed of two powerful Next.js applications: an internal **Admin Dashboard** and a public-facing **Customer Website**.

## Overview
This repository manages two separate Next.js workspaces:
1. **`admin/`**: A secure management panel for admins to oversee products, categories, orders, logs, and user roles. 
2. **`website/`**: The consumer-facing storefront for users to browse catalogs, view products, and checkout.

## Shared Tech Stack
- **Framework:** Next.js & React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit
- **UI Components:** Radix UI / shadcn-like foundations
- **API Fetching:** Axios

---

## 1. Admin Dashboard (`/admin`)

### Setup Instructions
1. Navigate to the admin directory:
   ```bash
   cd admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.sample` to `.env` and configure it:
   ```env
   NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   NODE_ENV=DEVELOPMENT
   NEXT_SUPER_ADMIN_EMAIL=admin@ecommercely.com
   ```
4. Start the development server (runs on port 3001 by default):
   ```bash
   npm run dev
   ```
   Admin panel will be accessible at `http://localhost:3001`.

---

## 2. Customer Website (`/website`)

### Setup Instructions
1. Navigate to the website directory:
   ```bash
   cd website
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.sample` to `.env` and configure it:
   ```env
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   ```
4. Start the development server (runs on port 3000 by default):
   ```bash
   npm run dev
   ```
   The public storefront will be accessible at `http://localhost:3000`.
