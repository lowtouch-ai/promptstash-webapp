import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  Save,
  Trash2,
  Github,
  HardDrive,
  ExternalLink,
  FileText,
  Eye,
  ArrowLeft,
  Send,
  Star,
  Share2,
  Link as LinkIcon,
  User,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Switch } from '@/app/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { PromptTemplate } from '@/app/data/mock-templates';
import { toast } from 'sonner';
import { 
  getTemplateVariables, 
  updateTemplateVariable 
} from '@/app/services/template-variables';
import {
  trackPromptSent,
  trackProviderSelected,
  trackFavoriteAdded,
  trackFavoriteRemoved,
  trackPermalinkShared
} from '@/app/services/analytics';
import { prependProfileToPrompt, getUserProfile } from '@/app/services/user-profile';
import { useIsMobile } from '@/app/components/ui/use-mobile';

interface TemplateDetailProps {
  template: PromptTemplate;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export function TemplateDetail({ template, onClose, onToggleFavorite }: TemplateDetailProps) {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('variables');
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [includeProfile, setIncludeProfile] = useState(true);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const isMobile = useIsMobile();

  // Check if user has a profile set
  const userProfile = getUserProfile();
  const hasProfile = userProfile && userProfile.trim().length > 0;
  
  // Debounce timer ref for auto-save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to always have current values in async callbacks
  const templateRef = useRef(template);
  const placeholderValuesRef = useRef(placeholderValues);
  const parsedPlaceholdersRef = useRef<Array<{
    name: string;
    description?: string;
    required: boolean;
    type?: string;
  }>>([]);
  
  // Keep refs in sync with current values
  useEffect(() => {
    templateRef.current = template;
  }, [template]);
  
  useEffect(() => {
    placeholderValuesRef.current = placeholderValues;
  }, [placeholderValues]);

  // Load saved values when template changes
  useEffect(() => {
    const savedValues = getTemplateVariables(template.id);
    setPlaceholderValues(savedValues);
  }, [template.id]);

  // Auto-save function with debouncing
  const autoSave = (variableName: string, value: string) => {
    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer to save after 500ms of no typing
    saveTimerRef.current = setTimeout(() => {
      updateTemplateVariable(template.id, variableName, value);
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Extract placeholders from template text
  const parsedPlaceholders = useMemo(() => {
    // Safety check: ensure template.template exists and is a string
    if (!template.template || typeof template.template !== 'string') {
      return [];
    }
    
    // If we have placeholders from YAML (inputs section), use them as the source of truth
    if (template.placeholders && template.placeholders.length > 0) {
      return template.placeholders.map(p => ({
        name: p.name,
        description: p.description,
        required: p.required ?? false,
        type: p.type,
      }));
    }
    
    // Otherwise, auto-detect from template text
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [...template.template.matchAll(regex)];
    const uniquePlaceholders = new Set(matches.map(match => match[1].trim()));
    
    return Array.from(uniquePlaceholders).map(name => ({
      name,
      description: undefined,
      required: false,
    }));
  }, [template.template, template.placeholders]);

  // Keep parsedPlaceholders ref in sync
  useEffect(() => {
    parsedPlaceholdersRef.current = parsedPlaceholders;
  }, [parsedPlaceholders]);

  const renderedPrompt = useMemo(() => {
    // Safety check: ensure template.template exists and is a string
    if (!template.template || typeof template.template !== 'string') {
      return '';
    }
    
    let result = template.template;
    
    // Create a set of valid placeholder names from parsedPlaceholders
    const validPlaceholderNames = new Set(parsedPlaceholders.map(p => p.name));
    
    // First pass: replace filled placeholders with their values
    // Only replace placeholders that are defined in the inputs section
    Object.entries(placeholderValues).forEach(([key, value]) => {
      if (value && validPlaceholderNames.has(key)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    });
    
    // Second pass: remove entire lines that contain unfilled placeholders
    // Only check for placeholders that are defined in the inputs section
    const lines = result.split('\n');
    const filteredLines = lines.filter(line => {
      // Extract all placeholder patterns from the line
      const placeholderMatches = line.match(/\{\{([^}]+)\}\}/g);
      if (!placeholderMatches) return true;
      
      // Check if any of the placeholders in this line are:
      // 1. Valid input placeholders (in parsedPlaceholders)
      // 2. Not filled in
      const hasUnfilledValidPlaceholder = placeholderMatches.some(match => {
        const placeholderName = match.replace(/\{\{|\}\}/g, '').trim();
        return validPlaceholderNames.has(placeholderName) && !placeholderValues[placeholderName];
      });
      
      // Keep the line if it doesn't have unfilled valid placeholders
      return !hasUnfilledValidPlaceholder;
    });
    
    return filteredLines.join('\n');
  }, [template.template, placeholderValues, parsedPlaceholders]);

  // Final prompt with profile prepended (for display in preview)
  const finalPromptWithProfile = useMemo(() => {
    return includeProfile ? prependProfileToPrompt(renderedPrompt) : renderedPrompt;
  }, [renderedPrompt, includeProfile]);

  const handleCopyToClipboard = () => {
    // Prepend profile to the rendered prompt if includeProfile is true
    const finalPrompt = includeProfile ? prependProfileToPrompt(renderedPrompt) : renderedPrompt;
    
    // Fallback copy method that works in all contexts
    const textarea = document.createElement('textarea');
    textarea.value = finalPrompt;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleSend = () => {
    const missingRequired = parsedPlaceholders
      .filter((p) => p.required && !placeholderValues[p.name])
      .map((p) => p.name);

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`);
      return;
    }

    handleCopyToClipboard();
    toast.success('Prompt ready! Open your AI tool and paste.', {
      description: 'The prompt has been copied to your clipboard.',
    });
  };

  const handleSendToAI = (platform: 'chatgpt' | 'claude' | 'grok' | 'gemini', event?: React.MouseEvent) => {
    const missingRequired = parsedPlaceholders
      .filter((p) => p.required && !placeholderValues[p.name])
      .map((p) => p.name);

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.join(', ')}`);
      return;
    }

    // Capture template ID now for tracking later
    const templateIdForTracking = templateRef.current.id;

    // Determine target: if Ctrl/Cmd+Click, open new tab; otherwise reuse same tab per platform
    const isNewTabRequest = event && (event.ctrlKey || event.metaKey);
    const target = isNewTabRequest ? '_blank' : `_promptstash_${platform}`;

    // Prepend profile to rendered prompt before copying
    const finalPrompt = includeProfile ? prependProfileToPrompt(renderedPrompt) : renderedPrompt;

    // Copy to clipboard first using current values
    const textarea = document.createElement('textarea');
    textarea.value = finalPrompt;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      // Show different toast messages based on provider
      if (platform === 'claude' || platform === 'gemini') {
        const providerName = platform === 'claude' ? 'Claude' : 'Gemini';
        toast.success(`Prompt copied to clipboard!`, {
          description: `Paste in ${providerName}. Opening in 1 second...`,
          duration: 4000,
        });
      } else {
        // For ChatGPT and Grok
        toast.success('Prompt copied to clipboard!', {
          description: 'Opening AI tool in 1 second...',
          duration: 4000,
        });
      }
    } catch (err) {
      document.body.removeChild(textarea);
      toast.error('Failed to copy to clipboard');
      return;
    }

    // Delay opening the tab so user can see the toast message
    setTimeout(() => {
      // Re-compute the prompt using the CURRENT ref values to avoid stale closures
      const currentTemplate = templateRef.current.template || '';
      const currentValues = placeholderValuesRef.current;
      const currentParsedPlaceholders = parsedPlaceholdersRef.current;
      
      let freshRenderedPrompt = currentTemplate;
      
      // Create a set of valid placeholder names from currentParsedPlaceholders
      const validPlaceholderNames = new Set(currentParsedPlaceholders.map(p => p.name));
      
      // First pass: replace filled placeholders
      // Only replace placeholders that are defined in the inputs section
      Object.entries(currentValues).forEach(([key, value]) => {
        if (value && validPlaceholderNames.has(key)) {
          freshRenderedPrompt = freshRenderedPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      });
      
      // Second pass: remove lines with unfilled placeholders
      // Only check for placeholders that are defined in the inputs section
      const freshLines = freshRenderedPrompt.split('\n');
      const freshFilteredLines = freshLines.filter(line => {
        // Extract all placeholder patterns from the line
        const placeholderMatches = line.match(/\{\{([^}]+)\}\}/g);
        if (!placeholderMatches) return true;
        
        // Check if any of the placeholders in this line are:
        // 1. Valid input placeholders (in parsedPlaceholders)
        // 2. Not filled in
        const hasUnfilledValidPlaceholder = placeholderMatches.some(match => {
          const placeholderName = match.replace(/\{\{|\}\}/g, '').trim();
          return validPlaceholderNames.has(placeholderName) && !currentValues[placeholderName];
        });
        
        // Keep the line if it doesn't have unfilled valid placeholders
        return !hasUnfilledValidPlaceholder;
      });
      
      freshRenderedPrompt = freshFilteredLines.join('\n');
      
      // Re-encode with fresh prompt
      const MAX_URL_LENGTH = 2000;
      const freshEncoded = encodeURIComponent(freshRenderedPrompt);
      const freshCanUsePrefill = freshEncoded.length < MAX_URL_LENGTH;
      
      let freshUrl;
      switch (platform) {
        case 'chatgpt':
          freshUrl = freshCanUsePrefill 
            ? `https://chatgpt.com/?q=${freshEncoded}`
            : `https://chatgpt.com/`;
          break;
        case 'grok':
          freshUrl = freshCanUsePrefill
            ? `https://grok.com/?q=${freshEncoded}`
            : `https://grok.com/`;
          break;
        case 'gemini':
          // Gemini doesn't support URL prefill
          freshUrl = `https://gemini.google.com/app`;
          break;
        case 'claude':
          // Claude doesn't support URL prefill
          freshUrl = `https://claude.ai/new`;
          break;
        default:
          freshUrl = 'about:blank';
      }
      
      window.open(freshUrl, target, 'noopener,noreferrer');
      
      // Show additional instruction for platforms that don't support prefill (Claude and Gemini always need paste instruction)
      if (!freshCanUsePrefill || platform === 'claude' || platform === 'gemini') {
        setTimeout(() => {
          toast.info('Paste your prompt', {
            description: 'Press Ctrl+V (or Cmd+V) in the AI tool to paste your prompt.',
            duration: 5000,
          });
        }, 300);
      }
    }, 1000);

    // Track prompt sent
    trackPromptSent(templateIdForTracking, platform);
    trackProviderSelected(platform);
  };

  const handlePlaceholderChange = (name: string, value: string) => {
    setPlaceholderValues((prev) => ({ ...prev, [name]: value }));
    autoSave(name, value);
  };

  const handleClearAll = () => {
    setPlaceholderValues({});
    toast.info('All fields cleared');
  };

  const allFieldsFilled = parsedPlaceholders
    .filter((p) => p.required)
    .every((p) => placeholderValues[p.name]);

  const handleGithubClick = (event: React.MouseEvent) => {
    if (!template.githubUrl) return;
    
    const isNewTabRequest = event.ctrlKey || event.metaKey;
    const target = isNewTabRequest ? '_blank' : '_promptstash_github';
    
    window.open(template.githubUrl, target, 'noopener,noreferrer');
  };

  // Generate permalink URL
  const getPermalinkUrl = () => {
    if (!template.yamlPath) return window.location.href.split('?')[0];
    const url = new URL(window.location.href.split('?')[0]); // Use current URL without query params
    url.searchParams.set('y', template.yamlPath);
    return url.toString();
  };

  // Handle copying permalink
  const handleCopyPermalink = () => {
    const url = getPermalinkUrl();
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      toast.success('Link copied to clipboard!');
      setSharePopoverOpen(false);
    } catch (err) {
      toast.error('Failed to copy link');
    } finally {
      document.body.removeChild(textarea);
    }

    // Track permalink shared
    trackPermalinkShared('copy');
  };

  // Handle sharing to X (Twitter)
  const handleShareToX = () => {
    const url = getPermalinkUrl();
    const text = `Check out this prompt template: ${template.name}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    setSharePopoverOpen(false);
    trackPermalinkShared('twitter');
  };

  // Handle sharing to LinkedIn
  const handleShareToLinkedIn = () => {
    const url = getPermalinkUrl();
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    setSharePopoverOpen(false);
    trackPermalinkShared('linkedin');
  };

  return (
    <motion.div 
      className="flex flex-col h-full bg-background"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="border-b bg-card p-3 sm:p-6">
        <div className="max-w-7xl">
          {/* Title Row - Always visible */}
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base sm:text-2xl font-semibold flex-1 min-w-0 truncate sm:whitespace-normal">
              {template.name}
            </h1>
            {/* Mobile: Show info toggle, favorite, share */}
            <div className="flex items-center gap-1">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileDetails(!showMobileDetails)}
                  className="h-8 w-8"
                  title={showMobileDetails ? 'Hide details' : 'Show details'}
                >
                  {showMobileDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(template.id)}
                className="h-8 w-8"
              >
                <Star
                  className={`h-4 w-4 ${template.isFavorite ? 'fill-primary text-primary' : ''}`}
                />
              </Button>
              <Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleCopyPermalink} title="Copy Link">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShareToX} title="Share on X">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShareToLinkedIn} title="Share on LinkedIn">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Toolbar - Hidden on mobile, visible on desktop */}
          <div className="hidden sm:flex flex-wrap items-center gap-3 mb-4">
            <Button onClick={(e) => handleSendToAI('chatgpt', e)} disabled={!allFieldsFilled} size="sm">
              ChatGPT
              <Send className="h-3.5 w-3.5 ml-2" />
            </Button>
            <Button onClick={(e) => handleSendToAI('claude', e)} disabled={!allFieldsFilled} size="sm">
              Claude
              <Send className="h-3.5 w-3.5 ml-2" />
            </Button>
            <Button onClick={(e) => handleSendToAI('grok', e)} disabled={!allFieldsFilled} size="sm">
              Grok
              <Send className="h-3.5 w-3.5 ml-2" />
            </Button>
            <Button onClick={(e) => handleSendToAI('gemini', e)} disabled={!allFieldsFilled} size="sm">
              Gemini
              <Send className="h-3.5 w-3.5 ml-2" />
            </Button>
          </div>

          {/* Details Section - Hidden on mobile by default, always visible on desktop */}
          {(!isMobile || showMobileDetails) && (
            <div className="space-y-3 pt-2 border-t sm:border-t-0 sm:pt-0">
              {/* Mobile Send Buttons */}
              {isMobile && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={(e) => handleSendToAI('chatgpt', e)} disabled={!allFieldsFilled} size="sm">
                    GPT
                    <Send className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Button onClick={(e) => handleSendToAI('claude', e)} disabled={!allFieldsFilled} size="sm">
                    Claude
                    <Send className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Button onClick={(e) => handleSendToAI('grok', e)} disabled={!allFieldsFilled} size="sm">
                    Grok
                    <Send className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Button onClick={(e) => handleSendToAI('gemini', e)} disabled={!allFieldsFilled} size="sm">
                    Gemini
                    <Send className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {template.source === 'github' && template.githubUrl ? (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 cursor-pointer hover:bg-accent transition-colors"
                    onClick={handleGithubClick}
                  >
                    <Github className="h-3 w-3" />
                    GitHub
                    <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {template.source === 'github' ? (
                      <>
                        <Github className="h-3 w-3" />
                        GitHub
                      </>
                    ) : (
                      <>
                        <HardDrive className="h-3 w-3" />
                        Local
                      </>
                    )}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground block">
                {template.category} • Updated {template.lastUpdated}
                {template.contributor && (
                  <>
                    {' • '}
                    <a
                      href={`https://github.com/${template.contributor}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      @{template.contributor}
                    </a>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-4xl gap-2 py-2 sm:py-0">
            <TabsList className="rounded-none bg-transparent justify-start overflow-x-auto">
              <TabsTrigger value="variables" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fill Variables</span>
                <span className="sm:hidden">Variables</span>
                {parsedPlaceholders.filter((p) => p.required).length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {parsedPlaceholders.filter((p) => p.required).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="template" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Original Template</span>
                <span className="sm:hidden">Template</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-0">
              <Button variant="ghost" onClick={handleClearAll} size="sm">
                <Trash2 className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
              {/* Include Profile Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="include-profile-toggle"
                      className={`text-xs sm:text-sm cursor-pointer ${!hasProfile ? 'text-muted-foreground' : ''}`}
                    >
                      <span className="hidden sm:inline">Include Profile</span>
                      <span className="sm:hidden">Profile</span>
                    </Label>
                    <Switch
                      id="include-profile-toggle"
                      checked={includeProfile && hasProfile}
                      onCheckedChange={setIncludeProfile}
                      disabled={!hasProfile}
                    />
                  </div>
                </TooltipTrigger>
                {!hasProfile && (
                  <TooltipContent>
                    <p>No profile set in Settings</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                disabled={!allFieldsFilled}
                className="flex items-center gap-1 sm:gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Copy to Clipboard</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Variables Tab */}
        <TabsContent value="variables" className="flex-1 overflow-auto m-0 p-6">
          <div className="max-w-4xl space-y-4">
            {parsedPlaceholders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  This template has no placeholders.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {parsedPlaceholders.map((placeholder) => (
                  <div key={placeholder.name} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {placeholder.name}
                      {placeholder.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </Label>
                    {placeholder.description && (
                      <p className="text-sm text-muted-foreground">
                        {placeholder.description}
                      </p>
                    )}
                    {/* Render Textarea for type="text" or specific field names */}
                    {placeholder.type === 'text' ||
                    placeholder.name === 'code' ||
                    placeholder.name === 'requirements' ||
                    placeholder.name.includes('description') ? (
                      <Textarea
                        value={placeholderValues[placeholder.name] || ''}
                        onChange={(e) =>
                          handlePlaceholderChange(placeholder.name, e.target.value)
                        }
                        placeholder={`Enter ${placeholder.name}...`}
                        rows={placeholder.type === 'text' ? 2 : 6}
                        className="resize-y"
                      />
                    ) : (
                      <Input
                        value={placeholderValues[placeholder.name] || ''}
                        onChange={(e) =>
                          handlePlaceholderChange(placeholder.name, e.target.value)
                        }
                        placeholder={`Enter ${placeholder.name}...`}
                        className="text-base"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Original Template Tab */}
        <TabsContent value="template" className="flex-1 overflow-auto m-0 p-6">
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Original Template</CardTitle>
                <CardDescription>
                  This is the raw template with placeholder syntax
                </CardDescription>
              </CardHeader>
              <CardContent>
                {template.template && typeof template.template === 'string' ? (
                  <ScrollArea className="h-[600px]">
                    <pre className="text-sm font-mono whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                      {template.template}
                    </pre>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No template content available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="flex-1 overflow-auto m-0 p-6">
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  This is how your prompt will look with the current values (including your profile if set)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {finalPromptWithProfile}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}