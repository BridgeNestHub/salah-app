# Islamic Prayer Tools - Design Architecture

## Overview
A comprehensive Islamic prayer application with web and iOS versions, featuring prayer times, Qibla direction, mosque locator, Quran verses, Hadith, and administrative capabilities.

## Technology Stack

### Web Application
- **Frontend**: React.js with TypeScript (Single Page Application)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **APIs**: Aladhan API, Google Places API, OpenStreetMap
- **Deployment**: Docker containers, AWS/Vercel

### iOS Application
- **Framework**: SwiftUI
- **Backend**: Shared Node.js API
- **Local Storage**: Core Data
- **Maps**: MapKit
- **Authentication**: Shared JWT system

## Project Structure

### Web Application Structure
```
islamic-prayer-web/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── icons/
│   │   └── icons/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Shared components
│   │   │   ├── prayer/              # Prayer-related components
│   │   │   ├── qibla/               # Qibla compass components
│   │   │   ├── mosque/              # Mosque locator components
│   │   │   ├── quran/               # Quran components
│   │   │   └── hadith/              # Hadith components
│   │   ├── pages/                   # Page components
│   │   │   ├── public/              # Public pages
│   │   │   ├── admin/               # Admin dashboard
│   │   │   └── staff/               # Staff interface
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API service calls
│   │   ├── utils/                   # Utility functions
│   │   ├── contexts/                # React contexts
│   │   ├── types/                   # TypeScript type definitions
│   │   └── styles/                  # CSS/SCSS files
│   ├── package.json
│   └── tsconfig.json
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── controllers/             # Route controllers
│   │   │   ├── public/              # Public API controllers
│   │   │   ├── admin/               # Admin API controllers
│   │   │   └── staff/               # Staff API controllers
│   │   ├── models/                  # Database models
│   │   ├── routes/                  # API routes
│   │   │   ├── public/              # Public routes
│   │   │   ├── admin/               # Admin routes
│   │   │   └── staff/               # Staff routes
│   │   ├── middleware/              # Express middleware
│   │   ├── services/                # Business logic services
│   │   ├── utils/                   # Utility functions
│   │   ├── config/                  # Configuration files
│   │   └── types/                   # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── shared/                          # Shared types and utilities
│   ├── types/                       # Shared TypeScript types
│   └── constants/                   # Shared constants
├── docker-compose.yml
├── .env                     # Environment variables (gitignored)
└── README.md
```

### iOS Application Structure
```
islamic-prayer-ios/
├── IslamicPrayerApp/
│   ├── App/                         # App configuration
│   │   ├── IslamicPrayerApp.swift
│   │   └── ContentView.swift
│   ├── Core/                        # Core functionality
│   │   ├── Models/                  # Data models
│   │   ├── Services/                # API and data services
│   │   ├── Utilities/               # Helper functions
│   │   └── Extensions/              # Swift extensions
│   ├── Features/                    # Feature modules
│   │   ├── Prayer/                  # Prayer times feature
│   │   ├── Qibla/                   # Qibla compass feature
│   │   ├── Mosque/                  # Mosque locator feature
│   │   ├── Quran/                   # Quran feature
│   │   ├── Hadith/                  # Hadith feature
│   │   └── Profile/                 # User profile
│   ├── Shared/                      # Shared UI components
│   │   ├── Components/              # Reusable SwiftUI views
│   │   ├── Styles/                  # Design system
│   │   └── Resources/               # Assets and localizations
│   └── Info.plist
├── IslamicPrayerAppTests/
└── IslamicPrayerAppUITests/
```

## Feature Breakdown

### 1. Public Features (Web & iOS)
- **Prayer Times**: Location-based prayer schedules
- **Qibla Compass**: Direction finder with GPS
- **Mosque Locator**: Nearby mosque finder with maps
- **Quran Verses**: Daily verses with translations
- **Hadith**: Daily authentic hadith
- **Islamic Calendar**: Hijri calendar with events
- **About Page**: App information and Islamic resources
- **Contact Form**: User feedback and support

### 2. Staff Features (Web Only)
- **Content Management**: Manage Quran verses and Hadith
- **Mosque Verification**: Verify and moderate mosque listings
- **User Support**: Handle contact form submissions
- **Event Management**: Create and update Islamic events
- **Notification System**: Send messages/notifications to users
- **Analytics Dashboard**: Basic usage statistics

### 3. Admin Features (Web Only)
- **User Management**: Manage user accounts and permissions
- **Staff Management**: Manage staff accounts and roles
- **System Configuration**: API keys, app settings
- **Event Management**: Full control over Islamic events and calendar
- **Notification System**: Advanced notification management and broadcasting
- **Advanced Analytics**: Detailed usage reports
- **Content Moderation**: Full content control
- **Database Management**: Backup and maintenance tools

## Database Schema

### Core Collections
```javascript
// Users
{
  _id: ObjectId,
  email: String,
  role: ['user', 'staff', 'admin'],
  profile: {
    name: String,
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      country: String
    },
    preferences: {
      calculationMethod: String,
      madhab: String,
      notifications: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}

// Mosques
{
  _id: ObjectId,
  name: String,
  address: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  contact: {
    phone: String,
    website: String
  },
  verified: Boolean,
  addedBy: ObjectId,
  createdAt: Date
}

// Quran Verses
{
  _id: ObjectId,
  surah: Number,
  ayah: Number,
  arabicText: String,
  translation: String,
  transliteration: String,
  featured: Boolean,
  addedBy: ObjectId
}

// Hadith
{
  _id: ObjectId,
  collection: String,
  book: String,
  hadithNumber: String,
  arabicText: String,
  translation: String,
  narrator: String,
  grade: String,
  featured: Boolean,
  addedBy: ObjectId
}

// Events
{
  _id: ObjectId,
  title: String,
  description: String,
  eventType: ['islamic_holiday', 'community_event', 'educational'],
  startDate: Date,
  endDate: Date,
  location: {
    name: String,
    address: String,
    coordinates: [longitude, latitude]
  },
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}

// Notifications
{
  _id: ObjectId,
  title: String,
  message: String,
  type: ['general', 'prayer_reminder', 'event', 'system'],
  targetAudience: ['all', 'users', 'specific'],
  targetUsers: [ObjectId],
  scheduledFor: Date,
  sent: Boolean,
  sentAt: Date,
  createdBy: ObjectId,
  createdAt: Date
}
```

## API Structure

### Public APIs
- `GET /api/prayer-times` - Get prayer times by location
- `GET /api/qibla-direction` - Calculate Qibla direction
- `GET /api/mosques/nearby` - Find nearby mosques
- `GET /api/quran/daily` - Get daily Quran verse
- `GET /api/hadith/daily` - Get daily Hadith
- `GET /api/calendar/islamic` - Get Islamic calendar events
- `POST /api/contact` - Submit contact form

### Staff APIs
- `GET /api/staff/mosques/pending` - Get pending mosque verifications
- `PUT /api/staff/mosques/:id/verify` - Verify mosque
- `GET /api/staff/content/quran` - Manage Quran content
- `GET /api/staff/contact/submissions` - View contact submissions
- `GET /api/staff/events/my-events` - Get staff's own events
- `POST /api/staff/events` - Create new event
- `PUT /api/staff/events/:id` - Update own event
- `POST /api/staff/notifications` - Send notifications to users

### Admin APIs
- `GET /api/admin/users` - Manage users
- `GET /api/admin/staff` - Manage staff
- `GET /api/admin/analytics` - System analytics
- `PUT /api/admin/settings` - Update system settings
- `GET /api/admin/events` - Full event management
- `DELETE /api/admin/events/:id` - Delete events
- `GET /api/admin/notifications` - Advanced notification management
- `POST /api/admin/notifications/broadcast` - Broadcast notifications

## Security & Authentication

### Web Application
- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- HTTPS enforcement

### iOS Application
- Keychain storage for tokens
- Biometric authentication option
- Certificate pinning
- Local data encryption

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Set up project structure
- Database design and setup
- Basic authentication system
- Core API endpoints

### Phase 2: Core Features (Weeks 3-6)
- Prayer times functionality
- Qibla compass
- Mosque locator
- Basic web UI

### Phase 3: Content Features (Weeks 7-8)
- Quran verses system
- Hadith system
- Islamic calendar

### Phase 4: Admin System (Weeks 9-10)
- Admin dashboard
- Staff interface
- Content management

### Phase 5: iOS Development (Weeks 11-14)
- iOS app development
- API integration
- Testing and optimization

### Phase 6: Deployment & Testing (Weeks 15-16)
- Production deployment
- Performance optimization
- User testing and feedback

## Additional Features to Consider

1. **Push Notifications**: Prayer time reminders
2. **Offline Mode**: Cached prayer times and content
3. **Multi-language Support**: Arabic, English, and other languages
4. **Dark Mode**: UI theme options
5. **Prayer Tracking**: Personal prayer log
6. **Community Features**: Mosque reviews and ratings
7. **Educational Content**: Islamic articles and resources
8. **Donation Integration**: Support for mosque donations

This architecture provides a solid foundation for building a professional Islamic prayer application that can scale and support both web and mobile platforms.