'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Droplet,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  MessageCircle,
  Clock,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import styles from './current-orders.module.css';

interface BloodRequest {
  id: string;
  patientName: string;
  age: string;
  contact: string;
  hospitalName: string;
  locality: string;
  bloodGroup: string;
  email: string;
  emergencyContact: string;
  emergencyState: 'critical' | 'urgent' | 'normal';
  additionalInfo: string;
  submittedAt: string;
  status: string;
}

interface DonorMessage {
  id: string;
  requestId: string;
  requesterEmail: string;
  requesterMobile: string;
  requesterName: string;
  donorName: string;
  donorMobile: string;
  donorBloodGroup: string;
  message: string;
  consent: boolean;
  timestamp: string;
  status: 'unread' | 'read';
}

export default function CurrentOrdersPage() {
  const router = useRouter();
  const [userRequests, setUserRequests] = useState<BloodRequest[]>([]);
  const [allMessages, setAllMessages] = useState<DonorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Get user session to identify them
      const sessionJson = localStorage.getItem('userRequestSession');
      if (!sessionJson) {
        alert('No active session found. Please submit a blood request first.');
        router.push('/request-blood');
        return;
      }

      const session = JSON.parse(sessionJson);
      setUserEmail(session.email);
      setUserMobile(session.contact);

      // Fetch all blood requests
      const requestsResponse = await fetch('/api/donor-entries?type=blood-requests');
      if (requestsResponse.ok) {
        const allRequests = await requestsResponse.json();
        
        // Filter requests by user's email and mobile
        const myRequests = allRequests.filter((req: BloodRequest) => 
          req.email.toLowerCase() === session.email.toLowerCase() ||
          req.contact === session.contact
        );
        
        setUserRequests(myRequests);
      }

      // Fetch all messages for user's requests
      const messagesResponse = await fetch(`/api/donor-messages?email=${encodeURIComponent(session.email)}&mobile=${encodeURIComponent(session.contact)}`);
      if (messagesResponse.ok) {
        const messages = await messagesResponse.json();
        setAllMessages(messages);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessagesForRequest = (requestId: string) => {
    return allMessages.filter(msg => msg.requestId === requestId);
  };

  const getUnreadCount = (requestId: string) => {
    return allMessages.filter(msg => 
      msg.requestId === requestId && msg.status === 'unread'
    ).length;
  };

  const getEmergencyColor = (state: string) => {
    switch (state) {
      case 'critical': return '#DC143C';
      case 'urgent': return '#FF6B35';
      case 'normal': return '#4682B4';
      default: return '#4682B4';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF6B35';
      case 'fulfilled': return '#32CD32';
      case 'cancelled': return '#DC143C';
      default: return '#4682B4';
    }
  };

  const toggleRequestExpand = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const requestTime = new Date(timestamp);
    const diffMs = now.getTime() - requestTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Background Graphics */}
      <div className={styles.backgroundGraphics}>
        <div className={styles.bloodDrop} style={{top: '10%', left: '8%'}}></div>
        <div className={styles.bloodDrop} style={{top: '30%', right: '10%'}}></div>
        <div className={styles.bloodDrop} style={{top: '60%', left: '12%'}}></div>
        <div className={styles.bloodDrop} style={{bottom: '15%', right: '15%'}}></div>
      </div>

      <div className={styles.container}>
        {/* Back Button */}
        <button onClick={() => router.push('/')} className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Droplet size={40} fill="currentColor" />
          </div>
          <h1 className={styles.title}>My Blood Requests</h1>
          <p className={styles.subtitle}>
            Track your blood requests and view donor responses
          </p>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)' }}>
              <Droplet size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3>Total Requests</h3>
              <p className={styles.summaryValue}>{userRequests.length}</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)' }}>
              <MessageCircle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3>Total Messages</h3>
              <p className={styles.summaryValue}>{allMessages.length}</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF4500 100%)' }}>
              <AlertCircle size={24} />
            </div>
            <div className={styles.summaryContent}>
              <h3>Unread Messages</h3>
              <p className={styles.summaryValue}>
                {allMessages.filter(m => m.status === 'unread').length}
              </p>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {userRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <Droplet size={64} className={styles.emptyIcon} />
            <h3>No Blood Requests Yet</h3>
            <p>You haven't submitted any blood requests.</p>
            <button 
              className={styles.createRequestBtn}
              onClick={() => router.push('/request-blood')}
            >
              Create New Request
            </button>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {userRequests.map((request) => {
              const messages = getMessagesForRequest(request.id);
              const unreadCount = getUnreadCount(request.id);
              const isExpanded = expandedRequestId === request.id;

              return (
                <div key={request.id} className={styles.requestCard}>
                  {/* Request Header */}
                  <div className={styles.requestHeader}>
                    <div className={styles.requestMainInfo}>
                      <div className={styles.bloodGroupBadge}>
                        <Droplet size={20} fill="currentColor" />
                        <span>{request.bloodGroup}</span>
                      </div>
                      <div className={styles.requestDetails}>
                        <h3>{request.patientName}</h3>
                        <p className={styles.hospitalName}>
                          <MapPin size={16} />
                          {request.hospitalName}
                        </p>
                      </div>
                    </div>

                    <div className={styles.requestBadges}>
                      <span 
                        className={styles.statusBadge}
                        style={{ background: getStatusColor(request.status) }}
                      >
                        {request.status}
                      </span>
                      <span 
                        className={styles.emergencyBadge}
                        style={{ background: getEmergencyColor(request.emergencyState) }}
                      >
                        {request.emergencyState}
                      </span>
                    </div>
                  </div>

                  {/* Request Info Grid */}
                  <div className={styles.requestInfoGrid}>
                    <div className={styles.infoItem}>
                      <Calendar size={16} />
                      <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <Clock size={16} />
                      <span>{getTimeSince(request.submittedAt)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <User size={16} />
                      <span>Age: {request.age && Number(request.age) > 0 ? `${request.age} years` : 'Not specified'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <span>{request.locality}</span>
                    </div>
                  </div>

                  {/* Messages Section */}
                  <div className={styles.messagesSection}>
                    <button 
                      className={styles.toggleMessagesBtn}
                      onClick={() => toggleRequestExpand(request.id)}
                    >
                      <MessageCircle size={18} />
                      <span>
                        {messages.length} Donor Response{messages.length !== 1 ? 's' : ''}
                      </span>
                      {unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{unreadCount} new</span>
                      )}
                      <span className={styles.expandIcon}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className={styles.messagesContainer}>
                        {messages.length === 0 ? (
                          <div className={styles.noMessages}>
                            <MessageCircle size={32} className={styles.noMessagesIcon} />
                            <p>No donor responses yet</p>
                          </div>
                        ) : (
                          <div className={styles.messagesList}>
                            {messages.map((msg) => (
                              <div 
                                key={msg.id} 
                                className={`${styles.messageCard} ${msg.status === 'unread' ? styles.unreadMessage : ''}`}
                              >
                                <div className={styles.messageHeader}>
                                  <div className={styles.donorInfo}>
                                    <h4>{msg.donorName}</h4>
                                    <span className={styles.donorBloodGroup}>
                                      <Droplet size={12} fill="currentColor" />
                                      {msg.donorBloodGroup}
                                    </span>
                                    {msg.status === 'unread' && (
                                      <span className={styles.newTag}>NEW</span>
                                    )}
                                  </div>
                                  <div className={styles.messageTime}>
                                    <Clock size={14} />
                                    <span>{getTimeSince(msg.timestamp)}</span>
                                  </div>
                                </div>

                                <div className={styles.messageBody}>
                                  <p>{msg.message}</p>
                                </div>

                                <div className={styles.messageFooter}>
                                  <a href={`tel:${msg.donorMobile}`} className={styles.contactLink}>
                                    <Phone size={16} />
                                    <span>{msg.donorMobile}</span>
                                  </a>
                                  {msg.consent && (
                                    <span className={styles.consentBadge}>
                                      <CheckCircle size={14} />
                                      Confirmed to donate
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
