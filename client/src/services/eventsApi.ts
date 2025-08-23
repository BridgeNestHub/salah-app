import { Event, ApiResponse, PaginatedResponse, EventCreateRequest } from '../../../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface EventFilters {
  eventType?: 'islamic_holiday' | 'community_event' | 'educational' | 'community_services' | 'youth_sports' | 'faith_programs' | 'social_justice' | 'access_services' | 'health_advocacy' | 'environment_climate' | 'drug_violence_prevention' | 'voter_education' | 'mental_health' | 'youth_education';
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class EventsAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Public API
  async getEvents(filters: EventFilters = {}): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    return this.request(`/public/events?${params}`);
  }

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    return this.request(`/public/events/${id}`);
  }

  // Admin API
  async getAllEventsAdmin(filters: EventFilters = {}): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    return this.request(`/admin/events?${params}`);
  }

  async createEvent(eventData: EventCreateRequest): Promise<ApiResponse<Event>> {
    return this.request('/admin/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<EventCreateRequest>): Promise<ApiResponse<Event>> {
    return this.request(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Staff API
  async getMyEvents(filters: EventFilters = {}): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    return this.request(`/staff/events/my-events?${params}`);
  }

  async createEventStaff(eventData: EventCreateRequest): Promise<ApiResponse<Event>> {
    return this.request('/staff/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEventStaff(id: string, eventData: Partial<EventCreateRequest>): Promise<ApiResponse<Event>> {
    return this.request(`/staff/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }
}

export const eventsAPI = new EventsAPI();