'use client';

import { useState, FormEvent, useEffect } from 'react';
import styles from './donorentries.module.css';
import CustomSelect from './CustomSelect';
import { useRouter } from 'next/navigation';
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Droplet, 
  Syringe, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react';

interface DonorFormData {
  fullName: string;
  batch: string;
  age: string;
  bloodGroup: string;
  donorType: string;
  address: string;
  email: string;
  mobile: string;
}

export default function DonorEntries() {
  const router = useRouter();
  const [formData, setFormData] = useState<DonorFormData>({
    fullName: '',
    batch: '',
    age: '',
    bloodGroup: '',
    donorType: '',
    address: '',
    email: '',
    mobile: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [registeredName, setRegisteredName] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogText, setErrorDialogText] = useState('');

  const batches = ['2025-2029', '2024-2028', '2023-2027', '2022-2026'];
  const bloodGroups = [
    "I don't know my blood group",
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];
  const donorTypes = [
    { value: 'blood', label: 'Blood Donor' },
    { value: 'sdp', label: 'SDP Donor' },
    { value: 'both', label: 'Both (SDP & Blood Donor)' },
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

  const handleSelectChange = (name: keyof DonorFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownOpen = (name: string, isOpen: boolean) => {
    if (isOpen) {
      setActiveDropdown(name);
    } else if (activeDropdown === name) {
      setActiveDropdown(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const nameForDialog = formData.fullName;
      const response = await fetch('/api/donor-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for registering! Your information has been saved successfully. 🎉');
        // Show success dialog and start countdown redirect
        setRegisteredName(nameForDialog);
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('donorName', nameForDialog || '');
          }
        } catch {}
        setCountdown(4);
        setShowDialog(true);
        // Reset form
        setFormData({
          fullName: '',
          batch: '',
          age: '',
          bloodGroup: '',
          donorType: '',
          address: '',
          email: '',
          mobile: '',
        });
      } else if (response.status === 409) {
        const data = await response.json();
        setErrorDialogText(data.error || 'This email or mobile is already registered.');
        setShowErrorDialog(true);
      } else {
        setSubmitMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage('Failed to submit. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Countdown and redirect when dialog is shown
  useEffect(() => {
    if (!showDialog) return;
    let current = 4;
    setCountdown(current);
    const interval = setInterval(() => {
      current -= 1;
      setCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        router.push('/donorcertificates');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showDialog, router]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.bloodDrop}></div>
        <div className={styles.bloodDrop}></div>
        <div className={styles.bloodDrop}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.heartIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1 className={styles.title}>Blood Donor Registration</h1>
          <p className={styles.subtitle}>
            Join our community of life-savers. Every drop counts! 🩸
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                <User className={styles.labelIcon} size={18} />
                Full Name
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter your full name"
              />
            </div>

            {/* Batch */}
            <div className={`${styles.formGroup} ${activeDropdown === 'batch' ? styles.activeZ : ''}`}>
              <label htmlFor="batch" className={styles.label}>
                <GraduationCap className={styles.labelIcon} size={18} />
                Batch
                <span className={styles.required}>*</span>
              </label>
              <CustomSelect
                id="batch"
                name="batch"
                value={formData.batch}
                onChange={handleSelectChange('batch')}
                options={batches}
                placeholder="Select your batch"
                required
                onOpenChange={(isOpen) => handleDropdownOpen('batch', isOpen)}
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
                min="18"
                max="65"
                className={styles.input}
                placeholder="Enter your age"
              />
            </div>

            {/* Blood Group */}
            <div className={`${styles.formGroup} ${activeDropdown === 'bloodGroup' ? styles.activeZ : ''}`}>
              <label htmlFor="bloodGroup" className={styles.label}>
                <Droplet className={styles.labelIcon} size={18} />
                Blood Group
                <span className={styles.required}>*</span>
              </label>
              <CustomSelect
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleSelectChange('bloodGroup')}
                options={bloodGroups}
                placeholder="Select your blood group"
                required
                onOpenChange={(isOpen) => handleDropdownOpen('bloodGroup', isOpen)}
              />
            </div>

            {/* Donor Type */}
            <div className={`${styles.formGroup} ${styles.fullWidth} ${activeDropdown === 'donorType' ? styles.activeZ : ''}`}>
              <label htmlFor="donorType" className={styles.label}>
                <Syringe className={styles.labelIcon} size={18} />
                Donor Type
                <span className={styles.required}>*</span>
              </label>
              <CustomSelect
                id="donorType"
                name="donorType"
                value={formData.donorType}
                onChange={handleSelectChange('donorType')}
                options={donorTypes}
                placeholder="Select donor type"
                required
                onOpenChange={(isOpen) => handleDropdownOpen('donorType', isOpen)}
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

            {/* Mobile */}
            <div className={styles.formGroup}>
              <label htmlFor="mobile" className={styles.label}>
                <Phone className={styles.labelIcon} size={18} />
                Mobile Number
                <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className={styles.input}
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Address */}
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="address" className={styles.label}>
                <MapPin className={styles.labelIcon} size={18} />
                Address
                <span className={styles.required}>*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className={styles.textarea}
                placeholder="Enter your complete address"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Submitting...
              </>
            ) : (
              <>
                <Heart className={styles.buttonIcon} size={20} />
                Register as Donor
              </>
            )}
          </button>

          {submitMessage && (
            <div
              className={`${styles.message} ${
                submitMessage.includes('success') ? styles.success : styles.error
              }`}
            >
              {submitMessage}
            </div>
          )}
        </form>

        {showDialog && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true">
            <div className={styles.modalBox}>
              <div className={styles.modalIcon} aria-hidden>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <h2 className={styles.modalTitle}>Dear {registeredName || 'Donor'},</h2>
              <p className={styles.modalMessage}>
                You have been registered as a donor. You are being redirected to the certificate post page.
              </p>
              <div className={styles.modalCountdown}>
                Redirecting in <span className={styles.countNumber}>{countdown}</span> seconds...
              </div>
            </div>
          </div>
        )}

        {showErrorDialog && (
          <div className={styles.modalOverlay} role="alertdialog" aria-modal="true">
            <div className={`${styles.modalBox} ${styles.modalBoxError}`}>
              <div className={`${styles.modalIcon} ${styles.modalIconError}`} aria-hidden>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v7h-2V7h2zm0 9v2h-2v-2h2z"/></svg>
              </div>
              <h2 className={styles.modalTitle}>Already registered</h2>
              <p className={styles.modalMessage}>{errorDialogText}</p>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setShowErrorDialog(false)}>
                Got it
              </button>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <p>🌟 Thank you for your willingness to save lives! 🌟</p>
        </div>
      </div>
    </div>
  );
}
