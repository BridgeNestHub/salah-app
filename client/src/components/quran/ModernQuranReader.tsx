import React, { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaSquare, FaForward, FaBackward, FaStepBackward, FaStepForward, FaExclamationTriangle } from 'react-icons/fa';
import './ModernQuranReader.css';
import { getAudioSources, getBismillahSources, getWorkingAudioUrl } from '../../utils/audioUtils';

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

const ModernQuranReader: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [translations, setTranslations] = useState<{ [key: number]: Translation }>({});
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(() => {
    try {
      const saved = localStorage.getItem('quran-selected-reciter');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentAyah, setCurrentAyah] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [autoPlay, setAutoPlay] = useState(() => {
    try {
      const saved = localStorage.getItem('quran-autoplay');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [showTranslation, setShowTranslation] = useState(() => {
    try {
      const saved = localStorage.getItem('quran-show-translation');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [verseByVerse, setVerseByVerse] = useState(() => {
    try {
      const saved = localStorage.getItem('quran-verse-by-verse');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('quran-font-size');
      return saved !== null ? parseInt(saved) : 18;
    } catch {
      return 18;
    }
  });
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    try {
      const saved = localStorage.getItem('quran-playback-speed');
      return saved ? parseFloat(saved) : 1;
    } catch {
      return 1;
    }
  });
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const surahContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!surahContentRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowControls(entry.isIntersecting);
      },
      { threshold: 0.01, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(surahContentRef.current);

    return () => observer.disconnect();
  }, [currentSurah]);
  
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const nextAudioRef = React.useRef<HTMLAudioElement>(null);

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
    if (!selectedReciter) {
      const defaultReciter = reciters[0];
      setSelectedReciter(defaultReciter);
      localStorage.setItem('quran-selected-reciter', JSON.stringify(defaultReciter));
    }
  }, [selectedReciter]);

  const fetchSurahs = async () => {
    try {
      const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
      const data = await response.json();
      if (data.code === 200) {
        setSurahs(data.data.surahs);
        const savedSurahNumber = localStorage.getItem('quran-current-surah');
        const surahNumber = savedSurahNumber ? parseInt(savedSurahNumber) : 1;
        const surah = data.data.surahs.find((s: Surah) => s.number === surahNumber) || data.data.surahs[0];
        setCurrentSurah(surah);
        fetchTranslation(surah.number);
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
    localStorage.setItem('quran-current-surah', surah.number.toString());
    stopAudio();
  };



  const preloadNextAudio = (ayahNumber: number) => {
    const totalAyahs = currentSurah?.ayahs?.length || currentSurah?.numberOfAyahs;
    if (currentSurah && selectedReciter && totalAyahs && ayahNumber < totalAyahs && nextAudioRef.current) {
      try {
        const nextAudioSources = getAudioSources(currentSurah.number, ayahNumber + 1, selectedReciter.id);
        nextAudioRef.current.src = nextAudioSources.primary;
        nextAudioRef.current.playbackRate = playbackSpeed;
        nextAudioRef.current.load();
        
        // Force preload to complete
        nextAudioRef.current.addEventListener('canplaythrough', () => {
          // Audio is ready for seamless playback
        }, { once: true });
      } catch {
        // Silently fail preloading
      }
    }
  };

  const playAyahImmediate = async (ayahNumber = currentAyah) => {
    if (!currentSurah || !selectedReciter) {
      setAudioError('Missing surah or reciter selection');
      return;
    }
    
    setAudioError(null);
    setAudioLoading(true);
    
    if (audioRef.current) {
      // Stop any current playback first
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      const audioSources = getAudioSources(currentSurah.number, ayahNumber, selectedReciter.id);
      
      // Set source and optimize settings immediately
      audioRef.current.src = audioSources.primary;
      audioRef.current.preload = 'auto';
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = 1.0;
      
      // Force immediate load
      audioRef.current.load();
      
      // Start preloading next audio immediately
      preloadNextAudio(ayahNumber);
      
      // Wait for audio to be ready and play immediately
      const playAudio = () => {
        audioRef.current!.play().then(() => {
          setIsPlaying(true);
          setAudioLoading(false);
        }).catch(() => {
          // Try fallback source
          audioRef.current!.src = audioSources.fallback;
          audioRef.current!.load();
          audioRef.current!.playbackRate = playbackSpeed;
          audioRef.current!.play().then(() => {
            setIsPlaying(true);
            setAudioLoading(false);
          }).catch(() => {
            setAudioError('Audio not available for this ayah');
            setIsPlaying(false);
            setAudioLoading(false);
          });
        });
      };
      
      // Try to play as soon as possible
      if (audioRef.current.readyState >= 2) {
        playAudio();
      } else {
        audioRef.current.addEventListener('canplay', playAudio, { once: true });
        // Fallback timeout
        setTimeout(() => {
          if (audioLoading) playAudio();
        }, 1000);
      }
    }
  };

  const playBismillah = async (surahNumber: number) => {
    if (!selectedReciter) {
      setAudioError('No reciter selected for Bismillah');
      return;
    }
    
    setAudioError(null);
    setAudioLoading(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      const bismillahSources = getBismillahSources(selectedReciter.id);
      
      // Set current ayah to 0 to indicate Bismillah is playing
      setCurrentAyah(0);
      
      const originalOnEnded = audioRef.current.onended;
      audioRef.current.onended = () => {
        audioRef.current!.onended = originalOnEnded;
        // After Bismillah, start from ayah 1
        if (autoPlay) {
          setCurrentAyah(1);
          scrollToAyah(1);
          playAyahImmediate(1);
        } else {
          setCurrentAyah(1);
          scrollToAyah(1);
          setIsPlaying(false);
        }
      };
      
      // Try primary source first
      audioRef.current.src = bismillahSources.primary;
      audioRef.current.load();
      audioRef.current.playbackRate = playbackSpeed;
      
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      } catch (error) {
        // Skip to ayah 1 if Bismillah unavailable
        if (autoPlay) {
          setCurrentAyah(1);
          scrollToAyah(1);
          playAyahImmediate(1);
        } else {
          setCurrentAyah(1);
          scrollToAyah(1);
          setIsPlaying(false);
        }
      }
      
      setAudioLoading(false);
    }
  };

  const playAyah = async () => {
    setAudioLoading(true);
    
    // Check if we should start with Bismillah (only for surahs other than Al-Fatiha and At-Tawbah, and only when starting from ayah 1)
    if (currentAyah === 1 && currentSurah && currentSurah.number !== 1 && currentSurah.number !== 9) {
      await playBismillah(currentSurah.number);
    } else {
      scrollToAyah(currentAyah);
      await playAyahImmediate();
    }
    setAudioLoading(false);
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

  const scrollToAyah = (ayahNumber: number) => {
    const element = document.getElementById(`modern-ayah-${ayahNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const cleanAyahText = (text: string, surahNumber: number, ayahNumber: number) => {
    if (surahNumber === 9) {
      return text;
    }
    
    // For Al-Fatiha, hide verse 1 (which is Bismillah) since we show it separately
    if (surahNumber === 1 && ayahNumber === 1) {
      return '';
    }
    
    if (ayahNumber === 1 && text.includes('بِسْمِ')) {
      // Only remove if text starts with Bismillah
      if (text.startsWith('بِسْمِ')) {
        // Split by spaces and remove first 4 words (Bismillah)
        const words = text.split(' ');
        if (words.length > 4) {
          return words.slice(4).join(' ').trim();
        }
      }
    }
    
    return text;
  };

  const nextAyah = useCallback(() => {
    const totalAyahs = currentSurah?.ayahs?.length || currentSurah?.numberOfAyahs;
    if (currentSurah && totalAyahs && currentAyah < totalAyahs) {
      const newAyah = currentAyah + 1;
      setCurrentAyah(newAyah);
      scrollToAyah(newAyah);
      // Preload immediately for faster playback
      if (selectedReciter && audioRef.current) {
        const audioSources = getAudioSources(currentSurah.number, newAyah, selectedReciter.id);
        audioRef.current.src = audioSources.primary;
        audioRef.current.preload = 'auto';
        audioRef.current.load();
      }
      if (isPlaying) {
        playAyahImmediate(newAyah);
      }
    }
  }, [currentSurah, currentAyah, isPlaying, selectedReciter]);

  const handleAudioEnd = useCallback(() => {
    const totalAyahs = currentSurah?.ayahs?.length || currentSurah?.numberOfAyahs;
    if (autoPlay && currentSurah && totalAyahs) {
      if (currentAyah < totalAyahs) {
        const newAyah = currentAyah + 1;
        setCurrentAyah(newAyah);
        scrollToAyah(newAyah);
        
        if (nextAudioRef.current && nextAudioRef.current.src && nextAudioRef.current.readyState >= 3) {
          // Seamless transition using preloaded audio
          audioRef.current!.pause();
          audioRef.current!.src = nextAudioRef.current.src;
          audioRef.current!.currentTime = 0;
          audioRef.current!.playbackRate = playbackSpeed;
          
          // Ensure highlighting is updated
          setCurrentAyah(newAyah);
          scrollToAyah(newAyah);
          
          audioRef.current!.play().catch(() => {
            playAyahImmediate(newAyah);
          });
          
          preloadNextAudio(newAyah);
        } else {
          playAyahImmediate(newAyah);
        }
      } else if (currentSurah.number < 114) {
        const nextSurah = surahs.find(s => s.number === currentSurah.number + 1);
        if (nextSurah) {
          selectSurah(nextSurah);
          setTimeout(() => {
            if (nextSurah.number !== 1 && nextSurah.number !== 9) {
              playBismillah(nextSurah.number);
            } else {
              playAyahImmediate(1);
            }
          }, 100);
        }
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  }, [autoPlay, currentAyah, currentSurah, surahs, playbackSpeed]);

  const previousAyah = () => {
    if (currentAyah > 1) {
      const newAyah = currentAyah - 1;
      setCurrentAyah(newAyah);
      scrollToAyah(newAyah);
      // Preload immediately for faster playback
      if (selectedReciter && audioRef.current && currentSurah) {
        const audioSources = getAudioSources(currentSurah.number, newAyah, selectedReciter.id);
        audioRef.current.src = audioSources.primary;
        audioRef.current.preload = 'auto';
        audioRef.current.load();
      }
      if (isPlaying) {
        playAyahImmediate(newAyah);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '2px solid transparent',
          borderTop: '2px solid #059669',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const containerStyle = {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '1rem',
    paddingBottom: '6rem',
    position: 'relative' as const
  };

  const glassContainerStyle = {
    position: 'relative' as const,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(255, 255, 255, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '1rem',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  };

  const glassSelectStyle = {
    width: '100%',
    padding: '0.75rem',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    background: 'rgba(255, 255, 255, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '0.75rem',
    color: '#1f2937',
    fontWeight: 500,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    appearance: 'none' as const,
    cursor: 'pointer'
  };

  const settingsContainerStyle = {
    marginTop: '1.5rem',
    padding: '1.25rem',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.75rem',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  };

  const settingCardStyle = {
    padding: '1rem',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd}
        onError={(e) => {
          setAudioError('Audio playback failed');
          setIsPlaying(false);
          setAudioLoading(false);
        }}
        onLoadStart={() => {
          setAudioLoading(true);
          setAudioError(null);
        }}
        onCanPlay={() => setAudioLoading(false)}
        onLoadedData={() => setAudioError(null)}
        preload="auto"
        crossOrigin="anonymous"
      />
      <audio 
        ref={nextAudioRef}
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      
      {!isOnline && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#92400e'
        }}>
          <FaExclamationTriangle />
          <span>You are offline. Audio playback may not work properly.</span>
        </div>
      )}

      {audioError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#dc2626'
        }}>
          <FaExclamationTriangle />
          <span>{audioError}</span>
          <button
            onClick={() => setAudioError(null)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={glassContainerStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>Select Surah</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={currentSurah?.number || ''} 
                onChange={(e) => {
                  const surah = surahs.find(s => s.number === parseInt(e.target.value));
                  if (surah) selectSurah(surah);
                }}
                style={glassSelectStyle}
              >
                {surahs.map(surah => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.englishName}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>Select Reciter</label>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedReciter?.id || ''} 
                onChange={(e) => {
                  const reciter = reciters.find(r => r.id === parseInt(e.target.value));
                  if (reciter) {
                    setSelectedReciter(reciter);
                    localStorage.setItem('quran-selected-reciter', JSON.stringify(reciter));
                    if (isPlaying) {
                      stopAudio();
                    }
                  }
                }}
                style={glassSelectStyle}
              >
                {reciters.map(reciter => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div style={settingsContainerStyle}>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: '#1f2937', fontSize: '1.125rem', display: 'flex', alignItems: 'center' }}>
            <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Settings
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(3, 1fr)' : '1fr', gap: '1.5rem' }}>
            <div style={settingCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                const newValue = !autoPlay;
                setAutoPlay(newValue);
                localStorage.setItem('quran-autoplay', JSON.stringify(newValue));
              }}>
                <div style={{
                  width: '3rem',
                  height: '1.5rem',
                  borderRadius: '0.75rem',
                  background: autoPlay ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(156, 163, 175, 0.5)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transform: autoPlay ? 'translateX(1.5rem) translateY(0.125rem)' : 'translateX(0.125rem) translateY(0.125rem)',
                    transition: 'all 0.3s ease',
                    position: 'absolute',
                    top: 0
                  }}></div>
                </div>
                <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>Auto Play Next Ayah</span>
              </div>
            </div>
            
            <div style={settingCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                const newValue = !verseByVerse;
                setVerseByVerse(newValue);
                localStorage.setItem('quran-verse-by-verse', JSON.stringify(newValue));
              }}>
                <div style={{
                  width: '3rem',
                  height: '1.5rem',
                  borderRadius: '0.75rem',
                  background: verseByVerse ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(156, 163, 175, 0.5)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transform: verseByVerse ? 'translateX(1.5rem) translateY(0.125rem)' : 'translateX(0.125rem) translateY(0.125rem)',
                    transition: 'all 0.3s ease',
                    position: 'absolute',
                    top: 0
                  }}></div>
                </div>
                <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>Verse by Verse</span>
              </div>
            </div>
            
            {verseByVerse && (
              <div style={settingCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                  const newValue = !showTranslation;
                  setShowTranslation(newValue);
                  localStorage.setItem('quran-show-translation', JSON.stringify(newValue));
                }}>
                  <div style={{
                    width: '3rem',
                    height: '1.5rem',
                    borderRadius: '0.75rem',
                    background: showTranslation ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(156, 163, 175, 0.5)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      background: 'white',
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transform: showTranslation ? 'translateX(1.5rem) translateY(0.125rem)' : 'translateX(0.125rem) translateY(0.125rem)',
                      transition: 'all 0.3s ease',
                      position: 'absolute',
                      top: 0
                    }}></div>
                  </div>
                  <span style={{ marginLeft: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#1f2937' }}>Show Translation</span>
                </div>
              </div>
            )}
            
            <div style={settingCardStyle}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>Font Size</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="range"
                  min="14"
                  max="24"
                  value={fontSize}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    setFontSize(newValue);
                    localStorage.setItem('quran-font-size', newValue.toString());
                  }}
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    width: '100%',
                    height: '0.5rem',
                    borderRadius: '0.25rem',
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${((fontSize - 14) / (24 - 14)) * 100}%, rgba(156, 163, 175, 0.3) ${((fontSize - 14) / (24 - 14)) * 100}%, rgba(156, 163, 175, 0.3) 100%)`
                  }}
                />
                <span style={{
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  background: 'rgba(255, 255, 255, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  minWidth: '2.5rem',
                  textAlign: 'center'
                }}>{fontSize}px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentSurah && (
        <div ref={surahContentRef} style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(to right, #ecfdf5, #dbeafe)', borderRadius: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>
              {currentSurah.englishName} ({currentSurah.name})
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{currentSurah.englishNameTranslation}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {currentSurah.numberOfAyahs} Ayahs • {currentSurah.revelationType}
            </p>
          </div>

          {currentSurah.number !== 9 && (
            <div style={{ textAlign: 'center', marginBottom: verseByVerse ? '0.5rem' : '0.375rem' }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '0.375rem 0.5rem',
                background: currentAyah === 0 ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                borderRadius: '0.375rem',
                border: currentAyah === 0 ? '2px solid #10b981' : '1px solid #d1fae5',
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}>
              {/* Decorative Arabic pattern */}
              <div style={{
                position: 'absolute',
                top: '0.125rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.625rem',
                color: '#10b981',
                opacity: 0.3
              }}>۞</div>
              
              <div style={{
                position: 'absolute',
                bottom: '0.125rem',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.625rem',
                color: '#10b981',
                opacity: 0.3
              }}>۞</div>
              
              <p className="arabic-text" style={{ 
                fontSize: verseByVerse ? '1.125rem' : '1rem',
                fontWeight: '700',
                color: '#065f46',
                margin: '0',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                lineHeight: '1.2'
              }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              </div>
            </div>
          )}

          {verseByVerse ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {currentSurah.ayahs.filter(ayah => !(currentSurah.number === 1 && ayah.numberInSurah === 1)).map((ayah, index) => (
                <div 
                  key={ayah.numberInSurah}
                  id={`modern-ayah-${ayah.numberInSurah}`}
                  onClick={() => {
                    setCurrentAyah(ayah.numberInSurah);
                    scrollToAyah(ayah.numberInSurah);
                    playAyahImmediate(ayah.numberInSurah);
                  }}
                  style={{
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span style={{
                      background: '#059669',
                      color: 'white',
                      borderRadius: '50%',
                      width: '1.5rem',
                      height: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      flexShrink: 0,
                      marginTop: '0.25rem'
                    }}>
                      {currentSurah.number === 1 ? index + 1 : ayah.numberInSurah}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div 
                        className="arabic-text"
                        style={{ 
                          fontSize: `${fontSize}px`,
                          marginBottom: '0.25rem',
                          lineHeight: '1.5',
                          backgroundColor: currentAyah === ayah.numberInSurah ? '#dcfce7' : 'transparent',
                          padding: currentAyah === ayah.numberInSurah ? '0.25rem' : '0',
                          borderRadius: '0.25rem',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {cleanAyahText(ayah.text, currentSurah.number, ayah.numberInSurah)}
                      </div>
                      {showTranslation && translations[ayah.numberInSurah] && (
                        <div style={{ color: '#374151', fontSize: '0.875rem', lineHeight: '1.6' }}>
                          {translations[ayah.numberInSurah].text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="arabic-text"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: '2',
                textAlign: 'justify',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}
            >
              {currentSurah.ayahs.filter(ayah => !(currentSurah.number === 1 && ayah.numberInSurah === 1)).map((ayah, index) => {
                const displayNumber = currentSurah.number === 1 ? index + 1 : ayah.numberInSurah;
                const actualAyahNumber = currentSurah.number === 1 ? index + 2 : ayah.numberInSurah;
                return (
                <span 
                  key={ayah.numberInSurah}
                  id={`modern-ayah-${actualAyahNumber}`}
                  onClick={() => {
                    setCurrentAyah(actualAyahNumber);
                    scrollToAyah(actualAyahNumber);
                    playAyahImmediate(actualAyahNumber);
                  }}
                  style={{
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                >
                  <span style={{
                    backgroundColor: currentAyah === actualAyahNumber ? '#dcfce7' : 'transparent',
                    padding: currentAyah === actualAyahNumber ? '0.125rem 0.25rem' : '0',
                    borderRadius: '0.25rem',
                    transition: 'all 0.3s ease'
                  }}>
                    {cleanAyahText(ayah.text, currentSurah.number, ayah.numberInSurah)}
                  </span>
                  <span style={{
                    display: 'inline-block',
                    background: '#059669',
                    color: 'white',
                    borderRadius: '50%',
                    width: '1.25rem',
                    height: '1.25rem',
                    fontSize: '0.625rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    lineHeight: '1.25rem',
                    margin: '0 0.25rem',
                    verticalAlign: 'middle'
                  }}>
                    {displayNumber}
                  </span>
                  {index < currentSurah.ayahs.length - 2 ? ' ' : ''}
                </span>
                );
              })}
            </div>
          )}
          
        </div>
      )}

      {showControls && (
        <div style={{
          position: 'sticky',
          bottom: isMobile ? '0.5rem' : '1rem',
          left: isMobile ? '1rem' : '50%',
          right: isMobile ? '1rem' : 'auto',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          width: isMobile ? 'auto' : 'fit-content',
          padding: isMobile ? '0.75rem' : '1rem',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: isMobile ? '1.5rem' : '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          zIndex: 40,
          margin: isMobile ? '0' : '0 auto'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '0.5rem' : '0.75rem' }}>
          {/* Previous Surah */}
          <button
            onClick={() => {
              if (currentSurah) {
                const prevSurahNumber = currentSurah.number - 1;
                if (prevSurahNumber >= 1) {
                  const prevSurah = surahs.find(s => s.number === prevSurahNumber);
                  if (prevSurah) selectSurah(prevSurah);
                }
              }
            }}
            disabled={!currentSurah || currentSurah.number <= 1}
            style={{
              padding: isMobile ? '0.5rem' : '0.75rem',
              color: (!currentSurah || currentSurah.number <= 1) ? '#9ca3af' : '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: (!currentSurah || currentSurah.number <= 1) ? 'not-allowed' : 'pointer',
              transition: 'color 0.3s ease'
            }}
          >
            <FaStepBackward size={isMobile ? 16 : 20} />
          </button>
          
          {/* Previous Ayah */}
          <button
            onClick={previousAyah}
            disabled={currentAyah <= 1}
            style={{
              padding: isMobile ? '0.5rem' : '0.75rem',
              color: currentAyah <= 1 ? '#9ca3af' : '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: currentAyah <= 1 ? 'not-allowed' : 'pointer',
              transition: 'color 0.3s ease'
            }}
          >
            <FaBackward size={isMobile ? 16 : 20} />
          </button>
          
          {/* Play */}
          <button
            onClick={isPlaying ? stopAudio : playAyah}
            disabled={audioLoading || !isOnline}
            style={{
              padding: isMobile ? '0.75rem' : '1rem',
              background: (audioLoading || !isOnline) ? '#9ca3af' : '#059669',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              cursor: (audioLoading || !isOnline) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              opacity: !isOnline ? 0.5 : 1
            }}
            title={!isOnline ? 'Audio requires internet connection' : ''}
          >
            {audioLoading ? (
              <div className="modern-spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px', borderTopColor: 'white' }}></div>
            ) : isPlaying ? (
              <FaSquare size={isMobile ? 14 : 16} />
            ) : (
              <FaPlay size={isMobile ? 16 : 20} />
            )}
          </button>
          
          {/* Playback Speed */}
          <button
            onClick={() => {
              const speeds = [1, 1.5, 2];
              const currentIndex = speeds.indexOf(playbackSpeed);
              const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
              setPlaybackSpeed(nextSpeed);
              localStorage.setItem('quran-playback-speed', nextSpeed.toString());
              if (audioRef.current) {
                audioRef.current.playbackRate = nextSpeed;
              }
            }}
            style={{
              padding: isMobile ? '0.5rem' : '0.75rem',
              color: '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: isMobile ? '0.625rem' : '0.75rem',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}
          >
            {playbackSpeed}x
          </button>
          
          {/* Next Ayah */}
          <button
            onClick={() => nextAyah()}
            disabled={!currentSurah || currentAyah >= currentSurah.numberOfAyahs}
            style={{
              padding: isMobile ? '0.5rem' : '0.75rem',
              color: (!currentSurah || currentAyah >= currentSurah.numberOfAyahs) ? '#9ca3af' : '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: (!currentSurah || currentAyah >= currentSurah.numberOfAyahs) ? 'not-allowed' : 'pointer',
              transition: 'color 0.3s ease'
            }}
          >
            <FaForward size={isMobile ? 16 : 20} />
          </button>
          
          {/* Next Surah */}
          <button
            onClick={() => {
              if (currentSurah) {
                const nextSurahNumber = currentSurah.number + 1;
                if (nextSurahNumber <= 114) {
                  const nextSurah = surahs.find(s => s.number === nextSurahNumber);
                  if (nextSurah) selectSurah(nextSurah);
                }
              }
            }}
            disabled={!currentSurah || currentSurah.number >= 114}
            style={{
              padding: isMobile ? '0.5rem' : '0.75rem',
              color: (!currentSurah || currentSurah.number >= 114) ? '#9ca3af' : '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: (!currentSurah || currentSurah.number >= 114) ? 'not-allowed' : 'pointer',
              transition: 'color 0.3s ease'
            }}
          >
            <FaStepForward size={isMobile ? 16 : 20} />
          </button>
          

        </div>
        </div>
      )}
    </div>
  );
};

export default ModernQuranReader;