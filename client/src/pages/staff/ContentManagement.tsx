import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Content {
  id: string;
  type: 'quran' | 'hadith';
  title: string;
  content: string;
  source: string;
  status: 'draft' | 'published' | 'archived';
  lastModified: string;
}

const StaffContentManagement: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([
    {
      id: '1',
      type: 'quran',
      title: 'Surah Al-Fatiha (1:1-7)',
      content: 'In the name of Allah, the Entirely Merciful, the Especially Merciful...',
      source: 'Quran 1:1-7',
      status: 'published',
      lastModified: '2024-01-18'
    },
    {
      id: '2',
      type: 'hadith',
      title: 'The Importance of Prayer',
      content: 'The Prophet (peace be upon him) said: "The first matter that the slave will be brought to account for on the Day of Judgment is the prayer..."',
      source: 'Sahih At-Tirmidhi',
      status: 'draft',
      lastModified: '2024-01-17'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'quran' as 'quran' | 'hadith',
    title: '',
    content: '',
    source: ''
  });

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContent) {
      setContents(contents.map(c => 
        c.id === editingContent.id 
          ? { ...c, ...formData, lastModified: new Date().toISOString().split('T')[0] }
          : c
      ));
      showNotification('Content updated successfully');
    } else {
      const newContent: Content = {
        id: Date.now().toString(),
        ...formData,
        status: 'draft',
        lastModified: new Date().toISOString().split('T')[0]
      };
      setContents([...contents, newContent]);
      showNotification('Content created successfully');
    }
    setShowModal(false);
    setEditingContent(null);
    setFormData({ type: 'quran', title: '', content: '', source: '' });
  };

  const handleEdit = (content: Content) => {
    setEditingContent(content);
    setFormData({
      type: content.type,
      title: content.title,
      content: content.content,
      source: content.source
    });
    setShowModal(true);
  };

  const handleStatusChange = (id: string, status: Content['status']) => {
    setContents(contents.map(c => 
      c.id === id ? { ...c, status } : c
    ));
    showNotification(`Content ${status} successfully`);
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
          <li><Link to="/staff/content" className="nav-link active">📖 Content Management</Link></li>
          <li><Link to="/staff/notifications" className="nav-link">📢 Notifications</Link></li>
          <li><Link to="/staff/analytics" className="nav-link">📊 Basic Analytics</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <div>
            <h1>Content Management</h1>
            <p>Manage Quran verses and Hadith content</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-modern btn-primary-modern"
          >
            + Add Content
          </button>
        </header>

        <main className="admin-main">
          <div className="content-grid">
            {contents.map(content => (
              <div key={content.id} className="content-card">
                <div className="content-header">
                  <div className="content-type-badge">{content.type}</div>
                  <span className={`status-badge ${content.status}`}>{content.status}</span>
                </div>
                <h3>{content.title}</h3>
                <p className="content-preview">{content.content.substring(0, 100)}...</p>
                <div className="content-meta">
                  <span><strong>Source:</strong> {content.source}</span>
                  <span><strong>Modified:</strong> {content.lastModified}</span>
                </div>
                <div className="content-actions">
                  <button 
                    onClick={() => handleEdit(content)}
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                  <select 
                    value={content.status}
                    onChange={(e) => handleStatusChange(content.id, e.target.value as any)}
                    className="status-select"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>{editingContent ? 'Edit Content' : 'Add New Content'}</h3>
            <form onSubmit={handleSubmit}>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                required
              >
                <option value="quran">Quran Verse</option>
                <option value="hadith">Hadith</option>
              </select>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={6}
                required
              />
              <input
                type="text"
                placeholder="Source (e.g., Quran 2:255, Sahih Bukhari)"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-modern btn-primary-modern">
                  {editingContent ? 'Update Content' : 'Add Content'}
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

export default StaffContentManagement;