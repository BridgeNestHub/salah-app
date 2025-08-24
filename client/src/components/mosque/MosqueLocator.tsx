import React, { useState, useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Mosque } from '../../types/google-maps';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

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
      // User location marker
      new google.maps.Marker({
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
      });

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

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="max-width: 250px;">
              <h4 style="margin: 0 0 8px 0;">${mosque.name}</h4>
              <p style="margin: 0 0 8px 0; font-size: 14px;">${mosque.formatted_address}</p>
              ${mosque.rating ? `<p style="margin: 0 0 8px 0;">⭐ ${mosque.rating}/5</p>` : ''}
              ${mosque.isOpen !== undefined ? `<p style="margin: 0 0 8px 0; color: ${mosque.isOpen ? '#28a745' : '#dc3545'};">• ${mosque.isOpen ? 'Open Now' : 'Closed'}</p>` : ''}
              ${mosque.distance ? `<p style="margin: 0 0 12px 0;"><strong>Distance:</strong> ${mosque.distance.toFixed(2)} miles</p>` : ''}
              <div style="display: flex; gap: 8px;">
                <button onclick="window.getDirections('${mosque.place_id}')" style="padding: 4px 8px; background: #4285F4; color: white; border: none; border-radius: 4px; cursor: pointer;">Directions</button>
                <button onclick="window.openStreetView('${mosque.place_id}')" style="padding: 4px 8px; background: #34A853; color: white; border: none; border-radius: 4px; cursor: pointer;">Street View</button>
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      // Global functions for info window buttons
      (window as any).getDirections = (placeId: string) => {
        const mosque = mosques.find(m => m.place_id === placeId);
        if (mosque) onDirections(mosque);
      };

      (window as any).openStreetView = (placeId: string) => {
        const mosque = mosques.find(m => m.place_id === placeId);
        if (mosque) onStreetView(mosque);
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
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Corrected useEffect to trigger mosque search once location and maps are ready
  useEffect(() => {
    if (userLocation && mapsLoaded) {
      setLoading(true);
      findNearbyMosques(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, mapsLoaded]);

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
        () => {
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const findNearbyMosques = async (lat: number, lng: number) => {
    try {
      const { Place } = await window.google.maps.importLibrary('places') as google.maps.PlacesLibrary;
      
      const request = {
        textQuery: 'mosque',
        fields: ['displayName', 'location', 'formattedAddress', 'rating', 'regularOpeningHours', 'photos', 'id'],
        locationBias: {
          center: { lat, lng },
          radius: 8047,
        },
        maxResultCount: 20,
      };

      const { places } = await Place.searchByText(request);
      
      if (places && places.length > 0) {
        const mosqueData: Mosque[] = places.map((place) => ({
          place_id: place.id!,
          name: place.displayName || 'Mosque',
          formatted_address: place.formattedAddress || 'Address not available',
          geometry: {
            location: {
              lat: place.location!.lat(),
              lng: place.location!.lng(),
            },
          },
          rating: place.rating || undefined,
          isOpen: undefined,
          photos: place.photos?.slice(0, 1).map(photo => photo.getURI({ maxWidth: 400, maxHeight: 300 })),
          distance: calculateDistance(lat, lng, place.location!.lat(), place.location!.lng()),
        }));

        setMosques(mosqueData.sort((a, b) => (a.distance || 0) - (b.distance || 0)));
      } else {
        setMosques([]);
      }
    } catch (error) {
      console.error('Error finding mosques:', error);
      setError('Failed to load nearby mosques. Please try again.');
    } finally {
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
    return <div className="error">Google Maps API key is required. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.</div>;
  }

  if (loading) {
    return <div className="loading">🔍 Finding nearby mosques...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={getCurrentLocation} className="btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="mosque-locator">
      {userLocation && (
        <Wrapper 
          apiKey={GOOGLE_MAPS_API_KEY} 
          libraries={['places']}
          callback={() => setMapsLoaded(true)}
        >
          <GoogleMapComponent
            center={userLocation}
            zoom={13}
            mosques={mosques}
            onDirections={getDirections}
            onStreetView={openStreetView}
          />
        </Wrapper>
      )}

      <div className="mosque-list">
        <h3>🕌 Nearby Mosques ({mosques.length} found)</h3>
        {mosques.length === 0 ? (
          <p>No mosques found in your area. Try expanding your search radius.</p>
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