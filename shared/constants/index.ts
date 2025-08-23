// Shared constants for both client and server

export const USER_ROLES = {
  USER: 'user',
  STAFF: 'staff',
  ADMIN: 'admin'
} as const;

export const PRAYER_NAMES = {
  FAJR: 'Fajr',
  SUNRISE: 'Sunrise',
  DHUHR: 'Dhuhr',
  ASR: 'Asr',
  MAGHRIB: 'Maghrib',
  ISHA: 'Isha'
} as const;

export const CALCULATION_METHODS = {
  MWL: 'Muslim World League',
  ISNA: 'Islamic Society of North America',
  EGYPT: 'Egyptian General Authority of Survey',
  MAKKAH: 'Umm Al-Qura University, Makkah',
  KARACHI: 'University of Islamic Sciences, Karachi',
  TEHRAN: 'Institute of Geophysics, University of Tehran',
  JAFARI: 'Shia Ithna-Ashari, Leva Institute, Qum'
} as const;

export const MADHABS = {
  HANAFI: 'Hanafi',
  SHAFI: 'Shafi',
  MALIKI: 'Maliki',
  HANBALI: 'Hanbali'
} as const;

export const HADITH_COLLECTIONS = {
  BUKHARI: 'Sahih al-Bukhari',
  MUSLIM: 'Sahih Muslim',
  ABU_DAWUD: 'Sunan Abu Dawud',
  TIRMIDHI: 'Jami at-Tirmidhi',
  NASAI: 'Sunan an-Nasai',
  IBN_MAJAH: 'Sunan Ibn Majah'
} as const;

export const CONTACT_STATUS = {
  PENDING: 'pending',
  RESPONDED: 'responded',
  CLOSED: 'closed'
} as const;

export const EVENT_TYPES = {
  ISLAMIC_HOLIDAY: 'islamic_holiday',
  COMMUNITY_EVENT: 'community_event',
  EDUCATIONAL: 'educational'
} as const;

export const NOTIFICATION_TYPES = {
  GENERAL: 'general',
  PRAYER_REMINDER: 'prayer_reminder',
  EVENT: 'event',
  SYSTEM: 'system'
} as const;

export const TARGET_AUDIENCE = {
  ALL: 'all',
  USERS: 'users',
  SPECIFIC: 'specific'
} as const;

export const API_ENDPOINTS = {
  // Public endpoints
  PRAYER_TIMES: '/api/prayer-times',
  QIBLA_DIRECTION: '/api/qibla-direction',
  MOSQUES_NEARBY: '/api/mosques/nearby',
  QURAN_DAILY: '/api/quran/daily',
  HADITH_DAILY: '/api/hadith/daily',
  CALENDAR_ISLAMIC: '/api/calendar/islamic',
  CONTACT: '/api/contact',
  
  // Auth endpoints
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_REFRESH: '/api/auth/refresh',
  
  // Staff endpoints
  STAFF_MOSQUES_PENDING: '/api/staff/mosques/pending',
  STAFF_MOSQUES_VERIFY: '/api/staff/mosques/:id/verify',
  STAFF_CONTENT_QURAN: '/api/staff/content/quran',
  STAFF_CONTACT_SUBMISSIONS: '/api/staff/contact/submissions',
  
  // Admin endpoints
  ADMIN_USERS: '/api/admin/users',
  ADMIN_STAFF: '/api/admin/staff',
  ADMIN_ANALYTICS: '/api/admin/analytics',
  ADMIN_SETTINGS: '/api/admin/settings',
  ADMIN_EVENTS: '/api/admin/events',
  ADMIN_NOTIFICATIONS: '/api/admin/notifications',
  ADMIN_NOTIFICATIONS_BROADCAST: '/api/admin/notifications/broadcast',
  
  // Staff event and notification endpoints
  STAFF_EVENTS: '/api/staff/events',
  STAFF_NOTIFICATIONS: '/api/staff/notifications',
  
  // Public event endpoints
  EVENTS_UPCOMING: '/api/events/upcoming',
  EVENTS_BY_TYPE: '/api/events/type/:type'
} as const;