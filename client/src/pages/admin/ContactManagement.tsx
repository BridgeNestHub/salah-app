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

const AdminContactManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([
    {
      id: '1',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      subject: 'Prayer Time Issue',
      message: 'The prayer times shown for my location seem incorrect. Can you please check?',
      date: '2024-01-18',
      status: 'new',
      attachments: ['screenshot.png']
    },
    {
      id: '2',
      name: 'Fatima Ali',
      email: 'fatima@example.com',
      subject: 'Event Registration',
      message: 'I am having trouble registering for the upcoming Quran study circle.',
      date: '2024-01-17',
      status: 'in-progress',
      assignedTo: 'Staff User',
      response: 'We are looking into this issue and will get back to you soon.'
    }
  ]);

  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleStatusChange = (id: string, status: ContactSubmission['status']) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status } : sub
    ));
  };

  const handleAssign = (id: string, assignedTo: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, assignedTo, status: 'in-progress' } : sub
    ));
  };

  const handleResponse = (id: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, response: responseText, status: 'resolved' } : sub
    ));
    setResponseText('');
    setSelectedSubmission(null);
  };

  const filteredSubmissions = filterStatus === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.status === filterStatus);

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Admin Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/admin/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/admin/events" className="nav-link">📅 Events Management</Link></li>
          <li><Link to="/admin/contact" className="nav-link active">📧 Contact Submissions</Link></li>
          <li><Link to="/admin/users" className="nav-link">👥 User Management</Link></li>
          <li><Link to="/admin/staff" className="nav-link">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>Contact Management</h1>
          <p>View and respond to user inquiries and feedback</p>
        </header>

        <main className="admin-main">


        <div className="action-bar">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="modern-select"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
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
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
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
                  {submission.assignedTo && <span>👤 Assigned to: {submission.assignedTo}</span>}
                </div>

                {submission.response && (
                  <div className="response-section">
                    <strong>Response:</strong>
                    <p>{submission.response}</p>
                  </div>
                )}

                <div className="contact-actions-bottom">
                  <select 
                    onChange={(e) => handleAssign(submission.id, e.target.value)}
                    className="assign-select"
                  >
                    <option value="">Assign to...</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff User">Staff User</option>
                    <option value="Support Team">Support Team</option>
                  </select>
                  
                  <button 
                    onClick={() => setSelectedSubmission(submission)}
                    className="btn-modern btn-primary-modern"
                  >
                    Respond
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

export default AdminContactManagement;