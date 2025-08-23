export interface Mosque {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number | null;
  isOpen?: boolean;
  photos?: string[];
  distance?: number;
}

export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}