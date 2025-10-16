import { useState, useCallback } from 'react';
import { ArtworkData } from '../interfaces';

export function useRowSelection() {
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  const updateSelection = useCallback((currentPageRows: ArtworkData[], newlySelected: ArtworkData[]) => {
    setSelectedRowIds(prev => {
      const updated = new Set(prev);
      const currentPageRowIds = currentPageRows.map(row => row.id);
      
      // Clear current page selections first
      currentPageRowIds.forEach(id => updated.delete(id));
      
      // Add new selections
      newlySelected.forEach(row => updated.add(row.id));
      
      return updated;
    });
  }, []);

  const getSelectedForPage = useCallback((pageRows: ArtworkData[]) => {
    return pageRows.filter(row => selectedRowIds.has(row.id));
  }, [selectedRowIds]);

  const selectMultiple = useCallback((ids: number[]) => {
    setSelectedRowIds(prev => {
      const updated = new Set(prev);
      ids.forEach(id => updated.add(id));
      return updated;
    });
  }, []);

  return {
    selectedRowIds,
    updateSelection,
    getSelectedForPage,
    selectMultiple,
    totalSelected: selectedRowIds.size
  };
}
