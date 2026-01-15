import { Eye, Star, ExternalLink, Github, HardDrive, Calendar, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { PromptTemplate } from '@/app/data/mock-templates';

interface TemplateListProps {
  templates: PromptTemplate[];
  selectedTemplateId: string | null;
  viewMode: 'card' | 'list';
  onTemplateSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isLoading?: boolean;
}

export function TemplateList({
  templates,
  selectedTemplateId,
  viewMode,
  onTemplateSelect,
  onToggleFavorite,
  isLoading = false,
}: TemplateListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Loading templates...</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Fetching the latest prompt templates from the{' '}
          <a
            href="https://github.com/lowtouch-ai/promptstash-templates"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            lowtouch-ai/promptstash-templates
            <ExternalLink className="h-3 w-3" />
          </a>{' '}
          repository
        </p>
        <div className="max-w-md space-y-3 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Join the community!</strong> Contribute your own templates or improve existing ones.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <a
              href="https://lowtouch.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              lowtouch.ai
            </a>
            {' '}– Building open-source tools for AI workflows
          </p>
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No templates found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Try adjusting your search query or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="divide-y">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedTemplateId === template.id ? 'bg-muted' : ''
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{template.name}</h3>
                  {template.isModified && (
                    <Badge variant="outline" className="text-xs">
                      Modified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      {template.source === 'github' ? (
                        <Github className="h-3.5 w-3.5" />
                      ) : (
                        <HardDrive className="h-3.5 w-3.5" />
                      )}
                      <span>{template.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{template.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(template.id);
                  }}
                >
                  <Star
                    className={`h-4 w-4 ${
                      template.isFavorite ? 'fill-primary text-primary' : ''
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateSelect(template.id);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Card view (grid)
  return (
    <div className="p-4" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))',
      gap: '1rem',
      alignItems: 'start'
    }}>
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
            selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onTemplateSelect(template.id)}
        >
          <CardHeader className="pb-3 flex-none">
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-base line-clamp-2 flex-1 min-w-0">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-1 flex-none">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(template.id);
                  }}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      template.isFavorite ? 'fill-primary text-primary' : ''
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateSelect(template.id);
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {template.isModified && (
              <Badge variant="outline" className="text-xs w-fit mb-2">
                Modified
              </Badge>
            )}
            <CardDescription className="line-clamp-3 min-h-[3.6em]">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col justify-end gap-3">
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground border-t pt-3">
              <div className="flex items-center gap-1.5">
                {template.source === 'github' ? (
                  <Github className="h-3.5 w-3.5" />
                ) : (
                  <HardDrive className="h-3.5 w-3.5" />
                )}
                <span className="truncate">{template.category}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{template.lastUpdated}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}