import { NextResponse, type NextRequest } from 'next/server';

function normalizeReport(body: unknown): {
  documentUri?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  blockedUri?: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  originalPolicy?: string;
} | null {
  if (!body) return null;
  if (Array.isArray(body)) {
    const violation = body.find(
      (r): r is { type: string; body?: Record<string, unknown> } =>
        typeof r === 'object' && r !== null && 'type' in r && r.type === 'csp-violation'
    );
    if (violation?.body) return fromBody(violation.body);
    return null;
  }
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

function fromBody(b: Record<string, unknown>) {
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

/**
 * Receives CSP violation reports from browsers and persists them.
 * Two formats supported: legacy `application/csp-report` and the
 * new `application/reports+json`. Always 204 — failed reporting
 * should not generate retries.
 *
 * The Prisma client is loaded lazily so unit tests can exercise the
 * normalization logic without a database connection.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse('Invalid report body', { status: 400 });
  }

  const report = normalizeReport(body);
  if (report) {
    const userAgent = request.headers.get('user-agent') ?? null;
    console.error('[csp-violation]', JSON.stringify(report));
    // Best-effort persistence. Skip silently if Prisma isn't reachable
    // (e.g. in tests or during build).
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.cspReport.create({
        data: {
          documentUri: report.documentUri ?? null,
          violatedDirective: report.violatedDirective ?? null,
          effectiveDirective: report.effectiveDirective ?? null,
          blockedUri: report.blockedUri ?? null,
          sourceFile: report.sourceFile ?? null,
          lineNumber: report.lineNumber ?? null,
          columnNumber: report.columnNumber ?? null,
          originalPolicy: report.originalPolicy ?? null,
          userAgent: userAgent?.slice(0, 512) ?? null,
        },
      });
    } catch {
      // best-effort
    }
  }

  return new NextResponse(null, { status: 204 });
}

export function GET(): NextResponse {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}
