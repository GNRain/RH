import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Stepper, { Step } from '../../components/Stepper/Stepper';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
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
  

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        onLoginSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onLoginSuccess]);

  const resetFlowState = () => {
    setError('');
    setQrCodeImage(null);
    setIsSettingUp2fa(false);
    setIsShowingQr(false);
  };

  const handleLoginSubmit = async () => {
    if (!cin || !password) return setError('CIN and Password are required.');
    resetFlowState();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { cin, password });
      
      if (response.data.message === '2FA setup required') {
        setPartialToken(response.data.partial_token);
        setQrCodeImage(response.data.qrCodeImage);
        setIsSettingUp2fa(true);
        setIsShowingQr(true);
        setStep(3);
      } else if (response.data.message === '2FA code required') {
        setPartialToken(response.data.partial_token);
        setStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = async () => {
    if (!twoFactorCode) return setError('Please enter a valid 6-digit code.');
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/2fa/authenticate`,
        { code: twoFactorCode },
        { headers: { Authorization: `Bearer ${partialToken}` } }
      );
      
      localStorage.setItem('access_token', response.data.access_token);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handle2faSetupSubmit = async () => {
    if (!twoFactorCode) return setError('Please enter a valid 6-digit code from your app.');
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/2fa/turn-on`,
        { code: twoFactorCode },
        { headers: { Authorization: `Bearer ${partialToken}` } }
      );
      
      localStorage.setItem('access_token', response.data.access_token);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    resetFlowState();
    setStep(step - 1);
  };
  
  // --- DEFINE THE OVERRIDE HEIGHT ---
  const stepperHeight = isSettingUp2fa && isShowingQr ? 550 : undefined;

  return (
    <div>
      {/* --- PASS THE OVERRIDE HEIGHT TO THE STEPPER --- */}
      <Stepper 
        currentStep={step} 
        onStepChange={setStep} 
        overrideHeight={stepperHeight}
        disableStepIndicators={true}
      >
        {/* Step 1: Welcome */}
        <Step>
          <h2>Welcome to HRG portal</h2>
          <p>Proceed to sign-in</p>
          <div className="step-footer" style={{ justifyContent: 'flex-end' }}>
            <button onClick={() => setStep(2)} className="button button-primary">Next</button>
          </div>
        </Step>
        
        {/* Step 2: Credentials */}
        <Step>
          <h2>Please enter your credentials</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input placeholder="CIN Number" value={cin} onChange={(e) => setCin(e.target.value)} disabled={loading} className="form-input" />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="form-input" />
          </div>
                    {/* --- ADD THIS LINK --- */}
          <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
            <Link to="/reset-password" className="forgot-password-link">
              Password Forgotten?
            </Link>
          </div>
          {/* --- END OF LINK --- */}
          <div className="step-footer">
            <button onClick={handleBack} disabled={loading} className="button button-secondary">Previous</button>
            <button onClick={handleLoginSubmit} disabled={loading} className="button button-primary">{loading ? 'Signing In...' : 'Sign In'}</button>
          </div>
        </Step>

        {/* Step 3: Conditional 2FA View */}
        <Step>
          {isSettingUp2fa && isShowingQr ? (
            <>
              <h2>Set up 2-Factor Authentication</h2>
              <p style={{ marginTop: '1rem' }}>Scan the QR code with your authenticator app (e.g., Google Authenticator), then click "Done".</p>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
                <img src={qrCodeImage!} alt="2FA QR Code" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }} />
              </div>
              <div className="step-footer">
                <button onClick={handleBack} disabled={loading} className="button button-secondary">Previous</button>
                <button onClick={() => setIsShowingQr(false)} className="button button-primary">Done</button>
              </div>
            </>
          ) : (
            <>
              <h2>Please enter your 2FA code</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                <input placeholder="6-Digit Code" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} disabled={loading} className="form-input" style={{textAlign: 'center'}}/>
              </div>
              <div className="step-footer">
                <button onClick={handleBack} disabled={loading} className="button button-secondary">Previous</button>
                <button onClick={isSettingUp2fa ? handle2faSetupSubmit : handle2faSubmit} disabled={loading} className="button button-primary">
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </>
          )}
        </Step>
        
        {/* Step 4: Success */}
        <Step>
          <h2>You have been successfully signed-in!</h2>
          <p>We are redirecting you shortly.</p>
        </Step>
      </Stepper>
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{error}</p>}
    </div>
  );
}