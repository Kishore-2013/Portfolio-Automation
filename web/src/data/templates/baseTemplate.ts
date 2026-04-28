import { Template } from "../templates";

export const baseTemplate: Template = {
  id: "base-template",
  name: "Base Template",
  title: "Base Template",
  category: "General",
  description: "A clean starting point for your portfolio.",
  tags: ["Base", "Clean"],
  imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2340&auto=format&fit=crop",
  previewImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2340&auto=format&fit=crop",
  author: "System",
  version: "1.0.0",
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  files: {
    "/public/index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Portfolio Builder</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      language: "html"
    },
    "/src/index.js": {
      code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./styles.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}`,
      language: "javascript"
    },
    "/src/App.js": {
      code: `import React from "react";
import { portfolioData } from "./portfolioData.js";

export default function App() {
  return (
    <div className="layout">
      <h1>{portfolioData.name}'s Portfolio</h1>
      <p>Role: {portfolioData.role}</p>
      <p>Start building your portfolio by editing <code>src/App.js</code></p>
    </div>
  );
}`,
      language: "javascript"
    },
    "/src/portfolioData.js": {
      code: `export const portfolioData = {
  name: "New User",
  role: "Developer",
  bio: "Welcome to your new portfolio.",
  skills: [],
  projects: []
};`,
      language: "javascript"
    },
    "/src/styles.css": {
      code: `body {
  margin: 0;
  font-family: sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.layout {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  background: #1e293b;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}`,
      language: "css"
    }
  }
};

