import { useNotebookStore } from '@/stores/notebookStore';
import { NotebookCell as CellType } from '@/types/notebook';
import { TextCell } from './TextCell';
import { CodeCell } from './CodeCell';
import { LLMCell } from './LLMCell';
import { MindMapCell } from './MindMapCell';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, MoveUp, MoveDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotebookCellProps {
  cell: CellType;
}

export const NotebookCell = ({ cell }: NotebookCellProps) => {
  const { deleteCell, reorderCell, selectedCellId, selectCell, cells } = useNotebookStore();

  const isSelected = selectedCellId === cell.id;
  const cellIndex = cells.findIndex(c => c.id === cell.id);
  const canMoveUp = cellIndex > 0;
  const canMoveDown = cellIndex < cells.length - 1;

  const handleCellClick = () => {
    selectCell(cell.id);
  };

  const handleMoveUp = () => {
    if (canMoveUp) {
      reorderCell(cell.id, cell.order - 1);
    }
  };

  const handleMoveDown = () => {
    if (canMoveDown) {
      reorderCell(cell.id, cell.order + 1);
    }
  };

  const handleDelete = () => {
    deleteCell(cell.id);
  };

  const renderCell = () => {
    switch (cell.type) {
      case 'text':
        return <TextCell cell={cell} />;
      case 'code':
        return <CodeCell cell={cell} />;
      case 'llm':
        return <LLMCell cell={cell} />;
      case 'mindmap':
        return <MindMapCell cell={cell} />;
      default:
        return <div>Unknown cell type</div>;
    }
  };

  const getCellBackground = () => {
    switch (cell.type) {
      case 'text':
        return 'bg-cell-text';
      case 'code':
        return 'bg-cell-code';
      case 'llm':
        return 'bg-cell-llm';
      case 'mindmap':
        return 'bg-primary/5';
      default:
        return 'bg-surface';
    }
  };

  return (
    <div
      className={`relative group rounded-lg border transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary border-primary' 
          : 'border-border hover:border-border/80'
      } ${getCellBackground()}`}
      onClick={handleCellClick}
    >
      {/* Cell actions */}
      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0 bg-surface shadow-md"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMoveUp} disabled={!canMoveUp}>
              <MoveUp className="w-4 h-4 mr-2" />
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMoveDown} disabled={!canMoveDown}>
              <MoveDown className="w-4 h-4 mr-2" />
              Move Down
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cell content */}
      <div className="p-4">
        {renderCell()}
      </div>
    </div>
  );
};