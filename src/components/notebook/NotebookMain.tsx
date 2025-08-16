import { useNotebookStore } from '@/stores/notebookStore';
import { NotebookCell } from '@/components/notebook/cells/NotebookCell';
import { AddCellButton } from '@/components/notebook/AddCellButton';

export const NotebookMain = () => {
  const { cells, addCell } = useNotebookStore();

  return (
    <div className="flex-1 bg-notebook-main overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Welcome message when no cells */}
        {cells.length === 0 ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-primary rounded-sm" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Add a source to get started
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload documents, videos, or other content to start building your notebook.
                You can also add text cells, code snippets, or LLM prompts.
              </p>
            </div>
            <AddCellButton onAddCell={(type) => addCell(type)} />
          </div>
        ) : (
          <>
            {/* Render cells */}
            {cells
              .sort((a, b) => a.order - b.order)
              .map((cell, index) => (
                <div key={cell.id} className="relative group">
                  <NotebookCell cell={cell} />
                  
                  {/* Add cell button between cells */}
                  <div className="flex justify-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AddCellButton 
                      onAddCell={(type) => addCell(type, index + 1)}
                      compact
                    />
                  </div>
                </div>
              ))}
            
            {/* Add cell at the end */}
            <div className="flex justify-center py-4">
              <AddCellButton onAddCell={(type) => addCell(type)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};