import React from 'react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  backLink: string;
  backText: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, backLink, backText }) => {
  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <main>
        <section className="section">
          <div className="text-center">
            <div className="islamic-note">
              <p>This feature is coming soon, In Sha Allah.</p>
              <p>We are working hard to bring you the best Islamic tools and resources.</p>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <Link to={backLink} className="btn-primary">
                {backText}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PlaceholderPage;