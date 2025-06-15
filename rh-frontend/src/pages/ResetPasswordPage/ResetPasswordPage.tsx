import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Stepper, { Step } from '../../components/Stepper/Stepper';

const API_URL = 'http://localhost:3000';

export function ResetPasswordPage() {
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

  // --- ADD THIS useEffect to handle the redirection ---
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000); // 5-second delay

      // Cleanup the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handleCinSubmit = async () => {
    if (!cin) return setError('Please enter your CIN.');
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { cin });
      setMessage(response.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (!resetCode) return setError('Please enter the reset code.');
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-code`, { cin, code: resetCode });
      setResetSessionToken(response.data.reset_session_token);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    setError('');
    if (!newPassword || !confirmPassword) return setError('Please fill out both password fields.');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters long.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/auth/set-new-password`, 
        { newPassword },
        { headers: { Authorization: `Bearer ${resetSessionToken}` } }
      );
      // --- On success, simply go to the next step ---
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Stepper currentStep={step} onStepChange={setStep} disableStepIndicators={true}>
        {/* Step 1: Enter CIN */}
        <Step>
          <h2>Reset Your Password</h2>
          <p>Please enter your CIN number to receive a reset code.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input 
              placeholder="CIN Number" 
              value={cin} 
              onChange={(e) => setCin(e.target.value)} 
              disabled={loading} 
              className="form-input" 
            />
          </div>
          <div className="step-footer">
            <button onClick={() => navigate('/login')} disabled={loading} className="button button-secondary">Cancel</button>
            <button onClick={handleCinSubmit} disabled={loading} className="button button-primary">
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        </Step>

        {/* Step 2: Enter Code */}
        <Step>
          <h2>Enter Reset Code</h2>
          <p>Please check your email for the 8-digit reset code and enter it below.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input 
              placeholder="8-Digit Reset Code" 
              value={resetCode} 
              onChange={(e) => setResetCode(e.target.value)} 
              disabled={loading} 
              className="form-input" 
            />
          </div>
          <div className="step-footer">
            <button onClick={() => setStep(1)} disabled={loading} className="button button-secondary">Back</button>
            <button onClick={handleVerifyCodeSubmit} disabled={loading || !resetCode} className="button button-primary">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </Step>

        {/* Step 3: Set New Password */}
        <Step>
          <h2>Choose a New Password</h2>
          <p>Your new password must be at least 8 characters long.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <input 
              placeholder="New Password" 
              type="password"
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              disabled={loading} 
              className="form-input" 
            />
            <input 
              placeholder="Confirm New Password" 
              type="password"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              disabled={loading} 
              className="form-input" 
            />
          </div>
          <div className="step-footer">
            <button onClick={() => navigate('/login')} disabled={loading} className="button button-secondary">Cancel</button>
            <button onClick={handleResetPasswordSubmit} disabled={loading} className="button button-primary">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </Step>

        {/* --- ADDED STEP 4: SUCCESS MESSAGE --- */}
        <Step>
            <h2>Password Reset Successful!</h2>
            <p>We are redirecting you to the login page in 5 seconds...</p>
        </Step>
      </Stepper>
      {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{error}</p>}
      {message && !error && <p style={{ color: 'lime', textAlign: 'center', marginTop: '1.5rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}