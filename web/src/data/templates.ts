import { LayoutGrid, Timer, ShieldCheck, Laptop } from "lucide-react"

export const templateCategories = ["All", "Minimal", "Creative", "Developer", "Corporate", "Modern"]

export const templateStats = [
  { label: "Available Themes", value: "24+", icon: LayoutGrid },
  { label: "Avg. Build Time", value: "< 2m", icon: Timer },
  { label: "SEO Score", value: "98/100", icon: ShieldCheck },
  { label: "Device Support", value: "All", icon: Laptop },
]

import { VirtualFileSystem } from "@/components/builder/fileStore";

export interface Template {
  id: string;
  title: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  imageUrl: string;
  previewImage: string;
  badge?: "New" | "Popular";
  author: string;
  version: string;
  files: VirtualFileSystem;
  dependencies?: Record<string, string>;
}

export { templates } from "./templates/index";

