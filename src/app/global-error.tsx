'use client';

import { useEffect } from 'react';

import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Last-resort error boundary. Rendered when even the root layout
 * fails. Because the root layout provides the <html> / <body> tags,
 * this component has to provide them itself. Keep it dependency-free:
 * no translations, no theme, no fonts.
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderRadius: 6,
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
            }}
          >
            Critical error
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
            The application hit an unrecoverable state. Please try again, or come back in a few
            minutes.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              background: '#fff',
              color: '#0a0a0a',
              border: 0,
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
