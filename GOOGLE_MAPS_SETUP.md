# Google Maps Mosque Locator Setup

## Overview
The mosque locator has been upgraded to use Google Maps for enhanced functionality:

- **Enhanced mosque search** using Google Places API
- **Turn-by-turn directions** to mosques via Google Maps
- **Street view** of mosque locations

## Installation

1. Install the new dependencies:
```bash
cd client
npm install @googlemaps/react-wrapper @googlemaps/js-api-loader @types/google.maps
```

2. The Google Maps API key is already configured in `.env`:
```
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyCWbIl53i6ALouNiduvVkOIUiQjchDZCTE
```

## Features

### Enhanced Search
- Uses Google Places API for accurate mosque data
- Includes ratings, opening hours, and photos
- Better address information and location accuracy

### Directions
- Click "Directions" button on any mosque
- Opens Google Maps with turn-by-turn navigation
- Works on both mobile and desktop

### Street View
- Click "Street View" button to see mosque exterior
- Helps users identify the correct building
- Provides visual context of the location

## API Requirements

Ensure your Google Maps API key has these APIs enabled:
- Maps JavaScript API
- Places API
- Directions API
- Street View Static API

## Usage

The component automatically:
1. Gets user's current location
2. Searches for nearby mosques within 5 miles
3. Displays results on interactive Google Map
4. Provides action buttons for directions and street view

## Mobile Optimization

- Responsive design for mobile devices
- Touch-friendly buttons and interface
- Optimized for both portrait and landscape modes