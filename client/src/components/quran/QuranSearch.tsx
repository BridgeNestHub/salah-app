import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchResult {
  surah: {
    number: number;
    englishName: string;
    name: string;
  };
  numberInSurah: number;
  text: string;
}

interface QuranSearchProps {
  onResultClick: (surahNumber: number, ayahNumber: number) => void;
}

const QuranSearch: React.FC<QuranSearchProps> = ({ onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchQuran = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerm)}/all/en`);
      const data = await response.json();
      if (data.code === 200) {
        setSearchResults(data.data.matches);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching Quran:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result.surah.number, result.numberInSurah);
    setShowResults(false);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search in Quran (English translation)..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onKeyPress={(e) => e.key === 'Enter' && searchQuran()}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <button
          onClick={searchQuran}
          disabled={isSearching || !searchTerm.trim()}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FaSearch />
          )}
          Search
        </button>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-semibold text-gray-800">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </h4>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-green-600">
                        Surah {result.surah.englishName} ({result.surah.number}:{result.numberInSurah})
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.surah.name}
                      </div>
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {result.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <FaSearch className="mx-auto text-2xl mb-2 opacity-50" />
              <p>No results found for "{searchTerm}"</p>
              <p className="text-xs mt-1">Try different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default QuranSearch;