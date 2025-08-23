import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  time: string;
  location: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  imageUrl?: string;
  images?: string[];
  createdBy: string;
  status: 'active' | 'inactive' | 'pending';
  attendees: number;
}

const AdminEventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Friday Prayer Gathering',
      description: 'Weekly Friday prayer at the community center',
      startDate: '2024-01-19',
      endDate: '2024-01-19',
      frequency: 'weekly' as const,
      time: '13:00',
      location: 'Community Center',
      createdBy: 'Staff User',
      status: 'active',
      attendees: 45
    },
    {
      id: '2',
      title: 'Quran Study Circle',
      description: 'Weekly Quran study and discussion',
      startDate: '2024-01-21',
      endDate: '2024-01-21',
      frequency: 'once' as const,
      time: '19:00',
      location: 'Mosque Hall',
      createdBy: 'Admin',
      status: 'pending',
      attendees: 12
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    time: '',
    location: '',
    frequency: 'once' as 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly',
    imageUrl: '',
    uploadedImages: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...formData, status: 'active' as const }
          : event
      ));
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        time: formData.time,
        location: formData.location,
        frequency: formData.frequency,
        imageUrl: formData.imageUrl,
        images: formData.uploadedImages,
        createdBy: 'Admin',
        status: 'active',
        attendees: 0
      };
      setEvents([...events, newEvent]);
    }
    setShowModal(false);
    setEditingEvent(null);
    setFormData({ title: '', description: '', startDate: '', endDate: '', time: '', location: '', frequency: 'once', imageUrl: '', uploadedImages: [] });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate || '',
      time: event.time,
      location: event.location,
      frequency: event.frequency,
      imageUrl: event.imageUrl || '',
      uploadedImages: event.images || []
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: 'active' | 'inactive' | 'pending') => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, status } : event
    ));
  };

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Admin Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/admin/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/admin/events" className="nav-link active">📅 Events Management</Link></li>
          <li><Link to="/admin/contact" className="nav-link">📧 Contact Submissions</Link></li>
          <li><Link to="/admin/users" className="nav-link">👥 User Management</Link></li>
          <li><Link to="/admin/staff" className="nav-link">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>Events Management</h1>
          <p>Create, edit, and manage all events across the platform</p>
        </header>

        <main className="admin-main">


        <div className="action-bar">
          <button 
            onClick={() => setShowModal(true)}
            className="btn-modern btn-primary-modern"
          >
            + Create Event
          </button>
        </div>

        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              {(event.imageUrl || (event.images && event.images.length > 0)) && (
                <div className="event-images">
                  {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.title} className="event-main-image" />
                  )}
                  {event.images && event.images.map((img, index) => (
                    <img key={index} src={img} alt={`${event.title} ${index + 1}`} className="event-gallery-image" />
                  ))}
                </div>
              )}
              <div className="event-content">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <div className="event-actions">
                    <select 
                      value={event.status}
                      onChange={(e) => handleStatusChange(event.id, e.target.value as any)}
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <button onClick={() => handleEdit(event)} className="btn-edit">✏️</button>
                    <button onClick={() => handleDelete(event.id)} className="btn-delete">🗑️</button>
                  </div>
                </div>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <span>📅 {event.startDate}{event.endDate && event.endDate !== event.startDate ? ` - ${event.endDate}` : ''}</span>
                  <span>🕐 {event.time}</span>
                  <span>📍 {event.location}</span>
                  <span>🔄 {event.frequency}</span>
                </div>
                <div className="event-meta">
                  <span>Created by: {event.createdBy}</span>
                  <span>Attendees: {event.attendees}</span>
                  <span className={`status-badge ${event.status}`}>{event.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Event Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <div className="date-section">
                <div className="date-input-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date (optional):</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    min={formData.startDate}
                  />
                </div>
              </div>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
              <div className="frequency-section">
                <label>Frequency:</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value as any})}
                  required
                >
                  <option value="once">One-time event</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="image-section">
                <h4>Event Images</h4>
                
                <div className="image-input-group">
                  <label>Image URL:</label>
                  <input
                    type="url"
                    placeholder="Enter image URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  />
                </div>

                <div className="image-input-group">
                  <label>Upload Images:</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setFormData(prev => ({
                            ...prev,
                            uploadedImages: [...prev.uploadedImages, result]
                          }));
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  />
                </div>

                {formData.uploadedImages.length > 0 && (
                  <div className="image-preview">
                    <label>Uploaded Images:</label>
                    <div className="image-preview-grid">
                      {formData.uploadedImages.map((img, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={img} alt={`Preview ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
                            }))}
                            className="remove-image-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-modern btn-primary-modern">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-modern btn-secondary-modern"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsManagement;