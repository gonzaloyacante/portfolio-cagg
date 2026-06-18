import { beforeEach, describe, expect, it, vi } from 'vitest';

import axiosInstance from '@/lib/axios';
import { messagesService } from '@/services/messages-service';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(axiosInstance.post);

describe('messagesService.submit', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('posts to /api/messages with the payload', async () => {
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });
    const payload = {
      name: 'Carlos',
      email: 'carlos@example.com',
      phone: '+54 9 11 5555 5555',
      message: 'Hola',
      locale: 'es',
    };
    await messagesService.submit(payload);
    expect(mockedPost).toHaveBeenCalledWith('/api/messages', payload);
  });

  it('returns the axios response', async () => {
    const expected = { data: { ok: true } };
    mockedPost.mockResolvedValueOnce(expected);
    const result = await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      message: 'x'.repeat(10),
      locale: 'es',
    });
    expect(result).toBe(expected);
  });

  it('forwards errors from axios', async () => {
    const err = new Error('Network error');
    mockedPost.mockRejectedValueOnce(err);
    await expect(
      messagesService.submit({
        name: 'a',
        email: 'a@b.co',
        message: 'x'.repeat(10),
        locale: 'es',
      })
    ).rejects.toBe(err);
  });

  it('supports payload without phone (optional)', async () => {
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });
    await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      message: 'x'.repeat(10),
      locale: 'en',
    });
    const call = mockedPost.mock.calls[0];
    expect(call?.[1]).not.toHaveProperty('phone');
  });

  it.each(['es', 'en', 'pt', 'fr', ''])('forwards locale %s', async (locale) => {
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });
    await messagesService.submit({ name: 'a', email: 'a@b.co', message: 'x'.repeat(10), locale });
    const call = mockedPost.mock.calls[0] as unknown as [string, { locale: string }];
    expect(call?.[1]?.locale).toBe(locale);
  });

  it('does not transform the response', async () => {
    const expected = { data: { ok: false, extra: 'info' } };
    mockedPost.mockResolvedValueOnce(expected);
    const result = await messagesService.submit({
      name: 'a',
      email: 'a@b.co',
      message: 'x'.repeat(10),
      locale: 'es',
    });
    expect(result).toEqual(expected);
  });

  it('is callable multiple times without state leakage', async () => {
    mockedPost.mockResolvedValue({ data: { ok: true } });
    for (let i = 0; i < 5; i += 1) {
      await messagesService.submit({
        name: `u${i}`,
        email: 'a@b.co',
        message: 'x'.repeat(10),
        locale: 'es',
      });
    }
    expect(mockedPost).toHaveBeenCalledTimes(5);
  });
});
