import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container">
      <div className="not-found-container text-center">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/prayer-times" className="btn-secondary">
            Prayer Times
          </Link>
        </div>
        
        <div className="islamic-quote">
          <p>
            <em>"And Allah is the best of planners"</em>
            <br />
            <strong>- Quran 8:30</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;