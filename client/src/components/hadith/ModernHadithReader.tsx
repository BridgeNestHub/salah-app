import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaForward, FaBackward, FaRandom, FaBookmark, FaSearch, FaCog } from 'react-icons/fa';
import { fetchFromSunnah, fetchFromHadithAPI, fetchFromAltAPI, fetchHadithWithFallback } from '../../services/hadithApi';
import { searchHadiths, getRandomHadith, getHadithCollections } from '../../services/enhancedHadithApi';
import { fetchHadithProxy } from '../../services/proxyApi';

const translateText = async (text: string): Promise<string> => {
  if (!text || isEnglish(text)) return text;
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    return data[0]?.[0]?.[0] || text;
  } catch {
    return text;
  }
};

const isEnglish = (text: string): boolean => {
  const indonesianWords = ['telah', 'menceritakan', 'kepada', 'kami', 'dari', 'bahwa', 'berkata'];
  return !indonesianWords.some(word => text.toLowerCase().includes(word));
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

interface Collection {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  totalHadiths: number;
}

interface Book {
  id: string;
  name: string;
  arabicName: string;
  collectionId: string;
  totalHadiths: number;
}

const ModernHadithReader: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [currentHadith, setCurrentHadith] = useState<Hadith | null>(null);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentHadithIndex, setCurrentHadithIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showArabic, setShowArabic] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [showControls, setShowControls] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Sample data - replace with actual API calls
  const sampleCollections: Collection[] = [
    {
      id: 'bukhari',
      name: 'Sahih Bukhari',
      arabicName: 'صحيح البخاري',
      description: 'The most authentic collection of Hadith compiled by Imam Bukhari',
      totalHadiths: 7563
    },
    {
      id: 'muslim',
      name: 'Sahih Muslim',
      arabicName: 'صحيح مسلم',
      description: 'The second most authentic collection compiled by Imam Muslim',
      totalHadiths: 7190
    },
    {
      id: 'abudawud',
      name: 'Sunan Abu Dawud',
      arabicName: 'سنن أبي داود',
      description: 'Collection focusing on legal matters compiled by Abu Dawud',
      totalHadiths: 5274
    },
    {
      id: 'tirmidhi',
      name: 'Jami at-Tirmidhi',
      arabicName: 'جامع الترمذي',
      description: 'Collection with detailed commentary by At-Tirmidhi',
      totalHadiths: 3956
    }
  ];

  const sampleBooks: Book[] = [
    { id: 'faith', name: 'Book of Faith', arabicName: 'كتاب الإيمان', collectionId: 'bukhari', totalHadiths: 100 },
    { id: 'prayer', name: 'Book of Prayer', arabicName: 'كتاب الصلاة', collectionId: 'bukhari', totalHadiths: 150 },
    { id: 'faith', name: 'Book of Faith', arabicName: 'كتاب الإيمان', collectionId: 'muslim', totalHadiths: 90 },
    { id: 'prayer', name: 'Book of Prayer', arabicName: 'كتاب الصلاة', collectionId: 'muslim', totalHadiths: 140 },
    { id: 'purification', name: 'Book of Purification', arabicName: 'كتاب الطهارة', collectionId: 'abudawud', totalHadiths: 70 },
    { id: 'prayer', name: 'Book of Prayer', arabicName: 'كتاب الصلاة', collectionId: 'abudawud', totalHadiths: 120 },
    { id: 'faith', name: 'Book of Faith', arabicName: 'كتاب الإيمان', collectionId: 'tirmidhi', totalHadiths: 85 },
    { id: 'worship', name: 'Book of Worship', arabicName: 'كتاب العبادة', collectionId: 'tirmidhi', totalHadiths: 110 }
  ];

  const sampleHadiths: Hadith[] = [
    {
      id: '1',
      collection: 'Sahih Bukhari',
      book: 'Book of Faith',
      chapter: 'How the Divine Inspiration was revealed',
      hadithNumber: '1',
      arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
      translation: 'Actions are but by intention and every man shall have only that which he intended. Thus he whose migration was for Allah and His messenger, his migration was for Allah and His messenger, and he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that for which he migrated.',
      narrator: 'Umar ibn al-Khattab',
      grade: 'Sahih (Authentic)',
      reference: 'Bukhari 1:1'
    },
    {
      id: '2',
      collection: 'Sahih Bukhari',
      book: 'Book of Faith',
      chapter: 'The Statement of the Prophet',
      hadithNumber: '8',
      arabicText: 'أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ وَيُقِيمُوا الصَّلاَةَ وَيُؤْتُوا الزَّكَاةَ فَإِذَا فَعَلُوا ذَلِكَ عَصَمُوا مِنِّي دِمَاءَهُمْ وَأَمْوَالَهُمْ إِلاَّ بِحَقِّ الإِسْلاَمِ وَحِسَابُهُمْ عَلَى اللَّهِ',
      translation: 'I have been ordered to fight the people till they say: None has the right to be worshipped but Allah, and whoever said it then he will save his life and property from me except on breaking the law (rights and conditions of Islam), and his accounts will be with Allah.',
      narrator: 'Ibn Umar',
      grade: 'Sahih (Authentic)',
      reference: 'Bukhari 1:8'
    }
  ];

  useEffect(() => {
    initializeData();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('hadith-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    const savedFontSize = localStorage.getItem('hadith-font-size');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    
    const savedPlaybackSpeed = localStorage.getItem('hadith-playback-speed');
    if (savedPlaybackSpeed) {
      setPlaybackSpeed(parseFloat(savedPlaybackSpeed));
    }
  }, []);

  const initializeData = async () => {
    setLoading(true);
    setCollections(sampleCollections);
    const initialBooks = [{ id: 'revelation', name: 'Revelation', arabicName: 'كتاب بدء الوحي', collectionId: 'bukhari', totalHadiths: 7 }];
    setBooks(initialBooks);
    setCurrentCollection(sampleCollections[0]);
    setCurrentBook(initialBooks[0]);
    setCurrentHadith(sampleHadiths[0]);
    setCurrentHadithIndex(0);
    setLoading(false);
  };

  const selectCollection = async (collection: Collection) => {
    setCurrentCollection(collection);
    
    const booksByCollection = {
      bukhari: [{ id: 'revelation', name: 'Revelation', arabicName: 'كتاب بدء الوحي', collectionId: 'bukhari', totalHadiths: 7 }],
      muslim: [{ id: 'faith', name: 'The Book of Faith', arabicName: 'كتاب الإيمان', collectionId: 'muslim', totalHadiths: 382 }],
      abudawud: [{ id: 'purification', name: 'Purification', arabicName: 'كتاب الطهارة', collectionId: 'abudawud', totalHadiths: 390 }],
      tirmidhi: [{ id: 'purification', name: 'Purification', arabicName: 'كتاب الطهارة', collectionId: 'tirmidhi', totalHadiths: 138 }]
    };
    
    const collectionBooks = booksByCollection[collection.id as keyof typeof booksByCollection] || [];
    setBooks(collectionBooks);
    if (collectionBooks.length > 0) {
      setCurrentBook(collectionBooks[0]);
    }
    
    try {
      const hadith = await fetchHadithProxy(collection.id, '1');
      setCurrentHadith(hadith);
      setCurrentHadithIndex(0);
    } catch (error) {
      console.error('Failed to load hadith:', error);
      setCurrentHadith({
        ...sampleHadiths[0],
        collection: collection.name
      });
      setCurrentHadithIndex(0);
    }
  };

  const selectBook = async (book: Book) => {
    setCurrentBook(book);
    setCurrentHadithIndex(0);
    
    // Load first hadith from the selected book
    try {
      const hadith = await fetchFromHadithAPI(currentCollection?.id || 'bukhari', '1');
      setCurrentHadith(hadith);
    } catch (error) {
      console.error('Failed to load hadith:', error);
    }
  };

  const nextHadith = () => {
    if (currentHadithIndex < sampleHadiths.length - 1) {
      const nextIndex = currentHadithIndex + 1;
      setCurrentHadith(sampleHadiths[nextIndex]);
      setCurrentHadithIndex(nextIndex);
    }
  };

  const previousHadith = async () => {
    if (currentHadithIndex > 0) {
      const prevIndex = currentHadithIndex - 1;
      try {
        const hadith = await fetchFromHadithAPI(currentCollection?.id || 'bukhari', (prevIndex + 1).toString());
        setCurrentHadith(hadith);
        setCurrentHadithIndex(prevIndex);
      } catch (error) {
        console.error('Failed to load previous hadith:', error);
      }
    }
  };

  const loadRandomHadith = async () => {
    try {
      const hadith = await getRandomHadith();
      setCurrentHadith(hadith);
      setCurrentHadithIndex(Math.floor(Math.random() * 100));
    } catch (error) {
      console.error('Failed to load random hadith:', error);
      // Fallback to a default hadith
      setCurrentHadith(sampleHadiths[Math.floor(Math.random() * sampleHadiths.length)]);
    }
  };

  const toggleBookmark = (hadithId: string) => {
    const newBookmarks = bookmarks.includes(hadithId)
      ? bookmarks.filter(id => id !== hadithId)
      : [...bookmarks, hadithId];
    
    setBookmarks(newBookmarks);
    localStorage.setItem('hadith-bookmarks', JSON.stringify(newBookmarks));
  };

  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchHadiths(searchTerm.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const playHadithAudio = async () => {
    if (!currentHadith) return;
    
    setAudioLoading(true);
    // Simulate audio loading - in real implementation, use TTS or pre-recorded audio
    setTimeout(() => {
      setIsPlaying(true);
      setAudioLoading(false);
      // Simulate audio duration
      setTimeout(() => {
        setIsPlaying(false);
      }, 5000);
    }, 1000);
  };

  const stopAudio = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #059669',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', paddingBottom: '6rem', position: 'relative' }}>
      {/* Controls Panel */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Collection Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Select Collection
            </label>
            <select
              value={currentCollection?.id || ''}
              onChange={(e) => {
                const collection = collections.find(c => c.id === e.target.value);
                if (collection) selectCollection(collection);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                background: 'white',
                fontSize: '0.875rem'
              }}
            >
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          {/* Book Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Select Book
            </label>
            <select
              value={currentBook?.id || ''}
              onChange={(e) => {
                const book = books.find(b => b.id === e.target.value);
                if (book) selectBook(book);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                background: 'white',
                fontSize: '0.875rem'
              }}
            >
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Settings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          {/* Show Arabic Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showArabic}
              onChange={(e) => setShowArabic(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Show Arabic Text</span>
          </label>

          {/* Show Translation Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={(e) => setShowTranslation(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Show Translation</span>
          </label>

          {/* Font Size */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="28"
              value={fontSize}
              onChange={(e) => {
                const size = parseInt(e.target.value);
                setFontSize(size);
                localStorage.setItem('hadith-font-size', size.toString());
              }}
              style={{ 
                width: '100%',
                WebkitAppearance: 'none',
                appearance: 'none',
                height: '0.5rem',
                borderRadius: '0.25rem',
                outline: 'none',
                cursor: 'pointer',
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((fontSize - 14) / (28 - 14)) * 100}%, rgba(156, 163, 175, 0.3) ${((fontSize - 14) / (28 - 14)) * 100}%, rgba(156, 163, 175, 0.3) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#374151' }}>Search Hadiths</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hadiths by topic, narrator, or keywords..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
            onKeyPress={(e) => e.key === 'Enter' && performSearch()}
          />
          <button
            onClick={performSearch}
            disabled={isSearching || !searchTerm.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: isSearching || !searchTerm.trim() ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isSearching || !searchTerm.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isSearching ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Searching...
              </>
            ) : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{ 
              padding: '0.5rem 0.75rem', 
              background: '#f3f4f6', 
              borderRadius: '0.5rem 0.5rem 0 0',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Found {searchResults.length} hadith{searchResults.length !== 1 ? 's' : ''}
            </div>
            {searchResults.map((hadith, index) => (
              <div
                key={`${hadith.collection}-${hadith.id}-${index}`}
                onClick={() => {
                  setCurrentHadith(hadith);
                  setSearchResults([]);
                  setSearchTerm('');
                }}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.borderColor = '#bbf7d0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669', marginBottom: '0.25rem' }}>
                  {hadith.collection} - {hadith.reference}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                  {hadith.translation.substring(0, 150)}...
                </div>
                {hadith.narrator && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Narrator: {hadith.narrator}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : searchTerm && !isSearching ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <div>No hadiths found for "{searchTerm}"</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
              Try keywords like: prayer, charity, kindness, patience, forgiveness
            </div>
          </div>
        ) : null}
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search hadiths by text or narrator..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            />
            <button
              onClick={performSearch}
              disabled={isSearching}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map((hadith, index) => (
                <div
                  key={hadith.id}
                  onClick={() => {
                    setCurrentHadith(hadith);
                    setShowSearch(false);
                  }}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    background: '#f9fafb'
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669', marginBottom: '0.25rem' }}>
                    {hadith.collection} - {hadith.reference}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {hadith.translation.substring(0, 150)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hadith Display */}
      {currentHadith && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          padding: '2rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            background: 'linear-gradient(135deg, #e0f2fe, #b3e5fc)',
            color: '#374151',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {currentHadith.collection}
            </h2>
            <p style={{ fontSize: '1.125rem', opacity: 0.9, fontWeight: '500' }}>
              {currentHadith.book} - Hadith {currentHadith.hadithNumber}
            </p>
            <p style={{ fontSize: '1rem', opacity: 0.9, marginTop: '0.25rem', fontWeight: '500' }}>
              {currentHadith.chapter}
            </p>
          </div>

          {/* Arabic Text */}
          {showArabic && (
            <div style={{
              textAlign: 'right',
              fontSize: `${fontSize + 4}px`,
              lineHeight: '2',
              padding: '1.5rem',
              background: '#f9fafb',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              marginBottom: '1.5rem',
              fontFamily: 'Arabic, serif'
            }}>
              {currentHadith.arabicText}
            </div>
          )}

          {/* Translation */}
          {showTranslation && (
            <div style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.8',
              color: '#374151',
              padding: '1.5rem',
              background: '#f0fdf4',
              borderRadius: '0.5rem',
              border: '1px solid #bbf7d0',
              marginBottom: '1.5rem'
            }}>
              "{currentHadith.translation}"
            </div>
          )}

          {/* Hadith Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div>
              <strong style={{ color: '#059669' }}>Narrator:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#374151' }}>{currentHadith.narrator}</p>
            </div>
            <div>
              <strong style={{ color: '#059669' }}>Grade:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#374151' }}>{currentHadith.grade}</p>
            </div>
            <div>
              <strong style={{ color: '#059669' }}>Reference:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#374151' }}>{currentHadith.reference}</p>
            </div>
          </div>
        </div>
      )}





      <audio ref={audioRef} />
      
      {/* Add CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ModernHadithReader;