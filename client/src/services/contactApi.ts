import { ContactSubmission, ApiResponse, PaginatedResponse } from '../../../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

class ContactAPI {
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

  async submitContact(formData: ContactFormData): Promise<ApiResponse<void>> {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async getContactSubmissions(page = 1, limit = 10, status?: string): Promise<ApiResponse<PaginatedResponse<ContactSubmission>>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    
    return this.request(`/staff/contact/submissions?${params}`);
  }

  async updateSubmissionStatus(id: string, status: string): Promise<ApiResponse<ContactSubmission>> {
    return this.request(`/staff/contact/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const contactAPI = new ContactAPI();