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
          toast.success(`Loaded ${githubTemplates.length} templates from GitHub`);
        } else {
          // Fallback to mock data if GitHub fetch fails
          const favorites = getFavorites();
          const templatesWithFavorites = mockTemplates.map(template => ({
            ...template,
            isFavorite: favorites.includes(template.id),
          }));
          setTemplates(templatesWithFavorites);
          toast.info('Using local templates');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        const favorites = getFavorites();
        const templatesWithFavorites = mockTemplates.map(template => ({
          ...template,
          isFavorite: favorites.includes(template.id),
        }));
        setTemplates(templatesWithFavorites);
        toast.error('Failed to load templates from GitHub, using local templates');
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

  const handleTagToggle = (tag: string, event: React.MouseEvent) => {
    // Close template detail when interacting with sidebar
    setSelectedTemplateId(null);
    
    // Deselect quick filter when selecting tags
    setQuickFilter('none');
    
    const tagIndex = allTags.indexOf(tag);
    
    if (event.shiftKey && lastClickedTagIndex !== null) {
      // Shift+click: Select range
      const start = Math.min(lastClickedTagIndex, tagIndex);
      const end = Math.max(lastClickedTagIndex, tagIndex);
      const rangeToSelect = allTags.slice(start, end + 1);
      
      setSelectedTags((prev) => {
        const newSelection = new Set(prev);
        rangeToSelect.forEach((t) => newSelection.add(t));
        return Array.from(newSelection);
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+click: Toggle individual tag while keeping others
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
      setLastClickedTagIndex(tagIndex);
    } else {
      // Regular click: Select only this tag (deselect others)
      setSelectedTags([tag]);
      setLastClickedTagIndex(tagIndex);
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
  };

  const handleCategoryChange = (category: string) => {
    // Close template detail when interacting with sidebar
    setSelectedTemplateId(null);
    
    // Deselect quick filter when selecting category
    setQuickFilter('none');
    
    setSelectedCategory(category);
  };

  const handleToggleFavorite = (id: string) => {
    const newFavoriteStatus = toggleFavorite(id);
    setFavoriteIds(getFavorites());
    // Update templates state to reflect the change
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: newFavoriteStatus } : t))
    );
  };

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    addToRecentlyUsed(id);
    setRecentlyUsedIds(getRecentlyUsed());
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
                  onClose={() => setSelectedTemplateId(null)}
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