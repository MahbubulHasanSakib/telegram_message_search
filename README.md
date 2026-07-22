# Production-Grade AI Telegram Message Search Web Application

An enterprise full-stack AI application for searching Telegram channel and group export JSON files using natural language semantic queries (e.g. searching *"Find messages mentioning drugs"* surfaces *"cocaine"*, *"heroin"*, *"MDMA"*).

---

## 🚀 Quick Start for Reviewers & Recruiters

You can run the entire application stack (Frontend, Backend API, PostgreSQL Database) with a **single command**:

```bash
docker compose up --build
```

Once running, access:
- 💻 **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- 📚 **Backend OpenAPI Swagger Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- 🏥 **Backend Health Check**: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 14/15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query (v5), React Hook Form, Zod.
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Qdrant Vector DB, Groq AI API, Pino Logger, Swagger, Jest.
- **Deployment & Infra**: Multi-stage Docker, Docker Compose, Vercel, Render, Neon PostgreSQL, Qdrant Cloud.

---

## 🧪 Testing the Application

1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. Drag & drop a Telegram export `.json` file (standard Telegram Desktop `result.json` or `tg-export` format).
3. Execute natural language semantic queries using the search bar or preset chips:
   - `"Find messages mentioning drugs"`
   - `"Find malware discussions"`
   - `"Show suspicious messages"`
4. Every search result displays:
   - 🕒 **Timestamp**
   - 👤 **Sender Handle / User ID**
   - 💬 **Message Content Text**
   - 🏷️ **AI Relevance Score (0-100%)**

---

## 🔬 Running Tests

```bash
# Run backend Jest unit & integration test suite (24 tests)
npm --prefix apps/backend run test

# Run production build validation
npm --prefix apps/backend run build
npm --prefix apps/frontend run build
```
