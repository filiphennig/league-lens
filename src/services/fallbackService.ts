
import { MatchHighlight, League } from '@/types';
import { getRecommendedHighlights as getMockRecommendedHighlights, 
         getLeagueHighlights as getMockLeagueHighlights,
         getMatchById as getMockMatchById,
         getTeamHighlights as getMockTeamHighlights,
         searchHighlights as mockSearchHighlights } from './highlightService';

export const getFallbackData = async <T>(
  apiCall: () => Promise<T>,
  mockCall: () => Promise<T>,
  threshold: number = 1 // Minimum number of items expected
): Promise<T> => {
  try {
    const apiData = await apiCall();
    
    // Check if the API data meets minimum requirements
    if (Array.isArray(apiData) && apiData.length >= threshold) {
      return apiData;
    }
    
    // If not, fall back to mock data
    console.warn('API data did not meet threshold requirements, using fallback data');
    return await mockCall();
  } catch (error) {
    console.error('Error in API call, using fallback data:', error);
    return await mockCall();
  }
};

// Fallback functions that try the real API first, then fall back to mock data
export const getRecommendedHighlightsWithFallback = async (): Promise<MatchHighlight[]> => {
  const { getRecommendedHighlights } = await import('./scorebatService');
  return getFallbackData(getRecommendedHighlights, getMockRecommendedHighlights, 3);
};

export const getLeagueHighlightsWithFallback = async (): Promise<League[]> => {
  const { getLeagueHighlights } = await import('./scorebatService');
  return getFallbackData(getLeagueHighlights, getMockLeagueHighlights, 2);
};

export const getMatchByIdWithFallback = async (id: string): Promise<MatchHighlight | null> => {
  const { getMatchById } = await import('./scorebatService');
  return getFallbackData(
    () => getMatchById(id), 
    () => getMockMatchById(id), 
    1
  );
};

export const getTeamHighlightsWithFallback = async (teamId: string): Promise<MatchHighlight[]> => {
  const { getTeamHighlights } = await import('./scorebatService');
  return getFallbackData(
    () => getTeamHighlights(teamId), 
    () => getMockTeamHighlights(teamId), 
    1
  );
};

export const searchHighlightsWithFallback = async (query: string): Promise<MatchHighlight[]> => {
  const { searchHighlights } = await import('./scorebatService');
  return getFallbackData(
    () => searchHighlights(query), 
    () => mockSearchHighlights(query), 
    1
  );
};
