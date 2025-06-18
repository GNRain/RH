import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import { VscAccount, VscKey, VscSave } from 'react-icons/vsc';

const API_URL = 'http://localhost:3000';

interface UserProfile {
  name: string;
  familyName: string;
  email: string;
  cin: string;
  position: string;
  department: string;
  joinDate: string;
}

export function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [show2faInput, setShow2faInput] = useState(false);
  const [isPasswordChangeLoading, setIsPasswordChangeLoading] = useState(false);


  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleInitiatePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      return setError('New password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }
    // If validation passes, show the 2FA input
    setShow2faInput(true);
  };
  
  const handlePasswordChangeSubmit = async () => {
    if (!twoFactorCode) {
        return setError('Please enter your 2FA code to confirm.');
    }
    setIsPasswordChangeLoading(true);
    setError('');
    setSuccess('');

    try {
        const token = localStorage.getItem('access_token');
        const response = await axios.patch(`${API_URL}/users/me/password`, 
            { oldPassword, newPassword, twoFactorCode },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(response.data.message);
        // Reset fields on success
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTwoFactorCode('');
        setShow2faInput(false);
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
        setIsPasswordChangeLoading(false);
    }
  }

  if (loading) {
    return <p style={{ color: 'white' }}>Loading profile...</p>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-layout">
        {/* User Details Card */}
        <div className="profile-card details-card">
          <div className="profile-card-header">
            <VscAccount size={24} />
            <h2>Personal Information</h2>
          </div>
          {user ? (
            <div className="details-grid">
              <div className="detail-item"><span>Full Name</span><p>{user.name} {user.familyName}</p></div>
              <div className="detail-item"><span>Email</span><p>{user.email}</p></div>
              <div className="detail-item"><span>CIN</span><p>{user.cin}</p></div>
              <div className="detail-item"><span>Department</span><p>{user.department}</p></div>
              <div className="detail-item"><span>Position</span><p>{user.position}</p></div>
              <div className="detail-item"><span>Join Date</span><p>{new Date(user.joinDate).toLocaleDateString()}</p></div>
            </div>
          ) : (
            <p>{error || 'Could not load profile information.'}</p>
          )}
        </div>

        {/* Change Password Card */}
        <div className="profile-card password-card">
          <div className="profile-card-header">
            <VscKey size={24} />
            <h2>Change Password</h2>
          </div>
          <form onSubmit={handleInitiatePasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="old-password">Old Password</label>
              <input id="old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="form-input" required />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" required />
              <small>Must be at least 8 characters long.</small>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" required />
            </div>

            {/* Conditionally render the 2FA input */}
            {show2faInput && (
                 <div className="form-group two-fa-group">
                    <label htmlFor="2fa-code">Enter 2FA Code to Confirm</label>
                    <input id="2fa-code" type="text" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} className="form-input" style={{textAlign: 'center'}} required />
                </div>
            )}
            
            {error && <p className="form-message error">{error}</p>}
            {success && <p className="form-message success">{success}</p>}

            <div className="form-actions">
                {show2faInput ? (
                    <button type="button" onClick={handlePasswordChangeSubmit} className="button button-primary" disabled={isPasswordChangeLoading}>
                        <VscSave />
                        {isPasswordChangeLoading ? 'Saving...' : 'Confirm Change'}
                    </button>
                ) : (
                    <button type="submit" className="button button-primary">
                        Change Password
                    </button>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}