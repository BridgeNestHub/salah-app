import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaForward, FaBackward } from 'react-icons/fa';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

interface Translation {
  text: string;
}

interface Reciter {
  id: number;
  name: string;
}

const QuranReader: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [translations, setTranslations] = useState<{ [key: number]: Translation }>({});
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [currentAyah, setCurrentAyah] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const reciters: Reciter[] = [
    { id: 1, name: 'Abdul Basit Abdul Samad' },
    { id: 2, name: 'Mishary Rashid Alafasy' },
    { id: 3, name: 'Saad Al Ghamdi' },
    { id: 4, name: 'Ahmed ibn Ali al-Ajamy' },
    { id: 5, name: 'Hani ar-Rifai' }
  ];

  const reciterMap: { [key: number]: string } = {
    1: 'ar.abdulbasitmurattal',
    2: 'ar.alafasy',
    3: 'ar.saadalghamdi',
    4: 'ar.ahmedajamy',
    5: 'ar.hanirifai'
  };

  useEffect(() => {
    fetchSurahs();
    setSelectedReciter(reciters[0]);
  }, []);

  const fetchSurahs = async () => {
    try {
      const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
      const data = await response.json();
      if (data.code === 200) {
        setSurahs(data.data.surahs);
        setCurrentSurah(data.data.surahs[0]);
        fetchTranslation(1);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Quran data:', error);
      setLoading(false);
    }
  };

  const fetchTranslation = async (surahNumber: number) => {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
      const data = await response.json();
      if (data.code === 200) {
        const translationMap: { [key: number]: Translation } = {};
        data.data.ayahs.forEach((ayah: any) => {
          translationMap[ayah.numberInSurah] = { text: ayah.text };
        });
        setTranslations(translationMap);
      }
    } catch (error) {
      console.error('Error fetching translation:', error);
    }
  };

  const selectSurah = (surah: Surah) => {
    setCurrentSurah(surah);
    fetchTranslation(surah.number);
    setCurrentAyah(1);
    stopAudio();
  };

  const playAyah = async () => {
    if (!currentSurah || !selectedReciter) return;
    
    setAudioLoading(true);
    const reciterCode = reciterMap[selectedReciter.id];
    const paddedSurah = currentSurah.number.toString().padStart(3, '0');
    const paddedAyah = currentAyah.toString().padStart(3, '0');
    
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`;
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
      setAudioLoading(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const nextAyah = () => {
    if (currentSurah && currentAyah < currentSurah.numberOfAyahs) {
      setCurrentAyah(currentAyah + 1);
      if (isPlaying && autoPlay) {
        setTimeout(playAyah, 500);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (autoPlay) {
      nextAyah();
    }
  };

  const previousAyah = () => {
    if (currentAyah > 1) {
      setCurrentAyah(currentAyah - 1);
      if (isPlaying) {
        setTimeout(playAyah, 500);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="quran-reader max-w-4xl mx-auto p-4 pb-24 relative">
      {/* Background Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 pointer-events-none -z-10"></div>
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd}
      />
      
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-200/15 to-green-200/15 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* Glassmorphism Controls Container */}
      <div className="relative backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl shadow-2xl p-6 mb-6 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Select Surah */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">Select Surah</label>
              <div className="relative">
                <select 
                  value={currentSurah?.number || ''} 
                  onChange={(e) => {
                    const surah = surahs.find(s => s.number === parseInt(e.target.value));
                    if (surah) selectSurah(surah);
                  }}
                  className="w-full p-3 backdrop-blur-md bg-white/30 border border-white/40 rounded-xl text-gray-800 font-medium shadow-lg focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:bg-white/40 transition-all duration-300 appearance-none cursor-pointer hover:bg-white/35"
                >
                  {surahs.map(surah => (
                    <option key={surah.number} value={surah.number} className="bg-white text-gray-800">
                      {surah.number}. {surah.englishName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Select Reciter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-3 drop-shadow-sm">Select Reciter</label>
              <div className="relative">
                <select 
                  value={selectedReciter?.id || ''} 
                  onChange={(e) => {
                    const reciter = reciters.find(r => r.id === parseInt(e.target.value));
                    setSelectedReciter(reciter || null);
                  }}
                  className="w-full p-3 backdrop-blur-md bg-white/30 border border-white/40 rounded-xl text-gray-800 font-medium shadow-lg focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 focus:bg-white/40 transition-all duration-300 appearance-none cursor-pointer hover:bg-white/35"
                >
                  {reciters.map(reciter => (
                    <option key={reciter.id} value={reciter.id} className="bg-white text-gray-800">
                      {reciter.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings Section */}
          <div className="mt-6 p-5 backdrop-blur-lg bg-white/15 border border-white/25 rounded-xl shadow-inner">
            <h4 className="font-bold mb-4 text-gray-800 text-lg drop-shadow-sm flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Auto Play Setting */}
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${autoPlay ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-400/30' : 'bg-gray-300/50 backdrop-blur-sm'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${autoPlay ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">Auto Play Next Ayah</span>
                </label>
              </div>
              
              {/* Show Translation Setting */}
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20 hover:bg-white/15 transition-all duration-300">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showTranslation}
                      onChange={(e) => setShowTranslation(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${showTranslation ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-400/30' : 'bg-gray-300/50 backdrop-blur-sm'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${showTranslation ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">Show Translation</span>
                </label>
              </div>
              
              {/* Font Size Setting */}
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20">
                <label className="block text-sm font-semibold text-gray-800 mb-3">Font Size</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="14"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gradient-to-r from-green-200/50 to-green-400/50 rounded-lg appearance-none cursor-pointer backdrop-blur-sm slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${((fontSize - 14) / (24 - 14)) * 100}%, rgba(156, 163, 175, 0.3) ${((fontSize - 14) / (24 - 14)) * 100}%, rgba(156, 163, 175, 0.3) 100%)`
                    }}
                  />
                  <span className="text-sm font-bold text-gray-800 min-w-[40px] px-2 py-1 bg-white/30 rounded-md backdrop-blur-sm border border-white/30">{fontSize}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentSurah && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {currentSurah.englishName} ({currentSurah.name})
            </h2>
            <p className="text-gray-600 text-sm">{currentSurah.englishNameTranslation}</p>
            <p className="text-xs text-gray-500 mt-1">
              {currentSurah.numberOfAyahs} Ayahs • {currentSurah.revelationType}
            </p>
          </div>

          {currentSurah.number !== 1 && currentSurah.number !== 9 && (
            <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xl arabic-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              <p className="text-gray-600 text-sm italic mt-1">In the name of Allah, the Entirely Merciful, the Especially Merciful.</p>
            </div>
          )}

          <div className="space-y-2">
            {currentSurah.ayahs.map((ayah) => (
              <div 
                key={ayah.numberInSurah}
                id={`ayah-${ayah.numberInSurah}`}
                className={`p-3 rounded border transition-all ${
                  currentAyah === ayah.numberInSurah 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                    {ayah.numberInSurah}
                  </span>
                  <div className="flex-1">
                    <div 
                      className="arabic-text text-right leading-relaxed mb-2"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {ayah.text}
                    </div>
                    {showTranslation && translations[ayah.numberInSurah] && (
                      <div className="text-gray-700 text-sm leading-relaxed">
                        {translations[ayah.numberInSurah].text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Audio Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={previousAyah}
            disabled={currentAyah <= 1}
            className="p-3 text-gray-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaBackward size={20} />
          </button>
          
          <button
            onClick={isPlaying ? pauseAudio : playAyah}
            disabled={audioLoading}
            className="p-4 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {audioLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isPlaying ? (
              <FaPause size={20} />
            ) : (
              <FaPlay size={20} />
            )}
          </button>
          
          <button
            onClick={stopAudio}
            className="p-3 text-gray-600 hover:text-red-600"
          >
            <FaStop size={20} />
          </button>
          
          <button
            onClick={nextAyah}
            disabled={!currentSurah || currentAyah >= currentSurah.numberOfAyahs}
            className="p-3 text-gray-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaForward size={20} />
          </button>
          
          {currentSurah && (
            <div className="ml-4 text-sm text-gray-600">
              Ayah {currentAyah} of {currentSurah.numberOfAyahs}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuranReader;