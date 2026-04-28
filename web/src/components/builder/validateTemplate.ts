/**
 * validateTemplate.ts
 * 
 * Run this on your template files BEFORE passing them to createInstance().
 * Catches the most common causes of blank Sandpack previews.
 * 
 * Usage:
 *   import { validateTemplate } from "./validateTemplate"
 *   const result = validateTemplate(myTemplateFiles)
 *   if (!result.valid) console.error(result.errors)
 */

import { VirtualFileSystem } from "./fileStore"

interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
    fixedFiles?: VirtualFileSystem
}

export function validateTemplate(files: VirtualFileSystem): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const fixedFiles = { ...files }

    // Helper to check for a file with or without leading slash
    const findFile = (name: string) => files[name] || files["/" + name]

    // ─── Check 1: Entry file exists ──────────────────────────────────────────
    // Sandpack template="react" looks for src/index.js as entry
    const indexJs  = findFile("src/index.js")
    const indexJsx = findFile("src/index.jsx")

    if (!indexJs && !indexJsx) {
        warnings.push("Missing src/index.js — adding default React 18 entry file")
        fixedFiles["src/index.js"] = {
            code: [
                'import React from "react";',
                'import { createRoot } from "react-dom/client";',
                'import App from "./App";',
                '',
                'const container = document.getElementById("root");',
                'const root = createRoot(container);',
                'root.render(<App />);',
            ].join("\n"),
            language: "javascript"
        }
    }

    // ─── Check 2: App component exists ───────────────────────────────────────
    const appJs  = findFile("src/App.js")
    const appJsx = findFile("src/App.jsx")

    if (!appJs && !appJsx) {
        errors.push("Missing App component. Add src/App.js or src/App.jsx.")
    }

    // ─── Check 3: index.js imports App correctly ──────────────────────────────
    const indexCode = files["/src/index.js"]?.code ?? files["/src/index.jsx"]?.code ?? ""
    if (indexCode && !indexCode.includes("createRoot") && !indexCode.includes("ReactDOM.render")) {
        errors.push(
            "/src/index.js does not call createRoot() or ReactDOM.render(). " +
            "The preview will be blank. Add: createRoot(document.getElementById('root')).render(<App />)"
        )
    }

    // ─── Check 4: HTML root div ───────────────────────────────────────────────
    // Sandpack template="react" provides its own index.html with <div id="root">
    // so this is only needed if you're using template="vanilla"
    const htmlFile = files["/public/index.html"] ?? files["/index.html"]
    if (htmlFile && !htmlFile.code.includes('id="root"') && !htmlFile.code.includes("id='root'")) {
        errors.push(
            "index.html is missing <div id=\"root\"></div>. " +
            "React cannot mount without a root element."
        )
    }

    // ─── Check 5: No circular imports ────────────────────────────────────────
    // Basic check: App shouldn't import itself
    const appCode = files["/src/App.js"]?.code ?? files["/src/App.jsx"]?.code ?? ""
    if (appCode.includes('from "./App"') || appCode.includes("from './App'")) {
        errors.push("App.js imports itself — circular import will crash the bundler.")
    }

    // ─── Check 6: Warn about .jsx files when using template="react" ──────────
    const jsxFiles = Object.keys(files).filter(p => p.endsWith(".jsx"))
    if (jsxFiles.length > 0) {
        warnings.push(
            `Found .jsx files: ${jsxFiles.join(", ")}. ` +
            "Sandpack template='react' handles .jsx fine, but ensure your imports " +
            "don't include the extension (use './Hero' not './Hero.jsx')."
        )
    }

    // ─── Check 7: File code is not empty ─────────────────────────────────────
    Object.entries(files).forEach(([path, file]) => {
        if (!file.code || file.code.trim() === "") {
            warnings.push(`${path} has empty code — this may cause import errors.`)
        }
    })

    // ─── Check 8: portfolioData.js uses named or default export ──────────────
    const dataFile = Object.keys(files).find(p => p.includes("portfolioData"))
    if (dataFile) {
        const code = files[dataFile]?.code ?? ""
        if (!code.includes("export default") && !code.includes("export const")) {
            warnings.push(
                `${dataFile} has no export statement. ` +
                "Add 'export default portfolioData' or 'export const portfolioData = ...'"
            )
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        fixedFiles: Object.keys(fixedFiles).length > Object.keys(files).length
            ? fixedFiles
            : undefined
    }
}

/**
 * Quick dev helper — call this in createInstance() to catch issues early
 * 
 * Usage in fileStore.ts createInstance():
 *   if (process.env.NODE_ENV === "development") {
 *       const validation = validateAndLog(templateFiles)
 *       if (validation.fixedFiles) filesCopy = { ...filesCopy, ...validation.fixedFiles }
 *   }
 */
export function validateAndLog(files: VirtualFileSystem): ValidationResult {
    const result = validateTemplate(files)
    return result
}

