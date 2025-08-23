import React, { useState, useEffect } from 'react';
import './QiblaCompass.css';

interface Coordinates {
  latitude: number;
  longitude: number;
}

const KAABA_LAT = 21.4224779;
const KAABA_LNG = 39.8251832;

const QiblaCompass: React.FC = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    getLocation();
    setupCompass();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        calculateQibla(coords);
        setLoading(false);
      },
      () => {
        setError('Location access denied');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const calculateQibla = (coords: Coordinates) => {
    const lat1 = coords.latitude * Math.PI / 180;
    const lng1 = coords.longitude * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const lng2 = KAABA_LNG * Math.PI / 180;

    const dLng = lng2 - lng1;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    setQiblaDirection(bearing);
  };

  const setupCompass = async () => {
    const desktop = !('ontouchstart' in window);
    setIsDesktop(desktop);
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        const heading = desktop ? event.alpha : 360 - event.alpha;
        setDeviceHeading(heading);
      }
    };

    // Try to get compass permission for all devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
          window.addEventListener('deviceorientation', handleOrientation as EventListener);
        }
      } catch (error) {
        console.log('Compass permission denied');
      }
    } else {
      // For desktop and Android
      window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
      window.addEventListener('deviceorientation', handleOrientation as EventListener);
    }
  };

  const compassRotation = deviceHeading ? qiblaDirection - deviceHeading : qiblaDirection;

  return (
    <div className="qibla-container">
      {loading && <div className="loading">📍 Getting your location...</div>}
      {error && <div className="error-msg">⚠️ {error}</div>}
      
      {location && (
        <>
          <div className="compass-wrapper">
            <div className="compass-circle">
              <div className="compass-marks">
                <div className="mark north">N</div>
                <div className="mark east">E</div>
                <div className="mark south">S</div>
                <div className="mark west">W</div>
              </div>
              
              <div className="degree-marks">
                {Array.from({ length: 36 }, (_, i) => {
                  const angle = i * 10;
                  const isMajor = angle % 30 === 0;
                  return (
                    <div key={angle}>
                      <div 
                        className={`degree-mark ${isMajor ? 'major' : ''}`}
                        style={{
                          transform: `rotate(${angle}deg) translateY(-140px)`,
                          left: '50%',
                          top: '50%',
                          marginLeft: isMajor ? '-1.5px' : '-1px'
                        }}
                      />
                      {isMajor && angle !== 0 && angle !== 90 && angle !== 180 && angle !== 270 && (
                        <div 
                          className="degree-number"
                          style={{
                            left: `${50 + 35 * Math.sin(angle * Math.PI / 180)}%`,
                            top: `${50 - 35 * Math.cos(angle * Math.PI / 180)}%`
                          }}
                        >
                          {angle}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div 
                className="qibla-needle"
                style={{ transform: `rotate(${compassRotation}deg)` }}
              >
                <div className="needle-tip">🕋</div>
              </div>
              
              <div className="compass-center"></div>
              <div className="degree-display">{Math.round(qiblaDirection)}°</div>
            </div>
          </div>

          <div className="info-panel">
            <div className="info-item">
              <span className="label">Qibla Direction:</span>
              <span className="value">{Math.round(qiblaDirection)}°</span>
            </div>
            <div className="info-item">
              <span className="label">Your Location:</span>
              <span className="value">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
            </div>
          </div>

          <div className="controls">
            <button onClick={getLocation} className="refresh-btn">
              🔄 Refresh Location
            </button>
            <button onClick={setupCompass} className="refresh-btn">
              🧭 Enable Compass
            </button>
          </div>
          
          {deviceHeading !== 0 && (
            <div className="compass-status">
              Device heading: {Math.round(deviceHeading)}°
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QiblaCompass;