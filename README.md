# ✨ WishLift

> People post goals, needs, or dreams. Others choose to help.

WishLift is a community platform where individuals share meaningful goals, needs, and aspirations, while generous people can directly connect and help make them happen.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A free [Supabase](https://supabase.com) account

---

## 📦 Step 1 — Install Dependencies

```bash
cd wishlift
npm install
```

---

## 🗄️ Step 2 — Set Up Supabase

### 2a. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Click **"New project"**
3. Fill in name, password, and region — then click **Create project**
4. Wait ~2 minutes for the project to provision

### 2b. Run the Database Schema
1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase_schema.sql` from this project folder
4. Paste the entire contents into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

This creates all tables, policies, and the storage bucket automatically.

### 2c. Get Your API Keys
1. In your Supabase dashboard, go to **Project Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public** key (the long JWT string)

---

## 🔑 Step 3 — Configure Environment Variables

1. In the project root, copy the example env file:

```bash
cp .env.example .env
```

2. Open `.env` and fill in your keys:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## ▶️ Step 4 — Run the App

```bash
npm run dev
```

Open your browser to: **http://localhost:5173**

---

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

The built files are in the `dist/` folder — deploy to Vercel, Netlify, or any static host.

---

## 🌐 Deploy to Vercel (Free)

1. Push this project to a GitHub repo
2. Go to [https://vercel.com](https://vercel.com) and import the repo
3. Add your environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## 📁 Project Structure

```
wishlift/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── WishCard.jsx
│   │   ├── ContactModal.jsx
│   │   ├── ReportModal.jsx
│   │   └── MessageBubble.jsx
│   ├── pages/            # Route pages
│   │   ├── Home.jsx
│   │   ├── Browse.jsx
│   │   ├── WishDetails.jsx
│   │   ├── CreateWish.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Messages.jsx
│   ├── services/         # Supabase data layer
│   │   ├── supabase.js
│   │   ├── auth.js
│   │   ├── wishes.js
│   │   └── messages.js
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase_schema.sql   # Run this in Supabase SQL Editor
├── .env.example
├── .env                  # Your local env (create from .env.example)
├── vite.config.js
└── package.json
```

---

## ✨ Features

### For Recipients
- Create an account and post wishes
- Upload photos for wishes
- Receive and manage contact requests (accept/decline)
- Mark wishes as In Progress or Fulfilled
- Private messaging with connected helpers

### For Helpers
- Browse all open wishes
- Filter by category (Education, Health, Business, Family, etc.)
- Search by keyword
- Save wishes for later
- Send contact requests with a personal message
- Private messaging once accepted

### Platform
- Real-time messaging with Supabase subscriptions
- Report system for trust & safety
- Fully responsive (mobile-friendly)
- No payment processing — coordination is direct

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Animations | Framer Motion |
| Backend | Supabase (Auth, DB, Storage) |
| Styling | Custom CSS with CSS variables |

---

## ❓ Troubleshooting

**"Invalid API key" or blank page:**
- Double-check your `.env` file has the correct keys with no extra spaces
- Make sure the file is named `.env` not `.env.example`

**"relation does not exist" errors:**
- Run the `supabase_schema.sql` file in the Supabase SQL Editor

**Images not uploading:**
- Make sure the `supabase_schema.sql` was fully executed — it creates the storage bucket and policies

**Auth not working:**
- In Supabase dashboard → Authentication → Settings, make sure "Enable email signups" is ON
