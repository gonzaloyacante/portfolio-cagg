import { ImageResponse } from 'next/og';

export const alt = 'Carlos Armando Guerra — Ingeniero Electrónico de Control Industrial';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Open Graph image shown when someone shares the site on social
 * networks (LinkedIn, Twitter, Facebook, WhatsApp, Slack, etc.).
 * Also used as the Twitter card image. Renders entirely on the
 * server via ImageResponse so the first byte is the PNG.
 */
export default async function OpengraphImage() {
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
      {/* Ambient gradient mesh */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 40%), radial-gradient(circle at 100% 100%, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0) 50%)',
          display: 'flex',
        }}
      />

      {/* Top-left brand row */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #fafafa 0%, #d4d4d8 100%)',
            color: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.05em',
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
              fontSize: 14,
              color: '#a1a1aa',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Portfolio · 2026
          </div>
          <div
            style={{
              fontSize: 16,
              color: '#fafafa',
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            carlosguerra.dev
          </div>
        </div>
      </div>

      {/* Center main heading */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 60,
          right: 60,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: '#a1a1aa',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Ingeniero Electrónico · Control Industrial
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: '#fafafa',
            display: 'flex',
          }}
        >
          Carlos Armando
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: '#a1a1aa',
            display: 'flex',
          }}
        >
          Guerra
        </div>
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 60,
          right: 60,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: '#d4d4d8',
            lineHeight: 1.4,
            maxWidth: 700,
            display: 'flex',
          }}
        >
          +30 años optimizando líneas de producción industrial.
          <br />
          Termoformado · BOPP · Metalizado · Extrusión PP
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#71717a',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Disponible para nuevos proyectos
          </div>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: '#22c55e',
              display: 'flex',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
            }}
          />
        </div>
      </div>

      {/* Bottom hairline */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background:
            'linear-gradient(90deg, rgba(99, 102, 241, 0.6) 0%, rgba(244, 63, 94, 0.4) 100%)',
          display: 'flex',
        }}
      />
    </div>,
    { ...size }
  );
}
