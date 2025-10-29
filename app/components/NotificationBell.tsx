'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Droplet, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import styles from './NotificationBell.module.css';

interface Notification {
  id: string;
  type: 'success' | 'pending' | 'urgent' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage
  useEffect(() => {
    const storedNotifications = localStorage.getItem('bloodNotifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed);
      updateUnreadCount(parsed);
    }

    // Listen for new notifications
    const handleNewNotification = () => {
      const storedNotifications = localStorage.getItem('bloodNotifications');
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed);
        updateUnreadCount(parsed);
      }
    };

    window.addEventListener('newNotification', handleNewNotification);
    window.addEventListener('notificationUpdate', handleNewNotification);

    // Check for new notifications periodically
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
      window.removeEventListener('notificationUpdate', handleNewNotification);
      clearInterval(interval);
    };
  }, []);

  // Update unread count
  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  // Check for new notifications from user's requests
  const checkForNewNotifications = () => {
    const userRequests = localStorage.getItem('userBloodRequests');
    if (!userRequests) return;

    const requests = JSON.parse(userRequests);
    // Here you would check the status of each request
    // For now, we'll just keep existing notifications
  };

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    localStorage.setItem('bloodNotifications', JSON.stringify(updated));
    updateUnreadCount(updated);
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('bloodNotifications', JSON.stringify(updated));
    updateUnreadCount(updated);
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('bloodNotifications', JSON.stringify(updated));
    setUnreadCount(0);
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('bloodNotifications', JSON.stringify(updated));
    updateUnreadCount(updated);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem('bloodNotifications', JSON.stringify([]));
    setUnreadCount(0);
  };

  // Get icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'urgent':
        return <AlertCircle size={20} color="#DC143C" />;
      case 'pending':
        return <Clock size={20} color="#FFA500" />;
      default:
        return <Droplet size={20} color="#87CEEB" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.notificationContainer}>
      <button 
        className={styles.bellButton}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className={styles.overlay} onClick={() => setShowDropdown(false)} />
          <div className={styles.dropdown}>
            <div className={styles.header}>
              <h3>Notifications</h3>
              {notifications.length > 0 && (
                <div className={styles.headerActions}>
                  <button onClick={markAllAsRead} className={styles.textBtn}>
                    Mark all read
                  </button>
                  <button onClick={clearAll} className={styles.textBtn}>
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <div className={styles.empty}>
                  <Bell size={48} color="#ccc" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={styles.iconWrapper}>
                      {getIcon(notification.type)}
                    </div>
                    <div className={styles.content}>
                      <div className={styles.titleRow}>
                        <h4>{notification.title}</h4>
                        <button 
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p>{notification.message}</p>
                      <span className={styles.time}>{formatTime(notification.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export function to add notification from anywhere
export const addBloodNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  const storedNotifications = localStorage.getItem('bloodNotifications');
  const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
  
  const newNotification: Notification = {
    ...notification,
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const updated = [newNotification, ...notifications];
  localStorage.setItem('bloodNotifications', JSON.stringify(updated));
  
  // Dispatch custom event to update UI
  window.dispatchEvent(new CustomEvent('newNotification'));
};
