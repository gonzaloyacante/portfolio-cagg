import { NextResponse, type NextRequest } from 'next/server';

/**
 * Receives CSP violation reports from browsers.
 *
 * Browsers send two formats:
 *  - Legacy: `Content-Type: application/csp-report` → `{ "csp-report": { ... } }`
 *  - Reporting API: `Content-Type: application/reports+json` → `[{ "type": "csp-violation", "body": { ... } }]`
 *
 * We accept both, normalize them, and log the violation. No PII storage, no
 * third-party forwarding — just enough to know if the policy is breaking
 * something real in production.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/reports+json')) {
      body = await request.json();
    } else {
      // Legacy csp-report format
      body = await request.json();
    }
  } catch {
    return new NextResponse('Invalid report body', { status: 400 });
  }

  const report = normalizeReport(body);

  if (report) {
    // Log structured so Vercel/Log drain can pick it up.
    console.error('[csp-violation]', JSON.stringify(report));
  }

  // Always 204 — we don't want failed reporting to spam retries.
  return new NextResponse(null, { status: 204 });
}

// Some browsers/health checks may GET; respond with 405.
export function GET(): NextResponse {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

type NormalizedReport = {
  documentUri?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  blockedUri?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  originalPolicy?: string;
  userAgent?: string;
};

function normalizeReport(body: unknown): NormalizedReport | null {
  if (!body) return null;

  // Newer Reporting API: array of reports with `type` discriminator.
  if (Array.isArray(body)) {
    const violation = body.find(
      (r): r is { type: string; body?: Record<string, unknown> } =>
        typeof r === 'object' && r !== null && 'type' in r && r.type === 'csp-violation'
    );
    if (violation?.body) return fromBody(violation.body);
    return null;
  }

  // Object input — could be wrapped in csp-report or be a single report.
  if (typeof body !== 'object') return null;
  const obj = body as Record<string, unknown>;

  if ('csp-report' in obj && obj['csp-report'] && typeof obj['csp-report'] === 'object') {
    return fromBody(obj['csp-report'] as Record<string, unknown>);
  }

  if ('type' in obj && obj.type === 'csp-violation' && obj.body && typeof obj.body === 'object') {
    return fromBody(obj.body as Record<string, unknown>);
  }

  return null;
}

function fromBody(b: Record<string, unknown>): NormalizedReport {
  return {
    documentUri: stringOrUndefined(b['document-uri'] ?? b['documentURL']),
    violatedDirective: stringOrUndefined(b['violated-directive'] ?? b['effectiveDirective']),
    effectiveDirective: stringOrUndefined(b['effective-directive'] ?? b['effectiveDirective']),
    blockedUri: stringOrUndefined(b['blocked-uri'] ?? b['blockedURL']),
    sourceFile: stringOrUndefined(b['source-file'] ?? b['sourceFile']),
    lineNumber: numberOrUndefined(b['line-number'] ?? b['lineNumber']),
    columnNumber: numberOrUndefined(b['column-number'] ?? b['columnNumber']),
    originalPolicy: stringOrUndefined(b['original-policy'] ?? b['originalPolicy']),
  };
}

function stringOrUndefined(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function numberOrUndefined(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}
