import React, { useState, useEffect } from 'react';

interface SimpleMosque {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
}

const FallbackMosqueLocator: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mosques, setMosques] = useState<SimpleMosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample mosque data for fallback
  const sampleMosques: SimpleMosque[] = [
    { id: '1', name: 'Islamic Center of Greater Cincinnati', address: '3668 Clifton Ave, Cincinnati, OH 45220', lat: 39.1312, lng: -84.5120 },
    { id: '2', name: 'Masjid Al-Noor', address: '123 Main St, Cincinnati, OH 45202', lat: 39.1031, lng: -84.5120 },
    { id: '3', name: 'Cincinnati Islamic Center', address: '456 Oak St, Cincinnati, OH 45219', lat: 39.1200, lng: -84.5000 },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          findNearbyMosques(location.lat, location.lng);
        },
        (geolocationError) => {
          setError(`Unable to get your location: ${geolocationError.message}`);
          setLoading(false);
          // Use default location (Cincinnati, OH)
          const defaultLocation = { lat: 39.1031, lng: -84.5120 };
          setUserLocation(defaultLocation);
          findNearbyMosques(defaultLocation.lat, defaultLocation.lng);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const findNearbyMosques = (lat: number, lng: number) => {
    try {
      // Calculate distances and sort by proximity
      const mosquesWithDistance = sampleMosques.map(mosque => ({
        ...mosque,
        distance: calculateDistance(lat, lng, mosque.lat, mosque.lng)
      }));

      mosquesWithDistance.sort((a, b) => a.distance - b.distance);
      setMosques(mosquesWithDistance);
    } catch (error) {
      console.error('Error finding mosques:', error);
      setError('Failed to load nearby mosques');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDirections = (mosque: SimpleMosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`;
    window.open(url, '_blank');
  };

  const openInMaps = (mosque: SimpleMosque) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${mosque.lat},${mosque.lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>🔍 Finding nearby mosques...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>⚠️ Location Error</h3>
        <p>{error}</p>
        <p>Showing sample mosques in Cincinnati, OH area.</p>
        <button onClick={getCurrentLocation} className="btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="mosque-locator">
      <div className="fallback-notice" style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px',
        color: '#856404'
      }}>
        <h4>📍 Fallback Mode</h4>
        <p>Using simplified mosque locator. For enhanced features, ensure Google Maps API is properly configured.</p>
      </div>

      {userLocation && (
        <div style={{
          background: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4>📍 Your Location</h4>
          <p>Latitude: {userLocation.lat.toFixed(4)}, Longitude: {userLocation.lng.toFixed(4)}</p>
        </div>
      )}

      <div className="mosque-list">
        <h3>🕌 Nearby Mosques ({mosques.length} found)</h3>
        {mosques.length === 0 ? (
          <p>No mosques found in your area.</p>
        ) : (
          <ul>
            {mosques.map((mosque) => (
              <li key={mosque.id} className="mosque-item">
                <div className="mosque-info">
                  <h4>{mosque.name}</h4>
                  <p>{mosque.address}</p>
                  <div className="mosque-details">
                    {mosque.distance && <span className="distance">{mosque.distance.toFixed(2)} miles away</span>}
                  </div>
                </div>
                <div className="mosque-actions">
                  <button onClick={() => getDirections(mosque)} className="btn-directions">📍 Directions</button>
                  <button onClick={() => openInMaps(mosque)} className="btn-street-view">🗺️ View on Map</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FallbackMosqueLocator;