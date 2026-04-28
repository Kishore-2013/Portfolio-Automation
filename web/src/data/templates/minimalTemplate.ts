import { Template } from "../templates";

export const minimalTemplate: Template = {
  id: "minimal-template",
  name: "Minimal Portfolio",
  title: "Minimal Portfolio",
  category: "Minimal",
  description: "Less is more. A clean, balanced layout.",
  tags: ["Minimal", "Sleek"],
  imageUrl: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=2340&auto=format&fit=crop",
  previewImage: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=2340&auto=format&fit=crop",
  author: "Sarah J.",
  version: "1.0.0",
  dependencies: {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  files: {
    "/public/index.html": {
      code: `<!DOCTYPE html><html><body><div id="root"></div></body></html>`,
      language: "html"
    },
    "/src/index.js": {
      code: `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.js";\nimport "./styles.css";\nconst root = createRoot(document.getElementById("root"));\nroot.render(<App />);`,
      language: "javascript"
    },
    "/src/App.js": {
      code: `import React from "react";\nimport { portfolioData } from "./portfolioData.js";\nexport default function App() {\n  return <div><h1>{portfolioData.name}</h1><p>{portfolioData.role}</p></div>;\n}`,
      language: "javascript"
    },
    "/src/portfolioData.js": {
      code: `export const portfolioData = { name: "Sarah Minimal", role: "Interface Designer", projects: [] };`,
      language: "javascript"
    },
    "/src/styles.css": {
      code: `body { margin: 0; font-family: sans-serif; background: #fff; color: #000; }`,
      language: "css"
    }
  }
};

