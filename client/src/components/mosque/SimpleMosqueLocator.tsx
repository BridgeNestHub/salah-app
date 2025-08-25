import React, { useState, useEffect } from 'react';

interface Mosque {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  rating?: number;
}

const SimpleMosqueLocator: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    setLocationStatus('Getting your location...');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLocationStatus('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setLocationStatus(`Location found: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        findNearbyMosques(location.lat, location.lng);
      },
      (geolocationError) => {
        let errorMessage = 'Unable to get your location: ';
        switch(geolocationError.code) {
          case geolocationError.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case geolocationError.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case geolocationError.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        setError(errorMessage);
        setLocationStatus('Location error');
        setLoading(false);
        
        // Use default location (Cincinnati, OH) as fallback
        const defaultLocation = { lat: 39.1031, lng: -84.5120 };
        setUserLocation(defaultLocation);
        findNearbyMosques(defaultLocation.lat, defaultLocation.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  const findNearbyMosques = async (lat: number, lng: number) => {
    setLocationStatus('Searching for nearby mosques...');

    try {
      // Use backend API to avoid CORS issues
      const response = await fetch(
        `/api/maps/mosques/nearby?lat=${lat}&lng=${lng}&radius=8047`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        const mosquesWithDistance = data.results.map((place: any, index: number) => ({
          id: place.place_id || index.toString(),
          name: place.name || 'Mosque',
          address: place.vicinity || 'Address not available',
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          rating: place.rating,
          distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
        }));

        mosquesWithDistance.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
        setMosques(mosquesWithDistance);
        setLocationStatus(`Found ${mosquesWithDistance.length} mosques`);
      } else {
        console.warn('No mosques found or API error:', data.status);
        throw new Error(`Places API error: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error finding mosques:', error);
      setError(`Failed to load nearby mosques: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLocationStatus('Search failed - using sample data');
      
      // Fallback to sample data
      const sampleMosques: Mosque[] = [
        { id: '1', name: 'Islamic Center of Greater Cincinnati', address: '3668 Clifton Ave, Cincinnati, OH 45220', lat: 39.1312, lng: -84.5120, rating: 4.5 },
        { id: '2', name: 'Masjid Al-Noor', address: '123 Main St, Cincinnati, OH 45202', lat: 39.1031, lng: -84.5120, rating: 4.2 },
      ];
      
      const mosquesWithDistance = sampleMosques.map(mosque => ({
        ...mosque,
        distance: calculateDistance(lat, lng, mosque.lat, mosque.lng)
      }));
      
      setMosques(mosquesWithDistance);
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

  const getDirections = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`;
    window.open(url, '_blank');
  };

  const openInMaps = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${mosque.lat},${mosque.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="mosque-locator">
      <div style={{
        background: '#e3f2fd',
        border: '1px solid #90caf9',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4>📍 Simple Mosque Locator</h4>
        <p>Status: {locationStatus}</p>
        {userLocation && (
          <p>Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
        )}
      </div>

      {loading && (
        <div className="loading">
          <h3>🔍 Finding nearby mosques...</h3>
        </div>
      )}

      {error && (
        <div className="error">
          <h3>⚠️ Notice</h3>
          <p>{error}</p>
          <p>Showing fallback data below.</p>
          <button onClick={getCurrentLocation} className="btn-primary">Try Again</button>
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
                    {mosque.rating && <span className="rating">⭐ {mosque.rating}/5</span>}
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

export default SimpleMosqueLocator;