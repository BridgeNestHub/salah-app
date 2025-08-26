export const LocalStorage = {
  // Audio settings
  getAudioEnabled: (): boolean => {
    return localStorage.getItem('audioEnabled') === 'true';
  },
  setAudioEnabled: (enabled: boolean): void => {
    localStorage.setItem('audioEnabled', enabled.toString());
  },

  // Location settings
  getLastLocation: (): string | null => {
    return localStorage.getItem('lastLocation');
  },
  setLastLocation: (location: string): void => {
    localStorage.setItem('lastLocation', location);
  },

  // Coordinates
  getLastCoords: (): {lat: number, lng: number} | null => {
    const coords = localStorage.getItem('lastCoords');
    return coords ? JSON.parse(coords) : null;
  },
  setLastCoords: (coords: {lat: number, lng: number}): void => {
    localStorage.setItem('lastCoords', JSON.stringify(coords));
  },

  // Location permission preference
  getLocationPermissionGranted: (): boolean => {
    return localStorage.getItem('locationPermissionGranted') === 'true';
  },
  setLocationPermissionGranted: (granted: boolean): void => {
    localStorage.setItem('locationPermissionGranted', granted.toString());
  },

  // Search radius for mosque locator
  getSearchRadius: (): number => {
    const radius = localStorage.getItem('searchRadius');
    return radius ? parseInt(radius) : 8047; // Default 5 miles
  },
  setSearchRadius: (radius: number): void => {
    localStorage.setItem('searchRadius', radius.toString());
  }
};