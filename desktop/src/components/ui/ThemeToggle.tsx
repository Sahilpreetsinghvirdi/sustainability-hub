import { Moon, Sun } from 'lucide-react';
import { toggleTheme, useTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${isDark ? 'is-dark' : ''}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Good morning ☀️' : 'Good night 🌙'}
    >
      <span className="tt-star" />
      <span className="tt-star" />
      <span className="tt-star" />
      <span className="tt-knob">
        <Sun className="tt-icon tt-sun w-3.5 h-3.5" />
        <Moon className="tt-icon tt-moon w-3 h-3" />
      </span>
    </button>
  );
}
