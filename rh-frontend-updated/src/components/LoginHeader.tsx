import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Globe } from "lucide-react";

export const LoginHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  return (
    <header className="absolute top-0 right-0 p-4 flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="fr">FR</SelectItem>
            </SelectContent>
        </Select>
      </div>
      
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    </header>
  );
};