import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import API_URL from '../config';


const Security = () => {
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSetupLoading, setTwoFactorSetupLoading] = useState(false);
  const [twoFactorVerifyLoading, setTwoFactorVerifyLoading] = useState(false);
  const [twoFactorDisableLoading, setTwoFactorDisableLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetch2FAStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/auth/2fa/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTwoFactorEnabled(response.data.is2faEnabled);
    } catch (err) {
      console.error("Failed to fetch 2FA status", err);
    }
  };

  useEffect(() => {
    fetch2FAStatus();
  }, []);

  const handleEnable2FA = async () => {
    setTwoFactorSetupLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/auth/2fa/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQrCode(response.data.qrCodeImage);
      setTwoFactorSetupLoading(false);
      toast({
        title: t('security_page.2fa_setup_title'),
        description: t('security_page.scan_qr'),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('security_page.error_2fa_setup'));
      setTwoFactorSetupLoading(false);
      toast({
        title: "Error",
        description: err.response?.data?.message || t('security_page.error_2fa_setup'),
        variant: "destructive",
      });
    }
  };

  const handleVerify2FA = async () => {
    setTwoFactorVerifyLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/auth/2fa/verify`, { token: twoFactorCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTwoFactorEnabled(true);
      setQrCode('');
      setTwoFactorCode('');
      setTwoFactorVerifyLoading(false);
      setSuccess(t('security_page.2fa_enabled_success'));
      toast({
        title: "2FA Enabled",
        description: t('security_page.2fa_enabled_success'),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('security_page.error_2fa_verify'));
      setTwoFactorVerifyLoading(false);
      toast({
        title: "Error",
        description: err.response?.data?.message || t('security_page.error_2fa_verify'),
        variant: "destructive",
      });
    }
  };

  const handleDisable2FA = async () => {
    setTwoFactorDisableLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/auth/2fa/disable`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTwoFactorEnabled(false);
      setQrCode('');
      setTwoFactorCode('');
      setTwoFactorDisableLoading(false);
      setSuccess(t('security_page.2fa_disabled_success'));
      toast({
        title: "2FA Disabled",
        description: t('security_page.2fa_disabled_success'),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || t('security_page.error_2fa_disable'));
      setTwoFactorDisableLoading(false);
      toast({
        title: "Error",
        description: err.response?.data?.message || t('security_page.error_2fa_disable'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('security_page.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('security_page.subtitle')}
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('security_page.2fa_title')}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('security_page.2fa_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
              disabled={twoFactorSetupLoading || twoFactorVerifyLoading || twoFactorDisableLoading}
            />
            <Label htmlFor="two-factor" className="text-gray-700 dark:text-gray-300">
              {twoFactorEnabled ? t('security_page.2fa_enabled') : t('security_page.2fa_disabled')}
            </Label>
          </div>

          {qrCode && !twoFactorEnabled && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md space-y-4 text-center">
              <p className="text-sm text-blue-800 dark:text-blue-200">{t('security_page.scan_qr')}</p>
              <img src={qrCode} alt="QR Code" className="mx-auto" />
              <div>
                <Label htmlFor="2fa-code-input" className="text-gray-700 dark:text-gray-300">{t('security_page.enter_code')}</Label>
                <Input
                  id="2fa-code-input"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder={t('security_page.code_placeholder')}
                  className="max-w-xs mx-auto mt-2"
                />
              </div>
              <Button onClick={handleVerify2FA} disabled={twoFactorVerifyLoading || !twoFactorCode}>
                {twoFactorVerifyLoading ? t('security_page.verifying_button') : t('security_page.verify_button')}
              </Button>
            </div>
          )}

          {twoFactorEnabled && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('security_page.2fa_enabled_message')}
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default Security;