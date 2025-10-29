'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Calendar, 
  Phone, 
  Hospital, 
  MapPin, 
  Droplet, 
  Mail,
  AlertCircle,
  ArrowLeft,
  Send
} from 'lucide-react';
import styles from './request-blood.module.css';

interface RequestFormData {
  patientName: string;
  age: string;
  contact: string;
  hospitalName: string;
  locality: string;
  bloodGroup: string;
  email: string;
  emergencyContact: string;
  emergencyState: string;
  additionalInfo: string;
}

export default function RequestBloodPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RequestFormData>({
    patientName: '',
    age: '',
    contact: '',
    hospitalName: '',
    locality: '',
    bloodGroup: '',
    email: '',
    emergencyContact: '',
    emergencyState: 'normal',
    additionalInfo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const emergencyStates = [
    { value: 'normal', label: 'Normal', color: '#87CEEB' },
    { value: 'urgent', label: 'Urgent', color: '#FFA500' },
    { value: 'critical', label: 'Critical Emergency', color: '#DC143C' },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }
      
      console.log('Blood Request Submitted:', data);
      
      // Store user session - expires in 30 days
      const sessionData = {
        requestId: data.requestId,
        patientName: formData.patientName,
        age: formData.age,
        contact: formData.contact,
        email: formData.email,
        hospitalName: formData.hospitalName,
        locality: formData.locality,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact,
        emergencyState: formData.emergencyState,
        additionalInfo: formData.additionalInfo,
        submittedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };
      
      // Store current session (for profile page)
      localStorage.setItem('userRequestSession', JSON.stringify(sessionData));
      
      // Store user requests array
      const existingRequests = localStorage.getItem('userBloodRequests');
      const requests = existingRequests ? JSON.parse(existingRequests) : [];
      requests.push(sessionData);
      localStorage.setItem('userBloodRequests', JSON.stringify(requests));
      
      // Add notification
      const notificationData = {
        type: formData.emergencyState === 'critical' ? 'urgent' : 'pending' as 'urgent' | 'pending',
        title: 'Blood Request Submitted',
        message: `Your request for ${formData.bloodGroup} blood at ${formData.hospitalName} is now pending. We're connecting you with nearby donors.`,
        requestId: data.requestId,
      };
      
      // Store notification
      const existingNotifications = localStorage.getItem('bloodNotifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      const newNotification = {
        ...notificationData,
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      notifications.unshift(newNotification);
      localStorage.setItem('bloodNotifications', JSON.stringify(notifications));
      
      // Dispatch event for notification bell
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('newNotification'));
      }
      
      setShowSuccessDialog(true);
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        setShowSuccessDialog(false);
        router.push('/');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className={styles.iconWrapper}>
            <Droplet size={48} className={styles.headerIcon} />
          </div>
          <h1 className={styles.title}>Request Blood</h1>
          <p className={styles.subtitle}>
            Fill in the details below and we'll connect you with nearby donors immediately
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Patient Name */}
            <div className={styles.formGroup}>
              <label htmlFor="patientName" className={styles.label}>
                <User className={styles.labelIcon} size={18} />
                Patient Name
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter patient's full name"
              />
            </div>

            {/* Age */}
            <div className={styles.formGroup}>
              <label htmlFor="age" className={styles.label}>
                <Calendar className={styles.labelIcon} size={18} />
                Age
                <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
                className={styles.input}
                placeholder="Enter patient's age"
              />
            </div>

            {/* Contact Number */}
            <div className={styles.formGroup}>
              <label htmlFor="contact" className={styles.label}>
                <Phone className={styles.labelIcon} size={18} />
                Contact Number
                <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className={styles.input}
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <Mail className={styles.labelIcon} size={18} />
                Email Address
                <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="your.email@example.com"
              />
            </div>

            {/* Hospital Name */}
            <div className={styles.formGroup}>
              <label htmlFor="hospitalName" className={styles.label}>
                <Hospital className={styles.labelIcon} size={18} />
                Hospital Name
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter hospital name"
              />
            </div>

            {/* Locality */}
            <div className={styles.formGroup}>
              <label htmlFor="locality" className={styles.label}>
                <MapPin className={styles.labelIcon} size={18} />
                Hospital Locality
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="locality"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Area/City"
              />
            </div>

            {/* Blood Group */}
            <div className={styles.formGroup}>
              <label htmlFor="bloodGroup" className={styles.label}>
                <Droplet className={styles.labelIcon} size={18} />
                Blood Group Required
                <span className={styles.required}>*</span>
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className={styles.select}
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* Emergency Contact */}
            <div className={styles.formGroup}>
              <label htmlFor="emergencyContact" className={styles.label}>
                <Phone className={styles.labelIcon} size={18} />
                Emergency Contact
                <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className={styles.input}
                placeholder="Alternative contact number"
              />
            </div>

            {/* Emergency State - Full Width */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="emergencyState" className={styles.label}>
                <AlertCircle className={styles.labelIcon} size={18} />
                Emergency State
                <span className={styles.required}>*</span>
              </label>
              <div className={styles.emergencyStates}>
                {emergencyStates.map((state) => (
                  <label
                    key={state.value}
                    className={`${styles.emergencyOption} ${
                      formData.emergencyState === state.value ? styles.selected : ''
                    }`}
                    style={{
                      borderColor: formData.emergencyState === state.value ? state.color : undefined,
                      backgroundColor: formData.emergencyState === state.value 
                        ? `${state.color}15` 
                        : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="emergencyState"
                      value={state.value}
                      checked={formData.emergencyState === state.value}
                      onChange={handleChange}
                      className={styles.radioInput}
                    />
                    <span 
                      className={styles.emergencyLabel}
                      style={{ color: formData.emergencyState === state.value ? state.color : undefined }}
                    >
                      {state.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Information - Full Width */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="additionalInfo" className={styles.label}>
                <Mail className={styles.labelIcon} size={18} />
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={4}
                className={styles.textarea}
                placeholder="Any additional details that might help (optional)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Submit Blood Request</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.successDialog}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Request Submitted Successfully!</h2>
            <p className={styles.successMessage}>
              We're connecting you with nearby donors. You'll receive a confirmation email shortly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
