# Islamic Prayer Tools - iOS App Development TODO Guide

## 📱 **iOS App Overview**
**Goal:** Create a native iOS app using SwiftUI that consumes the same backend API as the web application.

**Architecture:** 
- **Frontend**: SwiftUI + Swift
- **Backend**: Shared Node.js API (already built)
- **Data**: Core Data for offline storage
- **Maps**: MapKit for mosque locations
- **Auth**: JWT tokens (same as web)

---

## 🎯 **Phase 1: Project Setup & Foundation (Priority: HIGH)**

### **Task 1.1: Create iOS Project**
**AI Prompt:**
```
Create a new iOS project for Islamic Prayer Tools:
- Create new Xcode project with SwiftUI
- Set up project structure following MVVM architecture
- Configure Info.plist for location permissions
- Add required capabilities: Location Services, Background App Refresh
- Set minimum iOS version to 15.0
- Create folder structure: App/, Core/, Features/, Shared/
- Set up Git integration
```

### **Task 1.2: Core Data Setup**
**AI Prompt:**
```
Set up Core Data for offline storage in iOS app:
- Create Core Data model (.xcdatamodeld)
- Define entities: User, PrayerTime, Mosque, QuranVerse, Hadith, Event
- Create Core Data stack with persistent container
- Add Core Data manager class for CRUD operations
- Implement data synchronization with API
- Place in Core/Data/
```

### **Task 1.3: Network Layer**
**AI Prompt:**
```
Create network layer for API communication:
- Create APIService class with URLSession
- Add request/response models matching backend API
- Implement JWT token management and storage in Keychain
- Add error handling and network reachability
- Create endpoints enum for all API routes
- Place in Core/Network/
```

---

## 🎯 **Phase 2: Core Features (Priority: HIGH)**

### **Task 2.1: Prayer Times Feature**
**AI Prompt:**
```
Create Prayer Times feature for iOS:
- Create PrayerTimesView with SwiftUI
- Implement PrayerTimesViewModel with ObservableObject
- Integrate with Aladhan API through backend
- Add location services for automatic prayer times
- Display current prayer, next prayer, and all daily prayers
- Add Iqama time calculations
- Implement prayer notifications with UNUserNotificationCenter
- Place in Features/Prayer/
```

### **Task 2.2: Qibla Compass Feature**
**AI Prompt:**
```
Create Qibla Compass feature for iOS:
- Create QiblaCompassView with SwiftUI
- Implement compass using Core Location and Core Motion
- Calculate Qibla direction from user location to Kaaba
- Add animated compass needle and Qibla indicator
- Display distance to Kaaba and current location
- Add compass calibration functionality
- Place in Features/Qibla/
```

### **Task 2.3: Location Services**
**AI Prompt:**
```
Implement comprehensive location services:
- Create LocationManager class with CLLocationManager
- Handle location permissions and authorization
- Implement background location updates for prayer times
- Add location caching and offline support
- Create location-based prayer time calculations
- Handle location errors and fallbacks
- Place in Core/Location/
```

---

## 🎯 **Phase 3: Content Features (Priority: MEDIUM)**

### **Task 3.1: Mosque Locator**
**AI Prompt:**
```
Create Mosque Locator feature for iOS:
- Create MosqueLocatorView with MapKit integration
- Implement MosqueLocatorViewModel
- Display nearby mosques on map with custom annotations
- Add mosque search and filtering
- Integrate with backend mosque API
- Add directions using MKDirections
- Implement mosque details view
- Place in Features/Mosque/
```

### **Task 3.2: Quran Verses**
**AI Prompt:**
```
Create Quran Verses feature for iOS:
- Create QuranView with daily verse display
- Implement verse navigation and search
- Add Arabic text with proper RTL support
- Display translation and transliteration
- Add bookmark functionality with Core Data
- Implement verse sharing capabilities
- Add audio recitation (optional)
- Place in Features/Quran/
```

### **Task 3.3: Hadith Display**
**AI Prompt:**
```
Create Hadith feature for iOS:
- Create HadithView for daily hadith display
- Browse hadith by collection (Bukhari, Muslim, etc.)
- Add search functionality
- Display narrator and authenticity grade
- Implement bookmark and sharing features
- Add offline storage with Core Data
- Place in Features/Hadith/
```

---

## 🎯 **Phase 4: Events & Calendar (Priority: HIGH)**

### **Task 4.1: Islamic Calendar**
**AI Prompt:**
```
Create Islamic Calendar feature for iOS:
- Create IslamicCalendarView with calendar UI
- Display Hijri dates and Islamic holidays
- Integrate with backend events API
- Add event details and notifications
- Implement calendar navigation (month/year)
- Add event reminders with local notifications
- Place in Features/Calendar/
```

### **Task 4.2: Events Integration**
**AI Prompt:**
```
Integrate events system with iOS app:
- Create EventsView to display upcoming events
- Implement event details view
- Add event notifications and reminders
- Integrate with device calendar (EventKit)
- Add event sharing capabilities
- Implement offline event storage
- Place in Features/Events/
```

---

## 🎯 **Phase 5: User Experience (Priority: MEDIUM)**

### **Task 5.1: Navigation & Tab Bar**
**AI Prompt:**
```
Create main navigation structure:
- Implement TabView with 5 main tabs: Prayer, Qibla, Mosques, Quran, More
- Create navigation hierarchy for each tab
- Add custom tab bar icons and styling
- Implement deep linking support
- Add navigation state management
- Place in App/Navigation/
```

### **Task 5.2: Settings & Preferences**
**AI Prompt:**
```
Create Settings and Preferences:
- Create SettingsView with user preferences
- Add prayer calculation method selection
- Implement notification preferences
- Add madhab selection for Asr calculation
- Create location settings and permissions
- Add app theme and appearance options
- Implement data sync preferences
- Place in Features/Settings/
```

### **Task 5.3: Notifications System**
**AI Prompt:**
```
Implement comprehensive notifications:
- Create NotificationManager for local notifications
- Add prayer time notifications with custom sounds
- Implement event reminders
- Add daily Quran/Hadith notifications
- Create notification preferences and scheduling
- Handle notification actions and responses
- Place in Core/Notifications/
```

---

## 🎯 **Phase 6: Authentication & Sync (Priority: MEDIUM)**

### **Task 6.1: User Authentication**
**AI Prompt:**
```
Implement user authentication for iOS:
- Create LoginView and RegisterView
- Implement AuthenticationManager with Keychain
- Add biometric authentication (Face ID/Touch ID)
- Create user profile management
- Implement JWT token refresh logic
- Add logout and account deletion
- Place in Features/Authentication/
```

### **Task 6.2: Data Synchronization**
**AI Prompt:**
```
Implement data sync between device and server:
- Create SyncManager for background data sync
- Sync user preferences and bookmarks
- Implement conflict resolution for offline changes
- Add sync status indicators
- Handle network connectivity changes
- Implement incremental sync for performance
- Place in Core/Sync/
```

---

## 🎯 **Phase 7: Advanced Features (Priority: LOW)**

### **Task 7.1: Widgets**
**AI Prompt:**
```
Create iOS widgets for prayer times:
- Create WidgetKit extension
- Design small, medium, and large widget layouts
- Display current and next prayer times
- Add Qibla direction widget
- Implement widget configuration
- Add deep linking from widgets to app
- Place in Widgets/
```

### **Task 7.2: Apple Watch App**
**AI Prompt:**
```
Create Apple Watch companion app:
- Create WatchKit extension
- Display prayer times on watch face
- Add Qibla compass for watch
- Implement prayer notifications on watch
- Create watch-specific UI with Digital Crown support
- Add complications for watch faces
- Place in WatchApp/
```

### **Task 7.3: Siri Shortcuts**
**AI Prompt:**
```
Implement Siri Shortcuts integration:
- Add Intents extension for Siri support
- Create shortcuts for "Next prayer time"
- Add "Show Qibla direction" shortcut
- Implement "Today's Quran verse" shortcut
- Add custom Siri phrases and responses
- Create shortcuts donation system
- Place in SiriIntents/
```

---

## 🎯 **Phase 8: Polish & App Store (Priority: HIGH)**

### **Task 8.1: UI/UX Polish**
**AI Prompt:**
```
Polish the iOS app for App Store submission:
- Implement consistent design system with colors and fonts
- Add smooth animations and transitions
- Create loading states and error handling UI
- Implement accessibility features (VoiceOver, Dynamic Type)
- Add haptic feedback for user interactions
- Optimize for different screen sizes (iPhone, iPad)
- Create app icon and launch screen
```

### **Task 8.2: Testing & Quality Assurance**
**AI Prompt:**
```
Implement comprehensive testing:
- Create unit tests for ViewModels and business logic
- Add UI tests for critical user flows
- Implement integration tests for API communication
- Add performance testing and memory leak detection
- Test on different iOS versions and devices
- Create automated testing pipeline
- Place tests in appropriate test targets
```

### **Task 8.3: App Store Preparation**
**AI Prompt:**
```
Prepare for App Store submission:
- Create App Store Connect listing with screenshots
- Write app description and keywords for ASO
- Implement App Store review guidelines compliance
- Add privacy policy and terms of service
- Create app preview videos
- Set up TestFlight for beta testing
- Prepare marketing materials and press kit
```

---

## 🚀 **Development Timeline**

### **Phase 1-2: Foundation (Weeks 1-4)**
- Project setup and core features
- Prayer times and Qibla compass working

### **Phase 3-4: Content & Events (Weeks 5-8)**
- Mosque locator, Quran, Hadith, Calendar
- Events integration

### **Phase 5-6: UX & Auth (Weeks 9-12)**
- Navigation, settings, authentication
- Data synchronization

### **Phase 7-8: Advanced & Polish (Weeks 13-16)**
- Widgets, Watch app, Siri shortcuts
- Testing and App Store submission

---

## 📝 **iOS Development Notes**

### **Prerequisites:**
- Xcode 15+ with iOS 15+ deployment target
- Apple Developer Account for testing and distribution
- Physical iOS device for location and compass testing
- Backend API running and accessible

### **Key iOS Technologies:**
- **SwiftUI**: Modern declarative UI framework
- **Core Data**: Local data persistence
- **Core Location**: GPS and location services
- **MapKit**: Maps and directions
- **UserNotifications**: Local and push notifications
- **Keychain**: Secure credential storage

### **Architecture Pattern:**
- **MVVM**: Model-View-ViewModel with ObservableObject
- **Dependency Injection**: For testability and modularity
- **Repository Pattern**: For data access abstraction
- **Coordinator Pattern**: For navigation management

### **Testing Strategy:**
- Unit tests for business logic and ViewModels
- Integration tests for API communication
- UI tests for critical user journeys
- Performance tests for Core Data and networking

### **App Store Guidelines:**
- Follow Human Interface Guidelines
- Implement proper privacy controls
- Add accessibility features
- Ensure app works offline
- Handle edge cases gracefully

---

## 🔗 **Integration with Web Backend**

The iOS app will use the **same backend API** as the web application:
- **Authentication**: JWT tokens stored in Keychain
- **Data Sync**: RESTful API calls to Node.js backend
- **Real-time Updates**: Polling or WebSocket for live data
- **Offline Support**: Core Data caching with sync on connectivity

This ensures **feature parity** between web and mobile while maintaining a **single source of truth** for all data! 📱🚀