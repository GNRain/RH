// src/components/Header/Header.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VscSettings, VscBell, VscGlobe, VscSignOut, VscCheck } from 'react-icons/vsc';
import { NotificationDropdown } from '../NotificationDropdown/NotificationDropdown';
import { Avatar } from '../Avatar/Avatar';
import { LeaveBalanceIndicator } from '../LeaveBalanceIndicator/LeaveBalanceIndicator';
import './Header.css';

// Custom hook to detect clicks outside an element
const useOutsideClick = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          callback();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, callback]);
};

interface UserData {
  name: string;
}

interface HeaderProps {
    user: UserData | null;
    onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // State for Notification Dropdown
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  useOutsideClick(notificationRef, () => setIsNotificationOpen(false));

  // --- NEW: State and logic for Language Dropdown ---
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick(langDropdownRef, () => setIsLangDropdownOpen(false));

  const selectLanguage = (langCode: 'en' | 'fr') => {
    i18n.changeLanguage(langCode);
    setIsLangDropdownOpen(false); // Close dropdown after selection
  };
  // --- END OF NEW LOGIC ---

  const handleNotificationsLoaded = (notifications: any[]) => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  };

  const handleNotificationRead = () => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  return (
    <header className="header">
      <div className="header-actions">
        <button className="action-btn" title="Settings" onClick={() => navigate('/profile')}>
            <VscSettings size={20} />
        </button>
        <div ref={notificationRef} style={{ position: 'relative' }}>
            <button className="action-btn" title="Notifications" onClick={() => setIsNotificationOpen(p => !p)}>
                <VscBell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isNotificationOpen && (
                <NotificationDropdown 
                    onNotificationsLoaded={handleNotificationsLoaded}
                    onNotificationRead={handleNotificationRead}
                />
            )}
        </div>
        
        {/* --- UPDATED: Language button now opens a dropdown --- */}
        <div ref={langDropdownRef} style={{ position: 'relative' }}>
          <button className="action-btn" title="Language" onClick={() => setIsLangDropdownOpen(p => !p)}>
              <VscGlobe size={20} />
          </button>
          {isLangDropdownOpen && (
            <div className="lang-dropdown">
              <button className="lang-option" onClick={() => selectLanguage('en')}>
                <span>English</span>
                {i18n.language === 'en' && <VscCheck />}
              </button>
              <button className="lang-option" onClick={() => selectLanguage('fr')}>
                <span>Français</span>
                {i18n.language === 'fr' && <VscCheck />}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="header-profile">
        <LeaveBalanceIndicator />
        <span>{t('header.greeting', { name: user?.name })}</span>
        <Avatar name={user?.name} />
        <button className="action-btn logout-btn" title="Logout" onClick={onLogout}>
            <VscSignOut size={20} />
        </button>
      </div>
    </header>
  );
}