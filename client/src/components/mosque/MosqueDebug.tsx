import React, { useState, useEffect } from 'react';

const MosqueDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkGoogleMaps = () => {
      const info = {
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing',
        apiKeyValue: process.env.REACT_APP_GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...',
        googleMapsLoaded: typeof window.google !== 'undefined',
        googleMapsPlaces: typeof window.google?.maps?.places !== 'undefined',
        geolocationSupported: 'geolocation' in navigator,
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(info);
    };

    checkGoogleMaps();
    
    // Check again after a delay to see if Google Maps loads
    const timer = setTimeout(checkGoogleMaps, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const testGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDebugInfo((prev: any) => ({
            ...prev,
            geolocationTest: 'Success',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }));
        },
        (error) => {
          setDebugInfo((prev: any) => ({
            ...prev,
            geolocationTest: 'Failed',
            geolocationError: error.message
          }));
        }
      );
    }
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px 0',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <h3 style={{ color: '#495057', marginBottom: '15px' }}>🔍 Mosque Locator Debug Information</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={testGeolocation}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Geolocation
        </button>
      </div>

      <pre style={{ 
        background: 'white', 
        padding: '15px', 
        borderRadius: '4px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
        <p><strong>Common Issues:</strong></p>
        <ul>
          <li>API Key missing or invalid</li>
          <li>Google Maps API not enabled in Google Cloud Console</li>
          <li>Places API not enabled</li>
          <li>Geolocation blocked by browser</li>
          <li>HTTPS required for geolocation</li>
        </ul>
      </div>
    </div>
  );
};

export default MosqueDebug;