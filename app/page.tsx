'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserCircle, Handshake, Droplet, Heart, Users, ClipboardList, Menu, X } from 'lucide-react';
import NotificationBell from './components/NotificationBell';
import styles from './home.module.css';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Logo and Brand */}
          <div className={styles.logoSection}>
            <Image 
              src="/assh logo.webp" 
              alt="Aashayein Logo" 
              width={60} 
              height={60}
              className={styles.logo}
            />
            <div className={styles.brandName}>
              <span className={styles.brandText}>The</span>
              <span className={styles.brandHighlight}>LifeSaviours</span>
            </div>
          </div>

          {/* Desktop Header Buttons */}
          <div className={styles.headerButtons}>
            <NotificationBell />
            <Link href="/profile">
              <button className={styles.profileBtn}>
                <UserCircle size={20} />
                <span>Profile</span>
              </button>
            </Link>
            <button className={styles.partnerBtn}>
              <Handshake size={20} />
              <span>Partner With Us</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              <div className={styles.mobileMenuItem}>
                <UserCircle size={20} />
                <span>Profile</span>
              </div>
            </Link>
            <button className={styles.mobileMenuItem} onClick={() => setIsMobileMenuOpen(false)}>
              <Handshake size={20} />
              <span>Partner With Us</span>
            </button>
            <div className={styles.mobileMenuDivider}></div>
            <div className={styles.mobileMenuNotification}>
              <NotificationBell />
            </div>
          </div>
        )}
      </header>

      {/* Cards Section */}
      <section className={styles.cardsSection}>
        <div className={styles.cardsGrid}>
          {/* Card 1: Request Blood */}
          <Link href="/request-blood" className={styles.card}>
            <div className={styles.cardIcon}>
              <Droplet size={32} />
            </div>
            <h3 className={styles.cardTitle}>Request Blood</h3>
            <p className={styles.cardDescription}>
              Urgently need blood? Submit a request and we'll connect you with nearby donors instantly.
            </p>
            <div className={styles.cardArrow}>→</div>
          </Link>

          {/* Card 2: Donate Blood */}
          <Link href="/donate-blood" className={styles.card}>
            <div className={styles.cardIcon}>
              <Heart size={32} />
            </div>
            <h3 className={styles.cardTitle}>Donate Blood</h3>
            <p className={styles.cardDescription}>
              Register as a donor and be a hero. Your one donation can save up to three lives.
            </p>
            <div className={styles.cardArrow}>→</div>
          </Link>

          {/* Card 3: Current Orders */}
          <Link href="/current-orders" className={styles.card}>
            <div className={styles.cardIcon}>
              <ClipboardList size={32} />
            </div>
            <h3 className={styles.cardTitle}>Current Orders</h3>
            <p className={styles.cardDescription}>
              View ongoing blood requests in your area and help save lives in your community.
            </p>
            <div className={styles.cardArrow}>→</div>
          </Link>

          {/* Card 4: Community */}
          <Link href="/community" className={styles.card}>
            <div className={styles.cardIcon}>
              <Users size={32} />
            </div>
            <h3 className={styles.cardTitle}>Community</h3>
            <p className={styles.cardDescription}>
              Join thousands of donors, share stories, and be part of a movement that saves lives.
            </p>
            <div className={styles.cardArrow}>→</div>
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>10K+</div>
            <div className={styles.statLabel}>Donors Registered</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>5K+</div>
            <div className={styles.statLabel}>Lives Saved</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>500+</div>
            <div className={styles.statLabel}>Blood Camps</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>24/7</div>
            <div className={styles.statLabel}>Support Available</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3>Register</h3>
            <p>Create your donor profile in just 2 minutes with basic information.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3>Get Matched</h3>
            <p>We'll notify you when someone nearby needs your blood type.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3>Donate</h3>
            <p>Visit the nearest center or schedule a home collection.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>4</div>
            <h3>Save Lives</h3>
            <p>Track your impact and see the lives you've helped save.</p>
          </div>
        </div>
      </section>

      {/* Why Donate Section - Our Leaders */}
      <section className={styles.whyDonateSection}>
        <h2 className={styles.sectionTitle}>Our Leadership</h2>
        <p className={styles.sectionDescription}>Meet the visionaries behind our mission</p>
        <div className={styles.leadershipGrid}>
          <div className={styles.leaderCard}>
            <div className={styles.leaderImageWrapper}>
              <Image 
                src="https://d1h684srpghjti.cloudfront.net/assets/images/gallary_photos/t1661332149_KGzWxKGR3a.jpg?w=320&format=webp"
                alt="Arpit Agrawal - Chairman"
                width={200}
                height={200}
                className={styles.leaderImage}
              />
            </div>
            <div className={styles.leaderInfo}>
              <h3 className={styles.leaderTitle}>Chairman</h3>
              <h4 className={styles.leaderName}>Arpit Agrawal</h4>
              <p className={styles.leaderRole}>Director JECRC Foundation</p>
            </div>
          </div>
          <div className={styles.leaderCard}>
            <div className={styles.leaderImageWrapper}>
              <Image 
                src="https://d1h684srpghjti.cloudfront.net/assets/images/gallary_photos/t1661332038_YEGFfaygAW.jpg?w=320&format=webp"
                alt="Dr. Vinay Kumar Chandna - Vice-Chairman"
                width={200}
                height={200}
                className={styles.leaderImage}
              />
            </div>
            <div className={styles.leaderInfo}>
              <h3 className={styles.leaderTitle}>Vice-Chairman</h3>
              <h4 className={styles.leaderName}>Dr. Vinay Kumar Chandna</h4>
              <p className={styles.leaderRole}>Principal JECRC Foundation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div className={styles.footerSection}>
            <div className={styles.footerBrand}>
              <Image 
                src="/assh logo.webp" 
                alt="Aashayein Logo" 
                width={40} 
                height={40}
                className={styles.footerLogo}
              />
              <div className={styles.footerBrandName}>TheLifeSaviours</div>
            </div>
            <p className={styles.footerTagline}>by Aashayein</p>
            <p className={styles.footerDescription}>
              Saving lives through blood donation
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Quick Links</h4>
            <div className={styles.footerLinks}>
              <Link href="/donate-blood">Become a Donor</Link>
              <Link href="/request-blood">Request Blood</Link>
              <Link href="/donate-blood">Find Donors</Link>
            </div>
          </div>

          {/* Contact */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Contact</h4>
            <div className={styles.footerLinks}>
              <a href="mailto:info@thelifesaviours.org">Email Us</a>
              <a href="/contact">Get in Touch</a>
              <a href="/faq">Help & FAQ</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.footerBottom}>
          <p>© 2025 TheLifeSaviours by Aashayein. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
