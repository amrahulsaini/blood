// Session and Notification Management Utilities

interface UserSession {
  requestId: string;
  patientName: string;
  bloodGroup: string;
  emergencyState: string;
  submittedAt: string;
  expiresAt: string;
}

interface Notification {
  id: string;
  type: 'success' | 'pending' | 'urgent' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  requestId?: string;
}

// Session Management
export const SessionManager = {
  // Save user request session
  saveSession(requestData: Omit<UserSession, 'expiresAt'>) {
    const sessionData: UserSession = {
      ...requestData,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };

    const existingRequests = this.getSessions();
    existingRequests.push(sessionData);
    localStorage.setItem('userBloodRequests', JSON.stringify(existingRequests));
    
    return sessionData;
  },

  // Get all user sessions
  getSessions(): UserSession[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('userBloodRequests');
    if (!stored) return [];

    const sessions: UserSession[] = JSON.parse(stored);
    // Filter out expired sessions
    const activeSessions = sessions.filter(session => {
      const expiryDate = new Date(session.expiresAt);
      return expiryDate > new Date();
    });

    // Update localStorage if any expired
    if (activeSessions.length !== sessions.length) {
      localStorage.setItem('userBloodRequests', JSON.stringify(activeSessions));
    }

    return activeSessions;
  },

  // Get session by request ID
  getSessionByRequestId(requestId: string): UserSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.requestId === requestId) || null;
  },

  // Clear expired sessions
  clearExpiredSessions() {
    const activeSessions = this.getSessions();
    localStorage.setItem('userBloodRequests', JSON.stringify(activeSessions));
  },

  // Check if user has active request
  hasActiveRequest(): boolean {
    return this.getSessions().length > 0;
  },

  // Clear all sessions
  clearAllSessions() {
    localStorage.removeItem('userBloodRequests');
  },
};

// Notification Management
export const NotificationManager = {
  // Add new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const notifications = this.getNotifications();
    notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    const trimmed = notifications.slice(0, 50);
    localStorage.setItem('bloodNotifications', JSON.stringify(trimmed));

    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
    }

    return newNotification;
  },

  // Get all notifications
  getNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('bloodNotifications');
    return stored ? JSON.parse(stored) : [];
  },

  // Get unread count
  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.read).length;
  },

  // Mark notification as read
  markAsRead(id: string) {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('bloodNotifications', JSON.stringify(updated));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
    }
  },

  // Mark all as read
  markAllAsRead() {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('bloodNotifications', JSON.stringify(updated));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
    }
  },

  // Delete notification
  deleteNotification(id: string) {
    const notifications = this.getNotifications();
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem('bloodNotifications', JSON.stringify(updated));
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
    }
  },

  // Clear all notifications
  clearAll() {
    localStorage.removeItem('bloodNotifications');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
    }
  },
};

// Quick notification helpers for different scenarios
export const NotificationTemplates = {
  // Blood request submitted
  requestSubmitted(requestId: string, bloodGroup: string, hospitalName: string, emergencyState: string) {
    return NotificationManager.addNotification({
      type: emergencyState === 'critical' ? 'urgent' : 'pending',
      title: 'Blood Request Submitted',
      message: `Your request for ${bloodGroup} blood at ${hospitalName} is now pending. We're connecting you with nearby donors.`,
      requestId,
    });
  },

  // Donor matched
  donorMatched(requestId: string, donorName: string, bloodGroup: string) {
    return NotificationManager.addNotification({
      type: 'success',
      title: 'Donor Found!',
      message: `Great news! A ${bloodGroup} donor has been matched with your request. Contact details will be shared shortly.`,
      requestId,
    });
  },

  // Request fulfilled
  requestFulfilled(requestId: string) {
    return NotificationManager.addNotification({
      type: 'success',
      title: 'Request Fulfilled',
      message: 'Your blood request has been successfully fulfilled. Thank you for using our service!',
      requestId,
    });
  },

  // Urgent reminder
  urgentReminder(requestId: string, bloodGroup: string) {
    return NotificationManager.addNotification({
      type: 'urgent',
      title: 'Urgent: Still Looking for Donors',
      message: `We're actively searching for ${bloodGroup} donors in your area. Share your request with friends to increase visibility.`,
      requestId,
    });
  },

  // General info
  generalInfo(title: string, message: string) {
    return NotificationManager.addNotification({
      type: 'info',
      title,
      message,
    });
  },
};

// Clean up on app load
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  // Clear expired sessions
  SessionManager.clearExpiredSessions();
};
