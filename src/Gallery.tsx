import { useState, useEffect, useRef } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { ProgressBar } from 'primereact/progressbar';
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
  const [isBulkSelecting, setIsBulkSelecting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
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

  const handlePageSwitch = (e: DataTablePageEvent) => {
    const newPage = Math.floor(e.first / e.rows) + 1;
    setActivePage(newPage);
  };

  const handleSelectionUpdate = (e: { value: ArtworkData[] }) => {
    const newSelection = e.value;
    setSelectedRows(newSelection);
    updateSelection(items, newSelection);
  };

  const handleBulkSelection = async () => {
    if (!bulkCount || bulkCount < 1) return;

    setIsBulkSelecting(true);
    setBulkProgress(0);
    const idsToSelect: number[] = [];
    let collected = 0;
    let pageNum = 1;

    try {
      // Fetch pages in parallel (batches of 3)
      while (collected < bulkCount) {
        const pagesToFetch = Math.ceil((bulkCount - collected) / ITEMS_PER_PAGE);
        const batchSize = Math.min(3, pagesToFetch);
        
        const promises = [];
        for (let i = 0; i < batchSize && collected < bulkCount; i++) {
          promises.push(getArtworksPage(pageNum + i));
        }
        
        const responses = await Promise.all(promises);
        
        for (const response of responses) {
          if (collected >= bulkCount) break;
          
          const needed = bulkCount - collected;
          const batch = response.data.slice(0, needed);
          
          batch.forEach(item => {
            idsToSelect.push(item.id);
            collected++;
          });
          
          // Update progress
          setBulkProgress(Math.round((collected / bulkCount) * 100));
        }
        
        pageNum += batchSize;
        
        if (responses.some(r => r.data.length < ITEMS_PER_PAGE)) {
          break;
        }
      }

      selectMultiple(idsToSelect);
      
      const selected = getSelectedForPage(items);
      setSelectedRows(selected);
      
      overlayRef.current?.hide();
      setBulkCount(null);
    } catch (err) {
      console.error('Bulk selection failed:', err);
    } finally {
      setIsBulkSelecting(false);
      setBulkProgress(0);
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
        disabled={isBulkSelecting}
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
            max={1000}
          />
          <Button
            label="Submit"
            onClick={handleBulkSelection}
            style={{ width: '100%' }}
            disabled={!bulkCount || isBulkSelecting}
          />
        </div>
      </OverlayPanel>
    </div>
  );

  return (
    <div className="gallery-container">
      {/* Sticky Header */}
      <div className="gallery-header">
        <h1>Artwork Collection</h1>
        <div className="selection-badge">
          Selected: {totalSelected} rows
        </div>
        
        {/* Bulk Selection Progress */}
        {isBulkSelecting && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#4a5568' }}>
              Selecting rows... {bulkProgress}%
            </p>
            <ProgressBar value={bulkProgress} />
          </div>
        )}
      </div>

      {/* Scrollable Content */}
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

      {/* Sticky Footer with Pagination */}
      <div className="gallery-footer">
        <div className="pagination-controls">
          <Button 
            icon="pi pi-angle-double-left" 
            onClick={() => setActivePage(1)}
            disabled={activePage === 1 || isLoading || isBulkSelecting}
            text
          />
          <Button 
            icon="pi pi-angle-left" 
            onClick={() => setActivePage(prev => Math.max(1, prev - 1))}
            disabled={activePage === 1 || isLoading || isBulkSelecting}
            text
          />
          
          <span className="page-info">
            Page {activePage} of {Math.ceil(totalItems / ITEMS_PER_PAGE)}
          </span>
          
          <Button 
            icon="pi pi-angle-right" 
            onClick={() => setActivePage(prev => prev + 1)}
            disabled={activePage >= Math.ceil(totalItems / ITEMS_PER_PAGE) || isLoading || isBulkSelecting}
            text
          />
          <Button 
            icon="pi pi-angle-double-right" 
            onClick={() => setActivePage(Math.ceil(totalItems / ITEMS_PER_PAGE))}
            disabled={activePage >= Math.ceil(totalItems / ITEMS_PER_PAGE) || isLoading || isBulkSelecting}
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
