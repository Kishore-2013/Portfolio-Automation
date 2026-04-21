# 🚀 Visme AI Portfolio Generator

**Visme AI Portfolio Generator** is a high-performance automation platform that transforms raw resumes into stunning, data-driven portfolios in seconds. Built for developers and professionals who want a premium digital presence with zero manual effort.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![AI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Ollama-blueviolet.svg)

---

---

## 🔄 How it Works: End-to-End Workflow

The platform automates the entire portfolio creation lifecycle through the following steps:

1.  **Resume Ingestion**: The user uploads a PDF via the `Dashboard (web)`.
2.  **AI Extraction**: The `Automation Engine (server1)` parses the PDF using OpenAI or Ollama, calculating dynamic metrics and visual prompts.
3.  **Project Orchestration**: The engine clones a selected template from `server1/templates/` into a new, unique folder in `server1/instances/`.
4.  **AI Asset Generation**: DALL-E 3 generates bespoke project illustrations based on descriptions found in the resume.
5.  **Data Injection**: The parsed JSON data and generated assets are injected into the portfolio instance.
6.  **Live Preview**: The engine spawns a Vite server for the specific instance, providing a real-time, hot-reloading preview at a dedicated port.
7.  **Final Polish**: Users can refine their data in the dashboard, which instantly updates the `portfolioData.json` on the instance disk.

---

## 🏗️ Technical Architecture & Directory Structure

### Monorepo Overview
```text
├── server1/                 # The Orchestration Hub (Express + Node.js)
│   ├── src/                 # Engine Logic
│   │   ├── controllers/      # API Request Handlers
│   │   ├── services/         # Core Logic (AI, Assets, Data Injector, Git)
│   │   ├── shared/           # Common Types and Utils
│   │   └── routes/           # API Endpoint Definitions
│   ├── templates/           # Master Portfolio Source Templates
│   ├── instances/           # Generated Project Folders (Ignored by Git)
│   ├── uploads/             # Persistent User Resume PDFs
│   └── temp/                # Ephemeral Processing Storage
├── web/                     # The Builder Dashboard (Next.js + Tailwind)
│   ├── src/                 # Dashboard Application Code
│   │   ├── components/      # UI Blocks (Builder, Preview, Auth)
│   │   ├── hooks/           # Custom React Logic
│   │   └── lib/             # API Clients and Utilities
└── README.md                # Project Blueprint
```

---

## 🛠️ Getting Started & Setup Guide

### 1. Prerequisite Configuration
Ensure you have the following services active:
- **Supabase**: Initialize a project and run the provided SQL schema.
- **OpenAI**: Ensure you have an API key with `gpt-4o` and `dall-e-3` access.
- **Git**: Configured with a personal access token for automated repo creation.

### 2. Environment Setup
Fill in the following in `server1/.env`:
```env
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_TOKEN=...
INSTANCES_PATH="C:\absolute\path\to\server1\instances"
```

### 3. Running Locally
```bash
# Install root dependencies
npm install

# Start both Dashboard and API Engine
npm run dev
```

---

## 🚀 Deployment Strategy

### Portfolio Instances
- **Vercel**: Portfolios are deployed as static Vite projects.
- **GitHub**: The engine creates a new repository for each project and pushes the code automatically.

### Platform Dashboard
The `web/` application can be deployed to Vercel as a standard Next.js app.

---

## ✨ Advanced Features

### 🖼️ AI Image Engine
Uses DALL-E 3 to create isometric illustrations. The logic resides in `AIService.ts` and `AssetService.ts`. Images are saved locally to speed up preview loading.

### 📈 Dynamic Analytics
The parser calculates professional stats like "Years Experience" and "Project Volume" using LLM logic, ensuring your portfolio hero section is always data-accurate.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Developed with ❤️ for the Developer Community.
