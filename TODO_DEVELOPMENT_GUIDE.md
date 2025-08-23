# Islamic Prayer Tools - Development TODO Guide

## 📋 **Current Status**
✅ **Completed:**
- Project architecture and clean structure
- Prayer Times component (React + Aladhan API)
- Qibla Compass component (GPS calculations)
- MongoDB connection and database models
- Server running on port 8000, frontend on port 3000

🔄 **Next Steps:** Build remaining features step by step

---

## 🎯 **Phase 1: Core Navigation & UI (Priority: HIGH)**

### **Task 1.1: Navigation Header**
**AI Prompt:**
```
Create a navigation header component for the Islamic Prayer Tools app. Include:
- Logo/title "Islamic Prayer Tools"
- Navigation links: Home, Prayer Times, Qibla, Mosques, Quran, Hadith, Events, About, Contact
- Responsive mobile menu (hamburger)
- Clean Islamic-themed styling
- Use React Router for navigation
- Place in client/src/components/common/Header.tsx
```

### **Task 1.2: React Router Setup**
**AI Prompt:**
```
Set up React Router for the Islamic Prayer Tools app:
- Install react-router-dom
- Create route structure in App.tsx
- Create page components in client/src/pages/public/
- Routes needed: /, /prayer-times, /qibla, /mosques, /quran, /hadith, /events, /about, /contact
- Add 404 page
- Update navigation to use Link components
```

### **Task 1.3: Footer Component**
**AI Prompt:**
```
Create a footer component with:
- Copyright information
- Quick links to main pages
- Social media placeholders
- Islamic greeting/verse
- Place in client/src/components/common/Footer.tsx
```

---

## 🎯 **Phase 2: Mosque Locator (Priority: HIGH)**

### **Task 2.1: Migrate Mosque Locator**
**AI Prompt:**
```
Migrate the existing mosque locator JavaScript to React component:
- Convert the MosqueLocator class to React component with hooks
- Use Leaflet maps (react-leaflet)
- Integrate OpenStreetMap and Overpass API
- Add search functionality for locations
- Include directions feature
- Place in client/src/components/mosque/MosqueLocator.tsx
- Migrate existing CSS styles
```

### **Task 2.2: Mosque API Endpoints**
**AI Prompt:**
```
Create backend API endpoints for mosque functionality:
- GET /api/mosques/nearby - Find mosques near coordinates
- POST /api/mosques - Add new mosque (requires auth)
- PUT /api/mosques/:id/verify - Verify mosque (staff/admin only)
- Use existing Mosque model
- Add proper validation and error handling
- Place in server/src/routes/public/mosques.ts
```

---

## 🎯 **Phase 3: Content Features (Priority: MEDIUM)**

### **Task 3.1: Quran Verses Component**
**AI Prompt:**
```
Create Quran verses feature:
- Daily verse display with Arabic text, translation, transliteration
- Verse navigation (previous/next)
- Search verses by surah/ayah
- Bookmark favorite verses
- Use existing QuranVerse model
- Create API endpoints: GET /api/quran/daily, GET /api/quran/search
- Place in client/src/components/quran/QuranVerses.tsx
```

### **Task 3.2: Hadith Component**
**AI Prompt:**
```
Create Hadith feature:
- Daily hadith display with Arabic text and translation
- Browse by collection (Bukhari, Muslim, etc.)
- Search hadith by keyword
- Display narrator and authenticity grade
- Use existing Hadith model
- Create API endpoints: GET /api/hadith/daily, GET /api/hadith/search
- Place in client/src/components/hadith/HadithDisplay.tsx
```

### **Task 3.3: Islamic Calendar**
**AI Prompt:**
```
Create Islamic calendar feature:
- Display current Hijri date
- Show Islamic holidays and events
- Monthly calendar view
- Event details popup
- Use existing Event model
- Create API endpoints: GET /api/calendar/current, GET /api/events/upcoming
- Place in client/src/components/calendar/IslamicCalendar.tsx
```

---

## 🎯 **Phase 4: Events System (Priority: HIGH - Your Requirement)**

### **Task 4.1: Events API**
**AI Prompt:**
```
Create complete events API system:
- GET /api/events - List all active events
- POST /api/events - Create event (staff/admin only)
- PUT /api/events/:id - Update event (staff/admin only)
- DELETE /api/events/:id - Delete event (admin only)
- GET /api/events/upcoming - Public upcoming events
- Add proper authentication middleware
- Use existing Event model
- Place in server/src/routes/public/events.ts and server/src/routes/staff/events.ts
```

### **Task 4.2: Events Frontend**
**AI Prompt:**
```
Create events display and management:
- Public events list page
- Event details view
- Staff/Admin event creation form
- Event editing interface
- Calendar integration
- CRUD operations with proper permissions
- Place in client/src/components/events/ and client/src/pages/staff/
```

---

## 🎯 **Phase 5: Notification System (Priority: HIGH - Your Requirement)**

### **Task 5.1: Notification API**
**AI Prompt:**
```
Create notification system API:
- POST /api/notifications - Send notification (staff/admin)
- POST /api/admin/notifications/broadcast - Broadcast to all users (admin only)
- GET /api/notifications/user/:id - Get user notifications
- Use existing Notification model
- Add scheduling with node-cron
- Email integration with nodemailer
- Place in server/src/routes/staff/notifications.ts
```

### **Task 5.2: Notification Frontend**
**AI Prompt:**
```
Create notification management interface:
- Staff notification creation form
- Admin broadcast interface
- User notification preferences
- Notification history
- Real-time notifications (optional: WebSocket)
- Place in client/src/components/notifications/
```

---

## 🎯 **Phase 6: Authentication System (Priority: MEDIUM)**

### **Task 6.1: Authentication Backend**
**AI Prompt:**
```
Create authentication system:
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/refresh - Token refresh
- GET /api/auth/profile - Get user profile
- JWT middleware for protected routes
- Password hashing with bcrypt
- Use existing User model
- Place in server/src/routes/auth.ts and server/src/middleware/auth.ts
```

### **Task 6.2: Authentication Frontend**
**AI Prompt:**
```
Create authentication UI:
- Login/Register forms
- User profile page
- Protected route components
- Auth context for state management
- Role-based UI (user/staff/admin)
- Place in client/src/contexts/AuthContext.tsx and client/src/components/auth/
```

---

## 🎯 **Phase 7: Admin Dashboard (Priority: MEDIUM)**

### **Task 7.1: Admin User Management**
**AI Prompt:**
```
Create admin dashboard for user management:
- User list with search/filter
- User role management
- User activation/deactivation
- Staff account creation
- Analytics dashboard
- Place in client/src/pages/admin/UserManagement.tsx
```

### **Task 7.2: Content Management**
**AI Prompt:**
```
Create content management interface:
- Manage Quran verses and Hadith
- Approve/reject mosque submissions
- Event management
- System settings
- Database backup tools
- Place in client/src/pages/admin/ContentManagement.tsx
```

---

## 🎯 **Phase 8: Additional Features (Priority: LOW)**

### **Task 8.1: Contact Form**
**AI Prompt:**
```
Create contact form system:
- Contact form with validation
- Email sending with nodemailer
- Admin interface to view submissions
- Auto-response emails
- Spam protection
- Place in client/src/components/contact/ContactForm.tsx
```

### **Task 8.2: About Page**
**AI Prompt:**
```
Create comprehensive about page:
- App information and mission
- Islamic resources and references
- Developer information
- Privacy policy and terms
- FAQ section
- Place in client/src/pages/public/About.tsx
```

### **Task 8.3: Performance & SEO**
**AI Prompt:**
```
Optimize application performance:
- Add React.lazy for code splitting
- Implement service worker for offline functionality
- Add meta tags for SEO
- Optimize images and assets
- Add loading states and error boundaries
```

---

## 🚀 **Quick Start Instructions**

### **For Each Task:**
1. Copy the AI prompt exactly
2. Provide current project context
3. Specify file locations as mentioned
4. Test functionality after implementation
5. Update this TODO list with ✅ when complete

### **Development Order:**
1. **Start with Phase 1** (Navigation) - Quick wins
2. **Move to Phase 2** (Mosque Locator) - Existing logic to migrate
3. **Implement Phase 4** (Events) - Your priority requirement
4. **Add Phase 5** (Notifications) - Your priority requirement
5. **Continue with remaining phases**

### **Testing Each Feature:**
- Test frontend functionality in browser
- Test API endpoints with Postman or browser
- Verify database operations
- Check responsive design on mobile

---

## 📝 **Notes for AI Agent**

**Current Working Directory:** `/Users/rokme/Desktop/Project/prayer/prayer-app-web`

**Key Files to Reference:**
- Database Models: `server/src/models/`
- Shared Types: `shared/types/index.ts`
- Existing Components: `client/src/components/prayer/` and `client/src/components/qibla/`
- Environment: `.env` file with MongoDB and API configurations

**Architecture Decisions:**
- Use TypeScript throughout
- Follow existing component structure
- Use existing database models
- Maintain separation between public/staff/admin features
- Keep API endpoints RESTful

This guide provides clear, actionable tasks that can be implemented one at a time to build the complete Islamic Prayer Tools application! 🚀