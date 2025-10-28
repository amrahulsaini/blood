"use client";

import { useEffect, useRef, useState } from 'react';
// import { useSearchParams } from 'next/navigation';

const CERT_IMAGE_SRC = '/official%20offer%20letter.png';

// Base ratio to place the name on the certificate image (aimed at the blank line area)
const NAME_Y_RATIO = 0.475; // ~47.5% from top – closer to the horizontal line
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
    const baseFontSize = Math.round(width * 0.043 * Math.max(0.6, Math.min(1.6, fontScale)));
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
    // Try Web Share with image + caption when supported.
    try {
      const blob = await generateCertificateBlob();
      if (blob && 'share' in navigator && (navigator as any).canShare?.({ files: [new File([blob], 'certificate.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'certificate.png', { type: 'image/png' });
        await (navigator as any).share({
          files: [file],
          text: caption || undefined,
          title: 'Aashayein – Certificate',
        });
        return;
      }
    } catch (e) {
      // fall through to LinkedIn web composer
    }

    // Fallback: copy caption and open LinkedIn composer; user pastes and attaches image.
    if (caption) {
      try { await navigator.clipboard.writeText(caption); } catch {}
      alert('Caption copied. LinkedIn composer will open—paste the caption and attach the downloaded certificate image.');
    }
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
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
              fontSize: `clamp(18px, ${4.2 * Math.max(0.6, Math.min(1.6, fontScale))}vw, ${48 * Math.max(0.6, Math.min(1.6, fontScale))}px)`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={name}
          >
            {name || 'Donor'}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleDownload} style={{
            padding: '0.75rem 1.1rem',
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 800,
            boxShadow: '0 10px 25px rgba(220,38,38,0.3)'
          }}>
            Download PNG
          </button>
          <button onClick={handleGenerateCaption} disabled={isGen} style={{
            padding: '0.75rem 1.1rem',
            background: '#fff',
            color: '#b91c1c',
            border: '2px solid #fecaca',
            borderRadius: 10,
            fontWeight: 800
          }}>
            {isGen ? 'Generating…' : 'Generate LinkedIn Caption'}
          </button>
          <button onClick={handleCopyCaption} disabled={!caption} style={{
            padding: '0.75rem 1.1rem',
            background: '#fff',
            color: '#b91c1c',
            border: '2px solid #fecaca',
            borderRadius: 10,
            fontWeight: 800
          }}>
            Copy Caption
          </button>
          <button onClick={handleShareLinkedIn} style={{
            padding: '0.75rem 1.1rem',
            background: 'linear-gradient(135deg, #0a66c2 0%, #054a8b 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 800
          }}>
            Share on LinkedIn
          </button>
        </div>

        {/* Caption preview */}
        <div style={{
          marginTop: '0.75rem',
          padding: '0.9rem 1rem',
          border: '2px solid #fecaca',
          borderRadius: 12,
          background: '#fff',
          color: '#450a0a',
          minHeight: 48,
          maxWidth: 'min(1000px, 92vw)'
        }}>
          {caption || (genError ? genError : 'Caption will appear here after generation.')}
        </div>
      </div>
    </div>
  );
}
