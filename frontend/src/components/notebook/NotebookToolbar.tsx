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
        
        
      </div>
      </div>
  );
};