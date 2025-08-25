import React, { useState, useEffect } from 'react';

const MosqueTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: any = {};
    
    // Test 1: Environment Variables
    results.apiKey = {
      present: !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      value: process.env.REACT_APP_GOOGLE_MAPS_API_KEY?.substring(0, 20) + '...',
      length: process.env.REACT_APP_GOOGLE_MAPS_API_KEY?.length || 0
    };

    // Test 2: Geolocation
    results.geolocation = {
      supported: 'geolocation' in navigator,
      permissions: await testGeolocation()
    };

    // Test 3: Google Maps API
    results.googleMaps = await testGoogleMapsAPI();

    // Test 4: Network connectivity
    results.network = await testNetworkConnectivity();

    setTestResults(results);
    setLoading(false);
  };

  const testGeolocation = (): Promise<any> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ status: 'not_supported' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            status: 'success',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          resolve({
            status: 'error',
            code: error.code,
            message: error.message
          });
        },
        { timeout: 5000 }
      );
    });
  };

  const testGoogleMapsAPI = (): Promise<any> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        resolve({ status: 'no_api_key' });
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      (window as any).initMap = () => {
        resolve({
          status: 'success',
          googleAvailable: typeof window.google !== 'undefined',
          mapsAvailable: typeof window.google?.maps !== 'undefined',
          placesAvailable: typeof window.google?.maps?.places !== 'undefined'
        });
      };

      script.onerror = () => {
        resolve({ status: 'script_error' });
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.google) {
          resolve({ status: 'timeout' });
        }
      }, 10000);

      document.head.appendChild(script);
    });
  };

  const testNetworkConnectivity = (): Promise<any> => {
    return new Promise((resolve) => {
      fetch('https://maps.googleapis.com/maps/api/js', { method: 'HEAD', mode: 'no-cors' })
        .then(() => resolve({ status: 'success' }))
        .catch((error) => resolve({ status: 'error', message: error.message }));
    });
  };

  const testPlacesAPI = async () => {
    if (!window.google?.maps?.places) {
      setTestResults((prev: any) => ({
        ...prev,
        placesTest: { status: 'google_maps_not_loaded' }
      }));
      return;
    }

    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        location: new google.maps.LatLng(39.1031, -84.5120), // Cincinnati
        radius: 5000,
        keyword: 'mosque',
        type: 'place_of_worship'
      };

      service.nearbySearch(request, (results, status) => {
        setTestResults((prev: any) => ({
          ...prev,
          placesTest: {
            status: status,
            resultsCount: results?.length || 0,
            firstResult: results?.[0]?.name || 'None'
          }
        }));
      });
    } catch (error) {
      setTestResults((prev: any) => ({
        ...prev,
        placesTest: { status: 'error', message: (error as Error).message }
      }));
    }
  };

  if (loading) {
    return <div>Running diagnostic tests...</div>;
  }

  return (
    <div style={{ 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px 0' 
    }}>
      <h3>🔧 Mosque Locator Diagnostic Results</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testPlacesAPI}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Places API
        </button>
        <button 
          onClick={runTests}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Re-run Tests
        </button>
      </div>

      <pre style={{ 
        background: 'white', 
        padding: '15px', 
        borderRadius: '4px',
        overflow: 'auto',
        fontSize: '12px'
      }}>
        {JSON.stringify(testResults, null, 2)}
      </pre>

      <div style={{ marginTop: '15px' }}>
        <h4>Troubleshooting Guide:</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>API Key Issues:</strong> Ensure REACT_APP_GOOGLE_MAPS_API_KEY is set and valid</li>
          <li><strong>Geolocation Blocked:</strong> Check browser permissions and use HTTPS</li>
          <li><strong>Google Maps Failed:</strong> Check API key permissions and enabled APIs</li>
          <li><strong>Network Issues:</strong> Check internet connection and firewall settings</li>
        </ul>
      </div>
    </div>
  );
};

export default MosqueTest;