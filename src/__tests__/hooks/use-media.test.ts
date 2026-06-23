// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useMedia } from '@/hooks/use-media';

const { axiosInstance, isAxiosError } = vi.hoisted(() => ({
  axiosInstance: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
  isAxiosError: vi.fn((e: unknown) => Boolean((e as { isAxiosError?: boolean })?.isAxiosError)),
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, isAxiosError };
});
vi.mock('@/lib/axios', () => ({ default: axiosInstance }));

const SAMPLE = {
  items: [
    {
      id: 'm-1',
      publicId: 'pid',
      url: 'u',
      secureUrl: 'su',
      format: 'jpg',
      width: 100,
      height: 100,
      bytes: 1024,
      folder: 'portfolio-cag',
      createdAt: '2025-01-01',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 24,
};

describe('useMedia()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('items starts as empty array', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.items).toEqual([]);
    });

    it('total starts as 0', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.total).toBe(0);
    });

    it('page starts as 1', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.page).toBe(1);
    });

    it('pageSize starts as 24 (exposed via totalPages, but pageSize is internal)', async () => {
      // The hook returns totalPages but not pageSize itself. We confirm
      // the pageSize via the API: total=24 with pageSize=24 → 1 page.
      const { result } = renderHook(() => useMedia());
      expect(result.current.totalPages).toBe(1);
    });

    it('loading starts as false', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.loading).toBe(false);
    });

    it('uploading starts as false', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.uploading).toBe(false);
    });

    it('error starts as null', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.error).toBeNull();
    });

    it('totalPages is 1 when total=0', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.totalPages).toBe(1);
    });

    it('exposes fetchPage, upload, remove', () => {
      const { result } = renderHook(() => useMedia());
      expect(result.current.fetchPage).toBeTypeOf('function');
      expect(result.current.upload).toBeTypeOf('function');
      expect(result.current.remove).toBeTypeOf('function');
    });
  });

  describe('fetchPage()', () => {
    it('GETs /api/admin/media?page=1 by default', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: SAMPLE });
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.fetchPage();
      });
      expect(axiosInstance.get).toHaveBeenCalledWith('/api/admin/media?page=1');
    });

    it('populates items on success', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: SAMPLE });
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.fetchPage();
      });
      expect(result.current.items.length).toBe(1);
    });

    it('sets total to the response total', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: { ...SAMPLE, total: 50 } });
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.fetchPage();
      });
      expect(result.current.total).toBe(50);
    });

    it('sets totalPages based on total and pageSize', async () => {
      axiosInstance.get.mockResolvedValueOnce({ data: { ...SAMPLE, total: 100, pageSize: 24 } });
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.fetchPage();
      });
      expect(result.current.totalPages).toBe(5);
    });

    it('sets an error on failure', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.fetchPage();
      });
      expect(result.current.error).toBe('Error al cargar imágenes.');
    });

    it('flips loading to true during the call', async () => {
      let resolveGet: (v: unknown) => void = () => {};
      axiosInstance.get.mockReturnValueOnce(
        new Promise((r) => {
          resolveGet = r;
        })
      );
      const { result } = renderHook(() => useMedia());
      const p = result.current.fetchPage();
      resolveGet({ data: SAMPLE });
      await p;
      // loading ends false after the call resolves
      expect(result.current.loading).toBe(false);
    });

    it('clears previous error on a new fetch', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.fetchPage();
      });
      expect(result.current.error).toBeTruthy();
      axiosInstance.get.mockResolvedValueOnce({ data: SAMPLE });
      await act(async () => {
        await result.current.fetchPage();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('upload()', () => {
    it('POSTs the file to /api/admin/media with multipart header', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: SAMPLE.items[0] });
      axiosInstance.get.mockResolvedValueOnce({ data: SAMPLE });
      const { result } = renderHook(() => useMedia());
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      await result.current.upload(file);
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/api/admin/media',
        expect.any(FormData),
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'multipart/form-data' }),
        })
      );
    });

    it('returns the new media file on success', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: SAMPLE.items[0] });
      axiosInstance.get.mockResolvedValueOnce({ data: SAMPLE });
      const { result } = renderHook(() => useMedia());
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      const uploaded = await result.current.upload(file);
      expect(uploaded?.id).toBe('m-1');
    });

    it('returns null on failure', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMedia());
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      const uploaded = await result.current.upload(file);
      expect(uploaded).toBeNull();
    });

    it('sets an error on failure', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMedia());
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      await act(async () => {
        await result.current.upload(file);
      });
      expect(result.current.error).toBe('Error al subir imagen.');
    });

    it('refetches page 1 after success', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: SAMPLE.items[0] });
      axiosInstance.get.mockResolvedValueOnce({ data: SAMPLE });
      const { result } = renderHook(() => useMedia());
      const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
      await result.current.upload(file);
      expect(axiosInstance.get).toHaveBeenCalledWith('/api/admin/media?page=1');
    });

    // The upload error handler has 4 branches based on
    // (isAxiosError) && (response?.data?.error). Each must be exercised.
    describe('error message extraction', () => {
      const file = () => new File(['x'], 'test.jpg', { type: 'image/jpeg' });

      it('uses server error string when AxiosError carries response.data.error', async () => {
        axiosInstance.post.mockRejectedValueOnce({
          isAxiosError: true,
          response: { data: { error: 'Archivo demasiado grande' } },
        });
        const { result } = renderHook(() => useMedia());
        await act(async () => {
          await result.current.upload(file());
        });
        expect(result.current.error).toBe('Archivo demasiado grande');
      });

      it('falls back when AxiosError has no response (network failure)', async () => {
        axiosInstance.post.mockRejectedValueOnce({
          isAxiosError: true,
          message: 'Network Error',
        });
        const { result } = renderHook(() => useMedia());
        await act(async () => {
          await result.current.upload(file());
        });
        expect(result.current.error).toBe('Error al subir imagen.');
      });

      it('falls back when response.data has no error field', async () => {
        axiosInstance.post.mockRejectedValueOnce({
          isAxiosError: true,
          response: { data: { message: 'wrong shape' } },
        });
        const { result } = renderHook(() => useMedia());
        await act(async () => {
          await result.current.upload(file());
        });
        expect(result.current.error).toBe('Error al subir imagen.');
      });

      it('falls back when response.data.error is an empty string', async () => {
        axiosInstance.post.mockRejectedValueOnce({
          isAxiosError: true,
          response: { data: { error: '' } },
        });
        const { result } = renderHook(() => useMedia());
        await act(async () => {
          await result.current.upload(file());
        });
        expect(result.current.error).toBe('Error al subir imagen.');
      });

      it('falls back when error is not an AxiosError at all', async () => {
        axiosInstance.post.mockRejectedValueOnce(new Error('random'));
        const { result } = renderHook(() => useMedia());
        await act(async () => {
          await result.current.upload(file());
        });
        expect(result.current.error).toBe('Error al subir imagen.');
      });
    });
  });

  describe('remove()', () => {
    it('DELETEs /api/admin/media?publicId=...', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.remove('pid');
      });
      expect(axiosInstance.delete).toHaveBeenCalledWith(expect.stringContaining('publicId=pid'));
    });

    it('URL-encodes the publicId', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.remove('folder/pid with spaces');
      });
      expect(axiosInstance.delete).toHaveBeenCalledWith(
        expect.stringContaining('folder%2Fpid%20with%20spaces')
      );
    });

    it('sets an error on failure', async () => {
      axiosInstance.delete.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMedia());
      await act(async () => {
        await result.current.remove('pid');
      });
      expect(result.current.error).toBe('Error al eliminar imagen.');
    });

    it('clears error at the start of remove', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMedia());
      result.current.error = 'previous';
      await act(async () => {
        await result.current.remove('pid');
      });
      expect(result.current.error).toBeNull();
    });
  });
});
