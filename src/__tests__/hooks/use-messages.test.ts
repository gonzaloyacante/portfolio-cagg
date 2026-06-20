// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useMessages } from '@/hooks/use-messages';

const { axiosInstance, routerRefresh } = vi.hoisted(() => ({
  axiosInstance: { patch: vi.fn(), delete: vi.fn() },
  routerRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefresh, replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/axios', () => ({ default: axiosInstance }));

describe('useMessages()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('pending starts as null', () => {
      const { result } = renderHook(() => useMessages());
      expect(result.current.pending).toBeNull();
    });

    it('exposes markRead and remove', () => {
      const { result } = renderHook(() => useMessages());
      expect(result.current.markRead).toBeTypeOf('function');
      expect(result.current.remove).toBeTypeOf('function');
    });
  });

  describe('markRead()', () => {
    it('PATCHes /api/admin/messages/{id} with read', async () => {
      axiosInstance.patch.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      await result.current.markRead('m-1', true);
      expect(axiosInstance.patch).toHaveBeenCalledWith('/api/admin/messages/m-1', { read: true });
    });

    it('returns true on success', async () => {
      axiosInstance.patch.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      const ok = await result.current.markRead('m-1', false);
      expect(ok).toBe(true);
    });

    it('returns false on error', async () => {
      axiosInstance.patch.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMessages());
      const ok = await result.current.markRead('m-1', true);
      expect(ok).toBe(false);
    });

    it('calls router.refresh() on success', async () => {
      axiosInstance.patch.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      await result.current.markRead('m-1', true);
      expect(routerRefresh).toHaveBeenCalledOnce();
    });

    it('does not call router.refresh() on error', async () => {
      axiosInstance.patch.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMessages());
      await result.current.markRead('m-1', true);
      expect(routerRefresh).not.toHaveBeenCalled();
    });

    it('clears pending to null after success', async () => {
      axiosInstance.patch.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      await result.current.markRead('m-1', true);
      expect(result.current.pending).toBeNull();
    });

    it('clears pending to null after error', async () => {
      axiosInstance.patch.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMessages());
      await result.current.markRead('m-1', true);
      expect(result.current.pending).toBeNull();
    });

    it('handles mark-as-unread (read=false)', async () => {
      axiosInstance.patch.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      await result.current.markRead('m-1', false);
      expect(axiosInstance.patch).toHaveBeenCalledWith('/api/admin/messages/m-1', { read: false });
    });
  });

  describe('remove()', () => {
    it('DELETEs /api/admin/messages/{id}', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      await result.current.remove('m-1');
      expect(axiosInstance.delete).toHaveBeenCalledWith('/api/admin/messages/m-1');
    });

    it('returns true on success', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      const ok = await result.current.remove('m-1');
      expect(ok).toBe(true);
    });

    it('returns false on error', async () => {
      axiosInstance.delete.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMessages());
      const ok = await result.current.remove('m-1');
      expect(ok).toBe(false);
    });

    it('calls router.refresh() on success', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      await result.current.remove('m-1');
      expect(routerRefresh).toHaveBeenCalledOnce();
    });

    it('does not call router.refresh() on error', async () => {
      axiosInstance.delete.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useMessages());
      await result.current.remove('m-1');
      expect(routerRefresh).not.toHaveBeenCalled();
    });

    it('clears pending to null after success', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useMessages());
      await result.current.remove('m-1');
      expect(result.current.pending).toBeNull();
    });
  });
});
