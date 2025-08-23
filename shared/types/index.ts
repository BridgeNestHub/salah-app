// Shared TypeScript types for both client and server

export interface User {
  _id: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  location: Location;
  preferences: UserPreferences;
}

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface UserPreferences {
  calculationMethod: string;
  madhab: string;
  notifications: boolean;
}

export interface PrayerTimes {
  date: string;
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  location: Location;
}

export interface Mosque {
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
  createdAt: Date;
}

export interface QuranVerse {
  _id: string;
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  transliteration: string;
  featured: boolean;
  addedBy: string;
}

export interface Hadith {
  _id: string;
  collection: string;
  book: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string;
  featured: boolean;
  addedBy: string;
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: 'islamic_holiday' | 'community_event' | 'educational' | 'community_services' | 'youth_sports' | 'faith_programs' | 'social_justice' | 'access_services' | 'health_advocacy' | 'environment_climate' | 'drug_violence_prevention' | 'voter_education' | 'mental_health' | 'youth_education';
  startDate: Date;
  endDate: Date;
  location: {
    name: string;
    address: string;
    coordinates: [number, number];
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'general' | 'prayer_reminder' | 'event' | 'system';
  targetAudience: 'all' | 'users' | 'specific';
  targetUsers: string[];
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EventCreateRequest {
  title: string;
  description: string;
  eventType: 'islamic_holiday' | 'community_event' | 'educational' | 'community_services' | 'youth_sports' | 'faith_programs' | 'social_justice' | 'access_services' | 'health_advocacy' | 'environment_climate' | 'drug_violence_prevention' | 'voter_education' | 'mental_health' | 'youth_education';
  startDate: Date;
  endDate: Date;
  location: {
    name: string;
    address: string;
    coordinates: [number, number];
  };
}

export interface NotificationCreateRequest {
  title: string;
  message: string;
  type: 'general' | 'prayer_reminder' | 'event' | 'system';
  targetAudience: 'all' | 'users' | 'specific';
  targetUsers?: string[];
  scheduledFor?: Date;
}