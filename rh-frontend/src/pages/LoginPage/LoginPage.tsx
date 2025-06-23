import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Stepper, { Step } from '../../components/Stepper/Stepper';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // --- ADD IMPORT ---

const API_URL = 'http://localhost:3000';

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const { t } = useTranslation(); // --- INITIALIZE THE HOOK ---
  const [step, setStep] = useState(1);
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [partialToken, setPartialToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isSettingUp2fa, setIsSettingUp2fa] = useState(false);
  const [isShowingQr, setIsShowingQr] = useState(false);
  
  // ... (all logic functions remain the same) ...

  const resetFlowState = () => {
    setError(''); setQrCodeImage(null); setIsSettingUp2fa(false); setIsShowingQr(false);
  };
  const handleLoginSubmit = async () => {
    if (!cin || !password) return setError('CIN and Password are required.');
    resetFlowState(); setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { cin, password });
      if (response.data.message === '2FA setup required') {
        setPartialToken(response.data.partial_token); setQrCodeImage(response.data.qrCodeImage);
        setIsSettingUp2fa(true); setIsShowingQr(true); setStep(3);
      } else if (response.data.message === '2FA code required') {
        setPartialToken(response.data.partial_token); setStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally { setLoading(false); }
  };
  const handle2faSubmit = async () => {
    if (!twoFactorCode) return setError('Please enter a valid 6-digit code.');
    setError(''); setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/2fa/authenticate`, { code: twoFactorCode }, { headers: { Authorization: `Bearer ${partialToken}` } });
      localStorage.setItem('access_token', response.data.access_token); setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally { setLoading(false); }
  };
  const handle2faSetupSubmit = async () => {
    if (!twoFactorCode) return setError('Please enter a valid 6-digit code from your app.');
    setError(''); setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/2fa/turn-on`, { code: twoFactorCode }, { headers: { Authorization: `Bearer ${partialToken}` } });
      localStorage.setItem('access_token', response.data.access_token); setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally { setLoading(false); }
  };
  const handleBack = () => { resetFlowState(); setStep(step - 1); };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => onLoginSuccess(), 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onLoginSuccess]);
  
  const stepperHeight = isSettingUp2fa && isShowingQr ? 550 : undefined;

  return (
    <div>
      <Stepper currentStep={step} onStepChange={setStep} overrideHeight={stepperHeight} disableStepIndicators={true}>
        {/* --- JSX NOW USES THE t() FUNCTION --- */}
        <Step>
          <h2>{t('login_page.welcome_title')}</h2>
          <p>{t('login_page.welcome_subtitle')}</p>
          <div className="step-footer" style={{ justifyContent: 'flex-end' }}>
            <button onClick={() => setStep(2)} className="button button-primary">{t('login_page.next_button')}</button>
          </div>
        </Step>
        
        <Step>
          <h2>{t('login_page.credentials_title')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input placeholder={t('login_page.cin_placeholder')} value={cin} onChange={(e) => setCin(e.target.value)} disabled={loading} className="form-input" />
            <input placeholder={t('login_page.password_placeholder')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="form-input" />
          </div>
          <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
            <Link to="/reset-password" className="forgot-password-link">{t('login_page.forgot_password_link')}</Link>
          </div>
          <div className="step-footer">
            <button onClick={handleBack} disabled={loading} className="button button-secondary">{t('login_page.previous_button')}</button>
            <button onClick={handleLoginSubmit} disabled={loading} className="button button-primary">{loading ? t('login_page.signing_in_button') : t('login_page.sign_in_button')}</button>
          </div>
        </Step>

        <Step>
          {isSettingUp2fa && isShowingQr ? (
            <>
              <h2>{t('login_page.setup_2fa_title')}</h2>
              <p style={{ marginTop: '1rem' }}>{t('login_page.setup_2fa_subtitle')}</p>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
                <img src={qrCodeImage!} alt="2FA QR Code" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }} />
              </div>
              <div className="step-footer">
                <button onClick={handleBack} disabled={loading} className="button button-secondary">{t('login_page.previous_button')}</button>
                <button onClick={() => setIsShowingQr(false)} className="button button-primary">{t('login_page.done_button')}</button>
              </div>
            </>
          ) : (
            <>
              <h2>{t('login_page.enter_2fa_title')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                <input placeholder={t('login_page.code_placeholder')} value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} disabled={loading} className="form-input" style={{textAlign: 'center'}}/>
              </div>
              <div className="step-footer">
                <button onClick={handleBack} disabled={loading} className="button button-secondary">{t('login_page.previous_button')}</button>
                <button onClick={isSettingUp2fa ? handle2faSetupSubmit : handle2faSubmit} disabled={loading} className="button button-primary">
                  {loading ? t('login_page.verifying_button') : t('login_page.verify_button')}
                </button>
              </div>
            </>
          )}
        </Step>
        
        <Step>
          <h2>{t('login_page.success_title')}</h2>
          <p>{t('login_page.success_subtitle')}</p>
        </Step>
      </Stepper>
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{error}</p>}
    </div>
  );
}