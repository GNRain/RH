
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

const Security = () => {
  const { t } = useLanguage();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [backupEmail, setBackupEmail] = useState("backup@company.com");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match!");
      return;
    }
    console.log("Changing password...");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleBackupEmailSave = () => {
    console.log("Saving backup email:", backupEmail);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('security')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account security settings
        </p>
      </div>

      {/* Change Password */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('changePassword')}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-gray-700 dark:text-gray-300">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-gray-700 dark:text-gray-300">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <Button 
            onClick={handlePasswordChange}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Backup Email */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('backupEmail')}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Set a backup email for account recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-email" className="text-gray-700 dark:text-gray-300">Backup Email Address</Label>
            <Input
              id="backup-email"
              type="email"
              value={backupEmail}
              onChange={(e) => setBackupEmail(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <Button 
            onClick={handleBackupEmailSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('save')}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('twoFactorAuth')}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
            <Label htmlFor="two-factor" className="text-gray-700 dark:text-gray-300">
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
          {twoFactorEnabled && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                Two-factor authentication is enabled. You'll receive a code via SMS or email when logging in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Security;
