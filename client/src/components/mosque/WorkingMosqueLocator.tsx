import React, { useState, useEffect } from 'react';

interface Mosque {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  rating?: number;
  phone?: string;
  place_id?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  price_level?: number;
  user_ratings_total?: number;
}

const WorkingMosqueLocator: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(8047); // Default 5 miles in meters

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
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
        getLocationName(location.lat, location.lng);
        findNearbyMosques(location.lat, location.lng);
      },
      (geolocationError) => {
        console.warn('Geolocation error:', geolocationError);
        setError('Could not get your location. Please enable location services.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const findNearbyMosques = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:8000/api/maps/mosques/nearby?lat=${lat}&lng=${lng}&radius=${searchRadius}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        const mosquesWithDistance = data.results.map((place: any) => {
          const mosque: Mosque = {
            id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address || 'Address not available',
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            rating: place.rating,
            place_id: place.place_id,
            opening_hours: place.opening_hours,
            photos: place.photos,
            price_level: place.price_level,
            user_ratings_total: place.user_ratings_total,
            distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
          };
          
          return mosque;
        });

        // Sort by distance and limit to 20 results
        mosquesWithDistance.sort((a: Mosque, b: Mosque) => (a.distance || 0) - (b.distance || 0));
        const nearbyMosques = mosquesWithDistance.slice(0, 20);
        
        setMosques(nearbyMosques);
        
        if (nearbyMosques.length === 0) {
          setError('No mosques found in your area. Try increasing the search radius.');
        }
      } else if (data.status === 'ZERO_RESULTS') {
        setError('No mosques found in your area. Try increasing the search radius.');
        setMosques([]);
      } else {
        throw new Error(`Google Places API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Error finding mosques:', error);
      setError('Failed to load nearby mosques. Please try again.');
      setMosques([]);
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/maps/geocode?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results?.[0]) {
        const result = data.results[0];
        const components = result.address_components;
        
        let city = '', state = '', country = '';
        
        components.forEach((component: any) => {
          if (component.types.includes('locality')) {
            city = component.short_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
          } else if (component.types.includes('country')) {
            country = component.short_name;
          }
        });
        
        const locationStr = [city, state, country].filter(Boolean).join(', ');
        setLocationName(locationStr || 'Unknown Location');
      } else {
        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
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
    if (mosque.place_id) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}&destination_place_id=${mosque.place_id}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`;
      window.open(url, '_blank');
    }
  };

  const callMosque = (mosque: Mosque) => {
    if (mosque.phone) {
      window.open(`tel:${mosque.phone}`, '_self');
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      findNearbyMosques(userLocation.lat, userLocation.lng);
    }
  };

  const refreshSearch = () => {
    if (userLocation) {
      findNearbyMosques(userLocation.lat, userLocation.lng);
    } else {
      getCurrentLocation();
    }
  };

  const getRadiusInMiles = (radiusInMeters: number) => {
    return (radiusInMeters * 0.000621371).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>🔍 Finding nearby mosques...</h3>
        <p>Searching Google Maps for mosques in your area...</p>
      </div>
    );
  }

  return (
    <div className="mosque-locator">
      <div style={{
        background: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4>🗺️ Live Mosque Locator</h4>
        <p>Using Google Places API for real-time mosque data</p>
        {locationName && (
          <p>📍 Your location: {locationName}</p>
        )}
        
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Search Radius:</label>
          <select 
            value={searchRadius} 
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            style={{ padding: '5px', borderRadius: '4px' }}
          >
            <option value={1609}>1 mile</option>
            <option value={3219}>2 miles</option>
            <option value={8047}>5 miles</option>
            <option value={16093}>10 miles</option>
            <option value={32187}>20 miles</option>
            <option value={80467}>50 miles</option>
          </select>
          <span>({getRadiusInMiles(searchRadius)} miles)</span>
          <button 
            onClick={refreshSearch}
            style={{ 
              padding: '5px 10px', 
              borderRadius: '4px', 
              border: '1px solid #4caf50',
              background: '#4caf50',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          <h4>⚠️ Notice</h4>
          <p>{error}</p>
        </div>
      )}

      <div className="mosque-list">
        <h3>🕌 Nearby Mosques ({mosques.length} found)</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {mosques.map((mosque) => (
            <li key={mosque.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              background: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="mosque-info" style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2e7d32' }}>{mosque.name}</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>{mosque.address}</p>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px', color: '#555' }}>
                    {mosque.rating && (
                      <span>⭐ {mosque.rating}/5 {mosque.user_ratings_total && `(${mosque.user_ratings_total} reviews)`}</span>
                    )}
                    {mosque.distance && (
                      <span>📍 {mosque.distance.toFixed(1)} miles away</span>
                    )}
                    {mosque.opening_hours?.open_now !== undefined && (
                      <span style={{ color: mosque.opening_hours.open_now ? '#4caf50' : '#f44336' }}>
                        {mosque.opening_hours.open_now ? '🟢 Open Now' : '🔴 Closed'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <button 
                    onClick={() => getDirections(mosque)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border: '1px solid #2196f3',
                      background: '#2196f3',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    📍 Directions
                  </button>
                  {mosque.phone && (
                    <button 
                      onClick={() => callMosque(mosque)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #4caf50',
                        background: '#4caf50',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      📞 Call
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {mosques.length === 0 && !loading && !error && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <p>No mosques found in your current search radius.</p>
            <p>Try increasing the search radius or refreshing your location.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkingMosqueLocator;