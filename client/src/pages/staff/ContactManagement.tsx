import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  response?: string;
  attachments?: string[];
}

const StaffContactManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([
    {
      id: '2',
      name: 'Fatima Ali',
      email: 'fatima@example.com',
      subject: 'Event Registration',
      message: 'I am having trouble registering for the upcoming Quran study circle.',
      date: '2024-01-17',
      status: 'in-progress',
      assignedTo: 'Staff User'
    }
  ]);

  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleStatusChange = (id: string, status: ContactSubmission['status']) => {
    // Staff can only change between in-progress and resolved
    if (status === 'in-progress' || status === 'resolved') {
      setSubmissions(submissions.map(sub => 
        sub.id === id ? { ...sub, status } : sub
      ));
    }
  };

  const handleResponse = (id: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, response: responseText, status: 'resolved' } : sub
    ));
    setResponseText('');
    setSelectedSubmission(null);
  };

  const filteredSubmissions = filterStatus === 'all' 
    ? submissions.filter(sub => sub.assignedTo === 'Staff User')
    : submissions.filter(sub => sub.status === filterStatus && sub.assignedTo === 'Staff User');

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Staff Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/staff/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/staff/events" className="nav-link">📅 My Events</Link></li>
          <li><Link to="/staff/contact" className="nav-link active">📧 Contact Support</Link></li>
          <li><Link to="/staff/mosques" className="nav-link">🕌 Mosque Verification</Link></li>
          <li><Link to="/staff/content" className="nav-link">📖 Content Management</Link></li>
          <li><Link to="/staff/notifications" className="nav-link">📢 Notifications</Link></li>
          <li><Link to="/staff/analytics" className="nav-link">📊 Basic Analytics</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>Contact Support</h1>
          <p>Handle user inquiries assigned to you</p>
        </header>

        <main className="admin-main">
        <div className="page-header">
          <h2>Contact Support</h2>
          <p>Handle user inquiries assigned to you</p>
        </div>

        <div className="action-bar">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="modern-select"
          >
            <option value="all">All My Assignments</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="contact-grid">
          {filteredSubmissions.map(submission => (
            <div key={submission.id} className="contact-card">
              <div className="contact-header">
                <div className="contact-info">
                  <h3>{submission.name}</h3>
                  <p>{submission.email}</p>
                </div>
                <div className="contact-actions">
                  <select 
                    value={submission.status}
                    onChange={(e) => handleStatusChange(submission.id, e.target.value as any)}
                    className="status-select"
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              
              <div className="contact-content">
                <h4>{submission.subject}</h4>
                <p className="contact-message">{submission.message}</p>
                
                {submission.attachments && (
                  <div className="attachments">
                    <strong>Attachments:</strong>
                    {submission.attachments.map((file, index) => (
                      <span key={index} className="attachment">📎 {file}</span>
                    ))}
                  </div>
                )}
                
                <div className="contact-meta">
                  <span>📅 {submission.date}</span>
                  <span className={`status-badge ${submission.status}`}>{submission.status}</span>
                  <span>👤 Assigned to: {submission.assignedTo}</span>
                </div>

                {submission.response && (
                  <div className="response-section">
                    <strong>My Response:</strong>
                    <p>{submission.response}</p>
                  </div>
                )}

                <div className="contact-actions-bottom">
                  <button 
                    onClick={() => setSelectedSubmission(submission)}
                    className="btn-modern btn-primary-modern"
                  >
                    {submission.response ? 'Update Response' : 'Respond'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>

      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Respond to {selectedSubmission.name}</h3>
            <div className="original-message">
              <strong>Original Message:</strong>
              <p>{selectedSubmission.message}</p>
            </div>
            <textarea
              placeholder="Type your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
            />
            <div className="modal-buttons">
              <button 
                onClick={() => handleResponse(selectedSubmission.id)}
                className="btn-modern btn-primary-modern"
              >
                Send Response
              </button>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="btn-modern btn-secondary-modern"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffContactManagement;