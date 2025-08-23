import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'prayer' | 'event' | 'general' | 'emergency';
  targetAudience: 'all' | 'premium' | 'local';
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentAt?: string;
}

const StaffNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Ramadan Prayer Schedule',
      message: 'Updated prayer times for Ramadan are now available. Check the new schedule in your app.',
      type: 'prayer',
      targetAudience: 'all',
      status: 'sent',
      createdAt: '2024-01-18',
      sentAt: '2024-01-18 14:30'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'prayer' | 'event' | 'general' | 'emergency',
    targetAudience: 'all' as 'all' | 'premium' | 'local'
  });

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...formData,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setNotifications([...notifications, newNotification]);
    setShowModal(false);
    setFormData({ title: '', message: '', type: 'general', targetAudience: 'all' });
    showNotification('Notification created successfully');
  };

  const handleSend = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id 
        ? { ...n, status: 'sent', sentAt: new Date().toLocaleString() }
        : n
    ));
    showNotification('Notification sent successfully');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prayer': return '🕌';
      case 'event': return '📅';
      case 'emergency': return '🚨';
      default: return '📢';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'premium': return '⭐';
      case 'local': return '📍';
      default: return '🌍';
    }
  };

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Staff Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/staff/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/staff/events" className="nav-link">📅 My Events</Link></li>
          <li><Link to="/staff/contact" className="nav-link">📧 Contact Support</Link></li>
          <li><Link to="/staff/mosques" className="nav-link">🕌 Mosque Verification</Link></li>
          <li><Link to="/staff/content" className="nav-link">📖 Content Management</Link></li>
          <li><Link to="/staff/notifications" className="nav-link active">📢 Notifications</Link></li>
          <li><Link to="/staff/analytics" className="nav-link">📊 Basic Analytics</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <div>
            <h1>Notifications</h1>
            <p>Send notifications to users</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-modern btn-primary-modern"
          >
            + Create Notification
          </button>
        </header>

        <main className="admin-main">
          <div className="notifications-grid">
            {notifications.map(notif => (
              <div key={notif.id} className="notification-card">
                <div className="notification-header">
                  <div className="notification-badges">
                    <span className="type-badge">{getTypeIcon(notif.type)} {notif.type}</span>
                    <span className="audience-badge">{getAudienceIcon(notif.targetAudience)} {notif.targetAudience}</span>
                  </div>
                  <span className={`status-badge ${notif.status}`}>{notif.status}</span>
                </div>
                <h3>{notif.title}</h3>
                <p className="notification-message">{notif.message}</p>
                <div className="notification-meta">
                  <span><strong>Created:</strong> {notif.createdAt}</span>
                  {notif.sentAt && <span><strong>Sent:</strong> {notif.sentAt}</span>}
                </div>
                <div className="notification-actions">
                  {notif.status === 'draft' && (
                    <button 
                      onClick={() => handleSend(notif.id)}
                      className="btn-modern btn-success"
                    >
                      📤 Send Now
                    </button>
                  )}
                  <button className="btn-modern btn-secondary-modern">
                    📊 View Stats
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>Create New Notification</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Notification Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Notification Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                required
              />
              <div className="form-row">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="general">General</option>
                  <option value="prayer">Prayer Related</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                </select>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({...formData, targetAudience: e.target.value as any})}
                >
                  <option value="all">All Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="local">Local Users</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-modern btn-primary-modern">
                  Create Notification
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

      {notification && (
        <div className="custom-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <span className="notification-text">{notification}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffNotifications;