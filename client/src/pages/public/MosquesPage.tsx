import React from 'react';
import MosqueLocator from '../../components/mosque/MosqueLocator';
import MosqueDebug from '../../components/mosque/MosqueDebug';
import MosqueTest from '../../components/mosque/MosqueTest';
import SimpleMosqueLocator from '../../components/mosque/SimpleMosqueLocator';

const MosquesPage: React.FC = () => {
  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>Mosque Locator</h1>
        <p>Find mosques near your location</p>
      </header>

      <main>
        <section className="section">
          <MosqueTest />
          <MosqueDebug />
          <SimpleMosqueLocator />
          <hr style={{ margin: '40px 0', border: '1px solid #ddd' }} />
          <h3>Original MosqueLocator (with Google Maps)</h3>
          <MosqueLocator />
        </section>

        <section className="section">
          <div className="mosque-info">
            <h2>About Mosque Locator</h2>
            <p>
              Our mosque locator helps you find nearby mosques using your current location. 
              The map shows all mosques within a 5km radius, along with their distances from your location.
            </p>
            
            <div className="mosque-features">
              <h3>Features:</h3>
              <ul>
                <li>Interactive map with mosque locations</li>
                <li>Distance calculation from your location</li>
                <li>Mosque names and addresses</li>
                <li>Sorted by proximity</li>
              </ul>
            </div>

            <div className="mosque-tips">
              <h3>Tips:</h3>
              <ul>
                <li>Allow location access for accurate results</li>
                <li>Click on map markers for mosque details</li>
                <li>Use the list below the map for quick reference</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MosquesPage;