import React, { useState, useEffect, useRef } from 'react';
import './QiblaCompass.css';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Extend DeviceOrientationEvent for iOS Safari
interface ExtendedDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

// Precise Kaaba coordinates (verified from multiple Islamic sources)
const KAABA_LAT = 21.4224779;
const KAABA_LNG = 39.8251832;

const QiblaCompass: React.FC = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [compassCalibrated, setCompassCalibrated] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  
  // Smoothing for compass readings
  const headingHistory = useRef<number[]>([]);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    initializeQibla();
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener);
      window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    };
  }, []);

  const initializeQibla = async () => {
    try {
      await getLocation();
      await setupCompass();
    } catch (err) {
      setError('Failed to initialize Qibla compass');
      setLoading(false);
    }
  };

  const getLocation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      // Use high accuracy and watch position for better results
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(coords);
          setAccuracy(position.coords.accuracy || 0);
          const { bearing, distance } = calculateQiblaAndDistance(coords);
          setQiblaDirection(bearing);
          setDistance(distance);
          setLoading(false);
          resolve();
        },
        (err) => {
          setError('Location access denied. Please enable location services.');
          setLoading(false);
          reject(err);
        },
        { 
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    });
  };

  // Advanced Qibla calculation using spherical trigonometry
  const calculateQiblaAndDistance = (coords: Coordinates) => {
    const lat1 = toRadians(coords.latitude);
    const lng1 = toRadians(coords.longitude);
    const lat2 = toRadians(KAABA_LAT);
    const lng2 = toRadians(KAABA_LNG);

    const dLng = lng2 - lng1;

    // Calculate bearing using spherical trigonometry
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = Math.atan2(y, x);
    bearing = toDegrees(bearing);
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    // Calculate distance using Haversine formula
    const R = 3959; // Earth's radius in miles
    const dLat = lat2 - lat1;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return { bearing, distance };
  };

  const setupCompass = async (): Promise<void> => {
    return new Promise(async (resolve) => {
      // Request permission for iOS devices
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const response = await (DeviceOrientationEvent as any).requestPermission();
          if (response !== 'granted') {
            setError('Compass permission denied. Please allow sensor access.');
            resolve();
            return;
          }
        } catch (error) {
          setError('Compass not available on this device');
          resolve();
          return;
        }
      }

      // Add event listeners for compass
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.addEventListener('deviceorientation', handleOrientation as EventListener, true);
      
      setTimeout(() => setCompassCalibrated(true), 1000);
      resolve();
    });
  };

  const handleOrientation = (event: Event) => {
    const orientationEvent = event as ExtendedDeviceOrientationEvent;
    let heading = 0;

    if (orientationEvent.webkitCompassHeading !== undefined) {
      // iOS Safari
      heading = orientationEvent.webkitCompassHeading;
    } else if (orientationEvent.alpha !== null) {
      // Android Chrome and others
      heading = 360 - orientationEvent.alpha;
    }

    // Smooth the heading to reduce jitter
    const smoothedHeading = smoothHeading(heading);
    setDeviceHeading(smoothedHeading);
  };

  // 5-point moving average for smooth compass movement
  const smoothHeading = (newHeading: number): number => {
    headingHistory.current.push(newHeading);
    if (headingHistory.current.length > 5) {
      headingHistory.current.shift();
    }

    // Handle circular averaging for compass headings
    let sumSin = 0;
    let sumCos = 0;
    
    headingHistory.current.forEach(heading => {
      sumSin += Math.sin(toRadians(heading));
      sumCos += Math.cos(toRadians(heading));
    });

    const avgHeading = Math.atan2(sumSin / headingHistory.current.length, 
                                  sumCos / headingHistory.current.length);
    return (toDegrees(avgHeading) + 360) % 360;
  };

  const toRadians = (degrees: number): number => degrees * Math.PI / 180;
  const toDegrees = (radians: number): number => radians * 180 / Math.PI;

  // Calculate the rotation for the Qibla needle
  const qiblaRotation = compassCalibrated ? qiblaDirection - deviceHeading : qiblaDirection;

  const getDirectionText = (): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(qiblaDirection / 22.5) % 16;
    return directions[index];
  };

  const formatDistance = (dist: number): string => {
    if (dist < 1) {
      // Convert to feet for very short distances
      const feet = Math.round(dist * 5280);
      return `${feet} ft`;
    } else if (dist < 1000) {
      return `${Math.round(dist)} mi`;
    } else {
      return `${(dist / 1000).toFixed(1)}K mi`;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div>
            <p className="loading-text-large">📍 Locating your position...</p>
            <p className="loading-text-medium">🧭 Initializing compass...</p>
            <p className="loading-text-small">Please ensure location and motion sensors are enabled</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3 className="error-title">⚠️ Compass Error</h3>
          <p className="error-message">{error}</p>
          <button 
            onClick={initializeQibla} 
            className="retry-button"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qibla-main-container">
      {/* Header */}
      <div className="qibla-header">
        {/* <h1 className="qibla-title">
          🕋 Qibla Compass
        </h1> */}
        <div className={`calibration-status ${compassCalibrated ? 'status-active' : 'status-calibrating'}`}>
          {compassCalibrated ? (
            <span>🧭 Compass Active</span>
          ) : (
            <span>📱 Calibrating compass...</span>
          )}
        </div>
      </div>

      {/* Compass */}
      <div className="compass-container">
        <div className="compass-wrapper">
          {/* Main compass circle */}
          <div className="compass-circle">
            
            {/* Degree markings */}
            <div className="degree-markings">
              {Array.from({ length: 72 }, (_, i) => {
                const angle = i * 5;
                const isMajor = angle % 30 === 0;
                const isCardinal = angle % 90 === 0;
                
                return (
                  <div
                    key={angle}
                    className={`degree-mark ${
                      isCardinal 
                        ? 'degree-mark-cardinal' 
                        : isMajor 
                        ? 'degree-mark-major'
                        : 'degree-mark-small'
                    }`}
                    style={{ 
                      transform: `rotate(${angle}deg)` 
                    }}
                  />
                );
              })}
            </div>

            {/* Cardinal directions */}
            <div className="cardinal-directions">
              <div className="cardinal-direction cardinal-north">N</div>
              <div className="cardinal-direction cardinal-east">E</div>
              <div className="cardinal-direction cardinal-south">S</div>
              <div className="cardinal-direction cardinal-west">W</div>
            </div>

            {/* Qibla needle */}
            <div 
              className="qibla-needle"
              style={{ 
                transform: `translate(-50%, -100%) rotate(${qiblaRotation}deg)`
              }}
            >
              {/* Needle line */}
              <div className="needle-line"></div>
              
              {/* Kaaba icon at the tip */}
              <div className="kaaba-icon">
                🕋
              </div>
            </div>

            {/* Center point */}
            <div className="compass-center"></div>
          </div>
        </div>
      </div>

      {/* Information cards */}
      <div className="info-cards">
        <div className="info-card">
          <div className="info-label">🕋 Qibla Direction</div>
          <div className="info-value">
            {Math.round(qiblaDirection)}° {getDirectionText()}
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-label">📏 Distance to Kaaba</div>
          <div className="info-value">
            {formatDistance(distance)}
          </div>
        </div>
        
        {location && (
          <div className="info-card">
            <div className="info-label">📍 Your Location</div>
            <div className="info-value-small">
              {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
            </div>
            {accuracy > 0 && (
              <div className="accuracy-text">
                Accuracy: ±{Math.round(accuracy * 3.28084)}ft
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="instructions-container">
        <p className="instructions-main">
          🔄 Hold your device flat and point the Kaaba symbol towards Mecca
        </p>
        {!compassCalibrated && (
          <p className="instructions-calibration">
            📱 Move your device in a figure-8 pattern to calibrate the compass
          </p>
        )}
        <div className="instructions-tip">
          For best accuracy, hold your device horizontally and away from magnetic interference
        </div>
      </div>
    </div>
  );
};

export default QiblaCompass;