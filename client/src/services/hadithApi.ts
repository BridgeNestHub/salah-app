// Environment variables needed:
// REACT_APP_SUNNAH_API_KEY (for sunnah.com)
// REACT_APP_HADITH_API_KEY (for hadithapi.com)

// API Configuration
const SUNNAH_API_KEY = process.env.REACT_APP_SUNNAH_API_KEY;
const HADITH_API_KEY = '$2y$10$RZho6ptYn7jwQbSndFKoqevWNzXfWSTgPlmSLXzjpQw7NEbxiswaa';

// Corrected API URLs
const SUNNAH_BASE_URL = 'https://api.sunnah.com/v1';
const HADITH_API_BASE_URL = 'https://hadithapi.com/api/hadiths'; // Fixed: removed /public
const ALT_API_BASE_URL = 'https://api.hadith.gading.dev';

// Book slug mappings for HadithAPI.com
const BOOK_SLUGS: Record<string, string> = {
  'bukhari': 'sahih-bukhari',
  'muslim': 'sahih-muslim',
  'tirmidhi': 'al-tirmidhi',
  'abudawud': 'abu-dawood',
  'ibnmajah': 'ibn-e-majah',
  'nasai': 'sunan-nasai',
  'mishkat': 'mishkat',
  'ahmad': 'musnad-ahmad',
  'silsila': 'al-silsila-sahiha'
};

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

// Enhanced error handling
class HadithAPIError extends Error {
  constructor(message: string, public statusCode?: number, public apiSource?: string) {
    super(message);
    this.name = 'HadithAPIError';
  }
}

// Sunnah.com API (requires API key)
export const fetchFromSunnah = async (collection: string, hadithNumber: string): Promise<Hadith> => {
  if (!SUNNAH_API_KEY) {
    throw new HadithAPIError('Sunnah API key is required', 401, 'sunnah.com');
  }

  try {
    const response = await fetch(`${SUNNAH_BASE_URL}/collections/${collection}/hadiths/${hadithNumber}`, {
      headers: { 
        'X-API-Key': SUNNAH_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new HadithAPIError(`Sunnah API error: ${response.statusText}`, response.status, 'sunnah.com');
    }

    const data = await response.json();
    
    return {
      id: data.hadithNumber?.toString() || hadithNumber,
      collection: data.collection?.name || collection,
      book: data.book?.name || '',
      chapter: data.chapter?.name || '',
      hadithNumber: data.hadithNumber?.toString() || hadithNumber,
      arabicText: data.hadith?.[0]?.body || '',
      translation: data.hadith?.[1]?.body || data.hadith?.[0]?.body || '',
      narrator: data.hadith?.[0]?.attribution || '',
      grade: data.hadith?.[0]?.grades?.[0]?.name || 'Unknown',
      reference: `${data.collection?.name || collection} ${data.hadithNumber || hadithNumber}`
    };
  } catch (error) {
    if (error instanceof HadithAPIError) throw error;
    throw new HadithAPIError(`Failed to fetch from Sunnah: ${error instanceof Error ? error.message : 'Unknown error'}`, undefined, 'sunnah.com');
  }
};

// HadithAPI.com (requires API key and correct endpoint)
export const fetchFromHadithAPI = async (collection: string, hadithNumber: string): Promise<Hadith> => {
  if (!HADITH_API_KEY) {
    throw new HadithAPIError('Hadith API key is required. Get one from https://hadithapi.com/profile', 401, 'hadithapi.com');
  }

  // Convert collection to proper slug
  const bookSlug = BOOK_SLUGS[collection.toLowerCase()] || collection;

  try {
    const url = `${HADITH_API_BASE_URL}/?apiKey=${HADITH_API_KEY}&book=${bookSlug}&hadithNumber=${hadithNumber}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 403) {
        throw new HadithAPIError('API key required or invalid. Visit https://hadithapi.com/profile to get your key.', 403, 'hadithapi.com');
      }
      if (response.status === 401) {
        throw new HadithAPIError('Invalid API key for HadithAPI.com', 401, 'hadithapi.com');
      }
      throw new HadithAPIError(`HadithAPI error: ${response.statusText}`, response.status, 'hadithapi.com');
    }

    const data = await response.json();
    const hadith = data.hadiths?.data?.[0];
    
    if (!hadith) {
      throw new HadithAPIError(`No hadith found for ${collection} ${hadithNumber}`, 404, 'hadithapi.com');
    }
    
    return {
      id: hadith.hadithNumber?.toString() || hadithNumber,
      collection: hadith.book || collection,
      book: hadith.bookSlug || bookSlug,
      chapter: hadith.chapterName || hadith.chapterEnglish || '',
      hadithNumber: hadith.hadithNumber?.toString() || hadithNumber,
      arabicText: hadith.hadithArabic || '',
      translation: hadith.hadithEnglish || '',
      narrator: hadith.headingArabic || hadith.headingEnglish || '',
      grade: hadith.status || 'Unknown',
      reference: `${hadith.book || collection} ${hadith.hadithNumber || hadithNumber}`
    };
  } catch (error) {
    if (error instanceof HadithAPIError) throw error;
    throw new HadithAPIError(`Failed to fetch from HadithAPI: ${error instanceof Error ? error.message : 'Unknown error'}`, undefined, 'hadithapi.com');
  }
};

// Alternative API (Free, no key required)
export const fetchFromAltAPI = async (collection: string, hadithNumber: string): Promise<Hadith> => {
  try {
    const response = await fetch(`${ALT_API_BASE_URL}/books/${collection}?range=${hadithNumber}`);
    
    if (!response.ok) {
      throw new HadithAPIError(`Alternative API error: ${response.statusText}`, response.status, 'hadith.gading.dev');
    }

    const data = await response.json();
    const hadith = data.data?.hadiths?.[0];
    
    if (!hadith) {
      throw new HadithAPIError(`No hadith found for ${collection} ${hadithNumber}`, 404, 'hadith.gading.dev');
    }
    
    return {
      id: hadith.number?.toString() || hadithNumber,
      collection: data.data?.name || collection,
      book: data.data?.name || collection,
      chapter: '',
      hadithNumber: hadith.number?.toString() || hadithNumber,
      arabicText: hadith.arab || '',
      translation: hadith.id || '', // Note: This API structure might be different
      narrator: '',
      grade: 'Sahih', // Default assumption
      reference: `${collection} ${hadithNumber}`
    };
  } catch (error) {
    if (error instanceof HadithAPIError) throw error;
    throw new HadithAPIError(`Failed to fetch from Alternative API: ${error instanceof Error ? error.message : 'Unknown error'}`, undefined, 'hadith.gading.dev');
  }
};

// Fallback strategy: Try multiple APIs
export const fetchHadithWithFallback = async (collection: string, hadithNumber: string): Promise<Hadith> => {
  const errors: string[] = [];

  // Try HadithAPI.com first (most reliable)
  if (HADITH_API_KEY) {
    try {
      return await fetchFromHadithAPI(collection, hadithNumber);
    } catch (error) {
      errors.push(`HadithAPI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Try Sunnah.com second
  if (SUNNAH_API_KEY) {
    try {
      return await fetchFromSunnah(collection, hadithNumber);
    } catch (error) {
      errors.push(`Sunnah: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Try Alternative API last
  try {
    return await fetchFromAltAPI(collection, hadithNumber);
  } catch (error) {
    errors.push(`Alternative: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  throw new HadithAPIError(`All APIs failed: ${errors.join(', ')}`);
};

// Enhanced search with proper error handling
export const searchHadiths = async (query: string): Promise<Hadith[]> => {
  if (!HADITH_API_KEY) {
    throw new HadithAPIError('Search requires HadithAPI key. Get one from https://hadithapi.com/profile', 401, 'hadithapi.com');
  }

  try {
    const url = `${HADITH_API_BASE_URL}/?apiKey=${HADITH_API_KEY}&hadithEnglish=${encodeURIComponent(query)}&paginate=10`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new HadithAPIError(`Search failed: ${response.statusText}`, response.status, 'hadithapi.com');
    }

    const data = await response.json();
    
    if (!data.hadiths?.data) {
      return [];
    }

    return data.hadiths.data.map((h: any) => ({
      id: h.hadithNumber?.toString() || '',
      collection: h.book || '',
      book: h.bookSlug || '',
      chapter: h.chapterName || '',
      hadithNumber: h.hadithNumber?.toString() || '',
      arabicText: h.hadithArabic || '',
      translation: h.hadithEnglish || '',
      narrator: h.headingArabic || '',
      grade: h.status || 'Unknown',
      reference: `${h.book || ''} ${h.hadithNumber || ''}`
    }));
  } catch (error) {
    if (error instanceof HadithAPIError) throw error;
    throw new HadithAPIError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`, undefined, 'hadithapi.com');
  }
};

// Utility function to get available books
export const getAvailableBooks = (): { name: string; slug: string }[] => {
  return Object.entries(BOOK_SLUGS).map(([key, slug]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    slug
  }));
};

// Example usage function
export const exampleUsage = async () => {
  try {
    // Get a specific hadith with fallback
    const hadith = await fetchHadithWithFallback('bukhari', '1');
    console.log('Hadith found:', hadith);

    // Search for hadiths
    const searchResults = await searchHadiths('prayer');
    console.log('Search results:', searchResults);

  } catch (error) {
    if (error instanceof HadithAPIError) {
      console.error(`${error.apiSource || 'API'} Error:`, error.message);
      if (error.statusCode === 401 || error.statusCode === 403) {
        console.error('Please check your API keys in environment variables');
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
};