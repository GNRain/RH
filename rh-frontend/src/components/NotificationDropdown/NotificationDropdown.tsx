import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AnimatedList from '../AnimatedList/AnimatedList';
import './NotificationDowndown.css';
import { VscMail, VscCircleFilled } from "react-icons/vsc";

const API_URL = 'http://localhost:3000';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
        const token = localStorage.getItem('access_token');
        await axios.patch(`${API_URL}/notifications/${notification.id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Update the state locally for immediate feedback
        setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
    } catch (error) {
        console.error("Failed to mark notification as read", error);
    }
  };

  if (loading) {
    return <div className="notification-dropdown loading">Loading...</div>;
  }

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h4>Notifications</h4>
      </div>
      {notifications.length === 0 ? (
        <div className="no-notifications">
            <VscMail size={32} />
            <p>You have no new notifications.</p>
        </div>
      ) : (
        <AnimatedList
          items={notifications}
          onItemSelect={handleMarkAsRead}
          renderItem={(item, index, isSelected) => (
            <div className={`notification-item ${isSelected ? 'selected' : ''} ${item.isRead ? 'read' : ''}`}>
              {!item.isRead && <VscCircleFilled className="unread-dot" />}
              <div className="notification-content">
                <p className="notification-message">{item.message}</p>
                <p className="notification-time">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}