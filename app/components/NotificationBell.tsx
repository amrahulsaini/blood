'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Droplet, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import styles from './NotificationBell.module.css';
import { getSession } from '../utils/auth';

interface Notification {
  id: string;
  user_email: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'urgent' | 'warning';
  related_id?: string;
  priority: 'low' | 'normal' | 'high';
  read_at?: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications
    const handleNewNotification = () => {
      fetchNotifications();
    };

    window.addEventListener('newNotification', handleNewNotification);
    window.addEventListener('notificationUpdate', handleNewNotification);

    // Check for new notifications periodically
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
      window.removeEventListener('notificationUpdate', handleNewNotification);
      clearInterval(interval);
    };
  }, []);

  const fetchNotifications = async () => {
    const session = getSession();
    if (!session || !session.email) return;

    try {
      const response = await fetch(`/api/notifications?email=${encodeURIComponent(session.email)}&unreadOnly=true`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        const unread = data.filter((n: Notification) => !n.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        // Update local state
        const updated = notifications.map(n => 
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        );
        setNotifications(updated);
        const unread = updated.filter(n => !n.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const session = getSession();
    if (!session || !session.email) return;

    try {
      await Promise.all(
        notifications
          .filter(n => !n.read_at)
          .map(n => markAsRead(n.id))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updated = notifications.filter(n => n.id !== id);
        setNotifications(updated);
        const unread = updated.filter(n => !n.read_at).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Clear all read notifications
  const clearAll = async () => {
    const session = getSession();
    if (!session || !session.email) return;

    try {
      const response = await fetch(`/api/notifications?email=${encodeURIComponent(session.email)}&clearAll=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  // Get icon based on type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'urgent':
        return <AlertCircle size={20} color="#DC143C" />;
      case 'warning':
        return <Clock size={20} color="#FFA500" />;
      default:
        return <Droplet size={20} color="#87CEEB" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
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
                    className={`${styles.notificationItem} ${!notification.read_at ? styles.unread : ''}`}
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
                      <span className={styles.time}>{formatTime(notification.created_at)}</span>
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
