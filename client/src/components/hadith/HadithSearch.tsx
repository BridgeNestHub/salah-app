import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaSpinner, FaLightbulb } from 'react-icons/fa';
import { searchHadiths, getSearchSuggestions } from '../../services/enhancedHadithApi';

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

interface HadithSearchProps {
  onResultClick: (hadith: Hadith) => void;
  isMobile?: boolean;
}

const HadithSearch: React.FC<HadithSearchProps> = ({ onResultClick, isMobile = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions] = useState(getSearchSuggestions());
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length >= 3) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const searchResults = await searchHadiths(searchTerm.trim());
      setResults(searchResults);
      setShowResults(true);
      setShowSuggestions(false);
      
      if (searchResults.length === 0) {
        setError('No hadiths found. Try different keywords like "prayer", "charity", or "kindness".');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please check your connection and try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (!searchTerm.trim()) {
      setShowSuggestions(true);
    } else if (results.length > 0) {
      setShowResults(true);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
    setShowSuggestions(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleResultClick = (hadith: Hadith) => {
    onResultClick(hadith);
    setShowResults(false);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className={`relative ${isMobile ? 'w-full' : ''}`}>
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={isMobile ? "Search hadiths..." : "Search by topic, narrator, or keywords..."}
            className={`w-full ${isMobile ? 'p-3 text-base' : 'p-3'} border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10`}
            onKeyPress={(e) => e.key === 'Enter' && performSearch()}
          />
          
          {/* Clear button */}
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
          onClick={performSearch}
          disabled={isSearching || !searchTerm.trim()}
          className={`${isMobile ? 'px-4 py-3' : 'px-6 py-3'} bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          {!isMobile && (isSearching ? 'Searching...' : 'Search')}
        </button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-64 overflow-y-auto">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <FaLightbulb className="text-yellow-500" />
              Popular Topics
            </div>
          </div>
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm capitalize transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          {error ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-red-500 mb-2">⚠️</div>
              <div className="text-sm">{error}</div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-3 border-b bg-gray-50">
                <div className="text-sm font-medium text-gray-600">
                  Found {results.length} hadith{results.length !== 1 ? 's' : ''}
                </div>
              </div>
              {results.map((hadith, index) => (
                <div
                  key={`${hadith.collection}-${hadith.id}-${index}`}
                  onClick={() => handleResultClick(hadith)}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="text-sm font-medium text-green-600 mb-1">
                    {hadith.collection} - {hadith.reference}
                  </div>
                  <div className="text-gray-700 text-sm mb-1 line-clamp-2">
                    {hadith.translation.substring(0, isMobile ? 80 : 120)}...
                  </div>
                  {hadith.narrator && (
                    <div className="text-xs text-gray-500">
                      Narrator: {hadith.narrator}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <FaSpinner className="animate-spin mx-auto mb-2" />
              <div className="text-sm">Searching hadiths...</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HadithSearch;