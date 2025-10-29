'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Droplet,
  Hospital,
  MapPin,
  AlertCircle,
  Camera,
  Save,
  ArrowLeft,
  Edit2,
  MessageCircle,
  Clock
} from 'lucide-react';
import styles from './profile.module.css';

interface ProfileData {
  requestId: string;
  patientName: string;
  age: string;
  contact: string;
  email: string;
  hospitalName: string;
  locality: string;
  bloodGroup: string;
  emergencyContact: string;
  emergencyState: string;
  additionalInfo: string;
  submittedAt: string;
  profileImage?: string;
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

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [messages, setMessages] = useState<DonorMessage[]>([]);

  useEffect(() => {
    // Load session data
    const sessionJson = localStorage.getItem('userRequestSession');
    if (!sessionJson) {
      alert('No active session found. Please submit a blood request first.');
      router.push('/request-blood');
      return;
    }

    const session = JSON.parse(sessionJson);
    
    // Check if session is expired (30 days)
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      localStorage.removeItem('userRequestSession');
      alert('Your session has expired. Please submit a new request.');
      router.push('/request-blood');
      return;
    }

    // Load profile data
    const savedProfile = localStorage.getItem('userProfile_' + session.requestId);
    const profile = savedProfile ? JSON.parse(savedProfile) : session;
    
    setProfileData(profile);
    setEditedData(profile);
    setProfileImage(profile.profileImage || '');

    // Fetch messages from API based on email and mobile
    fetchMessages(profile.email, profile.contact);
  }, [router]);

  const fetchMessages = async (email: string, mobile: string) => {
    try {
      const response = await fetch(`/api/donor-messages?email=${encodeURIComponent(email)}&mobile=${encodeURIComponent(mobile)}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSave = async () => {
    if (!editedData) return;

    setIsSaving(true);
    
    try {
      // Update profile data with new image
      const updatedProfile = {
        ...editedData,
        profileImage: profileImage,
      };

      // Save to localStorage
      localStorage.setItem('userProfile_' + editedData.requestId, JSON.stringify(updatedProfile));
      
      // Update session data
      const sessionData = {
        requestId: updatedProfile.requestId,
        patientName: updatedProfile.patientName,
        bloodGroup: updatedProfile.bloodGroup,
        emergencyState: updatedProfile.emergencyState,
        submittedAt: updatedProfile.submittedAt,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem('userRequestSession', JSON.stringify(sessionData));

      setProfileData(updatedProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profileData) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const emergencyStates = [
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'critical', label: 'Critical Emergency' },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Background Graphics */}
      <div className={styles.backgroundGraphics}>
        <div className={styles.bloodDrop} style={{top: '10%', left: '8%'}}></div>
        <div className={styles.bloodDrop} style={{top: '30%', right: '10%'}}></div>
        <div className={styles.bloodDrop} style={{top: '60%', left: '12%'}}></div>
        <div className={styles.bloodDrop} style={{top: '80%', right: '15%'}}></div>
      </div>

      {/* Back Button */}
      <button onClick={() => router.push('/')} className={styles.backButton}>
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.profileImageSection}>
            <div className={styles.profileImageWrapper}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className={styles.profileImage} />
              ) : (
                <div className={styles.profileImagePlaceholder}>
                  <User size={60} />
                </div>
              )}
              <label htmlFor="profileImageInput" className={styles.cameraButton}>
                <Camera size={20} />
                <input
                  type="file"
                  id="profileImageInput"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
          
          <h1 className={styles.title}>{profileData.patientName}</h1>
          <p className={styles.requestId}>Request ID: {profileData.requestId}</p>
          
          <div className={styles.actionButtons}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={isSaving} className={styles.saveButton}>
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => {
                  setIsEditing(false);
                  setEditedData(profileData);
                  setProfileImage(profileData.profileImage || '');
                }} className={styles.cancelButton}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className={styles.formContainer}>
          <div className={styles.formGrid}>
            {/* Patient Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <User size={18} />
                Patient Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="patientName"
                  value={editedData?.patientName || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <p className={styles.value}>{profileData.patientName}</p>
              )}
            </div>

            {/* Age */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Calendar size={18} />
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={editedData?.age || ''}
                  onChange={handleChange}
                  className={styles.input}
                  min="1"
                  max="120"
                />
              ) : (
                <p className={styles.value}>{profileData.age} years</p>
              )}
            </div>

            {/* Contact */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Phone size={18} />
                Contact Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="contact"
                  value={editedData?.contact || ''}
                  onChange={handleChange}
                  className={styles.input}
                  pattern="[0-9]{10}"
                />
              ) : (
                <p className={styles.value}>{profileData.contact}</p>
              )}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Mail size={18} />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedData?.email || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <p className={styles.value}>{profileData.email}</p>
              )}
            </div>

            {/* Hospital Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Hospital size={18} />
                Hospital Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="hospitalName"
                  value={editedData?.hospitalName || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <p className={styles.value}>{profileData.hospitalName}</p>
              )}
            </div>

            {/* Locality */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MapPin size={18} />
                Hospital Locality
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="locality"
                  value={editedData?.locality || ''}
                  onChange={handleChange}
                  className={styles.input}
                />
              ) : (
                <p className={styles.value}>{profileData.locality}</p>
              )}
            </div>

            {/* Blood Group */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Droplet size={18} />
                Blood Group Required
              </label>
              {isEditing ? (
                <select
                  name="bloodGroup"
                  value={editedData?.bloodGroup || ''}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              ) : (
                <p className={`${styles.value} ${styles.bloodGroupValue}`}>{profileData.bloodGroup}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Phone size={18} />
                Emergency Contact
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="emergencyContact"
                  value={editedData?.emergencyContact || ''}
                  onChange={handleChange}
                  className={styles.input}
                  pattern="[0-9]{10}"
                />
              ) : (
                <p className={styles.value}>{profileData.emergencyContact}</p>
              )}
            </div>

            {/* Emergency State */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <AlertCircle size={18} />
                Emergency State
              </label>
              {isEditing ? (
                <select
                  name="emergencyState"
                  value={editedData?.emergencyState || ''}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {emergencyStates.map((state) => (
                    <option key={state.value} value={state.value}>{state.label}</option>
                  ))}
                </select>
              ) : (
                <p className={`${styles.value} ${styles.emergencyValue} ${styles[profileData.emergencyState]}`}>
                  {emergencyStates.find(s => s.value === profileData.emergencyState)?.label}
                </p>
              )}
            </div>

            {/* Additional Info - Full Width */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>
                Additional Information
              </label>
              {isEditing ? (
                <textarea
                  name="additionalInfo"
                  value={editedData?.additionalInfo || ''}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={4}
                />
              ) : (
                <p className={styles.value}>{profileData.additionalInfo || 'No additional information provided'}</p>
              )}
            </div>
          </div>

          {/* Request Info */}
          <div className={styles.requestInfo}>
            <p><strong>Request Submitted:</strong> {new Date(profileData.submittedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Messages Section */}
        <div className={styles.messagesSection}>
          <div className={styles.messagesHeader}>
            <MessageCircle size={24} className={styles.messagesIcon} />
            <h3>Donor Messages</h3>
            <div className={styles.messageCounts}>
              <span className={styles.messageCount}>{messages.length}</span>
              {messages.filter(m => m.status === 'unread').length > 0 && (
                <span className={styles.unreadBadge}>
                  {messages.filter(m => m.status === 'unread').length} new
                </span>
              )}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className={styles.noMessages}>
              <MessageCircle size={48} className={styles.noMessagesIcon} />
              <p>No messages yet from potential donors.</p>
              <p className={styles.noMessagesSubtext}>When donors contact you, their messages will appear here.</p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((msg, index) => (
                <div key={msg.id || index} className={`${styles.messageCard} ${msg.status === 'unread' ? styles.unreadMessage : ''}`}>
                  <div className={styles.messageHeader}>
                    <div className={styles.donorInfo}>
                      <h4>{msg.donorName}</h4>
                      <span className={styles.donorBloodGroup}>
                        <Droplet size={14} fill="currentColor" />
                        {msg.donorBloodGroup}
                      </span>
                      {msg.status === 'unread' && (
                        <span className={styles.newBadge}>NEW</span>
                      )}
                    </div>
                    <div className={styles.messageTime}>
                      <Clock size={14} />
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className={styles.messageBody}>
                    <p className={styles.messageText}>{msg.message}</p>
                  </div>

                  <div className={styles.messageFooter}>
                    <div className={styles.contactInfo}>
                      <Phone size={16} />
                      <a href={`tel:${msg.donorMobile}`} className={styles.phoneLink}>
                        {msg.donorMobile}
                      </a>
                    </div>
                    {msg.consent && (
                      <div className={styles.consentBadge}>
                        ✓ Confirmed willingness to donate
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
