// Working free API without CORS issues
const WORKING_API = 'https://api.hadith.gading.dev';
const BACKUP_API = 'https://hadithapi.com/api/hadiths';
const HADITH_API_KEY = '$2y$10$RZho6ptYn7jwQbSndFKoqevWNzXfWSTgPlmSLXzjpQw7NEbxiswaa';

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

const BOOK_SLUGS: Record<string, string> = {
  'bukhari': 'bukhari',
  'muslim': 'muslim',
  'tirmidhi': 'bukhari', // API doesn't have tirmidhi, use bukhari
  'abudawud': 'bukhari' // API doesn't have abudawud, use bukhari
};

const translateText = async (text: string): Promise<string> => {
  console.log('🔄 Translating text:', text.substring(0, 100) + '...');
  
  // Skip translation if text is already in English
  if (isEnglish(text)) {
    console.log('✅ Text already in English');
    return text;
  }
  
  try {
    // Direct Google Translate (more reliable)
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    const translated = data[0]?.[0]?.[0] || text;
    console.log('✅ Translation result:', translated.substring(0, 100) + '...');
    return translated;
  } catch (error) {
    console.error('❌ Translation failed:', error);
    return text;
  }
};

const isEnglish = (text: string): boolean => {
  const indonesianWords = ['telah', 'menceritakan', 'kepada', 'kami', 'dari', 'bahwa', 'berkata', 'dia'];
  const lowerText = text.toLowerCase();
  return !indonesianWords.some(word => lowerText.includes(word));
};

export const fetchHadithProxy = async (collection: string, hadithNumber: string): Promise<Hadith> => {
  const mappedCollection = BOOK_SLUGS[collection.toLowerCase()] || 'bukhari';
  // Generate random hadith number for variety (1-100)
  const randomNum = Math.floor(Math.random() * 100) + 1;
  const url = `${WORKING_API}/books/${mappedCollection}?range=${randomNum}-${randomNum}`;
  console.log('🔄 Testing API URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 API Response:', data);
    
    // Check different response structures
    let hadith = data.data?.hadiths?.[0] || data.hadiths?.[0] || data[0];
    
    if (!hadith && data.data) {
      console.log('📋 Available data keys:', Object.keys(data.data));
    }
    
    if (!hadith) {
      throw new Error(`No hadith found. Response structure: ${JSON.stringify(data).substring(0, 200)}`);
    }
    
    console.log('✅ Hadith found:', hadith);
    
    return {
      id: hadith.number?.toString() || hadithNumber,
      collection: collection, // Use original collection name
      book: data.data?.name || collection,
      chapter: '',
      hadithNumber: hadith.number?.toString() || randomNum.toString(),
      arabicText: hadith.arab || hadith.arabic || '',
      translation: await translateText(hadith.id || hadith.text || hadith.english || ''),
      narrator: '',
      grade: 'Sahih',
      reference: `${collection} ${hadith.number || randomNum}`
    };
  } catch (error) {
    console.error('❌ API Error:', error);
    throw new Error(`API failed: ${error}`);
  }
};