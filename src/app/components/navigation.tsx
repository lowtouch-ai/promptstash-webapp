import { Search, Plus, Clipboard, Github, Settings, Moon, Sun, ExternalLink } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useTheme } from 'next-themes';
import { useRef, useEffect } from 'react';
import { trackSearchUsed } from '@/app/services/analytics';
import packageJson from '../../../package.json';

interface NavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navigation({ searchQuery, onSearchChange }: NavigationProps) {
  const { theme, setTheme } = useTheme();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
        {/* Logo */}
        <div className="flex items-center gap-3 min-w-[240px]">
          <img
            src="https://demo2025a.lowtouch.ai/static/favicon.png"
            alt="PromptStash.io"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base leading-tight">PromptStash.io</span>
              <span className="text-[10px] text-muted-foreground leading-tight">v{packageJson.version}</span>
            </div>
            <span className="text-[10px] text-muted-foreground leading-tight">Built by the Community. Ready to Run Prompts</span>
          </div>
        </div>

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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Add new template">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Import from clipboard">
            <Clipboard className="h-4 w-4" />
          </Button>
          <a 
            href="https://github.com/lowtouch-ai/promptstash-webapp" 
            target="_blank" 
            rel="noopener noreferrer"
            title="View source code on GitHub"
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
          <Button variant="ghost" size="icon" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>

          {/* Community Links */}
          <div className="flex items-center gap-3 ml-2 pl-3 border-l text-xs">
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
    </header>
  );
}