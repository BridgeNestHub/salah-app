# Islamic Prayer Tools - Professional Web & Mobile Application

A comprehensive Islamic prayer application featuring prayer times, Qibla direction, mosque locator, Quran verses, Hadith, and administrative capabilities.

## 🏗️ Architecture Overview

This project follows a modern full-stack architecture with:
- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Mobile**: iOS app with SwiftUI (planned)
- **Deployment**: Docker containers

## 📁 Project Structure

```
prayer-app-web/
├── client/                    # React frontend application
├── server/                    # Node.js backend API
├── iOS_Prayer_App/            # iOS SwiftUI application
├── shared/                    # Shared types and constants
├── docker-compose.yml         # Development environment
├── package.json              # Root package.json for scripts
└── .env                      # Environment variables (not committed)
```

### Client Structure (React Frontend)
```
client/
├── public/                   # Static assets
│   ├── athan.mp3            # Prayer call audio
│   ├── favicon.ico          # App icon
│   └── manifest.json        # PWA manifest
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Shared components (Header, Footer, etc.)
│   │   ├── events/          # Islamic events components
│   │   ├── hadith/          # Hadith reader components
│   │   ├── mosque/          # Mosque locator components
│   │   ├── prayer/          # Prayer times components
│   │   ├── qibla/           # Qibla compass components
│   │   └── quran/           # Quran reader components
│   ├── pages/               # Page components
│   │   ├── public/          # Public pages (Home, About, Contact)
│   │   ├── admin/           # Admin dashboard pages
│   │   └── staff/           # Staff interface pages
│   ├── contexts/            # React contexts (Auth, Theme, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service calls
│   ├── styles/              # CSS files
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main App component
│   └── index.tsx            # App entry point
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

### Server Structure (Node.js Backend)
```
server/
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   │   ├── admin/           # Admin API controllers
│   │   ├── public/          # Public API controllers
│   │   └── staff/           # Staff API controllers
│   ├── middleware/          # Express middleware (auth, validation)
│   ├── models/              # MongoDB models (User, Mosque, etc.)
│   ├── routes/              # API route definitions
│   │   ├── admin/           # Admin routes
│   │   ├── public/          # Public routes
│   │   └── staff/           # Staff routes
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── index.ts             # Server entry point
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

### iOS App Structure (SwiftUI)
```
iOS_Prayer_App/
├── App/                     # Main app structure
│   ├── Navigation/          # Navigation components
│   ├── ContentView.swift    # Main content view
│   └── iOS_Prayer_AppApp.swift # App entry point
├── Core/                    # Core functionality
│   ├── Data/                # Data persistence
│   ├── Location/            # Location services
│   ├── Network/             # API services
│   └── Notifications/       # Push notifications
├── Features/                # Feature modules
│   ├── Events/              # Islamic events
│   ├── Hadith/              # Hadith reader
│   ├── Mosque/              # Mosque locator
│   ├── Prayer/              # Prayer times
│   ├── Qibla/               # Qibla compass
│   ├── Quran/               # Quran reader
│   └── Settings/            # App settings
├── Resources/               # App resources
│   ├── PrayerApp.xcdatamodeld/ # Core Data model
│   └── Info.plist           # App configuration
└── Shared/                  # Shared components
    ├── Models/              # Data models
    ├── Utils/               # Utility functions
    └── Views/               # Reusable views
```

## 🚀 Features

### Public Features
- ✅ **Prayer Times**: Location-based Islamic prayer schedules
- ✅ **Qibla Compass**: Direction finder using GPS coordinates
- ✅ **Mosque Locator**: Find nearby mosques with maps integration
- ✅ **Quran Verses**: Daily Quran verses with translations
- ✅ **Hadith**: Daily authentic hadith collections
- ✅ **Islamic Calendar**: Hijri calendar with Islamic events
- ✅ **Contact Form**: User feedback and support system

### Staff Features (Web Only)
- 📝 **Content Management**: Manage Quran verses and Hadith
- ✅ **Mosque Verification**: Verify and moderate mosque listings
- 📞 **User Support**: Handle contact form submissions
- 📊 **Analytics Dashboard**: Basic usage statistics

### Admin Features (Web Only)
- 👥 **User Management**: Manage user accounts and permissions
- 👨‍💼 **Staff Management**: Manage staff accounts and roles
- ⚙️ **System Configuration**: API keys and app settings
- 📈 **Advanced Analytics**: Detailed usage reports and insights
- 🛡️ **Content Moderation**: Full content control and management
- 🗄️ **Database Management**: Backup and maintenance tools

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form handling
- **Leaflet** for maps integration
- **Tailwind CSS** for styling
- **React Icons** for iconography

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Rate Limit** for API protection
- **Nodemailer** for email functionality
- **Helmet** for security headers

### APIs & Services
- **Aladhan API** for prayer times
- **Google Places API** for mosque locations
- **OpenStreetMap** for mapping
- **Nodemailer** for contact form emails

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 7.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd islamic-prayer-web
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file with your configuration
   # (See project documentation for required variables)
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker
   docker-compose up mongodb -d
   
   # Or start your local MongoDB instance
   mongod
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Using Docker (Recommended)

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

## 📱 iOS App Development (Planned)

The iOS application will be developed using:
- **SwiftUI** for the user interface
- **Core Data** for local storage
- **MapKit** for maps integration
- **Shared API** with the web application

## 🔐 Authentication & Authorization

The application implements role-based access control (RBAC):

- **Users**: Access to all public features
- **Staff**: Content management and mosque verification
- **Admin**: Full system access and user management

## 🗄️ Database Schema

### Core Collections
- **Users**: User accounts with profiles and preferences
- **Mosques**: Mosque locations with verification status
- **QuranVerses**: Quran verses with translations
- **Hadith**: Hadith collections with authenticity grades
- **ContactSubmissions**: User contact form submissions

## 🚀 Deployment

### Production Deployment
1. Build the application
2. Configure environment variables
3. Deploy using Docker containers
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates

### Recommended Platforms
- **AWS**: EC2, RDS, S3
- **Vercel**: Frontend deployment
- **MongoDB Atlas**: Database hosting
- **Docker Hub**: Container registry

## 🧪 Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

## 📝 API Documentation

API documentation will be available at `/api/docs` when the server is running.

### Key Endpoints
- `GET /api/prayer-times` - Get prayer times by location
- `GET /api/qibla-direction` - Calculate Qibla direction
- `GET /api/mosques/nearby` - Find nearby mosques
- `POST /api/contact` - Submit contact form

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Next Steps**: After reviewing this architecture, we can proceed with implementing individual features step by step, starting with the core prayer times functionality.