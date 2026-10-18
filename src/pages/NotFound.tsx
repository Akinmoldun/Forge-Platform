import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ForgeLogo } from "@/components/ForgeLogo";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex min-h-svh flex-col bg-background text-foreground"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <p className="eyebrow">404</p>
        <h1 className="font-display mt-3 text-4xl tracking-[-0.02em] sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-center text-[13px] leading-6 text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="mt-8 flex gap-2">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app">Open Forge</Link>
          </Button>
        </div>
      </div>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <ForgeLogo className="size-3.5" />
          <span>Forge</span>
        </div>
      </footer>
    </motion.div>
  );
}
