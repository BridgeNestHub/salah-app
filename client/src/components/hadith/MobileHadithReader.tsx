import React, { useState, useEffect } from 'react';
import { FaSearch, FaRandom, FaBookmark, FaShare, FaVolumeUp, FaCog } from 'react-icons/fa';
import { searchHadiths, getRandomHadith, getSearchSuggestions } from '../../services/enhancedHadithApi';
import HadithSearch from './HadithSearch';

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

const MobileHadithReader: React.FC = () => {
  const [currentHadith, setCurrentHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    loadRandomHadith();
    loadSettings();
  }, []);

  const loadRandomHadith = async () => {
    setLoading(true);
    try {
      const hadith = await getRandomHadith();
      setCurrentHadith(hadith);
    } catch (error) {
      console.error('Failed to load hadith:', error);
      setCurrentHadith({
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
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedBookmarks = localStorage.getItem('hadith-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    
    const savedFontSize = localStorage.getItem('hadith-font-size');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    
    const savedShowArabic = localStorage.getItem('hadith-show-arabic');
    if (savedShowArabic !== null) {
      setShowArabic(JSON.parse(savedShowArabic));
    }
    
    const savedShowTranslation = localStorage.getItem('hadith-show-translation');
    if (savedShowTranslation !== null) {
      setShowTranslation(JSON.parse(savedShowTranslation));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('hadith-bookmarks', JSON.stringify(bookmarks));
    localStorage.setItem('hadith-font-size', fontSize.toString());
    localStorage.setItem('hadith-show-arabic', JSON.stringify(showArabic));
    localStorage.setItem('hadith-show-translation', JSON.stringify(showTranslation));
  };

  useEffect(() => {
    saveSettings();
  }, [bookmarks, fontSize, showArabic, showTranslation]);

  const toggleBookmark = (hadithId: string) => {
    const newBookmarks = bookmarks.includes(hadithId)
      ? bookmarks.filter(id => id !== hadithId)
      : [...bookmarks, hadithId];
    setBookmarks(newBookmarks);
  };

  const shareHadith = async () => {
    if (!currentHadith) return;
    
    const shareText = `${currentHadith.translation}\n\n— ${currentHadith.narrator}\n${currentHadith.reference}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hadith - ${currentHadith.collection}`,
          text: shareText
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Hadith copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleSearchResult = (hadith: Hadith) => {
    setCurrentHadith(hadith);
    setShowSearch(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hadith...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-800">Hadith Reader</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-full ${showSearch ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaSearch size={18} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full ${showSettings ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaCog size={18} />
            </button>
          </div>
        </div>
        
        {showSearch && (
          <div className="p-4 border-t bg-gray-50">
            <HadithSearch onResultClick={handleSearchResult} isMobile={true} />
          </div>
        )}
        
        {showSettings && (
          <div className="p-4 border-t bg-gray-50 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showArabic}
                  onChange={(e) => setShowArabic(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Arabic</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Translation</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {currentHadith && (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-green-600 mb-1">
                {currentHadith.collection}
              </h2>
              <p className="text-sm text-gray-600">
                {currentHadith.book} - Hadith {currentHadith.hadithNumber}
              </p>
              {currentHadith.chapter && (
                <p className="text-xs text-gray-500 mt-1">
                  {currentHadith.chapter}
                </p>
              )}
            </div>
          </div>

          {showArabic && currentHadith.arabicText && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div 
                className="text-right leading-loose"
                style={{ 
                  fontSize: `${fontSize + 2}px`,
                  fontFamily: 'Arabic, serif',
                  lineHeight: '2'
                }}
              >
                {currentHadith.arabicText}
              </div>
            </div>
          )}

          {showTranslation && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div 
                className="text-gray-800 leading-relaxed"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
              >
                "{currentHadith.translation}"
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="space-y-2">
              {currentHadith.narrator && (
                <div>
                  <span className="text-sm font-medium text-green-600">Narrator: </span>
                  <span className="text-sm text-gray-700">{currentHadith.narrator}</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-green-600">Grade: </span>
                <span className="text-sm text-gray-700">{currentHadith.grade}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-green-600">Reference: </span>
                <span className="text-sm text-gray-700">{currentHadith.reference}</span>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default MobileHadithReader;