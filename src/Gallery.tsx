
import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
// DataTablePageEvent
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Gallery.css';

import { ArtworkData } from './interfaces';
import { getArtworksPage } from './utils/api';
import { useRowSelection } from './hooks/useRowSelection';

const ITEMS_PER_PAGE = 12;

export default function Gallery() {
  const [items, setItems] = useState<ArtworkData[]>([]);
  const [selectedRows, setSelectedRows] = useState<ArtworkData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [bulkCount, setBulkCount] = useState<number | null | undefined>(null);
  
  const overlayRef = useRef<OverlayPanel>(null);
  const { updateSelection, getSelectedForPage, selectMultiple, totalSelected } = useRowSelection();

  useEffect(() => {
    loadPage(activePage);
  }, [activePage]);

  const loadPage = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getArtworksPage(page);
      
      setItems(response.data);
      setTotalItems(response.pagination.total);
      
      
      const selected = getSelectedForPage(response.data);
      setSelectedRows(selected);
    } catch (err) {
      console.error('Failed to load page:', err);
    } finally {
      setIsLoading(false);
    }
  };

//   const handlePageSwitch = (e: DataTablePageEvent) => {
//     const newPage = Math.floor(e.first / e.rows) + 1;
//     setActivePage(newPage);
//   };

  const handleSelectionUpdate = (e: { value: ArtworkData[] }) => {
    const newSelection = e.value;
    


    const currentPageIds = items.map(item => item.id);
    

    currentPageIds.forEach(id => {
      updateSelection([{ id } as ArtworkData], []);
    });
    

    updateSelection([], newSelection);
    
    setSelectedRows(newSelection);
  };

  const handleBulkSelection = async () => {
    if (!bulkCount || bulkCount < 1) return;
  
    overlayRef.current?.hide();
    setIsLoading(true);
    
    const idsToSelect: number[] = [];
    const pagesToFetch = Math.ceil(bulkCount / ITEMS_PER_PAGE);
  
    try {

      const pagePromises = [];
      for (let i = 1; i <= pagesToFetch; i++) {
        pagePromises.push(getArtworksPage(i));
      }
      
      const allPages = await Promise.all(pagePromises);
      

      let collected = 0;
      for (const pageData of allPages) {
        for (const item of pageData.data) {
          if (collected >= bulkCount) break;
          idsToSelect.push(item.id);
          collected++;
        }
        if (collected >= bulkCount) break;
      }
  

      selectMultiple(idsToSelect);
      

      const currentPageResponse = await getArtworksPage(activePage);
      setItems(currentPageResponse.data);
      

      const selected = getSelectedForPage(currentPageResponse.data);
      setSelectedRows(selected);
      
      setBulkCount(null);
    } catch (err) {
      console.error('Bulk selection failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectionHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Button
        icon="pi pi-chevron-down"
        rounded
        text
        severity="secondary"
        onClick={(e) => overlayRef.current?.toggle(e)}
        style={{ width: '2rem', height: '2rem' }}
      />
      <OverlayPanel ref={overlayRef}>
        <div style={{ padding: '1rem', minWidth: '250px' }}>
          <label htmlFor="row-count" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Select rows:
          </label>
          <InputNumber
            id="row-count"
            value={bulkCount ?? null}
            onValueChange={(e: InputNumberValueChangeEvent) => setBulkCount(e.value)}
            placeholder="Enter number of rows"
            style={{ width: '100%', marginBottom: '0.5rem' }}
            min={1}
            max={500}
          />
          <Button
            label="Submit"
            onClick={handleBulkSelection}
            style={{ width: '100%' }}
            disabled={!bulkCount}
          />
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#718096' }}>
            Max 500 rows recommended
          </p>
        </div>
      </OverlayPanel>
    </div>
  );

  return (
    <div className="gallery-container">
      
      

      <div className="gallery-header">
        <h1>Artwork Collection</h1>
        <div className="selection-badge">
          Selected: {totalSelected} rows
        </div>
      </div>


      <div className="gallery-content">
        {isLoading ? (
          <div className="loading-skeleton">
            <Skeleton height="3rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="2rem" className="mb-2" />
          </div>
        ) : (
          <DataTable
            value={items}
            selection={selectedRows}
            onSelectionChange={handleSelectionUpdate}
            dataKey="id"
            tableStyle={{ minWidth: '60rem' }}
            selectionMode="multiple"
          >
            <Column 
              selectionMode="multiple" 
              headerStyle={{ width: '3rem' }}
              header={renderSelectionHeader}
            />
            <Column 
              field="title" 
              header="Title" 
              style={{ minWidth: '200px' }}
            />
            <Column 
              field="place_of_origin" 
              header="Place of Origin"
            />
            <Column 
              field="artist_display" 
              header="Artist" 
              style={{ minWidth: '200px' }}
            />
            <Column 
              field="inscriptions" 
              header="Inscriptions"
            />
            <Column 
              field="date_start" 
              header="Date Start"
            />
            <Column 
              field="date_end" 
              header="Date End"
            />
          </DataTable>
        )}
      </div>


      <div className="gallery-footer">
        <div className="pagination-controls">
          <Button 
            icon="pi pi-angle-double-left" 
            onClick={() => setActivePage(1)}
            disabled={activePage === 1 || isLoading}
            text
          />
          <Button 
            icon="pi pi-angle-left" 
            onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
            disabled={activePage === 1 || isLoading}
            text
          />
          
          <span className="page-info">
            Page {activePage} of {Math.ceil(totalItems / ITEMS_PER_PAGE)}
          </span>
          
          <Button 
            icon="pi pi-angle-right" 
            onClick={() => setActivePage(prev => prev + 1)}
            disabled={activePage >= Math.ceil(totalItems / ITEMS_PER_PAGE) || isLoading}
            text
          />
          <Button 
            icon="pi pi-angle-double-right" 
            onClick={() => setActivePage(Math.ceil(totalItems / ITEMS_PER_PAGE))}
            disabled={activePage >= Math.ceil(totalItems / ITEMS_PER_PAGE) || isLoading}
            text
          />
          
          <span className="total-info">
            Showing {(activePage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(activePage * ITEMS_PER_PAGE, totalItems)} of {totalItems.toLocaleString()} artworks
          </span>
        </div>
      </div>
    </div>
  );
}
