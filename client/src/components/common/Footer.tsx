import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <span className="footer-icon">🕌</span>
              <h3>Islamic Prayer Tools</h3>
              <p>Your comprehensive digital companion for Islamic worship and learning</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/quran">Quran</Link></li>
              <li><Link to="/hadith">Hadith</Link></li>
              <li><Link to="/events">Events</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Tools</h4>
            <ul>
              <li><Link to="/mosques">Mosque Locator</Link></li>
              <li><Link to="/">Prayer Times</Link></li>
              <li><Link to="/">Qibla Direction</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 Islamic Prayer Tools. Built with ❤️ for the Muslim community.</p>
            <div className="footer-quote">
              <em>"And whoever relies upon Allah - then He is sufficient for him"</em>
              <span> - Quran 65:3</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;