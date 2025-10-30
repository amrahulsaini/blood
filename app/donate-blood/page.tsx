'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, MessageCircle, MapPin, Clock, Droplet, AlertCircle, X, CheckCircle, ShieldAlert } from 'lucide-react';
import styles from './donate-blood.module.css';
import { canDonateTo, type BloodGroup, isValidBloodGroup } from '../utils/bloodCompatibility';
import { getSession, canUserDonate } from '../utils/auth';

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
  timestamp: string;
  submittedAt: string;
  status: string;
}

export default function DonateBloodPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [userSession, setUserSession] = useState<any>(null);
  
  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [donorName, setDonorName] = useState('');
  const [donorMobile, setDonorMobile] = useState('');
  const [donorBloodGroup, setDonorBloodGroup] = useState('');
  const [messageText, setMessageText] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    // Get user session to prevent self-donation
    const session = getSession();
    setUserSession(session);
    fetchBloodRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, selectedCity, searchQuery, selectedBloodGroup]);

  const fetchBloodRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/donor-entries?type=blood-requests');
      if (response.ok) {
        const data = await response.json();
        // Only show pending requests
        const pendingRequests = data.filter((req: BloodRequest) => req.status === 'pending');
        setRequests(pendingRequests);
        
        // Extract unique cities
        const uniqueCities = Array.from(
          new Set(pendingRequests.map((req: BloodRequest) => 
            req.locality?.trim().toLowerCase()
          ).filter(Boolean))
        ).map((city: unknown) => {
          const cityStr = String(city);
          return cityStr.charAt(0).toUpperCase() + cityStr.slice(1);
        });
        
        setCities(uniqueCities as string[]);
      }
    } catch (error) {
      console.error('Error fetching blood requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(req => 
        req.locality?.trim().toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // Filter by blood group compatibility
    if (selectedBloodGroup !== 'all' && isValidBloodGroup(selectedBloodGroup)) {
      filtered = filtered.filter(req => {
        if (isValidBloodGroup(req.bloodGroup)) {
          return canDonateTo(selectedBloodGroup as BloodGroup, req.bloodGroup as BloodGroup);
        }
        return false;
      });
    }

    // Filter by search query (blood group, patient name, hospital)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.bloodGroup.toLowerCase().includes(query) ||
        req.patientName.toLowerCase().includes(query) ||
        req.hospitalName.toLowerCase().includes(query)
      );
    }

    // Filter out user's own requests
    if (userSession) {
      filtered = filtered.filter(req => 
        canUserDonate(req.email, req.contact)
      );
    }

    setFilteredRequests(filtered);
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

  const getEmergencyColor = (state: string) => {
    switch (state) {
      case 'critical': return '#DC143C';
      case 'urgent': return '#FF6B35';
      case 'normal': return '#4682B4';
      default: return '#4682B4';
    }
  };

  const handleContact = (request: BloodRequest) => {
    // Placeholder for backend implementation
    console.log('Contact clicked for:', request.id);
    alert(`Contact feature will be implemented soon!\n\nFor now, you can call: ${request.contact}`);
  };

  const handleMessage = (request: BloodRequest) => {
    // Check if user is trying to donate to their own request
    if (!canUserDonate(request.email, request.contact)) {
      alert('⚠️ You cannot donate to your own blood request!');
      return;
    }

    setSelectedRequest(request);
    setShowMessageModal(true);
    setMessageSent(false);
    // Reset form
    setDonorName('');
    setDonorMobile('');
    setDonorBloodGroup('');
    setMessageText('');
    setConsent(false);
  };

  const closeModal = () => {
    setShowMessageModal(false);
    setSelectedRequest(null);
    setMessageSent(false);
  };

  const handleSendMessage = async () => {
    if (!selectedRequest) return;

    // Final check to prevent self-donation
    if (!canUserDonate(selectedRequest.email, selectedRequest.contact)) {
      alert('⚠️ You cannot donate to your own blood request!');
      closeModal();
      return;
    }

    // Validate form
    if (!donorName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!donorMobile.trim() || donorMobile.length < 10) {
      alert('Please enter a valid mobile number (at least 10 digits)');
      return;
    }
    if (!donorBloodGroup) {
      alert('Please select your blood group');
      return;
    }

    // Check blood compatibility - STRICT CHECK, MUST MATCH
    if (isValidBloodGroup(donorBloodGroup) && isValidBloodGroup(selectedRequest.bloodGroup)) {
      if (!canDonateTo(donorBloodGroup as BloodGroup, selectedRequest.bloodGroup as BloodGroup)) {
        alert(
          `❌ Blood Group Incompatible!\n\n` +
          `Sorry, your blood group ${donorBloodGroup} cannot donate to ${selectedRequest.bloodGroup}.\n\n` +
          `Please select a blood request that matches your blood group compatibility.`
        );
        return;
      }
    }

    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }
    if (!consent) {
      alert('Please confirm your consent to donate blood');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/donor-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest?.id,
          requesterEmail: selectedRequest?.email,
          requesterMobile: selectedRequest?.contact,
          requesterName: selectedRequest?.patientName,
          donorName: donorName.trim(),
          donorMobile: donorMobile.trim(),
          donorBloodGroup,
          message: messageText.trim(),
          consent: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);

      setMessageSent(true);
      
      setTimeout(() => {
        closeModal();
      }, 2000);

    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Floating blood drops animation */}
      <div className={styles.bloodDrops}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className={styles.bloodDrop} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 4}s`
          }}>
            <Droplet size={20} />
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              <Droplet className={styles.titleIcon} />
              Donate Blood - Save Lives
            </h1>
            <p className={styles.subtitle}>
              Find people in need of blood donation and be their hero
            </p>
          </div>
        </header>

        {/* Filters Section */}
        <section className={styles.filtersSection}>
          <div className={styles.filterControls}>
            {/* Search Bar */}
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search by blood group, patient name, or hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* City Filter */}
            <div className={styles.cityFilter}>
              <Filter className={styles.filterIcon} size={20} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className={styles.citySelect}
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city.toLowerCase()}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className={styles.resultsInfo}>
            <p className={styles.resultsCount}>
              Showing <strong>{filteredRequests.length}</strong> active request{filteredRequests.length !== 1 ? 's' : ''}
              {selectedBloodGroup !== 'all' && ` compatible with ${selectedBloodGroup}`}
            </p>
          </div>
        </section>

        {/* Blood Requests Grid */}
        <section className={styles.requestsSection}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading blood requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertCircle size={64} className={styles.emptyIcon} />
              <h3>No Blood Requests Found</h3>
              <p>
                {searchQuery || selectedCity !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no active blood requests at the moment.'}
              </p>
            </div>
          ) : (
            <div className={styles.requestsGrid}>
              {filteredRequests.map(request => (
                <div key={request.id} className={styles.requestCard}>
                  {/* Emergency Badge */}
                  <div 
                    className={styles.emergencyBadge}
                    style={{ 
                      background: getEmergencyColor(request.emergencyState),
                      color: 'white'
                    }}
                  >
                    {request.emergencyState.toUpperCase()}
                  </div>

                  {/* Blood Group Display */}
                  <div className={styles.bloodGroupDisplay}>
                    <Droplet size={24} fill="currentColor" />
                    <span className={styles.bloodGroupText}>{request.bloodGroup}</span>
                  </div>

                  {/* Patient Info */}
                  <div className={styles.patientInfo}>
                    <h3 className={styles.patientName}>{request.patientName}</h3>
                    <p className={styles.patientAge}>Age: {request.age} years</p>
                    <div className={styles.statusBadge}>
                      <span className={styles.statusDot}></span>
                      <span className={styles.statusText}>Status: {request.status}</span>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className={styles.locationInfo}>
                    <div className={styles.infoRow}>
                      <MapPin size={16} className={styles.infoIcon} />
                      <span className={styles.infoText}>{request.hospitalName}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <MapPin size={16} className={styles.infoIcon} />
                      <span className={styles.infoText}>{request.locality}</span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className={styles.timestamp}>
                    <Clock size={14} />
                    <span>{getTimeSince(request.submittedAt)}</span>
                  </div>

                  {/* Additional Info */}
                  {request.additionalInfo && (
                    <div className={styles.additionalInfo}>
                      <p className={styles.additionalInfoLabel}>Additional Information:</p>
                      <p className={styles.additionalInfoText}>{request.additionalInfo}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.contactBtn}
                      onClick={() => handleContact(request)}
                    >
                      <Phone size={18} />
                      <span>Contact</span>
                    </button>
                    <button 
                      className={styles.messageBtn}
                      onClick={() => handleMessage(request)}
                    >
                      <MessageCircle size={18} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info Banner */}
        <section className={styles.infoBanner}>
          <div className={styles.bannerContent}>
            <AlertCircle size={24} className={styles.bannerIcon} />
            <div className={styles.bannerText}>
              <h4>Important Information</h4>
              <p>
                Please verify the blood request details before donating. Contact the hospital or emergency contact 
                to confirm the requirement. Your donation can save lives!
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedRequest && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeModal}>
              <X size={24} />
            </button>

            {messageSent ? (
              <div className={styles.successMessage}>
                <CheckCircle size={64} className={styles.successIcon} />
                <h3>Message Sent Successfully!</h3>
                <p>The patient will receive your message and contact details.</p>
                <p className={styles.thankYou}>Thank you for your willingness to donate!</p>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2>Contact Blood Requester</h2>
                  <div className={styles.requesterInfo}>
                    <p><strong>Patient:</strong> {selectedRequest.patientName}</p>
                    <p><strong>Blood Group Needed:</strong> <span className={styles.bloodGroupBadge}>{selectedRequest.bloodGroup}</span></p>
                    <p><strong>Hospital:</strong> {selectedRequest.hospitalName}</p>
                  </div>
                </div>

                <div className={styles.modalBody}>
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                    {/* Donor Name */}
                    <div className={styles.formGroup}>
                      <label htmlFor="donorName">Your Name *</label>
                      <input
                        type="text"
                        id="donorName"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    {/* Donor Mobile */}
                    <div className={styles.formGroup}>
                      <label htmlFor="donorMobile">Your Mobile Number *</label>
                      <input
                        type="tel"
                        id="donorMobile"
                        value={donorMobile}
                        onChange={(e) => setDonorMobile(e.target.value)}
                        placeholder="Enter your mobile number"
                        pattern="[0-9]{10,}"
                        required
                      />
                    </div>

                    {/* Donor Blood Group */}
                    <div className={styles.formGroup}>
                      <label htmlFor="donorBloodGroup">Your Blood Group *</label>
                      <select
                        id="donorBloodGroup"
                        value={donorBloodGroup}
                        onChange={(e) => setDonorBloodGroup(e.target.value)}
                        required
                      >
                        <option value="">Select your blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      {donorBloodGroup && selectedRequest && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: canDonateTo(donorBloodGroup as BloodGroup, selectedRequest.bloodGroup as BloodGroup) 
                            ? '#d4edda' 
                            : '#f8d7da',
                          color: canDonateTo(donorBloodGroup as BloodGroup, selectedRequest.bloodGroup as BloodGroup) 
                            ? '#155724' 
                            : '#721c24',
                          border: canDonateTo(donorBloodGroup as BloodGroup, selectedRequest.bloodGroup as BloodGroup)
                            ? '1px solid #c3e6cb'
                            : '1px solid #f5c6cb'
                        }}>
                          {canDonateTo(donorBloodGroup as BloodGroup, selectedRequest.bloodGroup as BloodGroup)
                            ? `✓ Your ${donorBloodGroup} blood is compatible with ${selectedRequest.bloodGroup}`
                            : `✗ Your ${donorBloodGroup} blood is NOT compatible with ${selectedRequest.bloodGroup}`
                          }
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className={styles.formGroup}>
                      <label htmlFor="messageText">Your Message *</label>
                      <textarea
                        id="messageText"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write a message to the requester (e.g., when you can donate, any questions, etc.)"
                        rows={4}
                        required
                      ></textarea>
                    </div>

                    {/* Consent Checkbox */}
                    <div className={styles.consentGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          required
                        />
                        <span>
                          I confirm that I am willing to donate blood and understand the responsibilities involved. 
                          I agree to be contacted by the requester at the provided mobile number.
                        </span>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={closeModal}
                        disabled={isSending}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={isSending}
                      >
                        {isSending ? (
                          <>
                            <div className={styles.buttonSpinner}></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle size={18} />
                            <span>Send Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
