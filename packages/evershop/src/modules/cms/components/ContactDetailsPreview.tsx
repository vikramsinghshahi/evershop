import React from 'react';

export default function ContactDetailsPreview(): React.ReactElement {
  return (
    <div
      style={{
        height: 130,
        padding: 12,
        background: '#f5f0e9',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
        color: '#111e2d'
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 650 }}>Contact us</div>
      <div style={{ marginTop: 8, fontSize: 10, color: '#666' }}>
        Address, email, and phone
      </div>
      <div
        style={{
          marginTop: 10,
          height: 8,
          width: '70%',
          background: '#fff'
        }}
      />
      <div
        style={{
          marginTop: 6,
          height: 8,
          width: '45%',
          background: '#fff'
        }}
      />
    </div>
  );
}
