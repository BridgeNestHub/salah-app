import React, { useState, useEffect } from 'react';

interface Hadith {
  id: string;
  collection: string;
  book: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string;
}

const HadithDisplay: React.FC = () => {
  const [currentHadith, setCurrentHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample hadith for demonstration
  const sampleHadith: Hadith[] = [
    {
      id: '1',
      collection: 'Sahih Bukhari',
      book: 'Book of Faith',
      hadithNumber: '1',
      arabicText: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      translation: "Actions are but by intention and every man shall have only that which he intended.",
      narrator: "Umar ibn al-Khattab",
      grade: "Sahih (Authentic)"
    },
    {
      id: '2',
      collection: 'Sahih Muslim',
      book: 'Book of Faith',
      hadithNumber: '99',
      arabicText: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
      translation: "Whoever believes in Allah and the Last Day should speak good or keep silent.",
      narrator: "Abu Hurairah",
      grade: "Sahih (Authentic)"
    },
    {
      id: '3',
      collection: 'Sunan Abu Dawood',
      book: 'Book of Prayer',
      hadithNumber: '425',
      arabicText: "الطُّهُورُ شَطْرُ الإِيمَانِ",
      translation: "Cleanliness is half of faith.",
      narrator: "Abu Malik al-Ash'ari",
      grade: "Sahih (Authentic)"
    }
  ];

  useEffect(() => {
    loadDailyHadith();
  }, []);

  const loadDailyHadith = () => {
    setLoading(true);
    // Simulate API call - in real implementation, this would fetch from your backend
    setTimeout(() => {
      const today = new Date().getDate();
      const hadithIndex = today % sampleHadith.length;
      setCurrentHadith(sampleHadith[hadithIndex]);
      setLoading(false);
    }, 1000);
  };

  const getRandomHadith = () => {
    const randomIndex = Math.floor(Math.random() * sampleHadith.length);
    setCurrentHadith(sampleHadith[randomIndex]);
  };

  if (loading) {
    return <div className="loading">Loading hadith...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="hadith-display">
      {currentHadith && (
        <div className="hadith-container">
          <div className="hadith-header">
            <h3>{currentHadith.collection}</h3>
            <p className="hadith-reference">
              {currentHadith.book} - Hadith {currentHadith.hadithNumber}
            </p>
          </div>
          
          <div className="arabic-text">
            <p>{currentHadith.arabicText}</p>
          </div>
          
          <div className="translation">
            <p>"{currentHadith.translation}"</p>
          </div>
          
          <div className="hadith-details">
            <p><strong>Narrator:</strong> {currentHadith.narrator}</p>
            <p><strong>Grade:</strong> <span className="grade">{currentHadith.grade}</span></p>
          </div>
          
          <div className="hadith-actions">
            <button onClick={getRandomHadith} className="btn-secondary">
              Random Hadith
            </button>
            <button onClick={loadDailyHadith} className="btn-primary">
              Daily Hadith
            </button>
          </div>
        </div>
      )}

      <div className="hadith-info">
        <h3>About Hadith</h3>
        <p>
          Hadith are the recorded sayings, actions, and approvals of Prophet Muhammad (peace be upon him). 
          They serve as a source of Islamic law and moral guidance alongside the Quran.
        </p>
        <p>
          The authenticity of hadith is classified into different grades, with "Sahih" being the highest 
          level of authenticity, meaning the hadith is considered reliable and authentic.
        </p>
        
        <div className="collections-info">
          <h4>Major Hadith Collections:</h4>
          <ul>
            <li><strong>Sahih Bukhari</strong> - Compiled by Imam Bukhari</li>
            <li><strong>Sahih Muslim</strong> - Compiled by Imam Muslim</li>
            <li><strong>Sunan Abu Dawood</strong> - Compiled by Abu Dawood</li>
            <li><strong>Jami' at-Tirmidhi</strong> - Compiled by At-Tirmidhi</li>
            <li><strong>Sunan an-Nasa'i</strong> - Compiled by An-Nasa'i</li>
            <li><strong>Sunan Ibn Majah</strong> - Compiled by Ibn Majah</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HadithDisplay;