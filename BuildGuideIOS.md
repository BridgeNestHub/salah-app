# iOS Prayer App Build Guide

## Backend Architecture Overview

### Technology Stack
- **Backend Framework**: Node.js with Express.js and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing
- **API Structure**: RESTful API endpoints

### Database Schema
```typescript
// Core Collections
- Users: User accounts with profiles and preferences
- Mosques: Mosque locations with verification status  
- QuranVerses: Quran verses with translations
- Hadith: Hadith collections with authenticity grades
- ContactSubmissions: User contact form submissions
- Events: Islamic events and community activities
- Notifications: Push notifications and alerts
```

### API Base URL
- Development: `http://localhost:8000/api`
- Production: Your deployed backend URL

## Authentication & User Management

### Authentication Method
- **JWT Tokens** with 7-day expiration
- **Role-based Access Control (RBAC)**:
  - `user`: Basic access to public features
  - `staff`: Content management and mosque verification
  - `admin`: Full system access and user management

### User Model Structure
```typescript
interface User {
  _id: string;
  email: string;
  password: string; // bcrypt hashed
  role: 'user' | 'staff' | 'admin';
  profile: {
    name: string;
    location: {
      latitude: number;
      longitude: number;
      city: string;
      country: string;
    };
    preferences: {
      calculationMethod: string; // Default: 'MWL'
      madhab: string; // Default: 'Shafi'
      notifications: boolean; // Default: true
    };
  };
  isActive: boolean;
  lastLogin?: Date;
}
```

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
```

## Feature-Specific Implementation

### 1. Prayer Times

#### External API Used
- **Aladhan API**: `https://api.aladhan.com/v1`
- **Calculation Methods**: Multiple methods supported (MWL, ISNA, etc.)

#### Key Endpoints
```
GET /api/prayer/times?latitude={lat}&longitude={lng}&method={method}
GET /api/prayer/times/city?city={city}&country={country}&method={method}
GET /api/prayer/hijri-date?date={dd-mm-yyyy}
```

#### iOS Implementation Notes
- Use Core Location for GPS coordinates
- Cache prayer times locally using Core Data
- Support offline mode with cached data
- Implement background refresh for daily updates

### 2. Mosques

#### Data Sources
- **User-submitted mosques** stored in MongoDB
- **Google Places API** integration for additional mosque data
- **Verification system** by staff members

#### Mosque Model
```typescript
interface Mosque {
  _id: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  contact: {
    phone?: string;
    website?: string;
  };
  verified: boolean;
  addedBy: string;
}
```

#### Key Endpoints
```
GET /api/mosques/nearby?lat={lat}&lng={lng}&radius={km}
POST /api/mosques - Add new mosque (requires auth)
PUT /api/mosques/{id} - Update mosque (staff/admin only)
```

#### iOS Implementation Notes
- Use MapKit for displaying mosque locations
- Implement location-based search with radius
- Allow users to add new mosques
- Show verification status with badges

### 3. Qibla Direction

#### Implementation
- **Client-side calculation** using GPS coordinates
- **Kaaba coordinates**: `21.4224779, 39.8251832`
- **Formula**: Great circle bearing calculation

#### iOS Implementation Notes
- Use Core Location and Core Motion
- Implement compass view with smooth animations
- Handle magnetic declination
- Provide visual feedback for accuracy

### 4. Hadith Content

#### Data Sources
- **Multiple APIs with fallback strategy**:
  1. HadithAPI.com (Primary - requires API key)
  2. Sunnah.com API (Secondary - requires API key)
  3. Alternative free APIs (Fallback)

#### API Keys Required
```
HADITH_API_KEY=your_hadithapi_key_here
SUNNAH_API_KEY=your_sunnah_key_here
```

#### Hadith Model
```typescript
interface Hadith {
  id: string;
  collection: string; // bukhari, muslim, tirmidhi, etc.
  book: string;
  chapter: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string; // Sahih, Hasan, etc.
  reference: string;
}
```

#### Available Collections
- Sahih Bukhari (7,563 hadiths)
- Sahih Muslim (7,190 hadiths)
- Jami at-Tirmidhi (3,956 hadiths)
- Sunan Abu Dawud (5,274 hadiths)
- Sunan Ibn Majah (4,341 hadiths)
- Sunan an-Nasai (5,761 hadiths)

#### Key Endpoints
```
GET /api/hadith/collections - Get all collections
GET /api/hadith/search?q={query}&collection={collection}
GET /api/hadith/random?collection={collection}
GET /api/hadith/{id} - Get specific hadith
```

#### iOS Implementation Notes
- Implement search functionality with caching
- Support Arabic text display with proper fonts
- Provide bookmarking feature
- Enable sharing functionality

### 5. Quran Verses

#### Content Management
- **Staff-managed content** stored in MongoDB
- **Featured verses** system for daily highlights
- **Multiple translations** support

#### QuranVerse Model
```typescript
interface QuranVerse {
  _id: string;
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  transliteration: string;
  featured: boolean;
  addedBy: string;
}
```

#### Key Endpoints
```
GET /api/quran/verses/featured - Get featured verses
GET /api/quran/verses/random - Get random verse
GET /api/quran/verses/search?q={query}
```

### 6. Events

#### Event Management
- **Admin/Staff created events**
- **Multiple event types** supported
- **Location-based events**

#### Event Types
```typescript
type EventType = 
  | 'islamic_holiday'
  | 'community_event' 
  | 'educational'
  | 'community_services'
  | 'youth_sports'
  | 'faith_programs'
  | 'social_justice'
  | 'health_advocacy'
  | 'mental_health'
  | 'youth_education';
```

#### Key Endpoints
```
GET /api/events - Get all active events
GET /api/events/upcoming - Get upcoming events
GET /api/events/nearby?lat={lat}&lng={lng}
```

## iOS Development Setup

### Required Dependencies
```swift
// Core iOS Frameworks
import SwiftUI
import CoreData
import CoreLocation
import MapKit
import UserNotifications
import Network

// Third-party (if needed)
// Alamofire for networking
// SDWebImage for image caching
```

### Core Data Model
Create entities matching the backend models:
- User
- Mosque
- PrayerTime
- Hadith
- QuranVerse
- Event

### Network Layer Structure
```swift
// APIService.swift
class APIService {
    static let shared = APIService()
    private let baseURL = "http://localhost:8000/api"
    
    // Authentication
    func login(email: String, password: String) async throws -> User
    func register(user: UserRegistration) async throws -> User
    
    // Prayer Times
    func getPrayerTimes(lat: Double, lng: Double) async throws -> PrayerTimes
    
    // Mosques
    func getNearbyMosques(lat: Double, lng: Double) async throws -> [Mosque]
    
    // Hadith
    func searchHadiths(query: String) async throws -> [Hadith]
    func getRandomHadith() async throws -> Hadith
    
    // Quran
    func getFeaturedVerses() async throws -> [QuranVerse]
    
    // Events
    func getUpcomingEvents() async throws -> [Event]
}
```

### Location Services Setup
```swift
// LocationManager.swift
class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()
    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    
    func requestLocationPermission() {
        locationManager.requestWhenInUseAuthorization()
    }
    
    func calculateQiblaDirection() -> Double {
        // Implement Qibla calculation
    }
}
```

### Push Notifications Setup
```swift
// NotificationManager.swift
class NotificationManager: ObservableObject {
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            // Handle permission result
        }
    }
    
    func schedulePrayerReminders(prayerTimes: PrayerTimes) {
        // Schedule local notifications for prayer times
    }
}
```

## Environment Configuration

### Development Environment Variables
```swift
// Config.swift
struct Config {
    static let apiBaseURL = "http://localhost:8000/api"
    static let googleMapsAPIKey = "YOUR_GOOGLE_MAPS_KEY"
    static let hadithAPIKey = "YOUR_HADITH_API_KEY"
    static let kaabaLatitude = 21.4224779
    static let kaabaLongitude = 39.8251832
}
```

### Production Configuration
- Update API base URL to production server
- Configure proper SSL certificate pinning
- Set up proper error handling and logging
- Implement analytics tracking

## Security Considerations

### API Security
- Store JWT tokens securely in Keychain
- Implement token refresh mechanism
- Use HTTPS for all API calls
- Validate SSL certificates

### Data Protection
- Encrypt sensitive user data
- Implement proper data validation
- Use secure storage for user preferences
- Handle location data privacy properly

## Testing Strategy

### Unit Tests
- Test API service methods
- Test calculation functions (Qibla, prayer times)
- Test data models and Core Data operations

### Integration Tests
- Test API integration
- Test location services
- Test notification scheduling

### UI Tests
- Test user flows
- Test accessibility features
- Test different device sizes

## Deployment Checklist

### App Store Preparation
- [ ] Configure app icons and launch screens
- [ ] Set up proper app metadata
- [ ] Implement privacy policy
- [ ] Configure location usage descriptions
- [ ] Set up push notification certificates
- [ ] Test on multiple devices and iOS versions
- [ ] Implement crash reporting
- [ ] Set up analytics tracking

### Backend Deployment
- [ ] Deploy backend to production server
- [ ] Configure environment variables
- [ ] Set up database backups
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Test all API endpoints

## Additional Features to Consider

### Offline Support
- Cache prayer times for multiple days
- Store favorite hadiths offline
- Implement sync when online

### Accessibility
- VoiceOver support for Arabic text
- Dynamic type support
- High contrast mode support

### Localization
- Support multiple languages
- RTL layout support for Arabic
- Cultural considerations for different regions

### Performance Optimization
- Implement image caching
- Use lazy loading for large lists
- Optimize Core Data queries
- Implement proper memory management

## API Rate Limiting

The backend implements rate limiting:
- **Window**: 15 minutes (900,000ms)
- **Max Requests**: 100 per window
- Handle rate limit errors gracefully in iOS app

## Contact & Support

For backend API issues or questions:
- Check server logs for detailed error messages
- Verify environment variables are properly set
- Ensure database connection is established
- Test API endpoints using tools like Postman

This guide provides the foundation for building an iOS app that mirrors your web application's functionality while leveraging native iOS capabilities for the best user experience.