'use client';

import React, { useEffect, useState } from 'react';

export default function TestComponent() {
  const [count, setCount] = useState(0);
  
  console.log('🧪 TestComponent: Rendering with count:', count);
  
  useEffect(() => {
    console.log('🧪 TestComponent: useEffect running!');
    setCount(1);
  }, []);
  
  return (
    <div style={{ padding: '20px', background: 'yellow', margin: '10px' }}>
      <h2>Test Component</h2>
      <p>Count: {count}</p>
      <p>If this shows count = 1, useEffect is working</p>
    </div>
  );
}