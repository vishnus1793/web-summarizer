import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Type, Code, Brain } from 'lucide-react';
import { CellType } from '@/types/notebook';

interface AddCellButtonProps {
  onAddCell: (type: CellType) => void;
  compact?: boolean;
}

export const AddCellButton = ({ onAddCell, compact = false }: AddCellButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const cellTypes = [
    {
      type: 'text' as CellType,
      icon: Type,
      label: 'Text Cell',
      description: 'Add markdown text content'
    },
    {
      type: 'code' as CellType,
      icon: Code,
      label: 'Code Cell',
      description: 'Add code snippets with syntax highlighting'
    },
    {
      type: 'llm' as CellType,
      icon: Brain,
      label: 'LLM Cell',
      description: 'Chat with Google Gemini AI'
    }
  ];

  if (compact) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 bg-surface border-dashed hover:bg-surface-elevated"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {cellTypes.map(({ type, icon: Icon, label, description }) => (
            <DropdownMenuItem
              key={type}
              onClick={() => {
                onAddCell(type);
                setIsOpen(false);
              }}
              className="flex flex-col items-start gap-1 p-3"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-surface border-dashed hover:bg-surface-elevated">
          <Plus className="w-4 h-4" />
          Add Cell
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {cellTypes.map(({ type, icon: Icon, label, description }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => {
              onAddCell(type);
              setIsOpen(false);
            }}
            className="flex flex-col items-start gap-1 p-4"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};