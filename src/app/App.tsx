import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/app/components/ui/sonner';
import { toast } from 'sonner';
import { Navigation } from '@/app/components/navigation';
import { Sidebar } from '@/app/components/sidebar';
import { TemplateList } from '@/app/components/template-list';
import { TemplateListHeader } from '@/app/components/template-list-header';
import { TemplateDetail } from '@/app/components/template-detail';
import { mockTemplates, PromptTemplate } from '@/app/data/mock-templates';
import { fetchTemplatesFromGitHub } from '@/app/services/github-templates';
import { getRecentlyUsed, addToRecentlyUsed } from '@/app/services/recently-used';
import { getFavorites, toggleFavorite, isFavorite } from '@/app/services/favorites';
import { 
  initializeAnalytics, 
  trackAppLoaded, 
  trackTemplateOpened,
  trackCategoryFilterUsed,
  trackTagFilterUsed,
  trackFavoritesFilterAccessed,
  trackRecentlyUsedAccessed,
  trackViewModeChanged,
  trackSearchUsed,
  trackFavoriteAdded,
  trackFavoriteRemoved
} from '@/app/services/analytics';
import { initializeMetaTags, updateMetaTagsForTemplate, resetMetaTags } from '@/app/services/meta-tags';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lastClickedTagIndex, setLastClickedTagIndex] = useState<number | null>(null);
  const [quickFilter, setQuickFilter] = useState<'none' | 'recent' | 'favorites'>('none');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>(mockTemplates);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyUsedIds, setRecentlyUsedIds] = useState<string[]>(getRecentlyUsed());
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavorites());
  const [permalinkProcessed, setPermalinkProcessed] = useState(false);

  // Initialize analytics and set page title
  useEffect(() => {
    document.title = 'PromptStash.io - Built by the Community. Ready to Run Prompts';
    initializeAnalytics();
    trackAppLoaded();
    initializeMetaTags();
  }, []);

  // Fetch templates from GitHub on mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        const githubTemplates = await fetchTemplatesFromGitHub();
        if (githubTemplates.length > 0) {
          // Sync favorite status from localStorage
          const favorites = getFavorites();
          const templatesWithFavorites = githubTemplates.map(template => ({
            ...template,
            isFavorite: favorites.includes(template.id),
          }));
          setTemplates(templatesWithFavorites);
          
          // Check if templates came from cache
          const cached = localStorage.getItem('promptstash_templates_cache');
          if (cached) {
            const cacheData = JSON.parse(cached);
            const cacheAge = Date.now() - cacheData.timestamp;
            const isStale = cacheAge >= 60 * 60 * 1000; // 1 hour
            
            if (isStale) {
              toast.info('Using cached templates (GitHub API unavailable)', {
                description: 'Fresh templates will load after rate limit resets'
              });
            } else {
              toast.success(`Loaded ${githubTemplates.length} templates from cache`);
            }
          } else {
            toast.success(`Loaded ${githubTemplates.length} templates from GitHub`);
          }
        } else {
          // Fallback to mock data if GitHub fetch fails
          const favorites = getFavorites();
          const templatesWithFavorites = mockTemplates.map(template => ({
            ...template,
            isFavorite: favorites.includes(template.id),
          }));
          setTemplates(templatesWithFavorites);
          toast.warning('Using local templates (GitHub API unavailable)');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        const favorites = getFavorites();
        const templatesWithFavorites = mockTemplates.map(template => ({
          ...template,
          isFavorite: favorites.includes(template.id),
        }));
        setTemplates(templatesWithFavorites);
        toast.warning('Using local templates (GitHub API unavailable)');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Dynamically extract all unique tags from templates
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    templates.forEach((template) => {
      template.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [templates]);

  // Dynamically extract all unique categories from templates
  const categories = useMemo(() => {
    const categoriesSet = new Set<string>();
    templates.forEach((template) => {
      if (template.category) {
        categoriesSet.add(template.category);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [templates]);

  // Handle permalink on mount - check for ?y= URL parameter
  useEffect(() => {
    console.log('Permalink effect running:', { 
      permalinkProcessed, 
      isLoading, 
      templatesCount: templates.length,
      currentURL: window.location.href,
      searchParams: window.location.search,
    });
    
    // Only process permalink once and after templates are loaded
    if (permalinkProcessed || isLoading || templates.length === 0) {
      console.log('Permalink effect early return:', { permalinkProcessed, isLoading, templatesCount: templates.length });
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const yamlPath = urlParams.get('y');
    const categoryParam = urlParams.get('c');
    const tagsParam = urlParams.get('t');
    const searchParam = urlParams.get('q');
    
    console.log('URL search string:', window.location.search);
    console.log('Checking for permalink parameters:', { yamlPath, categoryParam, tagsParam, searchParam });
    
    // Handle template permalink
    if (yamlPath) {
      console.log('Permalink yamlPath:', yamlPath);
      console.log('Available templates:', templates.map(t => ({ id: t.id, name: t.name, yamlPath: t.yamlPath })));
      
      // Find template by yamlPath
      const template = templates.find(t => t.yamlPath === yamlPath);
      console.log('Found template:', template);
      
      if (template) {
        console.log('Selecting template from permalink:', template.id);
        // Set selected template directly
        setSelectedTemplateId(template.id);
        // Add to recently used
        addToRecentlyUsed(template.id);
        setRecentlyUsedIds(getRecentlyUsed());
        // Track template opened
        trackTemplateOpened(template.yamlPath || template.id);
        // Update meta tags for social sharing
        updateMetaTagsForTemplate(template);
        toast.success('Template loaded from permalink');
      } else {
        toast.error('Template not found');
        console.error('No template found with yamlPath:', yamlPath);
        console.error('Available yamlPaths:', templates.map(t => t.yamlPath));
        // Clear invalid parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('y');
        window.history.replaceState({}, '', url.toString());
      }
    }
    
    // Handle category permalink
    if (categoryParam) {
      console.log('Permalink category:', categoryParam);
      console.log('Available categories:', categories);
      
      // Check if category exists in the list
      if (categories.includes(categoryParam)) {
        console.log('Selecting category from permalink:', categoryParam);
        setSelectedCategory(categoryParam);
        // Deselect quick filter when category is set from permalink
        setQuickFilter('none');
        trackCategoryFilterUsed(categoryParam);
        toast.success(`Category "${categoryParam}" selected from permalink`);
      } else {
        toast.error('Category not found');
        console.error('No category found with name:', categoryParam);
        console.error('Available categories:', categories);
        // Clear invalid parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('c');
        window.history.replaceState({}, '', url.toString());
      }
    }
    
    // Handle tags permalink
    if (tagsParam) {
      console.log('Permalink tags:', tagsParam);
      console.log('Available tags:', allTags);
      
      // Parse comma-separated tags
      const requestedTags = tagsParam.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      console.log('Requested tags:', requestedTags);
      
      // Filter to only valid tags
      const validTags = requestedTags.filter(tag => allTags.includes(tag));
      const invalidTags = requestedTags.filter(tag => !allTags.includes(tag));
      
      if (validTags.length > 0) {
        console.log('Selecting tags from permalink:', validTags);
        setSelectedTags(validTags);
        // Deselect quick filter when tags are set from permalink
        setQuickFilter('none');
        trackTagFilterUsed(validTags);
        
        if (invalidTags.length > 0) {
          toast.warning(`Tags selected: ${validTags.join(', ')}`, {
            description: `Invalid tags ignored: ${invalidTags.join(', ')}`
          });
        } else {
          toast.success(`Tags selected from permalink: ${validTags.join(', ')}`);
        }
        
        // Update URL to remove invalid tags if any
        if (invalidTags.length > 0) {
          const url = new URL(window.location.href);
          url.searchParams.set('t', validTags.join(','));
          window.history.replaceState({}, '', url.toString());
        }
      } else {
        toast.error('No valid tags found');
        console.error('None of the requested tags are valid:', requestedTags);
        console.error('Available tags:', allTags);
        // Clear invalid parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('t');
        window.history.replaceState({}, '', url.toString());
      }
    }
    
    // Handle search permalink
    if (searchParam) {
      console.log('Permalink search query:', searchParam);
      setSearchQuery(searchParam);
      toast.success(`Search query loaded from permalink: "${searchParam}"`);
    }
    
    setPermalinkProcessed(true);
  }, [templates, isLoading, permalinkProcessed, categories, allTags]);

  // Update URL when template is selected (but not during initial permalink load)
  useEffect(() => {
    // Skip URL update if we're still processing the initial permalink
    if (!permalinkProcessed) {
      return;
    }
    
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template?.yamlPath) {
        const url = new URL(window.location.href);
        const currentYamlPath = url.searchParams.get('y');
        // Only update if the URL parameter is different
        if (currentYamlPath !== template.yamlPath) {
          url.searchParams.set('y', template.yamlPath);
          window.history.pushState({}, '', url.toString());
        }
      }
    } else {
      // Clear the parameter when no template is selected
      const url = new URL(window.location.href);
      if (url.searchParams.has('y')) {
        url.searchParams.delete('y');
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [selectedTemplateId, templates, permalinkProcessed]);

  // Update URL when category is selected (but not during initial permalink load)
  useEffect(() => {
    // Skip URL update if we're still processing the initial permalink
    if (!permalinkProcessed) {
      return;
    }
    
    const url = new URL(window.location.href);
    const currentCategory = url.searchParams.get('c');
    
    if (selectedCategory !== 'all') {
      // Set category parameter if a specific category is selected
      if (currentCategory !== selectedCategory) {
        url.searchParams.set('c', selectedCategory);
        window.history.pushState({}, '', url.toString());
      }
    } else {
      // Clear category parameter when "all" is selected
      if (currentCategory) {
        url.searchParams.delete('c');
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [selectedCategory, permalinkProcessed]);

  // Update URL when tags are selected (but not during initial permalink load)
  useEffect(() => {
    // Skip URL update if we're still processing the initial permalink
    if (!permalinkProcessed) {
      return;
    }
    
    const url = new URL(window.location.href);
    const currentTags = url.searchParams.get('t');
    
    if (selectedTags.length > 0) {
      // Set tags parameter with comma-separated values
      const tagsString = selectedTags.join(',');
      if (currentTags !== tagsString) {
        url.searchParams.set('t', tagsString);
        window.history.pushState({}, '', url.toString());
      }
    } else {
      // Clear tags parameter when no tags are selected
      if (currentTags) {
        url.searchParams.delete('t');
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [selectedTags, permalinkProcessed]);

  // Update URL when search query changes (but not during initial permalink load)
  useEffect(() => {
    // Skip URL update if we're still processing the initial permalink
    if (!permalinkProcessed) {
      return;
    }
    
    const url = new URL(window.location.href);
    const currentSearch = url.searchParams.get('q');
    
    if (searchQuery.trim().length > 0) {
      // Set search parameter if there's a search query
      if (currentSearch !== searchQuery) {
        url.searchParams.set('q', searchQuery);
        window.history.pushState({}, '', url.toString());
      }
    } else {
      // Clear search parameter when search is empty
      if (currentSearch) {
        url.searchParams.delete('q');
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [searchQuery, permalinkProcessed]);

  // Filter templates based on all criteria
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter((template) => {
      // Search query filter
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory;

      // Tags filter (must match all selected tags)
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => template.tags.includes(tag));

      // Quick filters
      const matchesRecent = quickFilter !== 'recent' || recentlyUsedIds.includes(template.id);
      const matchesFavorites = quickFilter !== 'favorites' || favoriteIds.includes(template.id);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesTags &&
        matchesRecent &&
        matchesFavorites
      );
    });

    // Sort by recency if "Recently Used" filter is active
    if (quickFilter === 'recent') {
      const recentIds = getRecentlyUsed();
      filtered.sort((a, b) => {
        const aIndex = recentIds.indexOf(a.id);
        const bIndex = recentIds.indexOf(b.id);
        return aIndex - bIndex; // Most recent first
      });
    }

    return filtered;
  }, [
    templates,
    searchQuery,
    selectedCategory,
    selectedTags,
    quickFilter,
    recentlyUsedIds,
    favoriteIds,
  ]);

  const handleTagToggle = (tag: string, event?: React.MouseEvent) => {
    // Close template detail when interacting with sidebar
    setSelectedTemplateId(null);
    
    // Deselect quick filter when selecting tags
    setQuickFilter('none');
    
    const tagIndex = allTags.indexOf(tag);
    
    if (event?.shiftKey && lastClickedTagIndex !== null) {
      // Shift+click: Select range of tags
      const start = Math.min(lastClickedTagIndex, tagIndex);
      const end = Math.max(lastClickedTagIndex, tagIndex);
      const rangeToSelect = allTags.slice(start, end + 1);
      
      setSelectedTags((prev) => {
        const newSelection = new Set(prev);
        rangeToSelect.forEach((t) => newSelection.add(t));
        const updated = Array.from(newSelection);
        trackTagFilterUsed(updated);
        return updated;
      });
    } else if (event?.ctrlKey || event?.metaKey) {
      // Ctrl/Cmd+click: Toggle individual tag while keeping others
      setSelectedTags((prev) => {
        const updated = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
        trackTagFilterUsed(updated);
        return updated;
      });
      setLastClickedTagIndex(tagIndex);
    } else {
      // Regular click: Select only this tag (deselect others)
      setSelectedTags([tag]);
      setLastClickedTagIndex(tagIndex);
      trackTagFilterUsed([tag]);
    }
  };

  const handleFilterChange = (filter: 'recent' | 'favorites') => {
    // Close template detail when interacting with sidebar
    setSelectedTemplateId(null);
    
    // Toggle the filter (clicking same filter deselects it)
    const newFilter = quickFilter === filter ? 'none' : filter;
    setQuickFilter(newFilter);
    
    // When activating a quick filter, reset category and tags
    if (newFilter !== 'none') {
      setSelectedCategory('all');
      setSelectedTags([]);
    }
    if (newFilter === 'favorites') {
      trackFavoritesFilterAccessed();
    } else if (newFilter === 'recent') {
      trackRecentlyUsedAccessed();
    }
  };

  const handleCategoryChange = (category: string) => {
    // Close template detail when interacting with sidebar
    setSelectedTemplateId(null);
    
    // Deselect quick filter when selecting category
    setQuickFilter('none');
    
    setSelectedCategory(category);
    trackCategoryFilterUsed(category);
  };

  const handleToggleFavorite = (id: string) => {
    const template = templates.find(t => t.id === id);
    const newFavoriteStatus = toggleFavorite(id);
    setFavoriteIds(getFavorites());
    
    // Update templates state to reflect the change
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: newFavoriteStatus } : t))
    );
    
    // Track favorite added/removed with template path
    if (template) {
      const templatePath = template.yamlPath || template.id;
      if (newFavoriteStatus) {
        trackFavoriteAdded(templatePath);
      } else {
        trackFavoriteRemoved(templatePath);
      }
    }
  };

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    addToRecentlyUsed(id);
    setRecentlyUsedIds(getRecentlyUsed());
    
    // Track template opened with yamlPath
    const template = templates.find(t => t.id === id);
    if (template) {
      trackTemplateOpened(template.yamlPath || template.id);
      updateMetaTagsForTemplate(template);
    }
  };

  const handleClearTags = () => {
    setSelectedTags([]);
    setLastClickedTagIndex(null);
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen flex flex-col bg-background">
        <Navigation searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar always visible */}
          <Sidebar
            selectedCategory={selectedCategory}
            selectedTags={selectedTags}
            quickFilter={quickFilter}
            onCategoryChange={handleCategoryChange}
            onTagToggle={handleTagToggle}
            onFilterChange={handleFilterChange}
            onClearTags={handleClearTags}
            allTags={allTags}
            categories={categories}
          />

          <main className="flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {selectedTemplate ? (
                /* Template editing workspace */
                <TemplateDetail
                  key="template-detail"
                  template={selectedTemplate}
                  onClose={() => {
                    setSelectedTemplateId(null);
                    resetMetaTags();
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                /* Template list view */
                <motion.div
                  key="template-list"
                  className="flex flex-col h-full"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <TemplateListHeader
                    templateCount={filteredTemplates.length}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                  <div className="flex-1 overflow-auto">
                    <TemplateList
                      templates={filteredTemplates}
                      selectedTemplateId={selectedTemplateId}
                      viewMode={viewMode}
                      onTemplateSelect={handleTemplateSelect}
                      onToggleFavorite={handleToggleFavorite}
                      isLoading={isLoading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}