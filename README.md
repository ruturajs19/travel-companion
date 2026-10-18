# 🌍 Travel Companion

> An end-to-end, AI-powered travel planning, collaboration, and community platform built with a high-performance modern TypeScript monorepo architecture.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📖 Architecture & Design Documentation

For a comprehensive architectural breakdown, sequence diagrams, data schemas, and interview deep-dives, read the **[High-Level Design Document (HLD)](./docs/HLD.md)**.

Highlights covered in the HLD:
- **Clean Architecture & Modular Monolith**: NestJS API + Next.js App Router with shared Zod contracts.
- **Secure Authentication Flow**: One-time code OAuth exchange pattern preventing token leaks in URLs.
- **AI Engine & Cost Optimization**: Deterministic SHA-256 prompt caching targeting >40% cache hit rates.
- **pgvector Semantic Search**: Hybrid relational + 768-dim vector embeddings for intent-based discovery.
- **SSR Hydration Architecture**: Zero layout shift and zero hydration mismatch with `useSyncExternalStore`.
- **Senior Full Stack Interview FAQs**: Technical rationales, trade-offs, and scaling strategies.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (Turbopack, App Router, React 19), Tailwind CSS v4, Lucide Icons.
- **Backend API**: NestJS 10, Passport JWT & Google OAuth 2.0, Argon2id, Zod Validation Pipes.
- **Database & Storage**: PostgreSQL 16 with `pgvector` extension, Prisma ORM, Cloudinary CDN.
- **AI & Embeddings**: Google Gemini 3.5 Flash, Gemini Embedding 001, pluggable strategy providers.
- **Monorepo Tooling**: `pnpm` workspaces, `tsup`, ESLint 9, Prettier.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- `pnpm` 9+
- Docker & Docker Compose (for PostgreSQL + pgvector)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ruturajs19/travel-companion.git
cd travel-companion
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Start Database (PostgreSQL + pgvector)
```bash
docker compose up -d
```

### 4. Push Database Schema & Generate Prisma Client
```bash
pnpm --filter @travel-companion/api prisma:db:push
```

### 5. Start Development Servers
```bash
pnpm dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- Backend REST API: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
