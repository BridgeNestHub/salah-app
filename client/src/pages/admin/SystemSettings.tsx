import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminSystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Islamic Prayer Tools',
    adminEmail: 'admin@islamicprayertools.com',
    apiKey: 'pk_live_xxxxxxxxxxxxxxxx',
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    prayerTimeSource: 'islamic-finder',
    defaultTimezone: 'UTC',
    maxFileSize: '5MB'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings logic here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="admin-layout-with-nav">
      <nav className="admin-sidebar">
        <div className="admin-nav-brand">
          <h2>🕌 Admin Panel</h2>
        </div>
        <ul className="admin-nav-menu">
          <li><Link to="/admin/dashboard" className="nav-link">📊 Dashboard</Link></li>
          <li><Link to="/admin/events" className="nav-link">📅 Events Management</Link></li>
          <li><Link to="/admin/contact" className="nav-link">📧 Contact Submissions</Link></li>
          <li><Link to="/admin/users" className="nav-link">👥 User Management</Link></li>
          <li><Link to="/admin/staff" className="nav-link">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link active">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>System Settings</h1>
          <p>Configure system settings and API keys</p>
        </header>

        <main className="admin-main">
          <div className="settings-container">
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="setting-item">
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Default Timezone</label>
                <select
                  value={settings.defaultTimezone}
                  onChange={(e) => handleInputChange('defaultTimezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Dubai">Dubai</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>API Configuration</h3>
              <div className="setting-item">
                <label>Prayer Times API Key</label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Prayer Time Source</label>
                <select
                  value={settings.prayerTimeSource}
                  onChange={(e) => handleInputChange('prayerTimeSource', e.target.value)}
                >
                  <option value="islamic-finder">Islamic Finder</option>
                  <option value="aladhan">Aladhan API</option>
                  <option value="prayer-times">Prayer Times API</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>System Controls</h3>
              <div className="setting-item toggle-item">
                <label>Maintenance Mode</label>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                />
                <span className="toggle-description">Enable to put site in maintenance mode</span>
              </div>
              <div className="setting-item toggle-item">
                <label>User Registration</label>
                <input
                  type="checkbox"
                  checked={settings.userRegistration}
                  onChange={(e) => handleInputChange('userRegistration', e.target.checked)}
                />
                <span className="toggle-description">Allow new user registrations</span>
              </div>
              <div className="setting-item toggle-item">
                <label>Email Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                />
                <span className="toggle-description">Send system email notifications</span>
              </div>
            </div>

            <div className="settings-section">
              <h3>File Upload</h3>
              <div className="setting-item">
                <label>Maximum File Size</label>
                <select
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
                >
                  <option value="1MB">1 MB</option>
                  <option value="5MB">5 MB</option>
                  <option value="10MB">10 MB</option>
                  <option value="25MB">25 MB</option>
                </select>
              </div>
            </div>

            <div className="settings-actions">
              <button onClick={handleSave} className="btn-modern btn-primary-modern">
                Save Settings
              </button>
              {saved && <span className="save-success">✅ Settings saved successfully!</span>}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSystemSettings;