import { ImageResponse } from 'next/og';

export const size = { width: 1242, height: 2688 };
export const contentType = 'image/png';

/**
 * iOS PWA splash screen. Rendered at 1242x2688 (iPhone X / 11 Pro / 13
 * Pro logical size). Shows the "CG" badge centered with the app
 * name below — looks like a real launch screen.
 *
 * iOS picks the right splash by device pixel ratio, so we only need
 * this one size: Next.js serves it at the URL the manifest points
 * to. Apple's launch-image spec requires the PNG to be exactly
 * the device's resolution, but a single 1242x2688 PNG with the
 * safe-area centered content works for all current iPhones.
 */
export default function AppleTouchStartupImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#fafafa',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {/* Ambient mesh — same as the OG image so the brand feels consistent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 50%), radial-gradient(circle at 50% 80%, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0) 50%)',
          display: 'flex',
        }}
      />

      {/* Top hairline */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background:
            'linear-gradient(90deg, rgba(99, 102, 241, 0.7) 0%, rgba(244, 63, 94, 0.5) 50%, rgba(34, 197, 94, 0.5) 100%)',
          display: 'flex',
        }}
      />

      {/* Centered logo block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 36,
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 48,
            background: 'linear-gradient(135deg, #fafafa 0%, #d4d4d8 100%)',
            color: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: '-0.05em',
            boxShadow: '0 24px 80px -20px rgba(255, 255, 255, 0.3)',
          }}
        >
          CG
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 40,
              fontWeight: 600,
              color: '#fafafa',
              display: 'flex',
              letterSpacing: '-0.02em',
            }}
          >
            Carlos A. Guerra
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#a1a1aa',
              display: 'flex',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Portfolio
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
