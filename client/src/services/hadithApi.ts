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

// Enhanced multi-API search with fallback
export const searchHadiths = async (query: string): Promise<Hadith[]> => {
  const results: Hadith[] = [];
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return [];

  // Search across multiple collections and APIs
  const collections = ['bukhari', 'muslim', 'tirmidhi', 'abudawud', 'ibnmajah', 'nasai'];
  const searchPromises = collections.map(async (collection) => {
    try {
      // Try multiple search strategies
      const strategies = [
        () => searchInHadithAPI(collection, searchTerm),
        () => searchInGadingAPI(collection, searchTerm),
        () => searchInLocalDatabase(collection, searchTerm)
      ];
      
      for (const strategy of strategies) {
        try {
          const collectionResults = await strategy();
          if (collectionResults.length > 0) {
            return collectionResults;
          }
        } catch (error) {
          console.warn(`Search strategy failed for ${collection}:`, error);
        }
      }
      return [];
    } catch (error) {
      console.warn(`Collection search failed for ${collection}:`, error);
      return [];
    }
  });

  try {
    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();
    
    // Remove duplicates and limit results
    const uniqueResults = flatResults.filter((hadith, index, self) => 
      index === self.findIndex(h => h.id === hadith.id && h.collection === hadith.collection)
    );
    
    return uniqueResults.slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

// Search in HadithAPI.com
const searchInHadithAPI = async (collection: string, query: string): Promise<Hadith[]> => {
  if (!HADITH_API_KEY) return [];
  
  const bookSlug = BOOK_SLUGS[collection.toLowerCase()] || collection;
  
  try {
    const url = `${HADITH_API_BASE_URL}/?apiKey=${HADITH_API_KEY}&book=${bookSlug}&hadithEnglish=${encodeURIComponent(query)}&paginate=5`;
    const response = await fetch(url);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.hadiths?.data) return [];
    
    return data.hadiths.data.map((h: any) => ({
      id: h.hadithNumber?.toString() || Math.random().toString(),
      collection: h.book || collection,
      book: h.bookSlug || bookSlug,
      chapter: h.chapterName || '',
      hadithNumber: h.hadithNumber?.toString() || '',
      arabicText: h.hadithArabic || '',
      translation: h.hadithEnglish || '',
      narrator: h.headingArabic || h.headingEnglish || '',
      grade: h.status || 'Unknown',
      reference: `${h.book || collection} ${h.hadithNumber || ''}`
    }));
  } catch (error) {
    console.warn('HadithAPI search failed:', error);
    return [];
  }
};

// Search in Gading API
const searchInGadingAPI = async (collection: string, query: string): Promise<Hadith[]> => {
  try {
    // Get multiple ranges to increase search coverage
    const ranges = ['1-50', '51-100', '101-150', '151-200'];
    const searchPromises = ranges.map(async (range) => {
      try {
        const response = await fetch(`${ALT_API_BASE_URL}/books/${collection}?range=${range}`);
        if (!response.ok) return [];
        
        const data = await response.json();
        const hadiths = data.data?.hadiths || [];
        
        // Filter hadiths that match the search query
        return hadiths.filter((hadith: any) => {
          const text = (hadith.id || hadith.text || '').toLowerCase();
          const arab = (hadith.arab || '').toLowerCase();
          return text.includes(query) || arab.includes(query) || 
                 query.split(' ').some(word => text.includes(word) || arab.includes(word));
        }).map((hadith: any) => ({
          id: hadith.number?.toString() || Math.random().toString(),
          collection: collection,
          book: data.data?.name || collection,
          chapter: '',
          hadithNumber: hadith.number?.toString() || '',
          arabicText: hadith.arab || '',
          translation: hadith.id || hadith.text || '',
          narrator: '',
          grade: 'Sahih',
          reference: `${collection} ${hadith.number || ''}`
        }));
      } catch {
        return [];
      }
    });
    
    const results = await Promise.all(searchPromises);
    return results.flat().slice(0, 5); // Limit per collection
  } catch (error) {
    console.warn('Gading API search failed:', error);
    return [];
  }
};

// Search in local database (fallback with common hadiths)
const searchInLocalDatabase = async (collection: string, query: string): Promise<Hadith[]> => {
  const commonHadiths = [
    {
      id: '1',
      collection: 'Sahih Bukhari',
      book: 'Book of Faith',
      chapter: 'How the Divine Inspiration was revealed',
      hadithNumber: '1',
      arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
      translation: 'Actions are but by intention and every man shall have only that which he intended.',
      narrator: 'Umar ibn al-Khattab',
      grade: 'Sahih',
      reference: 'Bukhari 1:1',
      keywords: ['intention', 'actions', 'niyyah', 'purpose', 'heart']
    },
    {
      id: '2',
      collection: 'Sahih Muslim',
      book: 'Book of Faith',
      chapter: 'The Pillars of Islam',
      hadithNumber: '16',
      arabicText: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ وَإِقَامِ الصَّلاَةِ وَإِيتَاءِ الزَّكَاةِ وَالْحَجِّ وَصَوْمِ رَمَضَانَ',
      translation: 'Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is His messenger, establishing prayer, giving charity, pilgrimage to the House, and fasting Ramadan.',
      narrator: 'Ibn Umar',
      grade: 'Sahih',
      reference: 'Muslim 16',
      keywords: ['islam', 'pillars', 'five', 'prayer', 'charity', 'hajj', 'fasting', 'shahada']
    },
    {
      id: '3',
      collection: 'Sahih Bukhari',
      book: 'Book of Prayer',
      chapter: 'The Times of Prayer',
      hadithNumber: '521',
      arabicText: 'الصَّلاَةُ نُورٌ وَالصَّدَقَةُ بُرْهَانٌ وَالصَّبْرُ ضِيَاءٌ',
      translation: 'Prayer is light, charity is proof, and patience is illumination.',
      narrator: 'Abu Malik al-Ashari',
      grade: 'Sahih',
      reference: 'Bukhari 521',
      keywords: ['prayer', 'light', 'charity', 'patience', 'salah', 'sadaqah', 'sabr']
    },
    {
      id: '4',
      collection: 'Jami at-Tirmidhi',
      book: 'Book of Righteousness',
      chapter: 'Kindness to Parents',
      hadithNumber: '1899',
      arabicText: 'رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ',
      translation: 'The pleasure of Allah lies in the pleasure of the parent. The anger of Allah lies in the anger of the parent.',
      narrator: 'Abdullah ibn Amr',
      grade: 'Hasan',
      reference: 'Tirmidhi 1899',
      keywords: ['parents', 'mother', 'father', 'kindness', 'respect', 'obedience', 'family']
    },
    {
      id: '5',
      collection: 'Sunan Abu Dawud',
      book: 'Book of Prayer',
      chapter: 'Cleanliness',
      hadithNumber: '61',
      arabicText: 'الطَّهُورُ شَطْرُ الإِيمَانِ',
      translation: 'Cleanliness is half of faith.',
      narrator: 'Abu Malik al-Ashari',
      grade: 'Sahih',
      reference: 'Abu Dawud 61',
      keywords: ['cleanliness', 'purity', 'faith', 'wudu', 'tahara', 'hygiene']
    },
    {
      id: '6',
      collection: 'Sahih Muslim',
      book: 'Book of Remembrance',
      chapter: 'Dhikr and Dua',
      hadithNumber: '2675',
      arabicText: 'مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ',
      translation: 'Whoever says: There is no god but Allah alone, with no partner, His is the dominion and His is the praise, and He is able to do all things.',
      narrator: 'Abu Huraira',
      grade: 'Sahih',
      reference: 'Muslim 2675',
      keywords: ['dhikr', 'remembrance', 'tawhid', 'allah', 'praise', 'worship', 'dua']
    }
  ];
  
  // Filter hadiths based on query
  return commonHadiths.filter(hadith => {
    const searchFields = [
      hadith.translation.toLowerCase(),
      hadith.narrator.toLowerCase(),
      hadith.collection.toLowerCase(),
      hadith.book.toLowerCase(),
      ...(hadith.keywords || [])
    ].join(' ');
    
    return query.split(' ').some(word => 
      searchFields.includes(word.toLowerCase())
    );
  }).slice(0, 3);
};

// Enhanced book collection with more sources
export const getAvailableBooks = (): { name: string; slug: string; description: string; totalHadiths: number }[] => {
  return [
    { name: 'Sahih Bukhari', slug: 'bukhari', description: 'Most authentic collection', totalHadiths: 7563 },
    { name: 'Sahih Muslim', slug: 'muslim', description: 'Second most authentic', totalHadiths: 7190 },
    { name: 'Jami at-Tirmidhi', slug: 'tirmidhi', description: 'With detailed commentary', totalHadiths: 3956 },
    { name: 'Sunan Abu Dawud', slug: 'abudawud', description: 'Focus on legal matters', totalHadiths: 5274 },
    { name: 'Sunan Ibn Majah', slug: 'ibnmajah', description: 'Comprehensive collection', totalHadiths: 4341 },
    { name: 'Sunan an-Nasai', slug: 'nasai', description: 'Strict authentication', totalHadiths: 5761 },
    { name: 'Mishkat al-Masabih', slug: 'mishkat', description: 'Selected hadiths', totalHadiths: 6285 },
    { name: 'Musnad Ahmad', slug: 'ahmad', description: 'Largest collection', totalHadiths: 26363 }
  ];
};

// Get random hadith from any collection
export const getRandomHadith = async (): Promise<Hadith> => {
  const collections = ['bukhari', 'muslim', 'tirmidhi', 'abudawud'];
  const randomCollection = collections[Math.floor(Math.random() * collections.length)];
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  
  try {
    return await fetchHadithWithFallback(randomCollection, randomNumber.toString());
  } catch (error) {
    // Return a default hadith if all APIs fail
    return {
      id: '1',
      collection: 'Sahih Bukhari',
      book: 'Book of Faith',
      chapter: 'Intention',
      hadithNumber: '1',
      arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
      translation: 'Actions are but by intention and every man shall have only that which he intended.',
      narrator: 'Umar ibn al-Khattab',
      grade: 'Sahih',
      reference: 'Bukhari 1:1'
    };
  }
};

// Search suggestions based on common topics
export const getSearchSuggestions = (): string[] => {
  return [
    'prayer', 'charity', 'fasting', 'hajj', 'faith', 'intention',
    'parents', 'kindness', 'patience', 'forgiveness', 'knowledge',
    'cleanliness', 'marriage', 'friendship', 'honesty', 'justice',
    'gratitude', 'remembrance', 'dua', 'quran', 'prophet', 'companions'
  ];
};

// Batch fetch hadiths for better performance
export const fetchMultipleHadiths = async (collection: string, count: number = 10): Promise<Hadith[]> => {
  const hadiths: Hadith[] = [];
  const promises: Promise<Hadith | null>[] = [];
  
  for (let i = 1; i <= count; i++) {
    promises.push(
      fetchHadithWithFallback(collection, i.toString())
        .catch(() => null) // Handle individual failures
    );
  }
  
  const results = await Promise.all(promises);
  return results.filter((hadith): hadith is Hadith => hadith !== null);
};

// Enhanced search with caching
const searchCache = new Map<string, { results: Hadith[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const searchHadithsWithCache = async (query: string): Promise<Hadith[]> => {
  const cacheKey = query.toLowerCase().trim();
  const cached = searchCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }
  
  const results = await searchHadiths(query);
  searchCache.set(cacheKey, { results, timestamp: Date.now() });
  
  return results;
};

// Example usage function
export const exampleUsage = async () => {
  try {
    // Get a specific hadith with fallback
    const hadith = await fetchHadithWithFallback('bukhari', '1');
    console.log('Hadith found:', hadith);

    // Search for hadiths with caching
    const searchResults = await searchHadithsWithCache('prayer');
    console.log('Search results:', searchResults);
    
    // Get random hadith
    const randomHadith = await getRandomHadith();
    console.log('Random hadith:', randomHadith);

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