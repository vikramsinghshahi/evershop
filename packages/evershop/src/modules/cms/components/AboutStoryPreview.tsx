import React from 'react';

export default function AboutStoryPreview(): React.ReactElement {
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
      <div style={{ fontSize: 12, fontWeight: 650, lineHeight: 1.3 }}>
        32 years of textile expertise
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
        {['32+', 'Custom', 'Global'].map((item) => (
          <span
            key={item}
            style={{
              flex: 1,
              background: '#fff',
              textAlign: 'center',
              fontSize: 10,
              padding: '6px 0',
              color: '#d86828'
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
