import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'moderator' | 'inactive';
  department: string;
  joinDate: string;
  permissions: string[];
  phone?: string;
  address?: string;
  lastLogin?: string;
}

const AdminStaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@islamicprayertools.com',
      role: 'staff',
      department: 'Community Support',
      joinDate: '2024-01-01',
      permissions: ['events', 'contact'],
      phone: '+1-555-0123',
      address: '123 Main St, New York, NY',
      lastLogin: '2024-01-18 14:30'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'staff' | 'moderator' | 'inactive',
    department: '',
    permissions: [] as string[],
    phone: '',
    address: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      setStaff(staff.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...formData, permissions: formData.permissions }
          : s
      ));
      alert(`${formData.name} updated successfully`);
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        permissions: formData.permissions,
        phone: formData.phone,
        address: formData.address,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: 'Never'
      };
      setStaff([...staff, newStaff]);
      alert(`Staff member ${formData.name} added successfully`);
    }
    setShowModal(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', role: 'staff', department: '', permissions: [], phone: '', address: '', password: '' });
  };

  const handleRoleChange = (id: string, role: Staff['role']) => {
    const member = staff.find(s => s.id === id);
    setStaff(staff.map(s => 
      s.id === id ? { ...s, role } : s
    ));
    alert(`${member?.name}'s role updated to ${role}`);
  };

  const handleEdit = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      permissions: member.permissions,
      phone: member.phone || '',
      address: member.address || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const member = staff.find(s => s.id === id);
    if (window.confirm(`Are you sure you want to remove ${member?.name}?`)) {
      setStaff(staff.filter(s => s.id !== id));
      alert('Staff member removed successfully');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedStaff(expandedStaff === id ? null : id);
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
          <li><Link to="/admin/staff" className="nav-link active">👨💼 Staff Management</Link></li>
          <li><Link to="/admin/analytics" className="nav-link">📊 Analytics</Link></li>
          <li><Link to="/admin/settings" className="nav-link">⚙️ System Settings</Link></li>
        </ul>
      </nav>
      
      <div className="admin-content">
        <header className="admin-page-header">
          <h1>Staff Management</h1>
          <p>Manage staff accounts and roles</p>
        </header>

        <main className="admin-main">
          <div className="action-bar">
            <button 
              onClick={() => setShowModal(true)}
              className="btn-modern btn-primary-modern"
            >
              + Add Staff Member
            </button>
          </div>

          <div className="staff-grid">
            {staff.map(member => (
              <div key={member.id} className="staff-card">
                <div className="staff-header">
                  <h3>{member.name}</h3>
                  <div className="staff-actions">
                    <select 
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                      className="role-select"
                    >
                      <option value="staff">Staff</option>
                      <option value="moderator">Moderator</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <button onClick={() => handleEdit(member)} className="btn-edit">✏️</button>
                    <button onClick={() => handleDelete(member.id)} className="btn-delete">🗑️</button>
                    <button onClick={() => toggleExpand(member.id)} className="btn-expand">
                      {expandedStaff === member.id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                <p>{member.email}</p>
                <div className="staff-details">
                  <span>📋 {member.department}</span>
                  <span>📅 Joined: {member.joinDate}</span>
                  <span className={`status-badge ${member.role}`}>{member.role}</span>
                </div>
                <div className="permissions">
                  <strong>Permissions:</strong>
                  {member.permissions.map(perm => (
                    <span key={perm} className="permission-badge">{perm}</span>
                  ))}
                </div>
                
                {expandedStaff === member.id && (
                  <div className="staff-details-expanded">
                    <div className="detail-row">
                      <strong>Phone:</strong> {member.phone || 'Not provided'}
                    </div>
                    <div className="detail-row">
                      <strong>Address:</strong> {member.address || 'Not provided'}
                    </div>
                    <div className="detail-row">
                      <strong>Last Login:</strong> {member.lastLogin || 'Never'}
                    </div>
                    <div className="detail-row">
                      <strong>Full Email:</strong> {member.email}
                    </div>
                    <div className="detail-actions">
                      <button onClick={() => handleEdit(member)} className="btn-modern btn-primary-modern">
                        Edit Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={2}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="staff">Staff</option>
                <option value="moderator">Moderator</option>
              </select>
              {editingStaff && (
                <input
                  type="password"
                  placeholder="New Password (leave blank to keep current)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              )}
              <div className="modal-buttons">
                <button type="submit" className="btn-modern btn-primary-modern">
                  {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
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

export default AdminStaffManagement;