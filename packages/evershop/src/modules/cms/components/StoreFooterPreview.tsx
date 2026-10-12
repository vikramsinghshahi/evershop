import React from 'react';

/** Stylized preview of the store footer — brand block plus three columns. */
export default function StoreFooterPreview(): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        background: '#3d524a',
        padding: 16,
        height: 120
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          border: '1px solid rgba(244,239,230,0.7)',
          flexShrink: 0
        }}
      />
      {[4, 3, 3].map((lines, index) => (
        <span
          key={index}
          style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}
        >
          <span
            style={{
              display: 'block',
              width: '55%',
              height: 6,
              borderRadius: 2,
              background: '#f4efe6',
              opacity: 0.9
            }}
          />
          {Array.from({ length: lines }, (_, line) => (
            <span
              key={line}
              style={{
                display: 'block',
                width: line === lines - 1 ? '60%' : '80%',
                height: 4,
                borderRadius: 2,
                background: '#f4efe6',
                opacity: 0.45
              }}
            />
          ))}
        </span>
      ))}
    </div>
  );
}
