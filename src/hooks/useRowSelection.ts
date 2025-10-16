import { useState } from 'react';
import { ArtworkData } from '../interfaces';

export const useRowSelection = () => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const updateSelection = (removed: ArtworkData[], added: ArtworkData[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      
      
      removed.forEach(item => newSet.delete(item.id));
      
      
      added.forEach(item => newSet.add(item.id));
      
      return newSet;
    });
  };

  const getSelectedForPage = (pageData: ArtworkData[]): ArtworkData[] => {
    return pageData.filter(item => selectedIds.has(item.id));
  };

  const selectMultiple = (ids: number[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      ids.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  const totalSelected = selectedIds.size;

  return {
    updateSelection,
    getSelectedForPage,
    selectMultiple,
    totalSelected,
    selectedIds 
  };
};
