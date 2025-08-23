import React, { useState } from 'react';
import { fetchFromSunnah, fetchFromHadithAPI, fetchFromAltAPI } from '../../services/hadithApi';

interface HadithApiSelectorProps {
  onHadithLoad: (hadith: any) => void;
}

const HadithApiSelector: React.FC<HadithApiSelectorProps> = ({ onHadithLoad }) => {
  const [selectedApi, setSelectedApi] = useState<'sunnah' | 'hadithapi' | 'islamcompanion'>('hadithapi');
  const [collection, setCollection] = useState('bukhari');
  const [hadithNumber, setHadithNumber] = useState('1');
  const [loading, setLoading] = useState(false);

  const loadHadith = async () => {
    setLoading(true);
    try {
      let hadith;
      switch (selectedApi) {
        case 'sunnah':
          hadith = await fetchFromSunnah(collection, hadithNumber);
          break;
        case 'hadithapi':
          hadith = await fetchFromHadithAPI(collection, hadithNumber);
          break;
        case 'islamcompanion':
          hadith = await fetchFromAltAPI(collection, hadithNumber);
          break;
      }
      onHadithLoad(hadith);
    } catch (error) {
      console.error('Failed to load hadith:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="font-semibold mb-3">API Source</h3>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => setSelectedApi('sunnah')}
          className={`p-2 text-sm rounded ${selectedApi === 'sunnah' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
        >
          Sunnah.com
        </button>
        <button
          onClick={() => setSelectedApi('hadithapi')}
          className={`p-2 text-sm rounded ${selectedApi === 'hadithapi' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
        >
          Hadith API
        </button>
        <button
          onClick={() => setSelectedApi('islamcompanion')}
          className={`p-2 text-sm rounded ${selectedApi === 'islamcompanion' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
        >
          Islam Companion
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          className="flex-1 p-2 border rounded"
        >
          <option value="bukhari">Sahih Bukhari</option>
          <option value="muslim">Sahih Muslim</option>
          <option value="abudawud">Abu Dawud</option>
          <option value="tirmidhi">Tirmidhi</option>
        </select>
        
        <input
          type="number"
          value={hadithNumber}
          onChange={(e) => setHadithNumber(e.target.value)}
          placeholder="Hadith #"
          className="w-20 p-2 border rounded"
          min="1"
        />
      </div>

      <button
        onClick={loadHadith}
        disabled={loading}
        className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Hadith'}
      </button>
    </div>
  );
};

export default HadithApiSelector;