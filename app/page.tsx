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

      {/* Why Donate Section */}
      <section className={styles.whyDonateSection}>
        <h2 className={styles.sectionTitle}>Why Donate Blood?</h2>
        <div className={styles.reasonsGrid}>
          <div className={styles.reasonCard}>
            <div className={styles.reasonNumber}>01</div>
            <h3>Save Lives</h3>
            <p>One donation can save up to three lives. Be someone's hero today.</p>
          </div>
          <div className={styles.reasonCard}>
            <div className={styles.reasonNumber}>02</div>
            <h3>Health Benefits</h3>
            <p>Regular donation helps reduce heart disease risk and maintains iron levels.</p>
          </div>
          <div className={styles.reasonCard}>
            <div className={styles.reasonNumber}>03</div>
            <h3>Free Health Check</h3>
            <p>Get a mini health screening every time you donate blood.</p>
          </div>
          <div className={styles.reasonCard}>
            <div className={styles.reasonNumber}>04</div>
            <h3>Community Impact</h3>
            <p>Help build a healthier, more caring community for everyone.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* Brand Section */}
          <div className={styles.footerBrand}>
            <Image 
              src="/assh logo.webp" 
              alt="Aashayein Logo" 
              width={50} 
              height={50}
              className={styles.footerLogo}
            />
            <div className={styles.footerBrandInfo}>
              <div className={styles.footerBrandName}>TheLifeSaviours</div>
              <div className={styles.footerTagline}>Aashayein - Hope for Life</div>
              <div className={styles.footerDescription}>
                Join thousands of heroes saving lives through blood donation. Every drop counts.
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Quick Links</h4>
            <div className={styles.footerLinks}>
              <Link href="/about">About Us</Link>
              <Link href="/donorentries">Become a Donor</Link>
              <Link href="/request-blood">Request Blood</Link>
              <Link href="/donate-blood">Find Donors</Link>
            </div>
          </div>

          {/* Legal */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Legal</h4>
            <div className={styles.footerLinks}>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/faq">FAQ</Link>
            </div>
          </div>

          {/* Social & Contact */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Connect With Us</h4>
            <div className={styles.footerSocial}>
              <p className={styles.footerHashtags}>#BloodDonation #SaveLives #Aashayein</p>
              <p className={styles.footerEmail}>info@thelifesaviours.org</p>
              <p className={styles.footerPhone}>+91 XXXXX XXXXX</p>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>© 2025 TheLifeSaviours by Aashayein. All rights reserved.</p>
          <p className={styles.madeWith}>Made with ❤️ for saving lives</p>
        </div>
      </footer>
    </div>
  );
}
