import React, { useState, useEffect } from 'react';
import PrayerTimes from '../../components/prayer/PrayerTimes';
import QiblaCompass from '../../components/qibla/QiblaCompass';
import { getHijriDate, getHijriDateFromAPI, getDailyDhikr, getDailyReminder } from '../../utils/islamicContent';
import '../../styles/home.css';

const Home: React.FC = () => {
  const [hijriDate, setHijriDate] = useState(getHijriDate());
  const dailyDhikr = getDailyDhikr();
  const dailyReminder = getDailyReminder();

  useEffect(() => {
    // Fetch accurate Hijri date from API
    getHijriDateFromAPI().then(setHijriDate);
  }, []);

  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>Islamic Prayer Tools</h1>
        <p>Your comprehensive guide to Islamic prayer times and Qibla direction</p>
      </header>

      <main>
        <section className="section">
          <h2 className="text-center">Prayer Times</h2>
          <PrayerTimes />
        </section>

        <section className="section">
          <h2 className="text-center">🕋 Qibla Direction</h2>
          <QiblaCompass />
        </section>

        <section className="section">
          <div className="islamic-greeting text-center">
            <h2>السلام عليكم ورحمة الله وبركاته</h2>
            <p><em>Assalamu Alaikum wa Rahmatullahi wa Barakatuh</em></p>
            <p>Peace be upon you and Allah's mercy and blessings</p>
          </div>

          <div className="daily-reminders">
            <div className="hijri-date">
              <h3>📅 Today's Islamic Date</h3>
              <p>{hijriDate.day} {hijriDate.month} {hijriDate.year} AH</p>
              <div className="arabic-date">{hijriDate.arabic}</div>
              <small>Corresponding to {new Date().toLocaleDateString()}</small>
            </div>

            <div className="daily-dhikr">
              <h3>🤲 Daily Dhikr</h3>
              <div className="arabic-text">
                <p>{dailyDhikr.arabic}</p>
              </div>
              <p><em>{dailyDhikr.transliteration}</em></p>
              <p>"{dailyDhikr.translation}"</p>
              <small>{dailyDhikr.benefit}</small>
            </div>

            <div className="islamic-reminder">
              <h3>💡 Daily Reminder</h3>
              <p>"{dailyReminder.verse}"</p>
              <p><strong>- {dailyReminder.reference}</strong></p>
            </div>
          </div>



          <div className="islamic-benefits text-center">
            <h3>Benefits of Regular Prayer</h3>
            <div className="benefits-list">
              <div className="benefit-item">
                <h4>🧘‍♂️ Spiritual Peace</h4>
                <p>Prayer brings tranquility and connection with Allah</p>
              </div>
              <div className="benefit-item">
                <h4>🕰️ Time Management</h4>
                <p>Five daily prayers structure your day with purpose</p>
              </div>
              <div className="benefit-item">
                <h4>🤝 Community Bond</h4>
                <p>Congregational prayers strengthen Muslim brotherhood</p>
              </div>
              <div className="benefit-item">
                <h4>💪 Self-Discipline</h4>
                <p>Regular worship builds character and self-control</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;