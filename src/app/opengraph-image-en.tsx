import { ImageResponse } from 'next/og';

export const alt = 'Carlos Armando Guerra — Industrial Control Electronic Engineer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * English-language Open Graph image. Served at /opengraph-image-en.
 * The Spanish version at /opengraph-image is the default; this
 * one is what we point OG metadata to when the page locale is 'en'.
 *
 * Same visual hierarchy as the Spanish variant, just translated:
 *   - Eyebrow: "Electronic Engineer · Industrial Control"
 *   - Name: "Carlos Armando / Guerra."
 *   - Stat chips: "30+ years", "15+ brands", "Thermoforming"
 *   - Tagline: "Industrial production lines optimized. BOPP ·
 *     Metallizing · PP Extrusion"
 *   - "Argentina · since 1994"
 */
export default async function OpengraphImageEn() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fafafa',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            'linear-gradient(90deg, rgba(99, 102, 241, 0.7) 0%, rgba(244, 63, 94, 0.5) 50%, rgba(34, 197, 94, 0.5) 100%)',
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0) 45%), radial-gradient(circle at 100% 100%, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0) 55%), radial-gradient(circle at 100% 0%, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0) 50%)',
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 70,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #fafafa 0%, #d4d4d8 100%)',
            color: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.05em',
            boxShadow: '0 8px 24px -8px rgba(255, 255, 255, 0.2)',
          }}
        >
          CG
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: '#a1a1aa',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            Portfolio · 2026
          </div>
          <div
            style={{
              fontSize: 17,
              color: '#fafafa',
              fontWeight: 600,
              marginTop: 4,
              display: 'flex',
            }}
          >
            carlosguerra.dev
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 70,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: '#22c55e',
            display: 'flex',
            boxShadow: '0 0 16px rgba(34, 197, 94, 0.7)',
          }}
        />
        <div
          style={{
            fontSize: 12,
            color: '#a1a1aa',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 600,
            display: 'flex',
          }}
        >
          Available
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 70,
          right: 70,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: '#a1a1aa',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 1,
              background: '#71717a',
              display: 'flex',
            }}
          />
          Electronic Engineer · Industrial Control
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.045em',
            color: '#fafafa',
            display: 'flex',
          }}
        >
          Carlos Armando
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.045em',
            color: '#a1a1aa',
            display: 'flex',
          }}
        >
          Guerra.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 70,
          right: 70,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fafafa',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: '#6366f1',
                display: 'flex',
              }}
            />
            30+ years
          </div>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fafafa',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: '#f43f5e',
                display: 'flex',
              }}
            />
            15+ brands
          </div>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fafafa',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                background: '#22c55e',
                display: 'flex',
              }}
            />
            Thermoforming
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
            maxWidth: 320,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: '#d4d4d8',
              lineHeight: 1.4,
              textAlign: 'right',
              display: 'flex',
            }}
          >
            Industrial production lines optimized.
            <br />
            BOPP · Metallizing · PP Extrusion
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#71717a',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: 6,
              display: 'flex',
            }}
          >
            Argentina · since 1994
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
