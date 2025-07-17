import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Monitor, Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme, resolvedTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return resolvedTheme === 'dark' ? 
        <Monitor className="w-4 h-4" /> : 
        <Monitor className="w-4 h-4" />;
    }
    return theme === 'dark' ? 
      <Moon className="w-4 h-4" /> : 
      <Sun className="w-4 h-4" />;
  };

  const getTitle = () => {
    if (theme === 'system') return `System (${resolvedTheme})`;
    return theme === 'dark' ? 'Dark mode' : 'Light mode';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={getTitle()}
      className="relative"
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;