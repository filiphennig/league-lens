import { MatchHighlight, League } from '@/types';
import { getRecommendedHighlights as getMockRecommendedHighlights, 
         getLeagueHighlights as getMockLeagueHighlights,
         getMatchById as getMockMatchById,
         getTeamHighlights as getMockTeamHighlights,
         searchHighlights as mockSearchHighlights } from './highlightService';
import { toast } from 'sonner';

// Set the Premier League competition ID and default API token
export const PREMIER_LEAGUE_ID = 'england-premier-league';
export const SCOREBAT_API_TOKEN = 'MTk1NDQ4XzE3NDEwODA4NDdfOGNmZWUwYmVmOWVmNGRlOTY0OGE2MGM0NjA1ZGRmMWM1YzljNDc5Yg==';

// Track when we've shown error messages to prevent duplicates
const hasShownAPIError = {
  value: false,
  reset: () => { hasShownAPIError.value = false; }
};

// Manager for API connection state
const apiStateTracker = {
  lastSuccessTime: 0,
  retryCount: 0,
  maxRetries: 3,
  cooldownPeriod: 60 * 1000,
  isApiModeEnabled: true, // Always enable API mode by default
  
  recordSuccess: () => {
    apiStateTracker.lastSuccessTime = Date.now();
    apiStateTracker.retryCount = 0;
    apiStateTracker.isApiModeEnabled = true; // Ensure API mode is enabled after success
    hasShownAPIError.reset();
    
    // When dispatching events, don't trigger refreshes by default
    window.dispatchEvent(new CustomEvent('scorebat-api-status-change', { 
      detail: { status: 'connected', refresh: false } 
    }));
    
    // Add more detailed logs for successful API responses
    console.log('API connection successful, reset tracking state');
  },
  
  shouldRetryApi: () => {
    // Always use API if it's enabled
    if (apiStateTracker.isApiModeEnabled) {
      return true;
    }
    
    // Only retry if the cooldown period has passed or we haven't reached max retries
    if (
      (Date.now() - apiStateTracker.lastSuccessTime > apiStateTracker.cooldownPeriod) ||
      (apiStateTracker.retryCount < apiStateTracker.maxRetries)
    ) {
      apiStateTracker.retryCount++;
      return true;
    }
    return false;
  }
};

// Helper to create a promise with timeout
const promiseWithTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: number;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = window.setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutHandle);
  }) as Promise<T>;
};

export const getFallbackData = async <T>(
  apiCall: () => Promise<T>,
  mockCall: () => Promise<T>,
  threshold: number = 1,
  showToast: boolean = false
): Promise<T> => {
  // Always try API calls first
  if (apiStateTracker.shouldRetryApi()) {
    try {
      console.log('Attempting to fetch highlights from Scorebat...');
      
      // Use timeout to prevent long-hanging requests
      const apiData = await promiseWithTimeout(
        apiCall(), 
        10000 // Increase timeout to 10 seconds
      );
      
      console.log('API response received', apiData);
      
      // Check if the response is an array and has sufficient items
      if (Array.isArray(apiData) && apiData.length >= threshold) {
        console.log('Successfully received live data from Scorebat');
        apiStateTracker.recordSuccess();
        
        // Only show success toast if we previously showed an error and toasts are enabled
        if (showToast && hasShownAPIError.value) {
          toast.success('Live highlights available', {
            description: 'Score90 is now showing the latest football highlights.',
            duration: 3000,
            id: 'api-status-success' // Prevent duplicate toasts
          });
        }
        
        return apiData;
      } else if (apiData && typeof apiData === 'object' && Object.keys(apiData).length > 0) {
        // Handle non-array but valid responses (like single match data)
        console.log('Successfully received non-array data from Scorebat');
        apiStateTracker.recordSuccess();
        return apiData;
      }
      
      console.warn('No highlights found in API response or response format incorrect. Response:', apiData);
      if (showToast && !hasShownAPIError.value) {
        toast.warning('No new highlights available', {
          description: 'No recent football highlights found. Showing demo highlights for now.',
          duration: 5000,
        });
        hasShownAPIError.value = true;
        
        window.dispatchEvent(new CustomEvent('scorebat-api-status-change', { 
          detail: { status: 'error', error: 'No videos found or invalid format', refresh: false } 
        }));
      }
      return await mockCall();
    } catch (error) {
      console.error('Error fetching highlights, details:', error);
      // Additional error logging
      if (error instanceof Response) {
        try {
          const errorText = await error.text();
          console.error('API error response:', errorText);
        } catch (e) {
          console.error('Could not extract error text:', e);
        }
      }
      
      if (showToast && !hasShownAPIError.value) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('403')) {
          toast.error('API Access Denied', {
            description: 'Your API token appears to be invalid or has expired. Check your settings.',
            duration: 5000,
          });
        } else if (errorMessage.includes('timed out')) {
          toast.error('Connection Timeout', {
            description: 'Request timed out while fetching highlights. Showing demo content for now.',
            duration: 5000,
          });
        } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Failed to parse')) {
          toast.error('Network Error', {
            description: 'Unable to connect to highlights service. Check your internet connection.',
            duration: 5000,
          });
        } else {
          toast.error('API Connection Error', {
            description: `Could not load highlights: ${errorMessage.substring(0, 100)}`,
            duration: 5000,
          });
        }
        hasShownAPIError.value = true;
        
        window.dispatchEvent(new CustomEvent('scorebat-api-status-change', { 
          detail: { status: 'error', error: errorMessage, refresh: false } 
        }));
      }
      
      console.log('Falling back to demo data due to API error');
      return await mockCall();
    }
  } else {
    console.warn('Using demo highlights - API calls temporarily disabled due to previous failures');
    return await mockCall();
  }
};

export const forceRetryAPI = () => {
  // Reset all API state tracking
  apiStateTracker.retryCount = 0;
  apiStateTracker.lastSuccessTime = 0; // Reset the last success time to force retry
  apiStateTracker.isApiModeEnabled = true; // Ensure API mode is enabled
  hasShownAPIError.reset();
  
  console.log('Forcing API refresh and reconnection');
  window.dispatchEvent(new CustomEvent('scorebat-force-refresh'));
  return true;
};

// Additional helper to reset API cooldown on demand
export const resetApiCooldown = () => {
  apiStateTracker.lastSuccessTime = 0;
  apiStateTracker.retryCount = 0;
  apiStateTracker.isApiModeEnabled = true; // Ensure API mode is enabled
  hasShownAPIError.reset();
  console.log('API cooldown reset - will attempt fresh connections');
  return true;
};

export const hasApiToken = (): boolean => {
  // First check environment variable, then fallback to constant
  const token = import.meta.env.VITE_SCOREBAT_API_TOKEN || SCOREBAT_API_TOKEN;
  return !!token && token.length > 0;
};

export const isValidTokenFormat = (): boolean => {
  // First check environment variable, then fallback to constant
  const token = import.meta.env.VITE_SCOREBAT_API_TOKEN || SCOREBAT_API_TOKEN;
  if (!token) return false;
  
  // Check for reasonable token length and correct format
  // Scorebat tokens usually start with "MTk" (base64 encoded)
  return token.length > 10 && token.startsWith('MTk');
};

// Helper functions to get different types of football highlights with fallback to demo data
export const getRecommendedHighlightsWithFallback = async (): Promise<MatchHighlight[]> => {
  const { getRecommendedHighlights } = await import('./scorebatService');
  return getFallbackData(getRecommendedHighlights, getMockRecommendedHighlights, 1);
};

export const getLeagueHighlightsWithFallback = async (): Promise<League[]> => {
  const { getLeagueHighlights } = await import('./scorebatService');
  return getFallbackData(getLeagueHighlights, getMockLeagueHighlights, 2);
};

export const getMatchByIdWithFallback = async (id: string): Promise<MatchHighlight | null> => {
  const { getMatchById } = await import('./scorebatService');
  
  // Enhanced logging for match ID troubleshooting
  console.log(`Attempting to fetch match with ID: ${id}`);
  
  try {
    // Try the real API call first
    const match = await getFallbackData(
      () => getMatchById(id), 
      () => getMockMatchById(id), 
      1,
      true // Show toast for match details to help debug issues
    );
    
    // Log successful result
    if (match) {
      console.log('Successfully found match:', match.id);
    } else {
      console.warn('No match found with ID:', id);
    }
    
    return match;
  } catch (error) {
    console.error(`Error fetching match with ID ${id}:`, error);
    
    // Fall back to mock data with more detailed error
    toast.error('Match details unavailable', {
      description: `Unable to load details for this match. Technical details: ${error instanceof Error ? error.message : String(error)}`,
      duration: 5000,
    });
    
    return getMockMatchById(id);
  }
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

export const getCompetitionHighlightsWithFallback = async (competitionId: string): Promise<MatchHighlight[]> => {
  const { getCompetitionHighlights } = await import('./scorebatService');
  
  const mockCompetitionHighlights = async (id: string) => {
    const leagues = await getMockLeagueHighlights();
    const league = leagues.find(l => l.id === id);
    return league ? league.highlights : [];
  };
  
  // For Premier League, use direct API with token
  if (competitionId === PREMIER_LEAGUE_ID) {
    const { getPremierLeagueHighlights } = await import('./scorebatService');
    return getFallbackData(
      getPremierLeagueHighlights,
      () => mockCompetitionHighlights(competitionId),
      1,
      true // Show toast for Premier League data
    );
  }
  
  return getFallbackData(
    () => getCompetitionHighlights(competitionId), 
    () => mockCompetitionHighlights(competitionId), 
    1
  );
};
