import React from 'react';
import ModernQuranReader from '../../components/quran/ModernQuranReader';

const QuranPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Holy Quran</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read, listen, and reflect upon the verses of the Holy Quran with multiple reciters, 
            translations, and interactive features
          </p>
        </header>

        <main>
          <ModernQuranReader />
        </main>
      </div>
    </div>
  );
};

export default QuranPage;