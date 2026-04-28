export interface VirtualFile {
    code: string
    language?: string
}

export type VirtualFileSystem = Record<string, VirtualFile>

export const builderFiles: VirtualFileSystem = {
    "/src/App.js": {
        code: `export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem" }}>
      <h1>👋 Your Portfolio</h1>
      <p>Generate a portfolio from your resume to see it here.</p>
    </div>
  );
}`,
        language: "jsx",
    },
    "/src/index.js": {
        code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);`,
        language: "jsx",
    },
    "/src/components/Hero.jsx": {
        code: `export default function Hero() {
  return (
    <section className="hero">
      <h1>I'm a Full Stack Developer</h1>
      <p>Building high-performance web applications.</p>
    </section>
  );
}`,
        language: "jsx"
    },
    "/src/components/Projects.jsx": {
        code: `export default function Projects() {
  return (
    <section className="projects">
      <h2>My Projects</h2>
      <div className="grid">
        {/* Project cards go here */}
      </div>
    </section>
  );
}`,
        language: "jsx"
    },
    "/src/data/portfolioData.js": {
        code: `export const portfolioData = {
  name: "Alex Dev",
  title: "Senior Full Stack Engineer",
  experience: [
    { company: "TechCorp", role: "Leade Dev", period: "2021-Present" }
  ]
};`,
        language: "javascript"
    }
}

