# 🚀 WebCraft AI — Dual-Engine AI Website Builder SaaS

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://mini-website-builder-omega.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-8.3-blue.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Database-emerald.svg)](https://supabase.com/)
[![Groq Llama 70B](https://img.shields.io/badge/Primary_AI-Groq_Llama_3.3_70B-orange.svg)](https://groq.com/)
[![Google Gemini](https://img.shields.io/badge/Fallback_AI-Google_Gemini_Flash-blue.svg)](https://ai.google.dev/)

🔗 **Live Production URL**: [https://mini-website-builder-omega.vercel.app](https://mini-website-builder-omega.vercel.app)

**WebCraft AI** is a production-grade, full-stack AI-powered website builder SaaS application. It enables users to generate full, responsive, multi-section single-page websites in real-time using natural language prompts, complete with interactive Alpine.js controls, live Monaco code editing, automatic HD Unsplash photo hydration, voice prompt recognition, and cloud project history.

---

## 📸 Platform Highlights & Demo Preview

```
+-----------------------------------------------------------------------------------+
|  [AI Chat Sidebar]             |  [Live Preview Canvas & Device Toggles]          |
|  - Prompt: "Artisanal Bakery"  |  Desktop | Tablet | Mobile | Code Editor View     |
|  - Router: Groq 70B -> Gemini  |  +--------------------------------------------+  |
|  - Live SSE Progress           |  |  Hero Banner with Sourdough & Pastry Photos|  |
|  - Voice Input                 |  |  Alpine.js Menu Tabs (Coffee, Pastry)      |  |
|  - Saved Cloud Projects        |  |  Embedded Reservation Form (No Overlays)   |  |
|                                |  +--------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 🏗️ Architectural Highlights & Key Engineering Features

### 1. ⚡ Dual-API Failover Architecture (Senior-Level Router)
- **Primary Engine**: **Groq API** running `llama-3.3-70b-versatile` / `llama3-70b-8192` (~5x faster generation, zero latency spikes).
- **Secondary Engine**: **Google Gemini API** (`gemini-3.5-flash-lite` / `gemini-3.6-flash`).
- **Self-Healing Router**: Automatically detects key prefix formats (`gsk_` vs `AQ./AIza`). If the primary Groq provider encounters rate limits or network errors, the system catches the exception and fails over to Gemini seamlessly without crashing the UI or showing broken states.

### 2. 🖼️ Smart HD Image Hydration Engine (Zero Broken <img> Links)
- **Problem**: Traditional LLMs often invent broken Unsplash links, hallucinate invalid URLs, or generate generic mismatched images.
- **Solution**: The system prompt forces the LLM to output lightweight transparent base64 placeholders (`data:image/gif;base64,...`) for every `<img>` tag alongside descriptive `alt` attributes.
- **Hydration Engine**: Upon stream completion, `hydrateImages(htmlString)` parses the document via browser `DOMParser` and queries the **Unsplash Search API**. If API keys are rate limited, a curated **Topic Photo Dictionary** (`bakery`, `coffee`, `sneakers`, `realestate`, `food`, `tech`, `fitness`) automatically assigns high-resolution photos matching the `alt` context.

### 3. ⚡ Resilient Mid-Stream Stream Recovery
- Stream consumption is wrapped directly inside the attempt loop. If Google's API drops mid-way or returns a transient 503 during long prompt edit requests, the system recovers generated HTML and finishes parsing without throwing unhandled promise rejections.

### 4. 🔒 Supabase Auth & Multi-Tenant Row Level Security (RLS)
- Integrated `@supabase/supabase-js` for Email/Password & Google OAuth authentication.
- **Cascading RLS Policies**: Database access is enforced strictly at the PostgreSQL layer using Supabase Row Level Security.
  - `projects`: Users can only SELECT, INSERT, UPDATE, and DELETE rows where `user_id = auth.uid()`.
  - `messages`: Cascading policy verifies that `messages.project_id` belongs to a project owned by `auth.uid()`.

### 5. 🛡️ Debounced Auto-Save & Zero-Wipe Locks
- **Race Condition Guard**: `isProjectLoading` locks prevent page refreshes from overwriting database entries with empty states.
- **Debounced Sync**: Monaco code edits and AI updates automatically sync to Supabase 2 seconds after typing stops.

---

## 🛠️ Tech Stack & Key Libraries

- **Frontend Framework**: React 19, Vite 8, Tailwind CSS v4, Zustand v5.
- **AI Engine 1 (Primary)**: Groq SDK (`llama-3.3-70b-versatile`).
- **AI Engine 2 (Fallback)**: `@google/generative-ai` (`gemini-3.5-flash-lite`, `gemini-3.6-flash`).
- **Code Editor**: `@monaco-editor/react` (VS Code Monaco instance).
- **Image Hydration Engine**: Unsplash Search REST API v1 + Topic Photo Resolver.
- **Database & Auth**: Supabase Auth & PostgreSQL Database with RLS.
- **Voice Recognition**: Native Browser Speech Recognition API.
- **UI Icons & FX**: Lucide React, Canvas Confetti.

---

## 🔑 Environment Variables Setup

Create a `.env.local` file in the project root:

```env
# 1. Primary AI Engine (Groq Llama 70B - Ultra Fast)
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here

# 2. Fallback AI Engine (Google Gemini)
VITE_AI_API_KEY=AQ.your_gemini_api_key_here
VITE_AI_MODEL=gemini-3.5-flash-lite
VITE_AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# 3. Unsplash Search API (Optional)
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# 4. Supabase Auth & Cloud Database
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
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

## 🏃‍♂️ Local Development

```bash
# Clone the repository
git clone https://github.com/Areebakn26/mini-website-builder.git
cd mini-website-builder

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
