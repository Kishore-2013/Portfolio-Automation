import { Template } from "../templates";

export const creativeTemplate: Template = {
  id: "creative-template",
  name: "Creative Portfolio",
  title: "Creative Portfolio",
  category: "Creative",
  description: "High contrast, bold typography, and a unique grid-based layout.",
  tags: ["React", "CSS Grid", "Creative"],
  imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2340&auto=format&fit=crop",
  previewImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2340&auto=format&fit=crop",
  author: "Daniel Brooks",
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
    <title>Creative Portfolio</title>
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
import { Hero } from "./components/Hero.jsx";
import { Projects } from "./components/Projects.jsx";

export default function App() {
  return (
    <div className="portfolio-app">
      <Hero />
      <main className="main-content">
        <Projects />
      </main>
    </div>
  );
}`,
      language: "javascript"
    },
    "/src/components/Hero.jsx": {
      code: `import React from "react";
import { portfolioData } from "../data/portfolioData.js";

export const Hero = () => {
  return (
    <header className="hero">
      <h1>{portfolioData.name.toUpperCase()}</h1>
      <p className="role">{portfolioData.role}</p>
    </header>
  );
};`,
      language: "javascript"
    },
    "/src/components/Projects.jsx": {
      code: `import React from "react";
import { portfolioData } from "../data/portfolioData.js";

export const Projects = () => {
  return (
    <section className="projects-section">
      <div className="projects-grid">
        {portfolioData.projects.map((project, index) => (
          <div key={index} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};`,
      language: "javascript"
    },
    "/src/data/portfolioData.js": {
      code: `export const portfolioData = {
  name: "Daniel Brooks",
  role: "Creative Developer",
  projects: [
    { title: "Project A", description: "Desc A" },
    { title: "Project B", description: "Desc B" }
  ]
};`,
      language: "javascript"
    },
    "/src/styles.css": {
      code: `body { margin: 0; background: #fee2e2; color: #1a1a1a; }`,
      language: "css"
    }
  }
};

