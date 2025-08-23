import React from 'react';
import ModernHadithReader from '../../components/hadith/ModernHadithReader';

const HadithPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Hadith Collection</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore authentic sayings and teachings of Prophet Muhammad (peace be upon him) 
            from verified collections with search and audio features
          </p>
        </header>

        <main>
          <ModernHadithReader />
        </main>
      </div>
    </div>
  );
};

export default HadithPage;