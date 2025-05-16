
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={theme === "dark"}
        onCheckedChange={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      <span className="sr-only md:not-sr-only text-xs md:text-sm text-muted-foreground">
        {theme === "light" ? "Light" : "Dark"}
      </span>
    </div>
  );
}
