import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // 1. Parse the incoming request data (e.g., resume raw text, parsed JSON, template ID)
        const body = await request.json();
        const { resumeData, templateId } = body;

        // TODO: In a real app, you would pass `resumeData` to an LLM (OpenAI/Anthropic)
        // or a generator engine to construct the actual customized source code files.

        // For now, we mock the generated Next.js / React portfolio file structure 
        // that the Sandpack Builder requires.
        const generatedFiles = {
            // Main entry points
            "/src/index.js": `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\ncreateRoot(document.getElementById("root")).render(<App />);`,
            "/src/App.js": `import Hero from "./components/Hero";\nimport Projects from "./components/Projects";\nimport portfolioData from "./data/portfolioData";\n\nexport default function App() {\n  return (\n    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0f0f1a", minHeight: "100vh", color: "#fff" }}>\n      <Hero data={portfolioData} />\n      <Projects projects={portfolioData.projects} />\n    </div>\n  );\n}`,

            // Components
            "/src/components/Hero.jsx": `export default function Hero({ data }) {\n  return (\n    <section style={{ padding: "5rem 2rem", textAlign: "center", background: "linear-gradient(135deg, #1a1a3e, #0f0f1a)" }}>\n      <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0 }}>{data.name}</h1>\n      <p style={{ fontSize: "1.25rem", color: "#8b8bab", margin: "1rem 0" }}>{data.title}</p>\n      <p style={{ maxWidth: 600, margin: "0 auto", lineHeight: 1.7, color: "#aaa" }}>{data.bio}</p>\n    </section>\n  );\n}`,
            "/src/components/Projects.jsx": `export default function Projects({ projects }) {\n  return (\n    <section style={{ padding: "4rem 2rem", maxWidth: 900, margin: "0 auto" }}>\n      <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem" }}>Projects</h2>\n      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>\n        {projects.map((p) => (\n          <div key={p.name} style={{ background: "#1a1a2e", borderRadius: 16, padding: "1.5rem", border: "1px solid #ffffff0d" }}>\n            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700 }}>{p.name}</h3>\n            <p style={{ margin: 0, color: "#8b8bab", fontSize: "0.9rem", lineHeight: 1.6 }}>{p.description}</p>\n          </div>\n        ))}\n      </div>\n    </section>\n  );\n}`,

            // Data inferred from User's Resume
            "/src/data/portfolioData.js": `const portfolioData = {\n  name: "${resumeData?.name || "Alex Chen"}",\n  title: "${resumeData?.title || "Full Stack Engineer"}",\n  bio: "${resumeData?.summary || "Passionate about building scalable web apps and elegant UI/UX experiences."}",\n  projects: ${JSON.stringify(resumeData?.projects || [
                { name: "DevFlow", description: "A real-time collaborative code editor for remote teams." },
                { name: "AuraML", description: "No-code machine learning pipeline builder." }
            ], null, 2)}\n};\n\nexport default portfolioData;`
        };

        // 2. Return the file structure correctly formatted for the Builder
        return NextResponse.json({
            success: true,
            files: generatedFiles
        });

    } catch (error) {
        console.error("Failed to generate portfolio API:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate portfolio files" },
            { status: 500 }
        );
    }
}

