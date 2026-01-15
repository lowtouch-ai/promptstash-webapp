import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/app/components/ui/toggle-group';

interface TemplateListHeaderProps {
  templateCount: number;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
}

export function TemplateListHeader({
  templateCount,
  viewMode,
  onViewModeChange,
}: TemplateListHeaderProps) {
  return (
    <div className="border-b bg-card/50 backdrop-blur p-4 flex items-center justify-between">
      <div>
        <h2 className="font-semibold">Templates</h2>
        <p className="text-sm text-muted-foreground">
          {templateCount} {templateCount === 1 ? 'template' : 'templates'} available
        </p>
      </div>
      <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as 'card' | 'list')}>
        <ToggleGroupItem value="card" aria-label="Card view" size="sm">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view" size="sm">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
