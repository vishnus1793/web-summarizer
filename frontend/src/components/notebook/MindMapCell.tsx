import React from 'react';
import { MindMapCellType } from '@/types/notebook';

interface MindMapCellProps {
  cell: MindMapCellType;
}

export const MindMapCell: React.FC<MindMapCellProps> = ({ cell }) => {
  return (
    <pre className="bg-surface p-2 rounded overflow-auto">
      {JSON.stringify(cell.mindmapData, null, 2)}
    </pre>
  );
};
