import React from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore';

export const PreviewTemplate = () => {
  // Consume the injected mapped props live from Zustand
  const { portfolioData } = usePortfolioStore();

  if (!portfolioData) {
    return <div className="animate-pulse p-8">Binding neural data to blueprint...</div>;
  }

  return (
    <div className="portfolio-preview-wrapper min-h-screen p-8 text-foreground">
      {/* Hero Section Binding */}
      <header className="hero-section mb-12 space-y-4">
        <h1 className="text-5xl font-bold">{portfolioData.personal.name}</h1>
        <h2 className="text-xl text-muted-foreground leading-relaxed">
          {portfolioData.summary}
        </h2>
        
        <div className="contact-info flex gap-4 text-sm font-medium pt-4">
          {portfolioData.personal.email && <span>{portfolioData.personal.email}</span>}
          {portfolioData.personal.location && <span>• {portfolioData.personal.location}</span>}
        </div>
      </header>

      {/* Arrays & Collections Binding */}
      <section className="skills-section mb-12">
        <h3 className="text-2xl font-semibold mb-4">Core Competencies</h3>
        <div className="flex flex-wrap gap-2">
          {portfolioData.skills.map((skill, idx) => (
            <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="projects-section">
        <h3 className="text-2xl font-semibold mb-4">Selected Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioData.projects.map((project, idx) => (
            <div key={idx} className="project-card border border-border p-6 rounded-xl hover:shadow-lg transition-all">
              <h4 className="font-bold text-lg mb-2">{project.title}</h4>
              <p className="text-muted-foreground text-sm">{project.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
