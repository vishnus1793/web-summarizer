// frontend/src/components/MindMapViewer.tsx
import Tree from 'react-d3-tree';

export const MindMapViewer = ({ mindmap }: { mindmap: any }) => {
  if (!mindmap) return null;

  return (
    <div className="h-96 w-full border border-border rounded-md p-2 overflow-auto">
      <Tree data={mindmap} orientation="vertical" />
    </div>
  );
};
