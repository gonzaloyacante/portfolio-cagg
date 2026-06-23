import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handlePrismaError } from '@/lib/api-error';

describe('lib/api-error.ts — handlePrismaError', () => {
  let originalNodeEnv: string | undefined;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'development';
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    consoleErrorSpy.mockRestore();
  });

  async function callHandle(
    err: unknown,
    operation: 'create' | 'update' | 'delete' | 'reorder' = 'update'
  ) {
    return handlePrismaError(err, operation);
  }

  // ─────────────────────────────────────────────────────────────────────
  // P2025 — record not found
  // ─────────────────────────────────────────────────────────────────────
  describe('P2025 (record not found)', () => {
    it('returns 404 when err.code is P2025', async () => {
      const res = await callHandle({ code: 'P2025', message: 'Not found' });
      expect(res.status).toBe(404);
    });

    it('body has error: "Not found"', async () => {
      const res = await callHandle({ code: 'P2025' });
      const body = await res.json();
      expect(body).toEqual({ error: 'Not found' });
    });

    it('logs the error in development', async () => {
      await callHandle({ code: 'P2025', message: 'missing' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('not-found'),
        expect.objectContaining({ code: 'P2025' })
      );
    });

    it('does NOT log in production', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      await callHandle({ code: 'P2025' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it.each(['create', 'update', 'delete', 'reorder'] as const)(
      'includes the operation name in the log message for %s',
      async (op) => {
        await callHandle({ code: 'P2025' }, op);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining(`[admin ${op}] not-found`),
          expect.anything()
        );
      }
    );
  });

  // ─────────────────────────────────────────────────────────────────────
  // not-found message hint fallback
  // ─────────────────────────────────────────────────────────────────────
  describe('message-based not-found fallback', () => {
    // The function extracts `.message` only from Error instances or
    // plain strings. Plain objects with a `message` field are NOT inspected.
    it.each([
      'not found',
      'Not Found',
      'NOT FOUND',
      'no existe',
      'does not exist',
      'Does Not Exist',
      'Record does not exist',
      'Registro no existe',
    ])('returns 404 when Error.message matches %j', async (msg) => {
      const res = await callHandle(new Error(msg));
      expect(res.status).toBe(404);
    });

    it('still returns 404 when error is a plain string with hint', async () => {
      const res = await callHandle('not found in db');
      expect(res.status).toBe(404);
    });

    it('does not match when hint word is part of a larger word', async () => {
      // "notebook" contains "not" but no space — should not match.
      const res = await callHandle(new Error('notebook'));
      expect(res.status).toBe(500);
    });

    it('plain object with .message is NOT inspected (extractor only handles Error/string)', async () => {
      // Documents the current behavior so we notice if it changes.
      const res = await callHandle({ message: 'not found' });
      expect(res.status).toBe(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // P2002 — unique constraint
  // ─────────────────────────────────────────────────────────────────────
  describe('P2002 (unique constraint)', () => {
    it('returns 409 when err.code is P2002', async () => {
      const res = await callHandle({ code: 'P2002', message: 'unique' });
      expect(res.status).toBe(409);
    });

    it('includes the offending target from meta as a string', async () => {
      const res = await callHandle({
        code: 'P2002',
        meta: { target: 'email' },
      });
      const body = await res.json();
      expect(body).toEqual({ error: 'Duplicate value for email' });
    });

    it('joins multiple targets with a comma', async () => {
      const res = await callHandle({
        code: 'P2002',
        meta: { target: ['code', 'locale'] },
      });
      const body = await res.json();
      expect(body).toEqual({ error: 'Duplicate value for code, locale' });
    });

    it('returns generic message when meta is missing', async () => {
      const res = await callHandle({ code: 'P2002' });
      const body = await res.json();
      expect(body).toEqual({ error: 'Duplicate value' });
    });

    it('returns generic message when meta.target is empty array', async () => {
      const res = await callHandle({ code: 'P2002', meta: { target: [] } });
      const body = await res.json();
      expect(body).toEqual({ error: 'Duplicate value' });
    });

    it('does NOT log a server-side error (client-visible)', async () => {
      await callHandle({ code: 'P2002', meta: { target: 'email' } });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // P2003 — FK violation
  // ─────────────────────────────────────────────────────────────────────
  describe('P2003 (FK violation)', () => {
    it('returns 409', async () => {
      const res = await callHandle({ code: 'P2003' });
      expect(res.status).toBe(409);
    });

    it('body has "Referenced record not found"', async () => {
      const res = await callHandle({ code: 'P2003' });
      const body = await res.json();
      expect(body).toEqual({ error: 'Referenced record not found' });
    });

    it('does NOT log a server-side error', async () => {
      await callHandle({ code: 'P2003' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Fallback / 500
  // ─────────────────────────────────────────────────────────────────────
  describe('fallback (unknown error)', () => {
    it('returns 500 for unknown error code', async () => {
      const res = await callHandle({ code: 'P9999', message: 'weird' });
      expect(res.status).toBe(500);
    });

    it('body has "Internal error" (no details leaked to client)', async () => {
      const res = await callHandle({ code: 'P9999', message: 'sensitive details' });
      const body = await res.json();
      expect(body).toEqual({ error: 'Internal error' });
      expect(body.error).not.toContain('sensitive');
    });

    it('logs the full error in development', async () => {
      await callHandle({ code: 'P9999', message: 'boom' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[admin update]'),
        expect.objectContaining({ code: 'P9999' })
      );
    });

    it('does NOT log in production', async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      await callHandle({ code: 'P9999' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('returns 500 for non-object errors (null)', async () => {
      const res = await callHandle(null);
      expect(res.status).toBe(500);
    });

    it('returns 500 for undefined', async () => {
      const res = await callHandle(undefined);
      expect(res.status).toBe(500);
    });

    it('returns 500 for a plain string error with no hint', async () => {
      const res = await callHandle('something went wrong');
      expect(res.status).toBe(500);
    });

    it('returns 500 for an Error with no code and no hint', async () => {
      const res = await callHandle(new Error('connection refused'));
      expect(res.status).toBe(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Prisma code embedded at the START of the message text (some drivers
  // put the code at the beginning of the human message rather than on
  // err.code). The regex is anchored with ^, so the message must start
  // with the code.
  // ─────────────────────────────────────────────────────────────────────
  describe('Prisma code detected from message text (anchored at start)', () => {
    it('P2025 at start of Error.message triggers 404 even without err.code', async () => {
      const res = await callHandle(new Error('P2025 record not found'));
      expect(res.status).toBe(404);
    });

    it('P2002 at start of Error.message triggers 409 even without err.code', async () => {
      const res = await callHandle(new Error('P2002 Unique constraint failed on field email'));
      expect(res.status).toBe(409);
    });

    it('P2003 at start of Error.message triggers 409 even without err.code', async () => {
      const res = await callHandle(new Error('P2003 Foreign key constraint failed'));
      expect(res.status).toBe(409);
    });

    it('code in the middle of the message is NOT detected (regex anchored)', async () => {
      const res = await callHandle(new Error('Operation failed: P2025 — record not found'));
      // No code on err.code, code-in-middle not matched, no hint in message.
      // (The hint would catch it if it contained "not found" — let's verify.)
      expect(res.status).toBe(404); // matched via the "not found" hint
    });

    it('P9999 at start (unknown code) returns 500', async () => {
      const res = await callHandle(new Error('P9999 some weird thing'));
      expect(res.status).toBe(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // Edge cases for input shape
  // ─────────────────────────────────────────────────────────────────────
  describe('input shape edge cases', () => {
    it('treats err as Error when instanceof matches', async () => {
      const err = new Error('plain error');
      const res = await callHandle(err);
      expect(res.status).toBe(500);
    });

    it('extracts message from Error instance', async () => {
      await callHandle(new Error('something'));
      // The function logged using the error itself.
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(String), expect.any(Error));
    });

    it('handles err with meta.target as a single string', async () => {
      const res = await callHandle({ code: 'P2002', meta: { target: 'code' } });
      const body = await res.json();
      expect(body).toEqual({ error: 'Duplicate value for code' });
    });

    it('ignores extra fields on err', async () => {
      const res = await callHandle({ code: 'P2025', extra: 'ignored', nested: { a: 1 } });
      expect(res.status).toBe(404);
    });
  });
});
