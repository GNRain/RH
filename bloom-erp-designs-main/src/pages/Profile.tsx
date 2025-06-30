
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@company.com",
    position: "System Administrator",
    department: "IT Department",
    phone: "+1 (555) 123-4567",
    address: "123 Business St, City, State 12345"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving profile data:", formData);
    // Add save logic here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('profile')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Update your personal details below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">{t('name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="text-gray-700 dark:text-gray-300">{t('position')}</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-700 dark:text-gray-300">{t('department')}</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">{t('phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">{t('address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="pt-4">
            <Button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
