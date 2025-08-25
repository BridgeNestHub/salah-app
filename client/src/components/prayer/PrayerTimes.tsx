import React, { useState, useEffect } from 'react';
import '../../types/google-maps.ts';
import { athanService } from '../../services/athanNotification';
import '../../styles/athan-notification.css';

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerData {
  timings: PrayerTimings;
  date: {
    hijri: {
      day: string;
      month: { en: string };
      year: string;
    };
    gregorian: {
      weekday: { en: string };
      day: string;
      month: { en: string };
      year: string;
    };
  };
}

const PrayerTimes: React.FC = () => {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const iqamaOffsets = {
    Fajr: 16,
    Dhuhr: 21,
    Asr: 18,
    Maghrib: 9,
    Isha: 15
  };

  useEffect(() => {
    initializeLocation();
    checkAudioStatus();
    
    // Check audio status periodically
    const interval = setInterval(checkAudioStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const checkAudioStatus = () => {
    // Check if audio is enabled
    const isEnabled = athanService.isAudioEnabled;
    setAudioEnabled(isEnabled);
  };

  const enableAudio = async () => {
    try {
      const success = await athanService.testAthansound();
      setAudioEnabled(success);
      if (!success) {
        alert('❌ Audio blocked by browser. Please:\n1. Enable sound in browser settings\n2. Make sure device is not on silent mode\n3. Try refreshing the page');
      }
    } catch (error) {
      console.error('Failed to enable audio:', error);
      setAudioEnabled(false);
    }
  };

  const initializeLocation = async () => {
    // Check if user previously granted location permission
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      setLocationPermission(permission.state);
      
      if (permission.state === 'granted') {
        getUserLocation();
      } else {
        // Use Google Maps to get approximate location based on IP
        getApproximateLocation();
      }
    } else {
      // Fallback for browsers without permissions API
      getUserLocation();
    }
  };

  const getApproximateLocation = () => {
    // Get user's approximate location based on IP
    fetch('/api/location/ip-location')
      .then(response => response.json())
      .then(data => {
        const city = `${data.city}, ${data.region}, ${data.country_name}`;
        setLocation(city);
        fetchPrayerTimes(city);
      })
      .catch(() => {
        // Ultimate fallback - major US city
        setLocation('New York, NY, USA');
        fetchPrayerTimes('New York, NY, USA');
      });
  };





  const fetchPrayerTimes = async (city: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/prayer/times/city?city=${encodeURIComponent(city)}&method=2`
      );
      const data = await response.json();
      setPrayerData(data.data);
      setLocation(city);
      
      // Schedule Athan notifications
      if (data.data?.timings) {
        athanService.scheduleAthanNotifications(data.data.timings);
      }
      
      // Update audio status after scheduling
      setTimeout(checkAudioStatus, 100);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get formatted address using backend geocoding service
          try {
            const response = await fetch(`/api/maps/geocode?lat=${latitude}&lng=${longitude}`);
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results[0]) {
              const components = data.results[0].address_components;
              const city = components.find((c: any) => c.types.includes('locality'))?.long_name ||
                          components.find((c: any) => c.types.includes('sublocality'))?.long_name ||
                          components.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name;
              const state = components.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name;
              const zipcode = components.find((c: any) => c.types.includes('postal_code'))?.long_name;
              const country = components.find((c: any) => c.types.includes('country'))?.long_name;
              
              const locationParts = [city, state, zipcode, country].filter(Boolean);
              const address = locationParts.join(', ');
              setLocation(address);
            } else {
              setLocation('Current Location');
            }
          } catch (error) {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          
          fetchPrayerTimesByCoords(latitude, longitude);
          
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
          getApproximateLocation();
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000 // 1 minute cache for more accurate location
        }
      );
    }
  };

  const fetchPrayerTimesByCoords = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `/api/prayer/times?latitude=${latitude}&longitude=${longitude}&method=2`
      );
      const data = await response.json();
      setPrayerData(data.data);
      
      // Schedule Athan notifications
      if (data.data?.timings) {
        athanService.scheduleAthanNotifications(data.data.timings);
      }
      
      // Update audio status after scheduling
      setTimeout(checkAudioStatus, 100);
      
      // Don't update location if it's already set by geocoder
      if (!location || location.includes(',')) {
        // Keep existing location or set a generic one
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertTo12HourFormat = (time24: string): string => {
    if (!time24) return '--:--';
    
    const [hours, minutes] = time24.split(':').map(Number);
    let period = 'AM';
    let hours12 = hours;
    
    if (hours >= 12) {
      period = 'PM';
      hours12 = hours > 12 ? hours - 12 : hours;
    }
    
    if (hours12 === 0) {
      hours12 = 12;
    }
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const calculateIqamaTime = (athanTime: string, offsetMinutes: number): string => {
    if (!athanTime) return '';
    
    const [hours, minutes] = athanTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + offsetMinutes;
    
    let iqamaHours = Math.floor(totalMinutes / 60) % 24;
    const iqamaMinutes = totalMinutes % 60;
    
    return `${iqamaHours.toString().padStart(2, '0')}:${iqamaMinutes.toString().padStart(2, '0')}`;
  };

  if (!prayerData) {
    return <div className="loading">Loading prayer times...</div>;
  }

  const prayers = [
    { name: 'Fajr', time: prayerData.timings.Fajr, iqamaOffset: iqamaOffsets.Fajr },
    { name: 'Sunrise', time: prayerData.timings.Sunrise, isSunrise: true },
    { name: 'Dhuhr', time: prayerData.timings.Dhuhr, iqamaOffset: iqamaOffsets.Dhuhr },
    { name: 'Asr', time: prayerData.timings.Asr, iqamaOffset: iqamaOffsets.Asr },
    { name: 'Maghrib', time: prayerData.timings.Maghrib, iqamaOffset: iqamaOffsets.Maghrib },
    { name: 'Isha', time: prayerData.timings.Isha, iqamaOffset: iqamaOffsets.Isha }
  ];

  return (
    <div className="prayer-times-container">
      <div className="location-info">
        <div className="location-input-container">
          <input
            id="location-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputValue = (e.target as HTMLInputElement).value;
                if (inputValue.trim()) {
                  setLocation(inputValue);
                  fetchPrayerTimes(inputValue);
                }
              }
            }}
            placeholder="Enter city, state, or address"
            className="location-input"
          />
          <button 
            onClick={getUserLocation} 
            disabled={loading}
            className="location-btn"
            title="Use precise GPS location"
          >
            {loading ? 'Locating...' : '📍 Use My Location'}
          </button>
        </div>
        {locationPermission === 'denied' && (
          <p className="location-note">
            Location access denied. Please type your city or enable location in browser settings.
          </p>
        )}
        {audioEnabled && (
          <p className="audio-status" style={{ color: '#28a745', fontSize: '14px', margin: '5px 0' }}>
            ✅ Prayer call notifications enabled
          </p>
        )}
      </div>

      <div className="date-display">
        <div>{prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year} AH</div>
        <div>{prayerData.date.gregorian.weekday.en}, {prayerData.date.gregorian.day} {prayerData.date.gregorian.month.en} {prayerData.date.gregorian.year}</div>
      </div>

      {!audioEnabled && (
        <div className="audio-enable-banner" style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px',
          margin: '15px 0',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
            🔔 Enable prayer call notifications
          </p>
          <button 
            onClick={enableAudio}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔊 Enable Sound
          </button>
        </div>
      )}



      <div className="prayer-times-grid">
        {prayers.map((prayer, index) => (
          <div key={prayer.name} className="prayer-time-card">
            <div className="prayer-name">{prayer.name}</div>
            {prayer.isSunrise ? (
              <div className="prayer-time">{convertTo12HourFormat(prayer.time)}</div>
            ) : (
              <div className="prayer-times">
                <div className="athan-time">
                  <span className="time-label">Athan:</span>
                  <span className="time-value">{convertTo12HourFormat(prayer.time)}</span>
                </div>
                {prayer.iqamaOffset && (
                  <div className="iqama-time">
                    <span className="time-label">Iqama:</span>
                    <span className="time-value">
                      {convertTo12HourFormat(calculateIqamaTime(prayer.time, prayer.iqamaOffset))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerTimes;