import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { VscSettings, VscBell, VscGlobe, VscSignOut } from 'react-icons/vsc';
import { NotificationDropdown } from '../NotificationDropdown/NotificationDropdown';
import { Avatar } from '../Avatar/Avatar';
import './Header.css';

// A custom hook to detect clicks outside an element
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

// Define types for props
interface UserData {
  name: string;
  // Add other user properties as needed in the future
}

interface HeaderProps {
    user: UserData | null;
    onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  useOutsideClick(notificationRef, () => {
    if (isNotificationOpen) setIsNotificationOpen(false);
  });

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
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>
            {isNotificationOpen && (
                <NotificationDropdown 
                    onNotificationsLoaded={handleNotificationsLoaded}
                    onNotificationRead={handleNotificationRead}
                />
            )}
        </div>
        <button className="action-btn" title="Language"><VscGlobe size={20} /></button>
      </div>
      <div className="header-profile">
        <span>Bonjour, {user?.name}</span>
        <Avatar name={user?.name} />
        <button className="action-btn logout-btn" title="Logout" onClick={onLogout}>
            <VscSignOut size={20} />
        </button>
      </div>
    </header>
  );
}