import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { NotebookCell, NotebookState, User, Notebook } from '@/types/notebook';

interface NotebookActions {
  setUser: (user: User | null) => void;
  setNotebook: (notebook: Notebook | null) => void;
  setCells: (cells: NotebookCell[]) => void;
  addCell: (type: NotebookCell['type'], position?: number) => void;
  updateCell: (id: string, updates: Partial<NotebookCell>) => void;
  deleteCell: (id: string) => void;
  reorderCell: (id: string, newOrder: number) => void;
  selectCell: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useNotebookStore = create<NotebookState & NotebookActions>()(
  devtools(
    (set, get) => ({
      // State
      currentNotebook: null,
      cells: [],
      selectedCellId: null,
      user: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      
      setNotebook: (notebook) => set({ 
        currentNotebook: notebook,
        cells: notebook?.contentJson || []
      }),

      setCells: (cells) => set({ cells }),

      addCell: (type, position) => {
        const { cells } = get();
        const newOrder = position ?? cells.length;
        
        // Shift existing cells down if inserting in middle
        const updatedCells = cells.map(cell => 
          cell.order >= newOrder 
            ? { ...cell, order: cell.order + 1 }
            : cell
        );

        let newCell: NotebookCell;
        
        if (type === 'text') {
          newCell = {
            id: crypto.randomUUID(),
            type: 'text',
            order: newOrder,
            content: ''
          };
        } else if (type === 'code') {
          newCell = {
            id: crypto.randomUUID(),
            type: 'code',
            order: newOrder,
            content: '',
            language: 'javascript'
          };
        } else if (type === 'llm') {
          newCell = {
            id: crypto.randomUUID(),
            type: 'llm',
            order: newOrder,
            prompt: '',
            response: '',
            model: 'gemini-1.5-pro'
          };
        } else {
          newCell = {
            id: crypto.randomUUID(),
            type: 'mindmap',
            order: newOrder,
            title: '',
            url: '',
            isGenerating: false
          };
        }

        set({ 
          cells: [...updatedCells, newCell].sort((a, b) => a.order - b.order),
          selectedCellId: newCell.id
        });
      },

      updateCell: (id, updates) => {
        const { cells } = get();
        set({
          cells: cells.map(cell => 
            cell.id === id ? { ...cell, ...updates } as NotebookCell : cell
          )
        });
      },

      deleteCell: (id) => {
        const { cells, selectedCellId } = get();
        const cellToDelete = cells.find(cell => cell.id === id);
        if (!cellToDelete) return;

        const remainingCells = cells
          .filter(cell => cell.id !== id)
          .map(cell => 
            cell.order > cellToDelete.order 
              ? { ...cell, order: cell.order - 1 }
              : cell
          );

        set({
          cells: remainingCells,
          selectedCellId: selectedCellId === id ? null : selectedCellId
        });
      },

      reorderCell: (id, newOrder) => {
        const { cells } = get();
        const cell = cells.find(c => c.id === id);
        if (!cell) return;

        const oldOrder = cell.order;
        const updatedCells = cells.map(c => {
          if (c.id === id) {
            return { ...c, order: newOrder };
          }
          if (oldOrder < newOrder && c.order > oldOrder && c.order <= newOrder) {
            return { ...c, order: c.order - 1 };
          }
          if (oldOrder > newOrder && c.order >= newOrder && c.order < oldOrder) {
            return { ...c, order: c.order + 1 };
          }
          return c;
        });

        set({ cells: updatedCells.sort((a, b) => a.order - b.order) });
      },

      selectCell: (id) => set({ selectedCellId: id }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    { name: 'notebook-store' }
  )
);