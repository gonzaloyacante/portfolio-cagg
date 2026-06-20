import axios, { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import axiosInstance from '@/lib/axios';

const { useMock, isAxiosErrorMock } = vi.hoisted(() => ({
  useMock: vi.fn(),
  isAxiosErrorMock: vi.fn((e: unknown): e is AxiosError => axios.isAxiosError(e)),
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  const interceptors = {
    response: { use: useMock },
  };
  const create = vi.fn(() => ({ interceptors, default: {} }));
  return {
    ...actual,
    default: { ...actual.default, create, isAxiosError: isAxiosErrorMock },
    create,
    isAxiosError: isAxiosErrorMock,
  };
});

describe('axios instance', () => {
  it('is created with a baseURL', () => {
    expect(axios.create).toHaveBeenCalled();
    const config = vi.mocked(axios.create).mock.calls[0]?.[0];
    expect(config?.baseURL).toBeDefined();
  });

  it('falls back to localhost when NEXT_PUBLIC_APP_URL is unset', () => {
    const config = vi.mocked(axios.create).mock.calls[0]?.[0];
    expect(config?.baseURL).toMatch(/localhost|portfolio-cag\.app/);
  });

  it('registers a response interceptor', () => {
    expect(useMock).toHaveBeenCalled();
  });

  it('exposes the same instance across imports', async () => {
    const second = (await import('@/lib/axios')).default;
    expect(second).toBe(axiosInstance);
  });
});

describe('response interceptor', () => {
  it('passes through a successful response', () => {
    const success = useMock.mock.calls[0]?.[0];
    expect(success).toBeTypeOf('function');
    const response = { data: 'ok', status: 200 };
    expect(success?.(response)).toBe(response);
  });

  it('rejects with the original error when it is an AxiosError with a response', async () => {
    const failure = useMock.mock.calls[0]?.[1];
    expect(failure).toBeTypeOf('function');
    const axiosError = {
      isAxiosError: true,
      response: { status: 500, data: 'oops' },
      message: 'Request failed',
    };
    isAxiosErrorMock.mockReturnValueOnce(true);
    await expect(failure?.(axiosError)).rejects.toEqual(axiosError);
  });

  it('rejects with a generic "Network error" for non-axios errors', async () => {
    const failure = useMock.mock.calls[0]?.[1];
    isAxiosErrorMock.mockReturnValueOnce(false);
    await expect(failure?.(new Error('boom'))).rejects.toThrow('Network error');
  });

  it('rejects with "Network error" for axios errors without a response', async () => {
    const failure = useMock.mock.calls[0]?.[1];
    const noResponseError = { isAxiosError: true, response: undefined, message: 'no response' };
    isAxiosErrorMock.mockReturnValueOnce(true);
    await expect(failure?.(noResponseError)).rejects.toThrow('Network error');
  });
});
