'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getFirebaseStatus } from '@/lib/firebase';

const FirebaseDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const status = getFirebaseStatus();
    const info = {
      authObject: auth,
      authType: typeof auth,
      authNull: auth === null,
      authUndefined: auth === undefined,
      firebaseStatus: status,
      timestamp: new Date().toISOString()
    };
    
    console.log('Firebase Debug Info:', info);
    setDebugInfo(info);
  }, []);

  if (!debugInfo) return <div>Loading debug info...</div>;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid red', 
      padding: '10px', 
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h3>Firebase Debug</h3>
      <div><strong>Auth Object:</strong> {debugInfo.authNull ? 'NULL' : debugInfo.authUndefined ? 'UNDEFINED' : 'EXISTS'}</div>
      <div><strong>Auth Type:</strong> {debugInfo.authType}</div>
      <div><strong>Firebase Configured:</strong> {debugInfo.firebaseStatus.configured ? 'YES' : 'NO'}</div>
      <div><strong>Auth Service:</strong> {debugInfo.firebaseStatus.services.auth ? 'YES' : 'NO'}</div>
      <div><strong>Missing Vars:</strong> {debugInfo.firebaseStatus.missingVars.join(', ') || 'None'}</div>
      <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
    </div>
  );
};

export default FirebaseDebug;