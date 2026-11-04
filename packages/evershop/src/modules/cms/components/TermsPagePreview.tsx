import React from 'react';

export default function TermsPagePreview(): React.ReactElement {
  return (
    <div
      style={{
        height: 130,
        padding: 12,
        background: '#f7f9fc',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
        color: '#1c2f6b'
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.14em' }}>OUR POLICIES</div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 650 }}>
        Terms & Conditions
      </div>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {['Orders', 'Pricing', 'Delivery', 'Quality'].map((item) => (
          <span
            key={item}
            style={{ background: '#fff', fontSize: 10, padding: '6px 8px' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
