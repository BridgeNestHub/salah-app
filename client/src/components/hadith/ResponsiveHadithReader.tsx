import React, { useState, useEffect } from 'react';
import ModernHadithReader from './ModernHadithReader';
import MobileHadithReader from './MobileHadithReader';

const ResponsiveHadithReader: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      
      // Also check screen size
      const isMobileScreen = window.innerWidth <= 768;
      
      // Check for touch capability
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileUserAgent || (isMobileScreen && isTouchDevice));
    };

    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force mobile view for testing (remove in production)
  const forceView = new URLSearchParams(window.location.search).get('view');
  if (forceView === 'mobile') {
    return <MobileHadithReader />;
  }
  if (forceView === 'desktop') {
    return <ModernHadithReader />;
  }

  return isMobile ? <MobileHadithReader /> : <ModernHadithReader />;
};

export default ResponsiveHadithReader;