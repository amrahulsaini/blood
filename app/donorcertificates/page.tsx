"use client";

import { useEffect, useRef, useState } from 'react';
// import { useSearchParams } from 'next/navigation';

const CERT_IMAGE_SRC = '/official%20offer%20letter.png';

// Base ratio to place the name on the certificate image (aimed at the blank line area)
const NAME_Y_RATIO = 0.53; // ~51% from top – moved down a bit
const NAME_X_CENTER_RATIO = 0.5; // center

export default function DonorCertificatesPage() {
  const [name, setName] = useState('');
  const [offsetY, setOffsetY] = useState(0); // fine tune vertical position (+down, -up)
  const [fontScale, setFontScale] = useState(1); // scale relative to base font size
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [caption, setCaption] = useState('');
  const [isGen, setIsGen] = useState(false);
  const [genError, setGenError] = useState('');

  // Initialize name from query param or localStorage
  useEffect(() => {
    try {
      // Read from query string on client without useSearchParams to avoid CSR bailout
      const qp = new URLSearchParams(window.location.search);
      const qpName = qp.get('name');
      if (qpName && qpName.trim()) {
        setName(qpName.trim());
        try { localStorage.setItem('donorName', qpName.trim()); } catch {}
      } else {
        const saved = localStorage.getItem('donorName');
        if (saved) setName(saved);
      }

      const savedOffset = localStorage.getItem('certYOffset');
      if (savedOffset) setOffsetY(parseFloat(savedOffset));
      const savedScale = localStorage.getItem('certFontScale');
      if (savedScale) setFontScale(parseFloat(savedScale));
    } catch {}
  }, []);

  const handleDownload = async () => {
    const blob = await generateCertificateBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name || 'donor').replace(/\s+/g, '_')}_certificate.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  async function generateCertificateBlob(): Promise<Blob | null> {
    const img = imgRef.current;
    if (!img) return null;
    if (!img.complete) {
      await new Promise<void>((resolve) => { img.onload = () => resolve(); });
    }
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    const baseFontSize = Math.round(width * 0.035 * Math.max(0.6, Math.min(1.6, fontScale)));
    ctx.font = `italic 700 ${baseFontSize}px Georgia, 'Times New Roman', Times, serif`;
    ctx.fillStyle = '#b91c1c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const x = Math.round(width * NAME_X_CENTER_RATIO);
    const y = Math.round(height * (NAME_Y_RATIO + offsetY));
    const maxWidth = width * 0.7;
    let displayFont = baseFontSize;
    const renderName = (name || 'Donor');
    while (ctx.measureText(renderName).width > maxWidth && displayFont > 18) {
      displayFont -= 1;
      ctx.font = `italic 700 ${displayFont}px Georgia, 'Times New Roman', Times, serif`;
    }
    ctx.fillText(renderName, x, y);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  }

  const handleGenerateCaption = async () => {
    try {
      setIsGen(true);
      setGenError('');
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        // Try to extract server-provided error details for better debugging
        let serverMsg = '';
        try {
          const j = await res.json();
          serverMsg = j?.error || JSON.stringify(j);
          if (j?.details?.primary) {
            serverMsg += ` | details: ${String(j.details.primary).slice(0, 200)}`;
          }
        } catch {
          try { serverMsg = await res.text(); } catch {}
        }
        throw new Error(serverMsg || 'Failed to generate');
      }
      const data = await res.json();
      setCaption(data.caption || 'Proud to support blood donation. #BloodDonation #SaveLives');
      try { localStorage.setItem('certCaption', data.caption || ''); } catch {}
    } catch (e: any) {
      setGenError('Could not generate caption. ' + (e?.message ? String(e.message).slice(0, 220) : 'You can still write your own.'));
    } finally {
      setIsGen(false);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('certCaption');
      if (saved) setCaption(saved);
    } catch {}
  }, []);

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      alert('Caption copied to clipboard. LinkedIn will open next—paste it in and attach the downloaded image.');
    } catch {}
  };

  const handleShareLinkedIn = async () => {
    // Auto-generate caption if not already present
    if (!caption || caption.trim() === '') {
      setIsGen(true);
      setGenError('');
      try {
        const res = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const data = await res.json();
          const generatedCaption = data.caption || 'Proud to support blood donation. #BloodDonation #SaveLives';
          setCaption(generatedCaption);
          try { localStorage.setItem('certCaption', generatedCaption); } catch {}
        }
      } catch (e: any) {
        // Use fallback caption if generation fails
        const fallbackCaption = 'Proud to support blood donation. #BloodDonation #SaveLives';
        setCaption(fallbackCaption);
      } finally {
        setIsGen(false);
      }
      // Wait a moment for caption to be set
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Download the certificate automatically
    const blob = await generateCertificateBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(name || 'donor').replace(/\s+/g, '_')}_certificate.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    // Get current caption for sharing
    const currentCaption = caption || 'Proud to support blood donation. #BloodDonation #SaveLives';

    // Try Web Share API first (best for mobile with file + text)
    try {
      if (blob && 'share' in navigator) {
        const file = new File([blob], 'certificate.png', { type: 'image/png' });
        const canShareFiles = (navigator as any).canShare?.({ files: [file] });
        
        if (canShareFiles) {
          await (navigator as any).share({
            files: [file],
            text: currentCaption,
            title: 'Blood Donation Certificate',
          });
          return; // Successfully shared via native share
        }
      }
    } catch (e) {
      // User cancelled or share failed, continue to LinkedIn
      console.log('Web share not available or cancelled');
    }

    // Copy caption to clipboard
    try { 
      await navigator.clipboard.writeText(currentCaption); 
    } catch (e) {
      console.log('Clipboard write failed');
    }
    
    // LinkedIn sharing - try different approaches
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const linkedInText = encodeURIComponent(currentCaption);
    
    if (isMobile) {
      // Mobile: try app deep link first
      alert('Certificate downloaded and caption copied! Opening LinkedIn app...');
      // LinkedIn app deep link
      window.location.href = `linkedin://sharing/share-offsite/?url=${encodeURIComponent('https://aashayein.org')}`;
      
      // Fallback to mobile web if app doesn't open
      setTimeout(() => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://aashayein.org')}`, '_blank');
      }, 2000);
    } else {
      // Desktop: open LinkedIn composer
      alert('Certificate downloaded and caption copied!\n\nLinkedIn will open - paste the caption and attach the downloaded certificate image.');
      window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 50%, #fff0f0 100%)'
    }}>
      <div style={{
        background: '#fff',
        border: '2px solid #fecaca',
        borderRadius: 16,
        padding: '1rem',
        color: '#7f1d1d',
        boxShadow: '0 20px 60px rgba(220,38,38,0.12), 0 8px 20px rgba(185,28,28,0.08)'
      }}>
        <div style={{ position: 'relative', width: 'min(1000px, 92vw)' }}>
          {/* Certificate preview with name overlay */}
          <img
            ref={imgRef}
            src={CERT_IMAGE_SRC}
            alt="Certificate"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${(NAME_Y_RATIO + offsetY) * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '72%',
              textAlign: 'center',
              color: '#b91c1c',
              fontFamily: "Georgia, 'Times New Roman', Times, serif",
              fontStyle: 'italic',
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontSize: `clamp(16px, ${3.5 * Math.max(0.6, Math.min(1.6, fontScale))}vw, ${40 * Math.max(0.6, Math.min(1.6, fontScale))}px)`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={name}
          >
            {name || 'Donor'}
          </div>
        </div>

        {/* Action buttons below certificate */}
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          marginTop: '1.25rem', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button onClick={handleDownload} style={{
            padding: '0.75rem 1.25rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Download Certificate
          </button>
          <button onClick={handleGenerateCaption} disabled={isGen} style={{
            padding: '0.75rem 1.25rem',
            background: isGen ? '#f5f5f5' : '#fff',
            color: '#b91c1c',
            border: '2px solid #fecaca',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: isGen ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s',
            opacity: isGen ? 0.7 : 1
          }}
          onMouseEnter={(e) => !isGen && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {isGen ? 'Generating Caption…' : 'Generate Caption'}
          </button>
          <button onClick={handleShareLinkedIn} disabled={isGen} style={{
            padding: '0.75rem 1.25rem',
            background: isGen ? '#6b95c2' : 'linear-gradient(135deg, #0a66c2 0%, #054a8b 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(10,102,194,0.3)',
            cursor: isGen ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s',
            opacity: isGen ? 0.7 : 1
          }}
          onMouseEnter={(e) => !isGen && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Post on LinkedIn
          </button>
        </div>

        {/* Caption preview below buttons */}
        <div style={{
          marginTop: '1rem',
          padding: '0.9rem 1rem',
          border: '2px solid #fecaca',
          borderRadius: 12,
          background: '#fff',
          color: '#450a0a',
          minHeight: 48,
          maxWidth: 'min(1000px, 92vw)',
          fontSize: '0.95rem',
          lineHeight: '1.5'
        }}>
          {caption || (genError ? genError : 'Caption will appear here after generation.')}
        </div>
      </div>
    </div>
  );
}
