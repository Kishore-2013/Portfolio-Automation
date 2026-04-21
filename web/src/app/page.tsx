import { Navbar } from "@/components/navbar/navbar"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { Process } from "@/components/sections/process"
import { Templates } from "@/components/sections/templates"
import { Testimonial } from "@/components/sections/testimonial"
import { CTA } from "@/components/sections/cta"
import { Footer } from "@/components/sections/footer"
import { BackgroundAnimation } from "@/components/sections/background-animation"
import { Snowfall } from "@/components/sections/snowfall"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans antialiased overflow-x-hidden">
      {/* Cool Background Animations */}
      <BackgroundAnimation />
      <Snowfall />

      <Navbar />

      <main className="relative">
        <Hero />
        <Features />
        <Process />
        <Templates />
        <Testimonial />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}

