// Session Management Utility

export interface UserSession {
  requestId: string;
  email: string;
  contact: string;
  patientName: string;
  bloodGroup: string;
  age?: string;
  hospitalName?: string;
  locality?: string;
  emergencyContact?: string;
  emergencyState?: string;
  additionalInfo?: string;
  expiresAt: string;
  createdAt: string;
}

const SESSION_KEY = 'userRequestSession';
const SESSION_DURATION_DAYS = 30;

/**
 * Creates and stores a new user session
 */
export function createSession(data: Omit<UserSession, 'expiresAt' | 'createdAt'>): UserSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
  
  const session: UserSession = {
    ...data,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

/**
 * Retrieves the current user session
 */
export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;

  const sessionJson = localStorage.getItem(SESSION_KEY);
  if (!sessionJson) return null;

  try {
    const session: UserSession = JSON.parse(sessionJson);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error parsing session:', error);
    clearSession();
    return null;
  }
}

/**
 * Checks if user has an active session
 */
export function hasActiveSession(): boolean {
  return getSession() !== null;
}

/**
 * Clears the current session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Updates session data
 */
export function updateSession(updates: Partial<UserSession>): UserSession | null {
  const currentSession = getSession();
  if (!currentSession) return null;

  const updatedSession = { ...currentSession, ...updates };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  return updatedSession;
}

/**
 * Checks if the current user is the requester (can access profile)
 */
export function isRequester(email: string, contact: string): boolean {
  const session = getSession();
  if (!session) return false;

  return session.email === email && session.contact === contact;
}

/**
 * Prevents user from donating to their own request
 */
export function canUserDonate(requestEmail: string, requestContact: string): boolean {
  const session = getSession();
  if (!session) return true; // No session, can donate

  // User cannot donate to their own request
  return !(session.email === requestEmail || session.contact === requestContact);
}
