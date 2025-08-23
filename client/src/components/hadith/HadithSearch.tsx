import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchResult {
  id: string;
  collection: string;
  hadithNumber: string;
  text: string;
  narrator: string;
  reference: string;
}

interface HadithSearchProps {
  onResultClick: (hadithId: string) => void;
}

const HadithSearch: React.FC<HadithSearchProps> = ({ onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchHadiths = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Replace with actual API call
      const mockResults: SearchResult[] = [
        {
          id: '1',
          collection: 'Sahih Bukhari',
          hadithNumber: '1',
          text: 'Actions are but by intention...',
          narrator: 'Umar ibn al-Khattab',
          reference: 'Bukhari 1:1'
        }
      ];
      setResults(mockResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search hadiths..."
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          onKeyPress={(e) => e.key === 'Enter' && searchHadiths()}
        />
        <button
          onClick={searchHadiths}
          disabled={isSearching}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <FaSearch />
        </button>
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => onResultClick(result.id)}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
            >
              <div className="text-sm font-medium text-green-600 mb-1">
                {result.collection} - {result.reference}
              </div>
              <div className="text-gray-700 text-sm">
                {result.text.substring(0, 100)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HadithSearch;