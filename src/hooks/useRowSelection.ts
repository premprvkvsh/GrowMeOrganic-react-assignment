// hooks/useRowSelection.ts
import { useState, useCallback } from 'react';
import { ArtworkData } from '../interfaces';

export function useRowSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const updateSelection = useCallback((allIdsOnPage: number[], selectedIdsOnPage: number[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      
      // Remove all current page items first
      allIdsOnPage.forEach(id => newSet.delete(id));
      
      // Add back the selected ones
      selectedIdsOnPage.forEach(id => newSet.add(id));
      
      return newSet;
    });
  }, []);

  const selectMultiple = useCallback((ids: number[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      ids.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  const getSelectedForPage = useCallback((pageData: ArtworkData[]): ArtworkData[] => {
    return pageData.filter(item => selectedIds.has(item.id));
  }, [selectedIds]);

  const totalSelected = selectedIds.size;

  return {
    selectedIds,
    updateSelection,
    selectMultiple,
    getSelectedForPage,
    totalSelected
  };
}