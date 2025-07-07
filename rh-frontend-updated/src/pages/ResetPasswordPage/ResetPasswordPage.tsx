import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // --- ADD IMPORT ---
import Stepper, { Step } from '../../components/Stepper/Stepper';
import API_URL from '../../config';

export function ResetPasswordPage() {
  const { t } = useTranslation(); // --- INITIALIZE THE HOOK ---
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cin, setCin] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => { navigate('/login'); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handleCinSubmit = async () => {
    if (!cin) return setError(t('reset_password_page.error_cin_required'));
    setError(''); setMessage(''); setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { cin });
      setMessage(response.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || t('reset_password_page.error_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (!resetCode) return setError(t('reset_password_page.error_code_required'));
    setError(''); setMessage(''); setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-code`, { cin, code: resetCode });
      setResetSessionToken(response.data.reset_session_token);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || t('reset_password_page.error_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    setError('');
    if (!newPassword || !confirmPassword) return setError(t('reset_password_page.error_fields_required'));
    if (newPassword.length < 8) return setError(t('reset_password_page.error_password_length'));
    if (newPassword !== confirmPassword) return setError(t('reset_password_page.error_passwords_no_match'));
    
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/auth/set-new-password`, 
        { newPassword },
        { headers: { Authorization: `Bearer ${resetSessionToken}` } }
      );
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || t('reset_password_page.error_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Stepper currentStep={step} onStepChange={setStep} disableStepIndicators={true}>
        <Step>
          <h2>{t('reset_password_page.step1_title')}</h2>
          <p>{t('reset_password_page.step1_subtitle')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input placeholder={t('reset_password_page.cin_placeholder')} value={cin} onChange={(e) => setCin(e.target.value)} disabled={loading} className="form-input" />
          </div>
          <div className="step-footer">
            <button onClick={() => navigate('/login')} disabled={loading} className="button button-secondary">{t('reset_password_page.cancel_button')}</button>
            <button onClick={handleCinSubmit} disabled={loading} className="button button-primary">
              {loading ? t('reset_password_page.sending_button') : t('reset_password_page.send_code_button')}
            </button>
          </div>
        </Step>

        <Step>
          <h2>{t('reset_password_page.step2_title')}</h2>
          <p>{t('reset_password_page.step2_subtitle')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input placeholder={t('reset_password_page.code_placeholder')} value={resetCode} onChange={(e) => setResetCode(e.target.value)} disabled={loading} className="form-input" />
          </div>
          <div className="step-footer">
            <button onClick={() => setStep(1)} disabled={loading} className="button button-secondary">{t('reset_password_page.back_button')}</button>
            <button onClick={handleVerifyCodeSubmit} disabled={loading || !resetCode} className="button button-primary">
              {loading ? t('reset_password_page.verifying_button') : t('reset_password_page.verify_button')}
            </button>
          </div>
        </Step>

        <Step>
          <h2>{t('reset_password_page.step3_title')}</h2>
          <p>{t('reset_password_page.step3_subtitle')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input placeholder={t('reset_password_page.new_password_placeholder')} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} className="form-input" />
            <input placeholder={t('reset_password_page.confirm_password_placeholder')} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className="form-input" />
          </div>
          <div className="step-footer">
            <button onClick={() => navigate('/login')} disabled={loading} className="button button-secondary">{t('reset_password_page.cancel_button')test}</button>
            <button onClick={handleResetPasswordSubmit} disabled={loading} className="button button-primary">
              {loading ? t('reset_password_page.resetting_button') : t('reset_password_page.reset_button')}
            </button>
          </div>
        </Step>

        <Step>
            <h2>{t('reset_password_page.step4_title')}</h2>
            <p>{t('reset_password_page.step4_subtitle')}</p>
        </Step>
      </Stepper>
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{error}</p>}
      {message && !error && <p style={{ color: 'lime', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}