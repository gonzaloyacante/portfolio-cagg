import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

/**
 * One icon generator, multiple sizes. Next.js will write each entry
 * to `/icon-NNN.png` so we can reference them in the PWA manifest
 * and the HTML <link rel="icon"> chain. Sizes cover:
 *   - 16, 32, 48 — legacy favicon / tab
 *   - 192, 512 — Android Chrome / PWA install
 *   - 180 — Apple touch icon
 */
export function generateImageMetadata() {
  return [
    { id: '16', size: { width: 16, height: 16 } },
    { id: '32', size: { width: 32, height: 32 } },
    { id: '48', size: { width: 48, height: 48 } },
    { id: '180', size: { width: 180, height: 180 } },
    { id: '192', size: { width: 192, height: 192 } },
    { id: '512', size: { width: 512, height: 512 } },
    { id: 'maskable-192', size: { width: 192, height: 192 }, contentType: 'image/png' },
    { id: 'maskable-512', size: { width: 512, height: 512 }, contentType: 'image/png' },
  ];
}

export default function Icon({ id }: { id: string | number }) {
  // Maskable variants need a bigger safe zone (about 40% padding on
  // each side) so the OS-mandated circle / squircle mask doesn't crop
  // the monogram. Non-maskable can use the full square.
  const idStr = String(id ?? '');
  const isMaskable = idStr.startsWith('maskable');
  const isApple = idStr === '180';
  // Bigger relative padding for smaller icons so the "CG" still
  // looks balanced at favicon sizes.
  const paddingScale = isMaskable ? 0.32 : isApple ? 0.18 : 0.1;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isMaskable
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 100%)'
          : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2a 100%)',
        color: '#fafafa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 800,
        letterSpacing: '-0.05em',
        position: 'relative',
      }}
    >
      {/* Top-left highlight to add depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
          display: 'flex',
        }}
      />
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 100 * (1 - paddingScale * 2),
          display: 'flex',
        }}
      >
        CG
      </span>
    </div>,
    { width: 512, height: 512 }
  );
}
