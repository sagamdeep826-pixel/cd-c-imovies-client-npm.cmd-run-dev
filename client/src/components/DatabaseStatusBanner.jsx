import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';

export default function DatabaseStatusBanner() {
  const [dbInfo, setDbInfo] = useState({
    checked: false,
    online: false,
    isPersistent: false,
    isMemory: false,
  });

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await api.get('/health');
        if (isMounted && res.status === 'ok') {
          setDbInfo({
            checked: true,
            online: true,
            isPersistent: res.database?.isPersistent || false,
            isMemory: res.database?.isMemory || false,
          });
        }
      } catch (e) {
        if (isMounted) {
          setDbInfo({
            checked: true,
            online: false,
            isPersistent: false,
            isMemory: false,
          });
        }
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 20000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (!dbInfo.checked) return null;

  if (!dbInfo.online) {
    return (
      <div
        style={{
          background: 'linear-gradient(90deg, #b45309 0%, #d97706 100%)',
          color: '#fff',
          fontSize: '0.8rem',
          padding: '0.45rem 1rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <AlertTriangle size={15} />
        <span>
          <strong>DEMO MODE:</strong> Backend offline. Displaying local sample demo data (Data is NOT persistent).
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: dbInfo.isPersistent ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
        borderBottom: dbInfo.isPersistent ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
        color: dbInfo.isPersistent ? '#34d399' : '#fbbf24',
        fontSize: '0.78rem',
        padding: '0.35rem 1rem',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: 600,
      }}
    >
      <Database size={13} />
      <span>
        {dbInfo.isPersistent ? (
          <>
            <strong>MongoDB Live Mode:</strong> Connected to Persistent Database. All bookings & catalog changes are saved.
          </>
        ) : (
          <>
            <strong>In-Memory MongoDB Mode:</strong> Zero-friction database active. Seeded with 6 blockbusters, 4 theatres & 90 shows.
          </>
        )}
      </span>
    </div>
  );
}
