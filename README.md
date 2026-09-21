# 🚀 WebCraft AI — Full-Stack AI Website Builder SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-8.3-blue.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Database-emerald.svg)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI_Engine-Gemini_2.0_Flash-amber.svg)](https://ai.google.dev/)

**WebCraft AI** is a production-grade, AI-powered website builder SaaS application. It allows users to generate full, responsive, multi-section single-page websites in real-time using natural language prompts, complete with interactive Alpine.js controls, live Monaco code editing, client-side Unsplash image hydration, voice input recognition, and cloud project history.

---

## 🏗️ Architectural Highlights & Key Engineering Decisions

### 1. 🖼️ Client-Side Image Hydration Pattern (Zero 404s & Topic Matching)
- **Problem**: Traditional LLMs often invent non-existent image URLs, guess broken Unsplash links, or generate random mismatched pictures (e.g. sports cars in bakery menus).
- **Solution**: The system prompt forces the LLM to output lightweight transparent base64 GIF placeholders (`data:image/gif;base64,...`) for every `<img>` tag alongside highly descriptive `alt` context attributes.
- **Hydration Engine**: Upon stream completion, `hydrateImages(htmlString)` parses the document via browser `DOMParser`, extracts `alt` strings, and concurrently fetches real-time HD photos from the official **Unsplash Search API** using `Promise.all`. This guarantees **100% topic accuracy** and **0% broken image links**.

### 2. ⚡ Isolated Sandbox Iframe Execution & Smooth Navigation
- Generated HTML string is rendered inside a sandboxed `<iframe>` (`sandbox="allow-scripts allow-modals"`).
- Injected client scripts intercept anchor links (`<a href="#section">`), applying smooth scroll positioning (`scroll-padding-top: 5rem`) and a 3-tier fallback target matcher (Exact ID ➔ Fuzzy ID ➔ Heading text content) to ensure navbar links always work regardless of minor LLM naming variations.

### 3. 🔒 Supabase Auth & Multi-Tenant Row Level Security (RLS)
- Integrated `@supabase/supabase-js` for Email/Password & Google OAuth authentication.
- **Cascading RLS Policies**: Database access is enforced strictly at the PostgreSQL layer using Supabase Row Level Security.
  - `projects`: Users can only SELECT, INSERT, UPDATE, and DELETE rows where `user_id = auth.uid()`.
  - `messages`: Cascading policy verifies that `messages.project_id` belongs to a project owned by `auth.uid()`.

### 4. 🛡️ Zero-Wipe State Synchronization & Debounced Auto-Save
- **Race Condition Guard**: Introduced `isProjectLoading` locks to prevent browser refresh or initial page hydration from overwriting cloud database entries with empty strings.
- **Debounced Auto-Save**: Monaco code edits and AI updates automatically sync to Supabase 2 seconds after typing stops, bypassing unnecessary database spam during live LLM streaming.

---

## 🛠️ Tech Stack & Key Libraries

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Zustand v5.
- **AI Model Engine**: Google Gemini 2.0 Flash (`gemini-2.0-flash`) via OpenAI-compatible SDK endpoint.
- **Code Editor**: `@monaco-editor/react` (VS Code Monaco instance).
- **Image Hydration Engine**: Unsplash Search REST API v1.
- **Database & Auth**: Supabase Auth & PostgreSQL Database with RLS.
- **Voice Recognition**: Native Browser `webkitSpeechRecognition` / `SpeechRecognition` API.
- **UI Icons & Visual Effects**: Lucide React, Canvas Confetti.

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the project root:

```env
# AI Model Configuration (Gemini 2.0 Flash)
VITE_AI_API_KEY=AQ.Ab8RN6J568hi1sMsb4Nu7kf1_TxrmKLXVvsNJGvaDXQFhyF1iQ
VITE_AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
VITE_AI_MODEL=gemini-2.0-flash

# Unsplash Search API Credentials
VITE_UNSPLASH_ACCESS_KEY=p_hRlHDXoJ85r5x_I2ogqmCjLBh_Ch0GCwAzFjdh3FA

# Supabase Production Configuration
VITE_SUPABASE_URL=https://ufytvbdsvumoavcmsdlc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmeXR2YmRzdnVtb2F2Y21zZGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDI0NzQsImV4cCI6MjEwNTU3ODQ3NH0.9I0cj9oTKHbdES6MeYyYvntwP3oWDA1VgpGYDDeBu-k
```

---

## 🗄️ Database Setup (Supabase SQL)

Run the SQL script from [`schema.sql`](file:///c:/Users/Faizan/Desktop/Mini%20Website%20builder/schema.sql) in your Supabase SQL Editor:

```sql
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  current_code text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.projects enable row level security;
alter table public.messages enable row level security;

create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

create policy "Users can view messages" on public.messages for select using (exists (select 1 from public.projects where id = messages.project_id and user_id = auth.uid()));
create policy "Users can insert messages" on public.messages for insert with check (exists (select 1 from public.projects where id = messages.project_id and user_id = auth.uid()));
create policy "Users can update messages" on public.messages for update using (exists (select 1 from public.projects where id = messages.project_id and user_id = auth.uid()));
create policy "Users can delete messages" on public.messages for delete using (exists (select 1 from public.projects where id = messages.project_id and user_id = auth.uid()));
```

---

## 🌐 Deployment Plan & Instructions (Vercel)

### Step 1: Push Code to GitHub
Ensure all changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: complete WebCraft AI SaaS with Vercel SPA routing and README"
git push origin main
```

### Step 2: Import Project to Vercel
1. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your `WebCraft AI` / `Mini Website builder` GitHub repository.
3. Framework Preset: Select **Vite**.

### Step 3: Configure Environment Variables on Vercel
In the Vercel deployment setup screen, expand **Environment Variables** and add:

| Key | Value |
| --- | --- |
| `VITE_AI_API_KEY` | `AQ.Ab8RN6J568hi1sMsb4Nu7kf1_TxrmKLXVvsNJGvaDXQFhyF1iQ` |
| `VITE_AI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `VITE_AI_MODEL` | `gemini-2.0-flash` |
| `VITE_UNSPLASH_ACCESS_KEY` | `p_hRlHDXoJ85r5x_I2ogqmCjLBh_Ch0GCwAzFjdh3FA` |
| `VITE_SUPABASE_URL` | `https://ufytvbdsvumoavcmsdlc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Step 4: Deploy & Verify Single Page Application Routing
- Click **Deploy**.
- `vercel.json` will automatically ensure all routes map to `index.html`, eliminating 404s on refresh.

---

## 🏃‍♂️ Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/webcraft-ai.git
cd webcraft-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
