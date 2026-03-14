# 📄 Resumy: AI-Powered Resume Builder

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai)](https://openai.com/)

**Resumy** is a state-of-the-art, standalone resume builder designed to help users create professional, high-impact resumes in minutes. Leveraging advanced AI, elegant design systems, and a seamless user experience, Resumy transforms the tedious process of resume creation into a creative journey.

---

## ✨ Key Features

- **🧠 AI-Powered Resume Import**: Upload existing PDF/DOCX files and let our AI parse and structure your data automatically.
- **🎨 Dynamic Design Engine**: Switch between multiple professional templates (Modern, Classic, Creative, Executive) instantly.
- **⚡ Real-time Editor**: A smooth, responsive editor with instant preview and autosave capabilities.
- **🔍 Intelligent Suggestions**: Get AI-driven advice for your summary, experience descriptions, and skills.
- **🛡️ Secure & Scalable**: Integrated virus scanning for uploads and robust RLS (Row Level Security) via Supabase.
- **📊 Usage Tracking**: Built-in plan limits and AI usage tracking to manage resources effectively.
- **📄 High-Fidelity PDF Export**: Consistent, professional PDF generation using a headless Puppeteer engine.
- **🔄 Sync Career DNA**: Automatically build a "Universal Career DNA" profile based on your resume data for future career moves.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/) |
| **Database/Auth**| [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage) |
| **AI Processing** | [OpenAI API](https://openai.com/), [Gemini AI](https://deepmind.google/technologies/gemini/), [Tesseract.js](https://tesseract.projectnaptha.com/) |
| **PDF Engine** | [Puppeteer](https://pptr.dev/) (Headless Chromium) |
| **Infrastructure**| [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (Optional, for easy deployment)
- [Supabase Account](https://supabase.com/)
- [OpenAI API Key](https://platform.openai.com/)

### 1. Database Setup (Supabase)

1. Create a new Supabase project.
2. Run the provided [setup_database.sql](./setup_database.sql) in the Supabase SQL Editor to create necessary tables and RLS policies.
3. Create a Storage Bucket named `resumes` and set it to `private`.

### 2. Environment Configuration

Create environment files in their respective directories.

**Frontend (`/frontend/.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend (`/backend/.env`):**
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Running with Docker (Recommended)

Simply run the following command in the root directory:
```bash
docker-compose up -d --build
```
The frontend will be available at `http://localhost:4500` and the backend at `http://localhost:4501`.

### 4. Direct/Local Setup

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```bash
├── backend/            # Express API services
│   ├── prisma/         # Database schema (optional/secondary)
│   ├── src/
│   │   ├── controllers/# Route handlers
│   │   ├── services/   # AI, PDF, Storage, OCR logic
│   │   └── routes/     # API endpoint definitions
│   └── Dockerfile
├── frontend/           # Next.js frontend application
│   ├── app/            # Next.js App Router pages
│   ├── components/     # UI design system and editor components
│   ├── lib/            # Shared utilities and Supabase client
│   └── Dockerfile
├── shared/             # Shared types and constants
├── setup_database.sql  # Database initialization script
└── docker-compose.yml  # Orchestration for local development
```

---

## 📜 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by the Resumy Team</p>
