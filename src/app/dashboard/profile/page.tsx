'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  gender?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'UAE',
    gender: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login-register');
      return;
    }
    loadProfile();
  }, [session, status, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Initialize with session data
      setProfile(prev => ({
        ...prev,
        name: session?.user?.name || '',
        email: session?.user?.email || ''
      }));
      
      // Try to fetch additional profile data
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, ...data.profile }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = (): number => {
    const fields = [
      { field: 'name', weight: 2, label: 'Full Name' }, // Required field, higher weight
      { field: 'phone', weight: 1, label: 'Phone Number' },
      { field: 'address', weight: 1, label: 'Address' },
      { field: 'city', weight: 1, label: 'City' },
      { field: 'state', weight: 1, label: 'State/Emirate' },
      { field: 'postalCode', weight: 1, label: 'Postal Code' },
      { field: 'country', weight: 1, label: 'Country' },
      { field: 'gender', weight: 1, label: 'Gender' },
      { field: 'emergencyContact', weight: 1, label: 'Emergency Contact' },
      { field: 'emergencyPhone', weight: 1, label: 'Emergency Phone' }
    ];

    const totalWeight = fields.reduce((sum, item) => sum + item.weight, 0);
    let completedWeight = 0;

    fields.forEach(({ field, weight }) => {
      const value = profile[field as keyof UserProfile];
      // Consider field completed if it has a value and it's not just the default 'UAE'
      if (value && value.trim() !== '' && !(field === 'country' && value === 'UAE')) {
        completedWeight += weight;
      } else if (field === 'name' && value && value.trim() !== '') {
        // Name should always count if present (required field)
        completedWeight += weight;
      } else if (field === 'country' && value && value !== 'UAE') {
        // Country counts if changed from default
        completedWeight += weight;
      }
    });

    // Email is always present, so we add a base completion
    const emailWeight = 1;
    const totalWithEmail = totalWeight + emailWeight;
    const completedWithEmail = completedWeight + emailWeight;

    return Math.round((completedWithEmail / totalWithEmail) * 100);
  };

  // Get missing fields for completion suggestions
  const getMissingFields = (): string[] => {
    const fields = [
      { field: 'phone', label: 'Phone Number' },
      { field: 'address', label: 'Address' },
      { field: 'city', label: 'City' },
      { field: 'state', label: 'State/Emirate' },
      { field: 'postalCode', label: 'Postal Code' },
      { field: 'gender', label: 'Gender' },
      { field: 'emergencyContact', label: 'Emergency Contact' },
      { field: 'emergencyPhone', label: 'Emergency Phone' }
    ];

    return fields
      .filter(({ field }) => {
        const value = profile[field as keyof UserProfile];
        return !value || value.trim() === '';
      })
      .map(({ label }) => label)
      .slice(0, 3); // Show only first 3 missing fields
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating your profile' });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <section className="space-top space-extra-bottom">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center">
                                  <LoadingSpinner size="medium" color="#0d6efd" />
                  <h3 className="mt-3">Loading Profile...</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header />
      

      <div className="profile-container">
        
        {/* New Navigation */}
        <div className="filters-section">
          <div className="container">
            <div className="status-filters">
              <Link className="filter-btn" href="/dashboard"><i className="fas fa-th-large"></i> Dashboard </Link>
              <Link className="filter-btn active" href="/dashboard/profile"><i className="fas fa-user"></i> Profile </Link>
              <Link className="filter-btn" href="/dashboard/services"><i className="fas fa-shopping-cart"></i> Orders </Link>
              <button className="filter-btn" onClick={() => signOut({ callbackUrl: '/login-register' })}><i className="fas fa-sign-out-alt"></i> Logout</button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <div className="container">
            
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <i className="fas fa-user"></i>
                </div>
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{profile.name || 'User'}</h2>
                <p className="profile-email">{profile.email}</p>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-label">Member since</span>
                    <span className="stat-value">2024</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Profile completion</span>
                    <span className="stat-value">{calculateProfileCompletion()}%</span>
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${calculateProfileCompletion()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message.text && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
                <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                {message.text}
              </div>
            )}

            {/* Profile Completion Status */}
            {calculateProfileCompletion() < 100 && getMissingFields().length > 0 && (
              <div className="completion-status-card mb-4">
                <div className="completion-status-content">
                  <div className="completion-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="completion-info">
                    <h4 className="completion-title">Complete Your Profile</h4>
                    <p className="completion-subtitle">
                      Add the following information to improve your profile: {getMissingFields().join(', ')}
                      {getMissingFields().length === 3 && ' and more'}
                    </p>
                  </div>
                  <div className="completion-percentage">
                    {calculateProfileCompletion()}%
                  </div>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="profile-form">
              
              {/* Personal Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">
                    <i className="fas fa-user me-2"></i>
                    Personal Information
                  </h3>
                  <p className="section-subtitle">Update your personal details and information</p>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        disabled
                      />
                      <small className="form-text text-muted">Email cannot be changed</small>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-control"
                        value={profile.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+971 50 123 4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details Section */}
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">
                    <i className="fas fa-address-book me-2"></i>
                    Contact Details
                  </h3>
                  <p className="section-subtitle">Manage your contact details and addresses</p>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <select
                        className="form-control"
                        value={profile.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      >
                        <option value="UAE">United Arab Emirates</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="QA">Qatar</option>
                        <option value="KW">Kuwait</option>
                        <option value="BH">Bahrain</option>
                        <option value="OM">Oman</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Dubai"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">State/Emirate</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Dubai"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profile.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>

                <div className="emergency-contact-section">
                  <h4 className="subsection-title">
                    <i className="fas fa-phone-alt me-2"></i>
                    Emergency Contact
                  </h4>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Emergency Contact Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profile.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Emergency Contact Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={profile.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          placeholder="+971 50 123 4567"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" color="#ffffff" className="me-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={loadProfile}>
                  <i className="fas fa-undo me-2"></i>
                  Reset Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        .profile-container {
          min-height: 100vh;
          background: #f8fafc;
        }

        .filters-section {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 32px 24px;
          border-radius: 20px;
          margin-bottom: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .status-filters {
          display: flex;
          gap: 16px;
          justify-content: center;
          width: max-content;
          margin: 0 auto;
        }

        .status-filters :global(a),
        .status-filters :global(button),
        .filter-btn {
          border-radius: 100px;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 16px 24px !important;
          background: white !important;
          border: 2px solid #e5e7eb !important;
          color: #6b7280 !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          text-decoration: none !important;
          position: relative !important;
          overflow: hidden !important;
          min-width: 140px !important;
          justify-content: center !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }

        .status-filters :global(a)::before,
        .status-filters :global(button)::before,
        .filter-btn::before {
          content: '' !important;
          position: absolute !important;
          top: 0 !important;
          left: -100% !important;
          width: 100% !important;
          height: 100% !important;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent) !important;
          transition: left 0.5s ease !important;
        }

        .status-filters :global(a):hover::before,
        .status-filters :global(button):hover::before,
        .filter-btn:hover::before {
          left: 100% !important;
        }

        .status-filters :global(a):hover,
        .status-filters :global(button):hover,
        .filter-btn:hover {
          border-color: var(--theme-color, #2A07F9) !important;
          color: var(--theme-color, #2A07F9) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 24px rgba(42, 7, 249, 0.15) !important;
        }

        .status-filters :global(a.active),
        .status-filters :global(button.active),
        .filter-btn.active {
          border-color: var(--theme-color, #2A07F9) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 24px rgba(42, 7, 249, 0.25) !important;
        }

        .status-filters :global(a.active)::before,
        .status-filters :global(button.active)::before,
        .filter-btn.active::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
        }

        .status-filters :global(a.active):hover,
        .status-filters :global(button.active):hover,
        .filter-btn.active:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 32px rgba(42, 7, 249, 0.3) !important;
        }

        /* Logout button specific styling */
        .status-filters :global(button:last-child) {
          background: white !important;
          border-color: #ef4444 !important;
          color: #ef4444 !important;
        }

        .status-filters :global(button:last-child):hover {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          border-color: #ef4444 !important;
          color: white !important;
          box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25) !important;
        }

        .status-filters :global(button:last-child)::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent) !important;
        }

        /* Icon styling */
        .status-filters :global(a) i,
        .status-filters :global(button) i,
        .filter-btn i {
          font-size: 1rem !important;
          transition: transform 0.3s ease !important;
        }

        .status-filters :global(a):hover i,
        .status-filters :global(button):hover i,
        .filter-btn:hover i {
          transform: scale(1.1) !important;
        }

        .status-filters :global(a.active) i,
        .status-filters :global(button.active) i,
        .filter-btn.active i {
          transform: scale(1.05) !important;
        }

        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .nav-links-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .nav-links-wrapper::-webkit-scrollbar {
          display: none;
        }

        .nav-links-container {
          display: flex;
          gap: 20px;
          min-width: max-content;
          padding: 0 20px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          color: #6b7280;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          min-width: 200px;
          white-space: nowrap;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--theme-color, #2A07F9), #4c1d95);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .nav-link:hover {
          border-color: var(--theme-color, #2A07F9);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 7, 249, 0.15);
        }

        .nav-link:hover::before {
          transform: scaleX(1);
        }

        .nav-link.active {
          background: linear-gradient(135deg, var(--theme-color, #2A07F9), #4c1d95);
          border-color: var(--theme-color, #2A07F9);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 7, 249, 0.25);
        }

        .nav-link.active::before {
          transform: scaleX(1);
          background: rgba(255, 255, 255, 0.2);
        }

        .nav-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(107, 114, 128, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .nav-link.active .nav-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .nav-link:hover .nav-icon {
          background: rgba(42, 7, 249, 0.1);
          color: var(--theme-color, #2A07F9);
        }

        .nav-link.active:hover .nav-icon {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .nav-content {
          flex: 1;
          text-align: left;
        }

        .nav-title {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }

        .nav-subtitle {
          display: block;
          font-size: 0.875rem;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .nav-link.active .nav-subtitle {
          opacity: 0.9;
        }

        .logout-btn {
          background: white !important;
          border: 2px solid #ef4444 !important;
          color: #ef4444 !important;
        }

        .logout-btn:hover {
          background: #ef4444 !important;
          color: white !important;
          border-color: #ef4444 !important;
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.25) !important;
        }

        .logout-btn .nav-icon {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
        }

        .logout-btn:hover .nav-icon {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        .profile-content {
          padding: 40px 0;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 32px;
          background: white;
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          position: relative;
          overflow: hidden;
        }

        .profile-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--theme-color, #2A07F9), #4c1d95);
        }

        .profile-avatar {
          position: relative;
        }

        .avatar-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--theme-color, #2A07F9), #4c1d95);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48px;
          box-shadow: 0 8px 25px rgba(42, 7, 249, 0.3);
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 2.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #1f2937, #374151);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .profile-email {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0 0 24px 0;
        }

        .profile-stats {
          display: flex;
          gap: 40px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--theme-color, #2A07F9);
        }

        .progress-container {
          width: 120px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--theme-color, #2A07F9), #4c1d95);
          border-radius: 4px;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .completion-status-card {
          background: linear-gradient(135deg, #fef3c7, #fbbf24);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #f59e0b;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
        }

        .completion-status-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .completion-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #92400e;
          flex-shrink: 0;
        }

        .completion-info {
          flex: 1;
        }

        .completion-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #92400e;
          margin: 0 0 6px 0;
        }

        .completion-subtitle {
          font-size: 0.95rem;
          color: #92400e;
          margin: 0;
          opacity: 0.8;
        }

        .completion-percentage {
          font-size: 1.5rem;
          font-weight: 700;
          color: #92400e;
          text-align: center;
          min-width: 60px;
        }

        .profile-form {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .form-section {
          margin-bottom: 48px;
        }

        .form-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f3f4f6;
          position: relative;
        }

        .section-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, var(--theme-color, #2A07F9), #4c1d95);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
        }

        .section-title i {
          color: var(--theme-color, #2A07F9);
        }

        .section-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .form-control {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #fafbfc;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--theme-color, #2A07F9);
          box-shadow: 0 0 0 4px rgba(42, 7, 249, 0.1);
          background: white;
        }

        .form-control:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
          border-color: #d1d5db;
        }

        .form-text {
          font-size: 0.875rem;
          margin-top: 6px;
          color: #6b7280;
        }

        .emergency-contact-section {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 2px solid #f3f4f6;
          position: relative;
        }

        .emergency-contact-section::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .subsection-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 24px 0;
          display: flex;
          align-items: center;
        }

        .subsection-title i {
          color: #ef4444;
        }

        .btn {
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 2px solid;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--theme-color, #2A07F9), #4c1d95);
          border-color: var(--theme-color, #2A07F9);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 7, 249, 0.3);
        }

        .btn-primary:disabled {
          background: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-outline-secondary {
          background: transparent;
          border-color: #6b7280;
          color: #6b7280;
        }

        .btn-outline-secondary:hover {
          background: #6b7280;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(107, 114, 128, 0.3);
        }

        .form-actions {
          display: flex;
          gap: 20px;
          padding-top: 32px;
          border-top: 2px solid #f3f4f6;
          margin-top: 40px;
          position: relative;
        }

        .form-actions::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 0;
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, var(--theme-color, #2A07F9), #4c1d95);
        }

        .alert {
          padding: 18px 24px;
          border-radius: 12px;
          border: 1px solid;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .alert-success {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-color: #bbf7d0;
          color: #166534;
        }

        .alert-danger {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border-color: #fecaca;
          color: #dc2626;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .nav-link {
            min-width: 180px;
            padding: 16px 20px;
          }

          .nav-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .nav-title {
            font-size: 1rem;
          }
        }

        @media (max-width: 768px) {
          .profile-content {
            padding: 24px 0;
          }

          .profile-header {
            flex-direction: column;
            text-align: center;
            gap: 24px;
            padding: 32px 24px;
          }

          .profile-stats {
            justify-content: center;
            gap: 32px;
          }

          .completion-status-card {
            padding: 20px;
          }

          .completion-status-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .completion-info {
            text-align: center;
          }

          .progress-container {
            margin: 8px auto 0;
          }

          .nav-links-container {
            gap: 12px;
            padding: 0 16px;
          }

          .nav-link {
            min-width: 160px;
            padding: 16px 20px;
          }

          .nav-content {
            text-align: left;
          }

          .nav-subtitle {
            display: none;
          }

          .profile-form {
            padding: 32px 24px;
          }

          .form-actions {
            flex-direction: column;
          }

          .section-title {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .avatar-circle {
            width: 100px;
            height: 100px;
            font-size: 40px;
          }

          .profile-name {
            font-size: 1.75rem;
          }

          .profile-form {
            padding: 24px 16px;
          }

          .nav-link {
            min-width: 140px;
            padding: 14px 16px;
          }

          .nav-icon {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }

          .nav-title {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </>
  );
}
