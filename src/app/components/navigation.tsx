import { Search, Plus, Clipboard, Github, Settings, Moon, Sun, ExternalLink, Menu } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useTheme } from 'next-themes';
import { useRef, useEffect, useState } from 'react';
import { trackSearchUsed } from '@/app/services/analytics';
import packageJson from '../../../package.json';
import { SettingsModal } from '@/app/components/settings-modal';

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogoClick?: () => void;
  onMenuClick?: () => void;
}

export function Navigation({ searchQuery, onSearchChange, onLogoClick, onMenuClick }: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Track search usage with debouncing
  const handleSearchChange = (query: string) => {
    onSearchChange(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Track search after 1 second of inactivity (only if not empty)
    if (query.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearchUsed();
      }, 1000);
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          title="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 md:min-w-[240px] hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
          title="Return to home and clear all filters"
        >
          <img
            src="https://demo2025a.lowtouch.ai/static/favicon.png"
            alt="PromptStash.io"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="hidden sm:flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base leading-tight">PromptStash.io</span>
              <span className="text-[10px] text-muted-foreground leading-tight">v{packageJson.version}</span>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">Built by the Community. Ready to Run Prompts</span>
          </div>
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or tags"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" title="Add new template" className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Import from clipboard" className="hidden sm:inline-flex">
            <Clipboard className="h-4 w-4" />
          </Button>
          <a
            href="https://github.com/lowtouch-ai/promptstash-webapp"
            target="_blank"
            rel="noopener noreferrer"
            title="View source code on GitHub"
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Community Links */}
          <div className="hidden lg:flex items-center gap-3 ml-2 pl-3 border-l text-xs">
            <a
              href="https://github.com/lowtouch-ai/promptstash-templates"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              title="Contribute templates"
            >
              <Github className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Contribute</span>
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://lowtouch.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              title="Powered by lowtouch.ai"
            >
              <span className="hidden xl:inline">by</span> lowtouch.ai
            </a>
          </div>
        </div>
      </div>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  );
}