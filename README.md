# 🚀 WebCraft AI — Instant AI Website Builder

WebCraft AI is a full-featured, AI-powered web application generator that transforms natural language prompts into complete, interactive, single-file HTML/JS/Tailwind web applications in real time.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Monaco Editor**, and powered by the **Groq API / OpenAI SDK**.

---

## ✨ Key Features

- ⚡ **Real-Time Streaming Generation**: Watch your website build live with streaming AI tokens.
- 🎨 **Dynamic Color & Theme Engine**: Supports light, dark, pastel, vibrant, neon, and custom color palettes requested in prompts.
- 🖼️ **Context-Aware Unsplash Photos**: Uses topic-matched Unsplash photos with automatic fallback placeholders for missing/broken URLs.
- 📱 **Responsive Viewport Controls**: Switch seamlessly between Desktop, Tablet (768px), and Mobile (375px) device preview frames.
- 💻 **Monaco Code Editor**: Live, bi-directional editing with instant iframe sync.
- 🔄 **Anchor Link Trap & Smooth Scroll**: Smoothly handles in-page section links (`#menu`, `#pricing`, `#contact`) inside the preview iframe.
- 📥 **One-Click Export**: Copy single-file production HTML or download `website.html` directly with confetti celebration.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v4 (`@tailwindcss/vite`), Zustand v5
- **Code Editor**: `@monaco-editor/react`
- **Icons**: Lucide React
- **AI SDK**: `openai` (configured for Groq API streaming)
- **Interactive Injected CDNs**: Tailwind CSS CDN, Alpine.js v3, Lucide Icons

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/mini-website-builder.git
cd mini-website-builder
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_AI_API_KEY=your_groq_api_key_here
VITE_AI_BASE_URL=https://api.groq.com/openai/v1
VITE_AI_MODEL=openai/gpt-oss-120b
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

```bash
npm run build
npm run preview
```

---

## 📄 License
MIT License
