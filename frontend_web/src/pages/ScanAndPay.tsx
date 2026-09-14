import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const ScanAndPay = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize the scanner when the component mounts
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      // decodedText should be the UPI ID or merchant ID
      // E.g., 'merchant123@NexaPay'
      scanner.clear();
      navigate(`/transfer/${encodeURIComponent(decodedText)}`);
    };

    const onScanFailure = (error: any) => {
      // Typically just ignore failures until a success happens
      // console.warn(`Code scan error = ${error}`);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      // Cleanup when component unmounts
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [navigate]);

  return (
    <div className="glass-card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--text-main)' }}>Scan & Pay</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Point your camera at a QR code to initiate payment.</p>
      
      {/* The container for the camera feed */}
      <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
      
      {error && <p style={{ color: 'var(--danger)', marginTop: '16px' }}>{error}</p>}
      
      <button 
        className="btn-primary" 
        style={{ marginTop: '24px', width: '100%' }}
        onClick={() => navigate('/')}
      >
        Cancel
      </button>
    </div>
  );
};
