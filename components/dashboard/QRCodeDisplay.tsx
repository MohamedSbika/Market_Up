'use client';

/**
 * QRCodeDisplay — Generates and displays a QR code for a profile URL.
 * Uses the qrcode library on the client.
 */
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({ value, size = 160, label }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width:  size,
      margin: 2,
      color:  { dark: '#000000', light: '#FFFFFF' },
    }).catch((err) => console.error('[QRCode]', err));
  }, [value, size]);

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 rounded-lg border" style={{ border: '1px solid #E0E0E0', background: '#FFFFFF' }}>
        <canvas ref={canvasRef} width={size} height={size} />
      </div>
      {label && <p className="text-xs text-[#616161] text-center max-w-[160px] break-all">{label}</p>}
      <button
        onClick={download}
        className="ms-btn-secondary text-xs"
        style={{ padding: '6px 12px' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Télécharger
      </button>
    </div>
  );
}
