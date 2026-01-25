import { Folder, Tag, Clock, Star, XCircle } from 'lucide-react';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';
import { useIsMobile } from '@/app/components/ui/use-mobile';

interface SidebarProps {
  selectedCategory: string;
  selectedTags: string[];
  quickFilter: 'none' | 'recent' | 'favorites';
  onCategoryChange: (category: string) => void;
  onTagToggle: (tag: string, event: React.MouseEvent) => void;
  onFilterChange: (filter: 'recent' | 'favorites') => void;
  onClearTags: () => void;
  allTags: string[];
  categories: string[];
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({
  selectedCategory,
  selectedTags,
  quickFilter,
  onCategoryChange,
  onTagToggle,
  onFilterChange,
  onClearTags,
  allTags,
  categories,
  mobileOpen = false,
  onMobileOpenChange,
}: SidebarProps) {
  const isMobile = useIsMobile();

  const sidebarContent = (
    <>
      <div className="p-4 space-y-6 flex-shrink-0">
        {/* Quick Filters */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Quick Filters
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => {
                onFilterChange('recent');
                onMobileOpenChange?.(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                quickFilter === 'recent' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Recently Used
              </div>
            </button>
            <button
              onClick={() => {
                onFilterChange('favorites');
                onMobileOpenChange?.(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                quickFilter === 'favorites' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5" />
                Favorites
              </div>
            </button>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Categories
          </h3>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              onCategoryChange(value);
              onMobileOpenChange?.(false);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Tags Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <h3 className="text-sm font-semibold">Tags</h3>
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Clear all tags"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Tags Section */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <ScrollArea className="h-full">
          <div className="flex flex-wrap gap-2 pr-3">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/80 hover:text-primary-foreground transition-colors"
                onClick={(e) => {
                  onTagToggle(tag, e);
                  onMobileOpenChange?.(false);
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );

  // Mobile: render in a Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-60px)]">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render as a normal aside
  return (
    <aside className="w-64 border-r bg-muted/30 flex-col min-h-0 hidden md:flex">
      {sidebarContent}
    </aside>
  );
}