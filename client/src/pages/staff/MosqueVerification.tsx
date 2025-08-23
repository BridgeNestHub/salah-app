import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Mosque {
  id: string;
  name: string;
  address: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  submitDate: string;
  phone?: string;
  website?: string;
}

const StaffMosqueVerification: React.FC = () => {
  const [mosques, setMosques] = useState<Mosque[]>([
    {
      id: '1',
      name: 'Al-Noor Islamic Center',
      address: '123 Main St, New York, NY 10001',
      submittedBy: 'Ahmed Hassan',
      status: 'pending',
      submitDate: '2024-01-18',
      phone: '+1-555-0123',
      website: 'www.alnoor.org'
    },
    {
      id: '2',
      name: 'Masjid Al-Huda',
      address: '456 Oak Ave, Brooklyn, NY 11201',
      submittedBy: 'Fatima Ali',
      status: 'pending',
      submitDate: '2024-01-17',
      phone: '+1-555-0456'
    }
  ]);

  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    const mosque = mosques.find(m => m.id === id);
    setMosques(mosques.map(m => 
      m.id === id ? { ...m, status } : m
    ));
    showNotification(`${mosque?.name} has been ${status}`);
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
          <li><Link to="/staff/mosques" className="nav-link active">🕌 Mosque Verification</Link></li>
          <li><Link to="/staff/content" className="nav-link">📖 Content Management</Link></li>
          <li><Link to="/staff/notifications" className="nav-link">📢 Notifications</Link></li>
          <li><Link to="/staff/analytics" className="nav-link">📊 Basic Analytics</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>Mosque Verification</h1>
          <p>Review and verify mosque submissions</p>
        </header>

        <main className="admin-main">
          <div className="mosque-grid">
            {mosques.filter(m => m.status === 'pending').map(mosque => (
              <div key={mosque.id} className="mosque-card">
                <div className="mosque-header">
                  <h3>{mosque.name}</h3>
                  <span className={`status-badge ${mosque.status}`}>{mosque.status}</span>
                </div>
                <div className="mosque-details">
                  <p><strong>Address:</strong> {mosque.address}</p>
                  <p><strong>Submitted by:</strong> {mosque.submittedBy}</p>
                  <p><strong>Date:</strong> {mosque.submitDate}</p>
                  {mosque.phone && <p><strong>Phone:</strong> {mosque.phone}</p>}
                  {mosque.website && <p><strong>Website:</strong> {mosque.website}</p>}
                </div>
                <div className="mosque-actions">
                  <button 
                    onClick={() => setSelectedMosque(mosque)}
                    className="btn-modern btn-secondary-modern"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleStatusChange(mosque.id, 'approved')}
                    className="btn-modern btn-success"
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={() => handleStatusChange(mosque.id, 'rejected')}
                    className="btn-modern btn-danger"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {selectedMosque && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Mosque Details</h3>
            <div className="mosque-detail-view">
              <p><strong>Name:</strong> {selectedMosque.name}</p>
              <p><strong>Address:</strong> {selectedMosque.address}</p>
              <p><strong>Submitted by:</strong> {selectedMosque.submittedBy}</p>
              <p><strong>Submit Date:</strong> {selectedMosque.submitDate}</p>
              {selectedMosque.phone && <p><strong>Phone:</strong> {selectedMosque.phone}</p>}
              {selectedMosque.website && <p><strong>Website:</strong> {selectedMosque.website}</p>}
            </div>
            <div className="modal-buttons">
              <button 
                onClick={() => setSelectedMosque(null)}
                className="btn-modern btn-secondary-modern"
              >
                Close
              </button>
            </div>
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

export default StaffMosqueVerification;