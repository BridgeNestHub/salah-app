import React, { useState, useEffect, useRef } from 'react';
import { LocalStorage } from '../../utils/localStorage';
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
  const [showPermissionButton, setShowPermissionButton] = useState<boolean>(false);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [compassEnabled, setCompassEnabled] = useState<boolean>(false);
  
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
      // Check if we have saved location first
      const savedCoords = LocalStorage.getLastCoords();
      if (savedCoords && LocalStorage.getLocationPermissionGranted()) {
        const coords = {
          latitude: savedCoords.lat,
          longitude: savedCoords.lng
        };
        setLocation(coords);
        const { bearing, distance } = calculateQiblaAndDistance(coords);
        setQiblaDirection(bearing);
        setDistance(distance);
        setLoading(false);
        resolve();
        return;
      }
      
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
          LocalStorage.setLastCoords({ lat: coords.latitude, lng: coords.longitude });
          LocalStorage.setLocationPermissionGranted(true);
          setAccuracy(position.coords.accuracy || 0);
          const { bearing, distance } = calculateQiblaAndDistance(coords);
          setQiblaDirection(bearing);
          setDistance(distance);
          setLoading(false);
          resolve();
        },
        (err) => {
          LocalStorage.setLocationPermissionGranted(false);
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
      let permissionGranted = false;
      
      // Check if DeviceOrientationEvent is available
      if (!window.DeviceOrientationEvent) {
        // Fallback to manual compass for devices without orientation sensors
        setError('');
        setCompassCalibrated(true);
        resolve();
        return;
      }

      // For iOS 13+ devices, request permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          // First try to request permission
          const response = await (DeviceOrientationEvent as any).requestPermission();
          if (response === 'granted') {
            permissionGranted = true;
            setCompassEnabled(true);
            setShowPermissionButton(false);
          } else {
            setError('Motion & orientation access is required for the compass to work.');
            setShowPermissionButton(true);
            resolve();
            return;
          }
        } catch (error) {
          // If requestPermission fails, show permission button
          console.log('Permission request failed, showing manual permission button');
          setError('Tap "Enable Compass" to allow motion & orientation access.');
          setShowPermissionButton(true);
          resolve();
          return;
        }
      } else {
        // For Android and older iOS versions, no permission needed
        permissionGranted = true;
      }

      if (permissionGranted) {
        // Test if orientation events actually work
        let orientationDetected = false;
        
        const testOrientation = (event: Event) => {
          const orientationEvent = event as DeviceOrientationEvent;
          if (orientationEvent.alpha !== null || orientationEvent.beta !== null || orientationEvent.gamma !== null) {
            orientationDetected = true;
          }
        };

        // Add test listener
        window.addEventListener('deviceorientationabsolute', testOrientation, { passive: true } as AddEventListenerOptions);
        window.addEventListener('deviceorientation', testOrientation, { passive: true } as AddEventListenerOptions);

        // Wait for orientation data or timeout
        setTimeout(() => {
          window.removeEventListener('deviceorientationabsolute', testOrientation);
          window.removeEventListener('deviceorientation', testOrientation);
          
          if (orientationDetected) {
            // Orientation is working, add real listeners
            window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, { passive: true } as AddEventListenerOptions);
            window.addEventListener('deviceorientation', handleOrientation as EventListener, { passive: true } as AddEventListenerOptions);
            
            setTimeout(() => setCompassCalibrated(true), 1500);
          } else {
            // Orientation not detected, switch to manual mode
            console.log('Orientation events not detected, switching to manual mode');
            setIsManualMode(true);
            setCompassCalibrated(true);
          }
          
          resolve();
        }, 2000);
      }
    });
  };

  const handleOrientation = (event: Event) => {
    const orientationEvent = event as ExtendedDeviceOrientationEvent;
    let heading = 0;
    let hasValidHeading = false;

    // iOS Safari - webkitCompassHeading is most accurate
    if (orientationEvent.webkitCompassHeading !== undefined && orientationEvent.webkitCompassHeading !== null) {
      heading = orientationEvent.webkitCompassHeading;
      hasValidHeading = true;
    }
    // iOS Safari fallback - use alpha with correction
    else if (orientationEvent.alpha !== null && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      heading = orientationEvent.alpha;
      hasValidHeading = true;
    }
    // Android Chrome and other browsers
    else if (orientationEvent.alpha !== null) {
      heading = 360 - orientationEvent.alpha;
      hasValidHeading = true;
    }

    if (hasValidHeading) {
      // Ensure heading is positive and within 0-360 range
      heading = ((heading % 360) + 360) % 360;
      
      // Smooth the heading to reduce jitter
      const smoothedHeading = smoothHeading(heading);
      setDeviceHeading(smoothedHeading);
      
      // Mark compass as calibrated if we're getting valid readings
      if (!compassCalibrated) {
        setCompassCalibrated(true);
      }
    }
  };

  // Function to request permissions manually
  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setError('');
          setCompassEnabled(true);
          setShowPermissionButton(false);
          setupCompass();
        } else {
          setError('Please allow motion & orientation access in Safari settings to use the compass feature.');
        }
      } catch (error) {
        setError('Unable to request compass permission. Please check your browser settings.');
      }
    } else {
      // For non-iOS devices, just reinitialize
      setError('');
      initializeQibla();
    }
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
  const qiblaRotation = (compassCalibrated && !isManualMode) ? qiblaDirection - deviceHeading : qiblaDirection;

  const getDirectionText = (): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(qiblaDirection / 22.5) % 16;
    return directions[index];
  };

  const formatDistance = (dist: number): string => {
    if (dist < 1000) {
      return `${Math.round(dist)} miles`;
    } else {
      return `${(dist / 1000).toFixed(1)}K miles`;
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
          <h3 className="error-title">⚠️ Compass Access</h3>
          <p className="error-message">{error}</p>
          
          {showPermissionButton ? (
            <div>
              <button 
                onClick={requestCompassPermission} 
                className="retry-button"
                style={{ marginBottom: '12px' }}
              >
                🧭 Enable Compass
              </button>
              <button 
                onClick={() => {
                  setError('');
                  setIsManualMode(true);
                  setCompassCalibrated(true);
                  setShowPermissionButton(false);
                }} 
                className="retry-button"
                style={{ backgroundColor: '#6b7280', marginBottom: '12px' }}
              >
                📍 Use Manual Mode
              </button>
              <button 
                onClick={initializeQibla} 
                className="retry-button"
                style={{ backgroundColor: '#374151' }}
              >
                🔄 Try Again
              </button>
            </div>
          ) : (
            <button 
              onClick={initializeQibla} 
              className="retry-button"
            >
              🔄 Try Again
            </button>
          )}
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
            <span>{isManualMode ? '🧭 Manual Mode' : '🧭 Compass Active'}</span>
          ) : (
            <span>📱 Initializing...</span>
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
          <div className="info-label">🧭 Qibla Direction</div>
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
        
        {/* iOS-specific instructions */}
        {/iPad|iPhone|iPod/.test(navigator.userAgent) && (
          <div className="instructions-tip" style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <strong style={{ color: '#fbbf24' }}>📱 iOS Users:</strong>
            <br />• Allow Motion & Orientation access when prompted
            <br />• If compass isn't working, go to Settings → Safari → Motion & Orientation Access → Enable
            <br />• Make sure "Location Services" is enabled in Settings
          </div>
        )}
        
        <div className="instructions-tip">
          For best accuracy, hold your device horizontally and away from magnetic interference
        </div>
      </div>
    </div>
  );
};

export default QiblaCompass;