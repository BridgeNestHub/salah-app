import React, { useState, useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Mosque } from '../../types/google-maps';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
console.log('Google Maps API Key loaded:', GOOGLE_MAPS_API_KEY ? 'Yes' : 'No');

interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  mosques: Mosque[];
  onDirections: (mosque: Mosque) => void;
  onStreetView: (mosque: Mosque) => void;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({ center, zoom, mosques, onDirections, onStreetView }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: true,
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      const infoWindow = new google.maps.InfoWindow();
      const markers: google.maps.Marker[] = [];

      // User location marker
      markers.push(new google.maps.Marker({
        position: center,
        map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
        },
      }));

      // Mosque markers
      mosques.forEach((mosque) => {
        const marker = new google.maps.Marker({
          position: { lat: mosque.geometry.location.lat, lng: mosque.geometry.location.lng },
          map,
          title: mosque.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L8 8H16L12 2Z" fill="#0F9D58"/>
                <circle cx="12" cy="16" r="6" fill="#0F9D58" stroke="white" stroke-width="2"/>
                <text x="12" y="18" text-anchor="middle" fill="white" font-size="8">🕌</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
          },
        });
        markers.push(marker);

        const contentString = `
          <div style="max-width: 250px;">
            <h4 style="margin: 0 0 8px 0;">${mosque.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${mosque.formatted_address}</p>
            ${mosque.rating ? `<p style="margin: 0 0 8px 0;">⭐ ${mosque.rating}/5</p>` : ''}
            ${mosque.isOpen !== undefined ? `<p style="margin: 0 0 8px 0; color: ${mosque.isOpen ? '#28a745' : '#dc3545'};">• ${mosque.isOpen ? 'Open Now' : 'Closed'}</p>` : ''}
            ${mosque.distance ? `<p style="margin: 0 0 12px 0;"><strong>Distance:</strong> ${mosque.distance.toFixed(2)} miles</p>` : ''}
            <div style="display: flex; gap: 8px;">
              <button id="directions-btn-${mosque.place_id}" style="padding: 4px 8px; background: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer;">Directions</button>
              <button id="streetview-btn-${mosque.place_id}" style="padding: 4px 8px; background: #34A853; color: white; border: none; border-radius: 4px; cursor: pointer;">Street View</button>
            </div>
          </div>
        `;

        marker.addListener('click', () => {
          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);

          setTimeout(() => {
            document.getElementById(`directions-btn-${mosque.place_id}`)?.addEventListener('click', () => {
              onDirections(mosque);
            });
            document.getElementById(`streetview-btn-${mosque.place_id}`)?.addEventListener('click', () => {
              onStreetView(mosque);
            });
          }, 0);
        });
      });
      
      return () => {
        markers.forEach(marker => marker.setMap(null));
      };
    }
  }, [map, mosques, center, onDirections, onStreetView]);

  return <div ref={ref} style={{ width: '100%', height: '400px' }} />;
};

const MosqueLocator: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered:', { userLocation });
    if (userLocation) {
      console.log('Starting mosque search...');
      setLoading(true);
      findNearbyMosques(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

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
        },
        (geolocationError) => {
          console.error('Geolocation error:', geolocationError);
          setError(`Unable to get your location: ${geolocationError.message}`);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const findNearbyMosques = async (lat: number, lng: number) => {
    console.log('Starting mosque search for:', lat, lng);
    try {
      // Use backend API to search for mosques
      const response = await fetch(`/api/maps/places/nearby?lat=${lat}&lng=${lng}&type=mosque&radius=8047`);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        const mosqueData: Mosque[] = data.results.map((place: any) => ({
          place_id: place.place_id,
          name: place.name || 'Mosque',
          formatted_address: place.vicinity || place.formatted_address || 'Address not available',
          geometry: {
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
          },
          rating: place.rating || undefined,
          isOpen: place.opening_hours?.open_now,
          photos: place.photos?.slice(0, 1).map((photo: any) => photo.photo_reference),
          distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        }));

        console.log('Found mosques:', mosqueData.length);
        setMosques(mosqueData.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
      } else {
        console.log('No mosques found');
        setMosques([]);
      }
    } catch (error) {
      console.error('Error finding mosques:', error);
      setError(`Failed to load nearby mosques: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('Mosque search completed');
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDirections = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.geometry.location.lat},${mosque.geometry.location.lng}&destination_place_id=${mosque.place_id}`;
    window.open(url, '_blank');
  };

  const openStreetView = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${mosque.geometry.location.lat},${mosque.geometry.location.lng}&heading=-45&pitch=38&fov=80`;
    window.open(url, '_blank');
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="error">
        <h3>❌ Configuration Error</h3>
        <p>Google Maps API key is required. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.</p>
        <p>Current key: {GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set'}</p>
      </div>
    );
  }

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
        <h3>❌ Error</h3>
        <p>{error}</p>
        <button onClick={getCurrentLocation} className="btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="mosque-locator">
      {userLocation && mosques.length > 0 && (
        <div style={{ width: '100%', height: '400px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <p>📍 Map view will be available soon. Use the list below to find mosques.</p>
        </div>
      )}

      <div className="mosque-list">
        <h3>🕌 Nearby Mosques ({mosques.length} found)</h3>
        {mosques.length === 0 ? (
          <p>No mosques found in your area. Try expanding your search radius or check your internet connection.</p>
        ) : (
          <ul>
            {mosques.slice(0, 10).map((mosque) => (
              <li key={mosque.place_id} className="mosque-item">
                <div className="mosque-info">
                  <h4>{mosque.name}</h4>
                  <p>{mosque.formatted_address}</p>
                  <div className="mosque-details">
                    {mosque.rating && <span className="rating">⭐ {mosque.rating}/5</span>}
                    {mosque.isOpen !== undefined && <span className={`status ${mosque.isOpen ? 'open' : 'closed'}`}>• {mosque.isOpen ? 'Open' : 'Closed'}</span>}
                    {mosque.distance && <span className="distance">{mosque.distance.toFixed(2)} miles away</span>}
                  </div>
                </div>
                <div className="mosque-actions">
                  <button onClick={() => getDirections(mosque)} className="btn-directions">📍 Directions</button>
                  <button onClick={() => openStreetView(mosque)} className="btn-street-view">👁️ Street View</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MosqueLocator;