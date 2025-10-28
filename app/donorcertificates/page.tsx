"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  // Security: Check if user came from form submission
  useEffect(() => {
    const checkAuthorization = () => {
      try {
        // Read from query string on client without useSearchParams to avoid CSR bailout
        const qp = new URLSearchParams(window.location.search);
        const qpName = qp.get('name');
        
        if (qpName && qpName.trim()) {
          // User came with a name in URL - authorized
          setName(qpName.trim());
          setIsLoading(false);
          try { localStorage.setItem('donorName', qpName.trim()); } catch {}
          return;
        }
        
        // Check localStorage as fallback
        const saved = localStorage.getItem('donorName');
        if (saved && saved.trim()) {
          setName(saved);
          setIsLoading(false);
          return;
        }
        
        // No name found - need to redirect
        setShouldRedirect(true);
      } catch (e) {
        // Error - redirect to safety
        setShouldRedirect(true);
      }
    };

    checkAuthorization();

    // Load saved settings
    try {
      const savedOffset = localStorage.getItem('certYOffset');
      if (savedOffset) setOffsetY(parseFloat(savedOffset));
      const savedScale = localStorage.getItem('certFontScale');
      if (savedScale) setFontScale(parseFloat(savedScale));
    } catch {}
  }, []);

  // Load saved caption
  useEffect(() => {
    try {
      const saved = localStorage.getItem('certCaption');
      if (saved) setCaption(saved);
    } catch {}
  }, []);

  // Handle redirect in separate effect
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/donorentries');
    }
  }, [shouldRedirect, router]);

  // Show loading/redirect state
  if (isLoading || shouldRedirect) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #e0f2fe 100%)',
        fontSize: '1.5rem',
        color: '#0e7490',
        fontWeight: 600
      }}>
        {shouldRedirect ? (
          <>
            <div>Please register first to get your certificate!</div>
            <div style={{ fontSize: '1.2rem' }}>Redirecting to registration...</div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }

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
    ctx.fillStyle = '#0e7490';
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

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      alert('✅ Caption copied to clipboard! You can now paste it on LinkedIn.');
    } catch (e) {
      alert('Failed to copy caption. Please try again.');
    }
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
        if (!res.ok) {
          throw new Error('Failed to generate caption');
        }
        const data = await res.json();
        if (!data.caption) {
          throw new Error('No caption received from AI');
        }
        setCaption(data.caption);
        try { localStorage.setItem('certCaption', data.caption); } catch {}
      } catch (e: any) {
        setGenError('Failed to generate caption. Please try "Generate Caption" button first.');
        setIsGen(false);
        return; // Don't proceed without caption
      } finally {
        setIsGen(false);
      }
      // Wait a moment for caption to be set
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Auto-copy caption to clipboard
    try { 
      await navigator.clipboard.writeText(caption);
      console.log('Caption auto-copied to clipboard'); 
    } catch (e) {
      console.log('Clipboard write failed');
    }

    // Generate and download the certificate
    const blob = await generateCertificateBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(name || 'donor').replace(/\s+/g, '_')}_certificate.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    // Try native Web Share API first (works best on mobile with image + text)
    if ('share' in navigator && blob) {
      try {
        const file = new File([blob], `${(name || 'donor').replace(/\s+/g, '_')}_certificate.png`, { type: 'image/png' });
        
        // Check if we can share files
        if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({
            files: [file],
            text: caption,
            title: 'Blood Donation Certificate - Aashayein'
          });
          return; // Successfully shared - user can choose LinkedIn from share menu
        }
      } catch (err) {
        console.log('Web Share API failed or cancelled:', err);
        // Continue to fallback methods
      }
    }

    // Caption already copied above, just need to open LinkedIn
    // Detect device and open LinkedIn appropriately
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Show instruction to user
    const instruction = isMobile 
      ? 'Certificate downloaded! Caption copied!\n\nLinkedIn app will open - create a new post, paste the caption, and attach the downloaded certificate image from your gallery.'
      : 'Certificate downloaded! Caption copied!\n\nLinkedIn will open - create a new post, paste the caption (Ctrl+V), and attach the downloaded certificate image.';
    
    alert(instruction);

    // Open LinkedIn
    if (isMobile) {
      // Try to open LinkedIn app on mobile
      window.location.href = 'linkedin://feed';
      // Fallback to web after delay
      setTimeout(() => {
        window.open('https://www.linkedin.com/feed/', '_blank');
      }, 1500);
    } else {
      // Desktop: Open LinkedIn in new tab
      window.open('https://www.linkedin.com/feed/', '_blank');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #e0f2fe 100%)'
    }}>
      <div style={{
        background: '#fff',
        border: '2px solid #a7f3d0',
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
              color: '#0e7490',
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
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
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
            color: '#0e7490',
            border: '2px solid #a7f3d0',
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
          <button onClick={handleCopyCaption} disabled={!caption} style={{
            padding: '0.75rem 1.25rem',
            background: caption ? '#fff' : '#f5f5f5',
            color: '#0e7490',
            border: '2px solid #a7f3d0',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            cursor: caption ? 'pointer' : 'not-allowed',
            transition: 'transform 0.2s',
            opacity: caption ? 1 : 0.5
          }}
          onMouseEnter={(e) => caption && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Copy Caption
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
          border: '2px solid #a7f3d0',
          borderRadius: 12,
          background: '#fff',
          color: '#164e63',
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
