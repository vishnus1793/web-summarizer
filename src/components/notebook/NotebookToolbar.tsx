import { useNotebookStore } from '@/stores/notebookStore';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  FolderOpen, 
  FileSpreadsheet, 
  Settings, 
  BarChart3,
  Share,
  User
} from 'lucide-react';

export const NotebookToolbar = () => {
  const { user, currentNotebook } = useNotebookStore();

  return (
    <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-google-blue rounded-sm" />
          <span className="font-semibold text-foreground">Notebook LLM</span>
        </div>
        
        {currentNotebook && (
          <div className="text-sm text-muted-foreground">
            {currentNotebook.title || 'Untitled notebook'}
          </div>
        )}
      </div>

      {/* Center section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          Save Notebook
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          Save to Drive
        </Button>
        
        <Button variant="ghost" size="sm" className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Export to Sheets
        </Button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <BarChart3 className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <Share className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>

        {user && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm text-foreground">{user.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};