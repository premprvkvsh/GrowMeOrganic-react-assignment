import { ArtworksResponse } from '../interfaces';

const API_BASE = 'https://api.artic.edu/api/v1/artworks';

export async function getArtworksPage(pageNum: number): Promise<ArtworksResponse> {
  const res = await fetch(`${API_BASE}?page=${pageNum}`);
  
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  
  const response = await res.json();
  
  
  return response;
}