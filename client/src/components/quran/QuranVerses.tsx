import React, { useState, useEffect } from 'react';

interface Verse {
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  transliteration: string;
  surahName: string;
}

const QuranVerses: React.FC = () => {
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample verses for demonstration
  const sampleVerses: Verse[] = [
    {
      surah: 1,
      ayah: 1,
      arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      transliteration: "Bismillahi'r-rahmani'r-raheem",
      surahName: "Al-Fatiha"
    },
    {
      surah: 2,
      ayah: 255,
      arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
      translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
      transliteration: "Allahu la ilaha illa huwa'l-hayyu'l-qayyum. La ta'khudhuhu sinatun wa la nawm",
      surahName: "Al-Baqarah"
    },
    {
      surah: 112,
      ayah: 1,
      arabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ",
      translation: "Say, 'He is Allah, [who is] One,",
      transliteration: "Qul huwa Allahu ahad",
      surahName: "Al-Ikhlas"
    }
  ];

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = () => {
    setLoading(true);
    // Simulate API call - in real implementation, this would fetch from your backend
    setTimeout(() => {
      const today = new Date().getDate();
      const verseIndex = today % sampleVerses.length;
      setCurrentVerse(sampleVerses[verseIndex]);
      setLoading(false);
    }, 1000);
  };

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * sampleVerses.length);
    setCurrentVerse(sampleVerses[randomIndex]);
  };

  if (loading) {
    return <div className="loading">Loading verse...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="quran-verses">
      {currentVerse && (
        <div className="verse-container">
          <div className="verse-header">
            <h3>Surah {currentVerse.surahName} ({currentVerse.surah}:{currentVerse.ayah})</h3>
          </div>
          
          <div className="arabic-text">
            <p>{currentVerse.arabicText}</p>
          </div>
          
          <div className="transliteration">
            <p><em>{currentVerse.transliteration}</em></p>
          </div>
          
          <div className="translation">
            <p>{currentVerse.translation}</p>
          </div>
          
          <div className="verse-actions">
            <button onClick={getRandomVerse} className="btn-secondary">
              Random Verse
            </button>
            <button onClick={loadDailyVerse} className="btn-primary">
              Daily Verse
            </button>
          </div>
        </div>
      )}

      <div className="quran-info">
        <h3>About the Quran</h3>
        <p>
          The Quran is the holy book of Islam, believed by Muslims to be the direct word of Allah 
          as revealed to Prophet Muhammad (peace be upon him) through the angel Gabriel.
        </p>
        <p>
          It consists of 114 chapters (Surahs) and over 6,000 verses (Ayahs), 
          providing guidance for all aspects of life.
        </p>
      </div>
    </div>
  );
};

export default QuranVerses;