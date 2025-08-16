import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const NotebookSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-80 bg-notebook-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Sources</h2>
          <Button size="sm" variant="ghost">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-2">
            <Search className="w-4 h-4" />
            Discover
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <Input
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-surface"
        />
      </div>

      {/* Sources list */}
      <div className="flex-1 p-4">
        <div className="text-center py-8 space-y-4">
          <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Saved sources will appear here</p>
            <p className="text-xs text-muted-foreground">
              Click Add source above to add PDFs, websites, text, videos,
              or audio files. Or import a file directly from Google Drive.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload a source
          </Button>
        </div>
      </div>
    </div>
  );
};