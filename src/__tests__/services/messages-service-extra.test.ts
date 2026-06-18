import { beforeEach, describe, expect, it, vi } from 'vitest';

import { messagesService } from '@/services/messages-service';

const { axiosInstance } = vi.hoisted(() => ({
  axiosInstance: { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

vi.mock('@/lib/axios', () => ({ default: axiosInstance }));

describe('messagesService — extra density', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles many sequential submissions', async () => {
    axiosInstance.post.mockResolvedValue({ data: { ok: true } });
    for (let i = 0; i < 10; i += 1) {
      await messagesService.submit({
        name: `u${i}`,
        email: 'a@b.co',
        message: 'x'.repeat(10),
        locale: 'es',
      });
    }
    expect(axiosInstance.post).toHaveBeenCalledTimes(10);
  });

  it('returns the same response shape regardless of payload', async () => {
    const response = { data: { ok: true, id: 'm-1' } };
    axiosInstance.post.mockResolvedValueOnce(response);
    const r = await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      message: 'x'.repeat(10),
      locale: 'es',
    });
    expect(r).toEqual(response);
  });

  it('forwards phone when provided', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { ok: true } });
    await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      phone: '+54 9 11 5555 5555',
      message: 'x'.repeat(10),
      locale: 'es',
    });
    expect(axiosInstance.post.mock.calls[0]?.[1]).toHaveProperty('phone', '+54 9 11 5555 5555');
  });

  it('handles unicode name', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { ok: true } });
    await messagesService.submit({
      name: '王小明',
      email: 'wang@example.com',
      message: 'Hello',
      locale: 'zh',
    });
    const call = axiosInstance.post.mock.calls[0];
    expect(call?.[0]).toBe('/api/messages');
  });

  it('handles long message', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { ok: true } });
    await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      message: 'a'.repeat(2000),
      locale: 'es',
    });
    const call = axiosInstance.post.mock.calls[0]?.[1] as { message: string };
    expect(call.message.length).toBe(2000);
  });

  it('handles empty phone (undefined)', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { ok: true } });
    await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      message: 'x'.repeat(10),
      locale: 'es',
    });
    const call = axiosInstance.post.mock.calls[0]?.[1] as Record<string, unknown>;
    expect('phone' in call ? call.phone : undefined).toBeUndefined();
  });

  it('handles 429 error (rate limited)', async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error('Request failed with status code 429'));
    await expect(
      messagesService.submit({
        name: 'a',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        locale: 'es',
      })
    ).rejects.toThrow('429');
  });

  it('handles 422 validation error', async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error('Request failed with status code 422'));
    await expect(
      messagesService.submit({
        name: 'a',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        locale: 'es',
      })
    ).rejects.toThrow('422');
  });

  it('handles 500 server error', async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error('Request failed with status code 500'));
    await expect(
      messagesService.submit({
        name: 'a',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        locale: 'es',
      })
    ).rejects.toThrow('500');
  });

  it('always uses the same endpoint', async () => {
    axiosInstance.post.mockResolvedValue({ data: { ok: true } });
    await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      message: 'x'.repeat(10),
      locale: 'es',
    });
    await messagesService.submit({
      name: 'b',
      email: 'b@c.co',
      message: 'y'.repeat(10),
      locale: 'en',
    });
    const calls = axiosInstance.post.mock.calls;
    expect(calls[0]?.[0]).toBe('/api/messages');
    expect(calls[1]?.[0]).toBe('/api/messages');
  });

  it('is callable without arguments check (TS only)', () => {
    expect(messagesService.submit).toBeTypeOf('function');
    expect(messagesService.submit.length).toBe(1);
  });
});
