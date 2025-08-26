import { Request, Response } from 'express';

// Enhanced hadith collections with more comprehensive data
const HADITH_COLLECTIONS = {
  bukhari: {
    name: 'Sahih Bukhari',
    arabicName: 'صحيح البخاري',
    description: 'The most authentic collection of Hadith',
    totalHadiths: 7563,
    apiEndpoint: 'bukhari'
  },
  muslim: {
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    description: 'The second most authentic collection',
    totalHadiths: 7190,
    apiEndpoint: 'muslim'
  },
  tirmidhi: {
    name: 'Jami at-Tirmidhi',
    arabicName: 'جامع الترمذي',
    description: 'Collection with detailed commentary',
    totalHadiths: 3956,
    apiEndpoint: 'bukhari' // Fallback to bukhari
  },
  abudawud: {
    name: 'Sunan Abu Dawud',
    arabicName: 'سنن أبي داود',
    description: 'Focus on legal matters',
    totalHadiths: 5274,
    apiEndpoint: 'bukhari' // Fallback to bukhari
  }
};

// Comprehensive hadith database for search
const HADITH_DATABASE = [
  {
    id: '1',
    collection: 'bukhari',
    hadithNumber: '1',
    arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Actions are but by intention and every man shall have only that which he intended. Thus he whose migration was for Allah and His messenger, his migration was for Allah and His messenger, and he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that for which he migrated.',
    narrator: 'Umar ibn al-Khattab',
    grade: 'Sahih',
    book: 'Book of Faith',
    chapter: 'How the Divine Inspiration was revealed',
    keywords: ['intention', 'actions', 'niyyah', 'purpose', 'heart', 'migration', 'hijra']
  },
  {
    id: '2',
    collection: 'muslim',
    hadithNumber: '16',
    arabicText: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ وَإِقَامِ الصَّلاَةِ وَإِيتَاءِ الزَّكَاةِ وَالْحَجِّ وَصَوْمِ رَمَضَانَ',
    translation: 'Islam is built upon five pillars: testifying that there is no god but Allah and that Muhammad is His messenger, establishing prayer, giving charity, pilgrimage to the House, and fasting Ramadan.',
    narrator: 'Ibn Umar',
    grade: 'Sahih',
    book: 'Book of Faith',
    chapter: 'The Pillars of Islam',
    keywords: ['islam', 'pillars', 'five', 'prayer', 'charity', 'hajj', 'fasting', 'shahada', 'salah', 'zakat']
  },
  {
    id: '3',
    collection: 'bukhari',
    hadithNumber: '521',
    arabicText: 'الصَّلاَةُ نُورٌ وَالصَّدَقَةُ بُرْهَانٌ وَالصَّبْرُ ضِيَاءٌ',
    translation: 'Prayer is light, charity is proof, and patience is illumination.',
    narrator: 'Abu Malik al-Ashari',
    grade: 'Sahih',
    book: 'Book of Prayer',
    chapter: 'The Times of Prayer',
    keywords: ['prayer', 'light', 'charity', 'patience', 'salah', 'sadaqah', 'sabr', 'worship']
  },
  {
    id: '4',
    collection: 'tirmidhi',
    hadithNumber: '1899',
    arabicText: 'رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ',
    translation: 'The pleasure of Allah lies in the pleasure of the parent. The anger of Allah lies in the anger of the parent.',
    narrator: 'Abdullah ibn Amr',
    grade: 'Hasan',
    book: 'Book of Righteousness',
    chapter: 'Kindness to Parents',
    keywords: ['parents', 'mother', 'father', 'kindness', 'respect', 'obedience', 'family', 'birr']
  },
  {
    id: '5',
    collection: 'abudawud',
    hadithNumber: '61',
    arabicText: 'الطَّهُورُ شَطْرُ الإِيمَانِ',
    translation: 'Cleanliness is half of faith.',
    narrator: 'Abu Malik al-Ashari',
    grade: 'Sahih',
    book: 'Book of Prayer',
    chapter: 'Cleanliness',
    keywords: ['cleanliness', 'purity', 'faith', 'wudu', 'tahara', 'hygiene', 'purification']
  },
  {
    id: '6',
    collection: 'muslim',
    hadithNumber: '2675',
    arabicText: 'مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ',
    translation: 'Whoever says: There is no god but Allah alone, with no partner, His is the dominion and His is the praise, and He is able to do all things.',
    narrator: 'Abu Huraira',
    grade: 'Sahih',
    book: 'Book of Remembrance',
    chapter: 'Dhikr and Dua',
    keywords: ['dhikr', 'remembrance', 'tawhid', 'allah', 'praise', 'worship', 'dua', 'tahlil']
  },
  {
    id: '7',
    collection: 'bukhari',
    hadithNumber: '13',
    arabicText: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translation: 'None of you truly believes until he loves for his brother what he loves for himself.',
    narrator: 'Anas ibn Malik',
    grade: 'Sahih',
    book: 'Book of Faith',
    chapter: 'Love for Others',
    keywords: ['love', 'brotherhood', 'faith', 'compassion', 'kindness', 'iman', 'akhi']
  },
  {
    id: '8',
    collection: 'muslim',
    hadithNumber: '54',
    arabicText: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    translation: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
    narrator: 'Abu Huraira',
    grade: 'Sahih',
    book: 'Book of Faith',
    chapter: 'Good Speech',
    keywords: ['speech', 'silence', 'good', 'words', 'faith', 'iman', 'akhlaq', 'manners']
  },
  {
    id: '9',
    collection: 'bukhari',
    hadithNumber: '2442',
    arabicText: 'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ',
    translation: 'Whoever relieves a believer of distress in this world, Allah will relieve him of distress on the Day of Resurrection.',
    narrator: 'Abu Huraira',
    grade: 'Sahih',
    book: 'Book of Oppression',
    chapter: 'Helping Others',
    keywords: ['help', 'relief', 'distress', 'kindness', 'charity', 'compassion', 'brotherhood']
  },
  {
    id: '10',
    collection: 'tirmidhi',
    hadithNumber: '2516',
    arabicText: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    translation: 'Seeking knowledge is an obligation upon every Muslim.',
    narrator: 'Anas ibn Malik',
    grade: 'Hasan',
    book: 'Book of Knowledge',
    chapter: 'Excellence of Learning',
    keywords: ['knowledge', 'learning', 'education', 'ilm', 'study', 'wisdom', 'obligation']
  }
];

// Get hadith collections
export const getCollections = async (req: Request, res: Response) => {
  try {
    const collections = Object.entries(HADITH_COLLECTIONS).map(([key, value]) => ({
      id: key,
      ...value
    }));

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hadith collections'
    });
  }
};

// Search hadiths
export const searchHadiths = async (req: Request, res: Response) => {
  try {
    const { q: query, collection, limit = 20 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = query.toLowerCase().trim();
    let results = HADITH_DATABASE;

    // Filter by collection if specified
    if (collection && typeof collection === 'string') {
      results = results.filter(hadith => hadith.collection === collection);
    }

    // Search in multiple fields
    const searchResults = results.filter(hadith => {
      const searchFields = [
        hadith.translation.toLowerCase(),
        hadith.narrator.toLowerCase(),
        hadith.book.toLowerCase(),
        hadith.chapter.toLowerCase(),
        ...hadith.keywords
      ].join(' ');

      // Check if any search term matches
      return searchTerm.split(' ').some(term => 
        searchFields.includes(term.toLowerCase())
      );
    });

    // Sort by relevance (exact matches first)
    const sortedResults = searchResults.sort((a, b) => {
      const aScore = calculateRelevanceScore(a, searchTerm);
      const bScore = calculateRelevanceScore(b, searchTerm);
      return bScore - aScore;
    });

    // Limit results
    const limitedResults = sortedResults.slice(0, parseInt(limit as string));

    // Format results
    const formattedResults = limitedResults.map(hadith => ({
      id: hadith.id,
      collection: HADITH_COLLECTIONS[hadith.collection as keyof typeof HADITH_COLLECTIONS]?.name || hadith.collection,
      book: hadith.book,
      chapter: hadith.chapter,
      hadithNumber: hadith.hadithNumber,
      arabicText: hadith.arabicText,
      translation: hadith.translation,
      narrator: hadith.narrator,
      grade: hadith.grade,
      reference: `${HADITH_COLLECTIONS[hadith.collection as keyof typeof HADITH_COLLECTIONS]?.name || hadith.collection} ${hadith.hadithNumber}`
    }));

    res.json({
      success: true,
      data: formattedResults,
      total: formattedResults.length,
      query: searchTerm
    });

  } catch (error) {
    console.error('Error searching hadiths:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search hadiths'
    });
  }
};

// Get random hadith
export const getRandomHadith = async (req: Request, res: Response) => {
  try {
    const { collection } = req.query;
    
    let availableHadiths = HADITH_DATABASE;
    
    // Filter by collection if specified
    if (collection && typeof collection === 'string') {
      availableHadiths = availableHadiths.filter(hadith => hadith.collection === collection);
    }
    
    if (availableHadiths.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hadiths found for the specified collection'
      });
    }
    
    const randomIndex = Math.floor(Math.random() * availableHadiths.length);
    const randomHadith = availableHadiths[randomIndex];
    
    const formattedHadith = {
      id: randomHadith.id,
      collection: HADITH_COLLECTIONS[randomHadith.collection as keyof typeof HADITH_COLLECTIONS]?.name || randomHadith.collection,
      book: randomHadith.book,
      chapter: randomHadith.chapter,
      hadithNumber: randomHadith.hadithNumber,
      arabicText: randomHadith.arabicText,
      translation: randomHadith.translation,
      narrator: randomHadith.narrator,
      grade: randomHadith.grade,
      reference: `${HADITH_COLLECTIONS[randomHadith.collection as keyof typeof HADITH_COLLECTIONS]?.name || randomHadith.collection} ${randomHadith.hadithNumber}`
    };
    
    res.json({
      success: true,
      data: formattedHadith
    });
    
  } catch (error) {
    console.error('Error fetching random hadith:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch random hadith'
    });
  }
};

// Get hadith by ID
export const getHadithById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const hadith = HADITH_DATABASE.find(h => h.id === id);
    
    if (!hadith) {
      return res.status(404).json({
        success: false,
        message: 'Hadith not found'
      });
    }
    
    const formattedHadith = {
      id: hadith.id,
      collection: HADITH_COLLECTIONS[hadith.collection as keyof typeof HADITH_COLLECTIONS]?.name || hadith.collection,
      book: hadith.book,
      chapter: hadith.chapter,
      hadithNumber: hadith.hadithNumber,
      arabicText: hadith.arabicText,
      translation: hadith.translation,
      narrator: hadith.narrator,
      grade: hadith.grade,
      reference: `${HADITH_COLLECTIONS[hadith.collection as keyof typeof HADITH_COLLECTIONS]?.name || hadith.collection} ${hadith.hadithNumber}`
    };
    
    res.json({
      success: true,
      data: formattedHadith
    });
    
  } catch (error) {
    console.error('Error fetching hadith:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hadith'
    });
  }
};

// Helper function to calculate relevance score
function calculateRelevanceScore(hadith: any, searchTerm: string): number {
  let score = 0;
  const terms = searchTerm.toLowerCase().split(' ');
  
  terms.forEach(term => {
    // Exact matches in translation get highest score
    if (hadith.translation.toLowerCase().includes(term)) {
      score += 10;
    }
    
    // Matches in keywords get high score
    if (hadith.keywords.some((keyword: string) => keyword.toLowerCase().includes(term))) {
      score += 8;
    }
    
    // Matches in narrator get medium score
    if (hadith.narrator.toLowerCase().includes(term)) {
      score += 5;
    }
    
    // Matches in book/chapter get lower score
    if (hadith.book.toLowerCase().includes(term) || hadith.chapter.toLowerCase().includes(term)) {
      score += 3;
    }
  });
  
  return score;
}