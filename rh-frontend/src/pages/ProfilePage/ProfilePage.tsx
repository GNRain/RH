import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';
import { VscAccount, VscKey, VscSave } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next'; // --- ADD IMPORT ---

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
  const { t } = useTranslation(); // --- INITIALIZE THE HOOK ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      return setError(t('profile_page.error_password_length')); // Use t()
    }
    if (newPassword !== confirmPassword) {
      return setError(t('profile_page.error_passwords_no_match')); // Use t()
    }
    setShow2faInput(true);
  };
  
  const handlePasswordChangeSubmit = async () => {
    if (!twoFactorCode) {
        return setError(t('profile_page.error_2fa_required')); // Use t()
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
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTwoFactorCode('');
        setShow2faInput(false);
    } catch (err: any) {
        // Backend error messages are not translated here
        setError(err.response?.data?.message || t('profile_page.error_failed_password_change'));
    } finally {
        setIsPasswordChangeLoading(false);
    }
  }

  if (loading) {
    return <p style={{ color: 'white' }}>{t('profile_page.loading')}</p>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-layout">
        <div className="profile-card details-card">
          <div className="profile-card-header">
            <VscAccount size={24} />
            <h2>{t('profile_page.personal_information')}</h2>
          </div>
          {user ? (
            <div className="details-grid">
              <div className="detail-item"><span>{t('profile_page.full_name')}</span><p>{user.name} {user.familyName}</p></div>
              <div className="detail-item"><span>{t('profile_page.email')}</span><p>{user.email}</p></div>
              <div className="detail-item"><span>{t('profile_page.cin')}</span><p>{user.cin}</p></div>
              <div className="detail-item"><span>{t('profile_page.department')}</span><p>{user.department}</p></div>
              <div className="detail-item"><span>{t('profile_page.position')}</span><p>{user.position}</p></div>
              <div className="detail-item"><span>{t('profile_page.join_date')}</span><p>{new Date(user.joinDate).toLocaleDateString()}</p></div>
            </div>
          ) : (
            <p>{t('profile_page.error_load_profile')}</p>
          )}
        </div>

        <div className="profile-card password-card">
          <div className="profile-card-header">
            <VscKey size={24} />
            <h2>{t('profile_page.change_password_title')}</h2>
          </div>
          <form onSubmit={handleInitiatePasswordChange} className="password-form">
            <div className="form-group">
              <label htmlFor="old-password">{t('profile_page.old_password')}</label>
              <input id="old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="form-input" required />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">{t('profile_page.new_password')}</label>
              <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" required />
              <small>{t('profile_page.password_length_rule')}</small>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">{t('profile_page.confirm_new_password')}</label>
              <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-input" required />
            </div>

            {show2faInput && (
                 <div className="form-group two-fa-group">
                    <label htmlFor="2fa-code">{t('profile_page.enter_2fa_prompt')}</label>
                    <input id="2fa-code" type="text" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} className="form-input" style={{textAlign: 'center'}} required />
                </div>
            )}
            
            {error && <p className="form-message error">{error}</p>}
            {success && <p className="form-message success">{success}</p>}

            <div className="form-actions">
                {show2faInput ? (
                    <button type="button" onClick={handlePasswordChangeSubmit} className="button button-primary" disabled={isPasswordChangeLoading}>
                        <VscSave />
                        {isPasswordChangeLoading ? t('profile_page.saving_button') : t('profile_page.confirm_change_button')}
                    </button>
                ) : (
                    <button type="submit" className="button button-primary">
                        {t('profile_page.change_password_button')}
                    </button>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}