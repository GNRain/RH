// src/pages/LoginPage/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Stepper, { Step } from '../../components/Stepper/Stepper';

const API_URL = 'http://localhost:3000';

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [partialToken, setPartialToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        onLoginSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onLoginSuccess]);


   const handleLoginSubmit = async () => {
    if (!cin || !password) return setError('CIN and Password are required.');
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { cin, password });
      
      if (response.data.message === '2FA code required') {
        setPartialToken(response.data.partial_token);
        setStep(3);
      } else {
        // --- THIS IS THE CHANGE ---
        // 1. Store the token in localStorage
        localStorage.setItem('access_token', response.data.access_token);
        // 2. Tell the App component the login was successful
        onLoginSuccess();
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
      
      // --- THIS IS THE CHANGE ---
      // 1. Store the final token in localStorage
      localStorage.setItem('access_token', response.data.access_token);
      // 2. Tell the App component the login was successful
      onLoginSuccess();
      
      setShow2faForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };
  
  // The outer full-screen centering div has been REMOVED.
  // The centering is now handled globally by index.css
  return (
    <div>
      <Stepper currentStep={step} onStepChange={setStep} disableStepIndicators={true}>
        {/* Step 1 */}
        <Step>
          <h2>Welcome to HRG portal</h2>
          <p>Proceed to sign-in</p>
          <div className="step-footer" style={{ justifyContent: 'flex-end' }}>
            <button onClick={() => setStep(2)} className="button button-primary">Next</button>
          </div>
        </Step>
        {/* Step 2 */}
        <Step>
          <h2>Please enter your credentials</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input placeholder="CIN Number" value={cin} onChange={(e) => setCin(e.target.value)} disabled={loading} className="form-input" />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="form-input" />
          </div>
          <div className="step-footer">
            <button onClick={handleBack} disabled={loading} className="button button-secondary">Previous</button>
            <button onClick={handleLoginSubmit} disabled={loading} className="button button-primary">{loading ? 'Signing In...' : 'Sign In'}</button>
          </div>
        </Step>
        {/* Step 3 */}
        <Step>
          <h2>Please enter your 2FA code</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input placeholder="2FA Code" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} disabled={loading} className="form-input" style={{textAlign: 'center'}}/>
          </div>
          <div className="step-footer">
            <button onClick={handleBack} disabled={loading} className="button button-secondary">Previous</button>
            <button onClick={handle2faSubmit} disabled={loading} className="button button-primary">{loading ? 'Verifying...' : 'Verify'}</button>
          </div>
        </Step>
        {/* Step 4 */}
        <Step>
          <h2>You have been successfully signed-in!</h2>
          <p>We are redirecting you shortly.</p>
        </Step>
      </Stepper>
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{error}</p>}
    </div>
  );
}