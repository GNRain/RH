import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { VscAccount, VscKey, VscSave } from 'react-icons/vsc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

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

const Profile = () => {
  const { t } = useTranslation();
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
      return setError(t('profile_page.error_password_length'));
    }
    if (newPassword !== confirmPassword) {
      return setError(t('profile_page.error_passwords_no_match'));
    }
    setShow2faInput(true);
  };
  
  const handlePasswordChangeSubmit = async () => {
    if (!twoFactorCode) {
        return setError(t('profile_page.error_2fa_required'));
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
        toast({
          title: "Success",
          description: response.data.message,
        });
    } catch (err: any) {
        setError(err.response?.data?.message || t('profile_page.error_failed_password_change'));
        toast({
          title: "Error",
          description: err.response?.data?.message || t('profile_page.error_failed_password_change'),
          variant: "destructive",
        });
    } finally {
        setIsPasswordChangeLoading(false);
    }
  }

  if (loading) {
    return <p className="text-white">{t('profile_page.loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('profile_page.personal_information')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('profile_page.personal_information')}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Update your personal details below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">{t('profile_page.full_name')}</Label>
                <Input id="name" value={`${user.name} ${user.familyName}`} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">{t('profile_page.email')}</Label>
                <Input id="email" type="email" value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cin" className="text-gray-700 dark:text-gray-300">{t('profile_page.cin')}</Label>
                <Input id="cin" value={user.cin} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-gray-700 dark:text-gray-300">{t('profile_page.position')}</Label>
                <Input id="position" value={user.position} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-700 dark:text-gray-300">{t('profile_page.department')}</Label>
                <Input id="department" value={user.department} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate" className="text-gray-700 dark:text-gray-300">{t('profile_page.join_date')}</Label>
                <Input id="joinDate" value={new Date(user.joinDate).toLocaleDateString()} disabled />
              </div>
            </div>
          ) : (
            <p>{t('profile_page.error_load_profile')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('profile_page.change_password_title')}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Update your password below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleInitiatePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="old-password">{t('profile_page.old_password')}</Label>
              <Input id="old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="new-password">{t('profile_page.new_password')}</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <p className="text-sm text-gray-500 mt-1">{t('profile_page.password_length_rule')}</p>
            </div>
            <div>
              <Label htmlFor="confirm-password">{t('profile_page.confirm_new_password')}</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>

            {show2faInput && (
              <div>
                <Label htmlFor="2fa-code">{t('profile_page.enter_2fa_prompt')}</Label>
                <Input id="2fa-code" type="text" value={twoFactorCode} onChange={e => setTwoFactorCode(e.target.value)} required />
              </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <Button type={show2faInput ? "button" : "submit"} onClick={show2faInput ? handlePasswordChangeSubmit : undefined} disabled={isPasswordChangeLoading} className="w-full">
              <VscSave className="mr-2" />
              {isPasswordChangeLoading ? t('profile_page.saving_button') : (show2faInput ? t('profile_page.confirm_change_button') : t('profile_page.change_password_button'))}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
