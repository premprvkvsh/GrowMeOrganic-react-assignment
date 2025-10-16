// // hooks/useRowSelection.ts
// import { useState, useCallback } from 'react';

// export function useRowSelection() {
//   const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

//   const updateSelection = useCallback((allIdsOnPage: number[], selectedIdsOnPage: number[]) => {
//     setSelectedIds(prev => {
//       const newSet = new Set(prev);
      
//       // Remove all current page items first
//       allIdsOnPage.forEach(id => newSet.delete(id));
      
//       // Add back the selected ones
//       selectedIdsOnPage.forEach(id => newSet.add(id));
      
//       return newSet;
//     });
//   }, []);

//   const selectMultiple = useCallback((ids: number[]) => {
//     setSelectedIds(prev => {
//       const newSet = new Set(prev);
//       ids.forEach(id => newSet.add(id));
//       return newSet;
//     });
//   }, []);

//   const getSelectedForPage = useCallback((pageData: any[]) => {
//     return pageData.filter(item => selectedIds.has(item.id));
//   }, [selectedIds]);

//   const totalSelected = selectedIds.size;

//   return {
//     selectedIds,
//     updateSelection,
//     selectMultiple,
//     getSelectedForPage,
//     totalSelected
//   };
// }

import { useState } from 'react';
import { ArtworkData } from '../interfaces';

export const useRowSelection = () => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const updateSelection = (removed: ArtworkData[], added: ArtworkData[]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      
      // Remove IDs
      removed.forEach(item => newSet.delete(item.id));
      
      // Add IDs
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
    selectedIds // Expose if needed for debugging
  };
};
