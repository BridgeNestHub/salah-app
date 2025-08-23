import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>About Islamic Prayer Tools</h1>
        <p>Your comprehensive digital companion for Islamic worship and learning</p>
      </header>

      <main>
        <section className="section">
          <div className="about-content">
            <h2>Our Mission</h2>
            <p>
              Islamic Prayer Tools is designed to help Muslims around the world maintain their 
              connection with Allah through accurate prayer times, Qibla direction, and access 
              to Islamic knowledge. We strive to make Islamic worship and learning accessible 
              to everyone, anywhere.
            </p>

            <h2>Features</h2>
            <div className="features-list">
              <div className="feature-item">
                <h3>🕐 Accurate Prayer Times</h3>
                <p>Get precise prayer times based on your location using multiple calculation methods.</p>
              </div>
              
              <div className="feature-item">
                <h3>🧭 Qibla Direction</h3>
                <p>Find the exact direction to the Kaaba in Mecca from anywhere in the world.</p>
              </div>
              
              <div className="feature-item">
                <h3>🕌 Mosque Locator</h3>
                <p>Discover nearby mosques with detailed information and directions.</p>
              </div>
              
              <div className="feature-item">
                <h3>📖 Quran & Hadith</h3>
                <p>Read daily verses from the Quran and authentic Hadith collections.</p>
              </div>
              
              <div className="feature-item">
                <h3>📅 Islamic Calendar</h3>
                <p>Stay updated with Islamic holidays and community events.</p>
              </div>
            </div>

            <h2>Islamic Resources</h2>
            <p>
              Our content is sourced from authentic Islamic texts and verified by Islamic scholars. 
              We use reliable APIs and databases to ensure accuracy in prayer times and Qibla calculations.
            </p>

            <div className="sources">
              <h3>Sources & References:</h3>
              <ul>
                <li><strong>Prayer Times:</strong> Aladhan API with multiple calculation methods</li>
                <li><strong>Quran:</strong> Authentic Arabic text with verified translations</li>
                <li><strong>Hadith:</strong> Sahih Bukhari, Sahih Muslim, and other authentic collections</li>
                <li><strong>Qibla Calculation:</strong> Precise geographical calculations using GPS coordinates</li>
              </ul>
            </div>

            <h2>Technology</h2>
            <p>
              Built with modern web technologies to provide a fast, reliable, and user-friendly experience:
            </p>
            <ul>
              <li>React.js for responsive user interface</li>
              <li>Node.js backend with MongoDB database</li>
              <li>Real-time GPS and compass integration</li>
              <li>Offline capability for essential features</li>
            </ul>

            <h2>Privacy & Data</h2>
            <p>
              We respect your privacy and only collect location data when necessary for prayer times 
              and Qibla direction. Your personal information is never shared with third parties.
            </p>

            <h2>Contact & Support</h2>
            <p>
              If you have questions, suggestions, or need support, please don't hesitate to 
              <a href="/contact"> contact us</a>. We're here to help you in your spiritual journey.
            </p>

            <div className="islamic-greeting">
              <p className="text-center">
                <em>"And whoever relies upon Allah - then He is sufficient for him. 
                Indeed, Allah will accomplish His purpose."</em>
                <br />
                <strong>- Quran 65:3</strong>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;