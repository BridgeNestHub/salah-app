// Enhanced Hadith API service that combines local server API with external APIs
import { searchHadithsWithCache, fetchHadithWithFallback, getRandomHadith as getRandomHadithFromAPI } from './hadithApi';

interface Hadith {
  id: string;
  collection: string;
  book: string;
  chapter: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string;
  reference: string;
}

interface Collection {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  totalHadiths: number;
}

// Base API URL - use environment variable or fallback to current domain
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Enhanced search that combines local server API with external APIs
export const searchHadiths = async (query: string): Promise<Hadith[]> => {
  const results: Hadith[] = [];
  
  try {
    // First, try local server API (fastest and most reliable)
    const serverResults = await searchFromServer(query);
    results.push(...serverResults);
    
    // If we have enough results from server, return them
    if (results.length >= 10) {
      return results.slice(0, 20);
    }
    
    // Otherwise, supplement with external API results
    const externalResults = await searchHadithsWithCache(query);
    
    // Combine and deduplicate results
    const combinedResults = [...results, ...externalResults];
    const uniqueResults = combinedResults.filter((hadith, index, self) => 
      index === self.findIndex(h => h.id === hadith.id && h.collection === hadith.collection)
    );
    
    return uniqueResults.slice(0, 20);
    
  } catch (error) {
    console.warn('Server search failed, falling back to external APIs:', error);
    
    // Fallback to external APIs only
    try {
      return await searchHadithsWithCache(query);
    } catch (fallbackError) {
      console.error('All search methods failed:', fallbackError);
      return [];
    }
  }
};

// Search from local server API
const searchFromServer = async (query: string): Promise<Hadith[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hadith/search?q=${encodeURIComponent(query)}&limit=15`);
    
    if (!response.ok) {
      throw new Error(`Server search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.warn('Server search error:', error);
    throw error;
  }
};

// Get hadith collections
export const getHadithCollections = async (): Promise<Collection[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hadith/collections`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    // Fallback to default collections
    return getDefaultCollections();
    
  } catch (error) {
    console.warn('Failed to fetch collections from server, using defaults:', error);
    return getDefaultCollections();
  }
};

// Get random hadith (enhanced with server API)
export const getRandomHadith = async (collection?: string): Promise<Hadith> => {
  try {
    // Try server API first
    const url = collection 
      ? `${API_BASE_URL}/api/hadith/random?collection=${collection}`
      : `${API_BASE_URL}/api/hadith/random`;
      
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
    
    // Fallback to external API
    return await getRandomHadithFromAPI();
    
  } catch (error) {
    console.warn('Server random hadith failed, using external API:', error);
    return await getRandomHadithFromAPI();
  }
};

// Get hadith by ID
export const getHadithById = async (id: string): Promise<Hadith | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hadith/${id}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch hadith by ID:', error);
    return null;
  }
};

// Get multiple hadiths for a collection
export const getHadithsByCollection = async (collection: string, limit: number = 10): Promise<Hadith[]> => {
  const hadiths: Hadith[] = [];
  
  // Try to get multiple random hadiths from the collection
  for (let i = 0; i < limit; i++) {
    try {
      const hadith = await getRandomHadith(collection);
      
      // Avoid duplicates
      if (!hadiths.find(h => h.id === hadith.id)) {
        hadiths.push(hadith);
      }
      
      // Small delay to avoid overwhelming the API
      if (i < limit - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.warn(`Failed to fetch hadith ${i + 1} for collection ${collection}:`, error);
    }
  }
  
  return hadiths;
};

// Default collections fallback
const getDefaultCollections = (): Collection[] => {
  return [
    {
      id: 'bukhari',
      name: 'Sahih Bukhari',
      arabicName: 'صحيح البخاري',
      description: 'The most authentic collection of Hadith',
      totalHadiths: 7563
    },
    {
      id: 'muslim',
      name: 'Sahih Muslim',
      arabicName: 'صحيح مسلم',
      description: 'The second most authentic collection',
      totalHadiths: 7190
    },
    {
      id: 'tirmidhi',
      name: 'Jami at-Tirmidhi',
      arabicName: 'جامع الترمذي',
      description: 'Collection with detailed commentary',
      totalHadiths: 3956
    },
    {
      id: 'abudawud',
      name: 'Sunan Abu Dawud',
      arabicName: 'سنن أبي داود',
      description: 'Focus on legal matters',
      totalHadiths: 5274
    },
    {
      id: 'ibnmajah',
      name: 'Sunan Ibn Majah',
      arabicName: 'سنن ابن ماجه',
      description: 'Comprehensive collection',
      totalHadiths: 4341
    },
    {
      id: 'nasai',
      name: 'Sunan an-Nasai',
      arabicName: 'سنن النسائي',
      description: 'Strict authentication',
      totalHadiths: 5761
    }
  ];
};

// Search suggestions based on popular topics
export const getSearchSuggestions = (): string[] => {
  return [
    'prayer', 'charity', 'fasting', 'hajj', 'faith', 'intention',
    'parents', 'kindness', 'patience', 'forgiveness', 'knowledge',
    'cleanliness', 'marriage', 'friendship', 'honesty', 'justice',
    'gratitude', 'remembrance', 'dua', 'quran', 'prophet', 'companions',
    'brotherhood', 'compassion', 'worship', 'manners', 'speech',
    'helping others', 'seeking knowledge', 'good deeds', 'repentance'
  ];
};

// Enhanced search with auto-suggestions
export const getSearchWithSuggestions = async (query: string): Promise<{
  results: Hadith[];
  suggestions: string[];
}> => {
  const results = await searchHadiths(query);
  
  // Generate suggestions based on query
  const allSuggestions = getSearchSuggestions();
  const suggestions = allSuggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(suggestion.toLowerCase())
    )
    .slice(0, 5);
  
  return { results, suggestions };
};

// Cache for better performance
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = <T>(key: string, fetchFn: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.data);
  }
  
  return fetchFn().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
};

// Batch operations for better performance
export const batchSearchHadiths = async (queries: string[]): Promise<Map<string, Hadith[]>> => {
  const results = new Map<string, Hadith[]>();
  
  const promises = queries.map(async (query) => {
    try {
      const hadiths = await getCachedData(`search:${query}`, () => searchHadiths(query));
      results.set(query, hadiths);
    } catch (error) {
      console.warn(`Batch search failed for query "${query}":`, error);
      results.set(query, []);
    }
  });
  
  await Promise.all(promises);
  return results;
};