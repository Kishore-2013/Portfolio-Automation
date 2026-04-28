import { Template } from "../templates";

export const developerTemplate: Template = {
  id: "developer-template",
  name: "Developer Portfolio",
  title: "Developer Portfolio",
  category: "Developer",
  description: "Modern developer portfolio template",
  tags: ["React", "JavaScript"],
  imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2340&auto=format&fit=crop",
  previewImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2340&auto=format&fit=crop",
  author: "Alex Rivera",
  version: "1.0.0",
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  files: {
    "index.html": {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Developer Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      language: "html"
    },
    "src/index.js": {
      code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found");
}`,
      language: "javascript"
    },
    "src/App.js": {
      code: `import React from "react";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";

export default function App() {
  return (
    <div className="portfolio-app">
      <Hero />
      <main>
        <Projects />
      </main>
    </div>
  );
}`,
      language: "javascript"
    },
    "src/components/Hero.jsx": {
      code: `import React from "react";
import { portfolioData } from "../data/portfolioData";

export const Hero = () => {
  return (
    <header className="hero">
      <h1>{portfolioData.name || "Default Name"}</h1>
      <p className="role">{portfolioData.role || "Developer"}</p>
      <div className="skills">
        {(portfolioData.skills || []).map((skill) => (
          <span key={skill} className="skill-badge">{skill}</span>
        ))}
      </div>
    </header>
  );
};`,
      language: "javascript"
    },
    "src/components/Projects.jsx": {
      code: `import React from "react";
import { portfolioData } from "../data/portfolioData";

export const Projects = () => {
  return (
    <section className="projects">
      <h2 style={{ padding: '0 2rem' }}>Featured Projects</h2>
      <div className="projects-grid">
        {(portfolioData.projects || []).map((project, index) => (
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
    "src/data/portfolioData.js": {
      code: `export const portfolioData = {
  name: "Jani Pasha",
  role: "Senior Full Stack Dev",
  skills: ["React", "TypeScript", "Node.js", "Tailwind"],
  projects: [
    { title: "Automation Engine", description: "Prototyping next-gen AI tools." }
  ]
};`,
      language: "javascript"
    },
    "src/styles.css": {
      code: `body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0b0b0e; color: #fff; }
.hero { padding: 5rem 2rem; text-align: center; background: linear-gradient(to bottom, #111115, #0b0b0e); border-bottom: 1px solid #1c1c22; }
.hero h1 { font-size: 3.5rem; margin: 0; background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; }
.role { font-size: 1.25rem; color: #94a3b8; margin-top: 1rem; font-weight: 500; }
.skill-badge { background: #1a1a24; padding: 0.4rem 1rem; border-radius: 99px; margin: 0.3rem; display: inline-block; font-size: 0.75rem; border: 1px solid #2a2a35; color: #818cf8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; padding: 2rem; }
.project-card { background: #111115; padding: 2rem; border-radius: 12px; border: 1px solid #1c1c22; transition: all 0.2s; }
.project-card:hover { border-color: #6366f1; transform: translateY(-4px); background: #16161f; }
.project-card h3 { color: #6366f1; margin-top: 0; }
.project-card p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; }`,
      language: "css"
    }
  }
};

