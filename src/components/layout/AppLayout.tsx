import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils.js";
import { ThemeSwitcher } from "@/components/ThemeSwitcher.js";

export interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
        <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 font-semibold"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg">PEA Dashboard</span>
          </motion.div>
          <div className="flex-1" />
          <ThemeSwitcher />
        </div>
      </header>
      <main className="container px-4 py-8 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
