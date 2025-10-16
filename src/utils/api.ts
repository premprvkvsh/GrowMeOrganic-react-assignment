import { ArtworksResponse } from '../interfaces';

const API_BASE = 'https://api.artic.edu/api/v1/artworks';

export async function getArtworksPage(pageNum: number): Promise<ArtworksResponse> {
  // Add fields parameter to get the same data structure as the working example
  const res = await fetch(
    `${API_BASE}?page=${pageNum}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`
  );
  
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  
  return res.json();
}