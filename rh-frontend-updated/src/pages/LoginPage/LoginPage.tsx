import React, { useState } from 'react';
import apiClient from '../../api'; // --- Use the new API client ---
import Stepper, { Step } from '../../components/Stepper/Stepper';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LoginHeader } from '../../components/LoginHeader';
import './LoginPage.css';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [partialToken, setPartialToken] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Logic functions remain the same
  const resetFlowState = () => {};
  const handleNextStep = () => setStep(prev => prev + 1);

  const handleLoginSubmit = async () => {
    if (!cin || !password) { toast({ title: t('login_page.error_title'), description: t('login_page.error_cin_required'), variant: "destructive" }); return; }
    resetFlowState(); setLoading(true);
    try {
      // --- Use apiClient for the request ---
      const response = await apiClient.post('/auth/login', { cin, password });
      if (response.data.access_token) { setStep(4); login(response.data.access_token); }
      else if (response.data.partial_token) { setPartialToken(response.data.partial_token); setStep(3); }
    } catch (err: any) {
      toast({ title: t('login_page.error_title'), description: err.response?.data?.message || 'An unexpected error occurred.', variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handle2faSubmit = async () => {
    if (!twoFactorCode) { toast({ title: t('login_page.error_title'), description: t('login_page.error_2fa_code_required'), variant: "destructive" }); return; }
    setLoading(true);
    try {
      // --- Use apiClient for the request ---
      const response = await apiClient.post('/auth/2fa/authenticate', { partial_token: partialToken, code: twoFactorCode });
      setStep(4); login(response.data.access_token);
    } catch (err: any) {
      toast({ title: t('login_page.error_title'), description: err.response?.data?.message || 'An unexpected error occurred.', variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleBack = () => { resetFlowState(); setStep(prev => prev - 1); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentStep: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep === 2) handleLoginSubmit();
      if (currentStep === 3) handle2faSubmit();
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-logo">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-xl font-bold text-foreground">{t('erpSystem')}</span>
        </div>
      </div>

      <LoginHeader />

      <div className="login-form-wrapper">
        <Stepper currentStep={step} onStepChange={setStep} disableStepIndicators={true}>

          <Step>
            <h2 className="text-foreground text-2xl font-semibold">{t('login_page.welcome_title')}</h2>
            <p className="text-muted-foreground mt-2">{t('login_page.welcome_subtitle')}</p>
            <div className="step-footer" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button onClick={handleNextStep} className="button button-primary">{t('login_page.next_button')}</button>
            </div>
          </Step>

          <Step>
            <h2 className="text-foreground text-2xl font-semibold">{t('login_page.credentials_title')}</h2>
            <div className="flex flex-col gap-4 mt-6">
              <input
                placeholder={t('login_page.cin_placeholder')}
                value={cin}
                onChange={(e) => setCin(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                disabled={loading}
                className="form-input"
              />
              <input
                placeholder={t('login_page.password_placeholder')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                disabled={loading}
                className="form-input"
              />
            </div>
            <div className="text-right mt-3">
              <Link to="/reset-password" className="forgot-password-link">{t('login_page.forgot_password_link')}</Link>
            </div>
            <div className="step-footer mt-4">
              <button onClick={handleBack} disabled={loading} className="button button-secondary">{t('login_page.previous_button')}</button>
              <button onClick={handleLoginSubmit} disabled={loading} className="button button-primary">
                {loading ? t('login_page.signing_in_button') : t('login_page.sign_in_button')}
              </button>
            </div>
          </Step>

          <Step>
            <h2 className="text-foreground text-2xl font-semibold">{t('login_page.enter_2fa_title')}</h2>
            <div className="flex flex-col gap-4 mt-6">
              <input
                placeholder={t('login_page.code_placeholder')}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 3)}
                disabled={loading}
                className="form-input text-center tracking-widest"
              />
            </div>
            <div className="step-footer mt-4">
              <button onClick={handleBack} disabled={loading} className="button button-secondary">{t('login_page.previous_button')}</button>
              <button onClick={handle2faSubmit} disabled={loading} className="button button-primary">
                {loading ? t('login_page.verifying_button') : t('login_page.verify_button')}
              </button>
            </div>
          </Step>

          <Step>
            <h2 className="text-foreground text-2xl font-semibold">{t('login_page.success_title')}</h2>
            <p className="text-muted-foreground mt-2">{t('login_page.success_subtitle')}</p>
          </Step>

        </Stepper>
        
      </div>
    </div>
  );
}