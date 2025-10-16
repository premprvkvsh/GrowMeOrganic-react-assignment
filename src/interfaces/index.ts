export interface ArtworkData {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
  }
  
  export interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  }
  
  export interface ArtworksResponse {
    data: ArtworkData[];
    pagination: PaginationInfo;
  }
  