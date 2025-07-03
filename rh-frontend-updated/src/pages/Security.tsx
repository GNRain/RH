import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import API_URL from '../config';
import { Skeleton } from '@/components/ui/skeleton';

const SecurityPage = () => {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuth(); // Assuming useAuth provides the current user and a way to refetch
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the modals
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setIs2faEnabled(user.isTwoFactorEnabled);
      setIsLoading(false);
    }
  }, [user]);

  const handleToggleChange = (checked: boolean) => {
    setError('');
    setVerificationCode('');
    if (checked) {
      // User wants to enable 2FA
      handleEnable2fa();
    } else {
      // User wants to disable 2FA
      setShowDisableModal(true);
    }
  };

  const handleEnable2fa = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/auth/2fa/generate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQrCode(response.data.qrCodeImage);
      setShowEnableModal(true);
    } catch (err) {
      toast({ title: t('toast.error_title'), description: t('security_page.generate_qr_error'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      setError(t('security_page.code_length_error'));
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/auth/2fa/turn-on`, { code: verificationCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: t('toast.success_title'), description: t('security_page.enable_success') });
      setShowEnableModal(false);
      await fetchUser(); // Refetch user data to update context and UI
    } catch (err) {
      setError(t('security_page.invalid_code_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAndDisable = async () => {
    if (verificationCode.length !== 6) {
      setError(t('security_page.code_length_error'));
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/auth/2fa/turn-off`, { code: verificationCode }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: t('toast.success_title'), description: t('security_page.disable_success') });
      setShowDisableModal(false);
      await fetchUser(); // Refetch user data
    } catch (err) {
      setError(t('security_page.invalid_code_error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('security_page.title')}</CardTitle>
          <CardDescription>{t('security_page.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="two-factor-auth" className="flex flex-col space-y-1">
              <span>{t('security_page.2fa_label')}</span>
              <span className="font-normal leading-snug text-muted-foreground">
                {t('security_page.2fa_description')}
              </span>
            </Label>
<Switch
  id="two-factor-auth"
  // Add this className
  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500"
  checked={is2faEnabled}
  onCheckedChange={handleToggleChange}
  disabled={isSubmitting}
/>
          </div>
        </CardContent>
      </Card>

      {/* Enable 2FA Modal */}
      <Dialog open={showEnableModal} onOpenChange={setShowEnableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('security_page.enable_modal_title')}</DialogTitle>
            <DialogDescription>{t('security_page.enable_modal_desc')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <p>{t('security_page.scan_qr')}</p>
            <img src={qrCode} alt="2FA QR Code" className="p-2 border rounded-lg" />
            <p className="text-sm text-muted-foreground">{t('security_page.enter_code')}</p>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">{t('common.cancel')}</Button></DialogClose>
            <Button onClick={handleVerifyAndEnable} disabled={isSubmitting}>
              {t('security_page.verify_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Modal */}
      <Dialog open={showDisableModal} onOpenChange={setShowDisableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('security_page.disable_modal_title')}</DialogTitle>
            <DialogDescription>{t('security_page.disable_modal_desc')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="disable-code">{t('security_page.enter_code_to_disable')}</Label>
            <Input
              id="disable-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">{t('common.cancel')}</Button></DialogClose>
            <Button variant="destructive" onClick={handleConfirmAndDisable} disabled={isSubmitting}>
              {t('security_page.disable_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecurityPage;