// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import { useCollection } from '@/hooks/use-collection';

const { axiosInstance, toast, routerRefresh } = vi.hoisted(() => ({
  axiosInstance: { post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  routerRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefresh, replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/axios', () => ({ default: axiosInstance }));
vi.mock('sonner', () => ({ toast }));

describe('useCollection()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('saving starts as false', () => {
      const { result } = renderHook(() => useCollection('brands'));
      expect(result.current.saving).toBe(false);
    });

    it('exposes create, update, remove, reorder', () => {
      const { result } = renderHook(() => useCollection('brands'));
      expect(result.current.create).toBeTypeOf('function');
      expect(result.current.update).toBeTypeOf('function');
      expect(result.current.remove).toBeTypeOf('function');
      expect(result.current.reorder).toBeTypeOf('function');
    });
  });

  describe('create()', () => {
    it('POSTs to /api/admin/{slug}', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.create({ name: 'Acme' });
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/admin/brands', { name: 'Acme' });
    });

    it('returns true on success', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.create({ name: 'X' });
      expect(ok).toBe(true);
    });

    it('returns false on error', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.create({ name: 'X' });
      expect(ok).toBe(false);
    });

    it('resets saving even on error', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.create({ name: 'X' });
      expect(result.current.saving).toBe(false);
    });

    it('shows success toast on success', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.create({ name: 'X' });
      expect(toast.success).toHaveBeenCalledWith('Creado correctamente');
    });

    it('shows error toast on failure', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.create({ name: 'X' });
      expect(toast.error).toHaveBeenCalledWith('No se pudo crear');
    });

    it('calls router.refresh() on success', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.create({ name: 'X' });
      expect(routerRefresh).toHaveBeenCalledOnce();
    });

    it('does not call router.refresh() on error', async () => {
      axiosInstance.post.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.create({ name: 'X' });
      expect(routerRefresh).not.toHaveBeenCalled();
    });

    it.each([
      'brands',
      'experience',
      'process',
      'services',
      'projects',
      'results',
      'testimonials',
      'timeline',
      'faqs',
    ])('POSTs to /api/admin/%s', async (slug) => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection(slug));
      await result.current.create({ name: 'x' });
      expect(axiosInstance.post).toHaveBeenCalledWith(`/api/admin/${slug}`, { name: 'x' });
    });

    it('passes through arbitrary payload fields', async () => {
      axiosInstance.post.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('projects'));
      const payload = { tag: 't', titleEs: 'A', titleEn: 'B', challengeEs: 'C', challengeEn: 'D' };
      await result.current.create(payload);
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/admin/projects', payload);
    });
  });

  describe('update()', () => {
    it('PUTs to /api/admin/{slug}/{id}', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.update('b1', { name: 'Updated' });
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/admin/brands/b1', { name: 'Updated' });
    });

    it('returns true on success', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.update('b1', { name: 'X' });
      expect(ok).toBe(true);
    });

    it('returns false on error', async () => {
      axiosInstance.put.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.update('b1', { name: 'X' });
      expect(ok).toBe(false);
    });

    it('shows success toast on success', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.update('b1', { name: 'X' });
      expect(toast.success).toHaveBeenCalledWith('Guardado correctamente');
    });

    it('shows error toast on error', async () => {
      axiosInstance.put.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.update('b1', { name: 'X' });
      expect(toast.error).toHaveBeenCalledWith('No se pudo guardar');
    });

    it('resets saving even on error', async () => {
      axiosInstance.put.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.update('b1', { name: 'X' });
      expect(result.current.saving).toBe(false);
    });

    it('calls router.refresh() on success', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.update('b1', { name: 'X' });
      expect(routerRefresh).toHaveBeenCalledOnce();
    });

    it.each([
      'brands',
      'experience',
      'process',
      'services',
      'projects',
      'results',
      'testimonials',
      'timeline',
      'faqs',
    ])('PUTs to /api/admin/%s/:id', async (slug) => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection(slug));
      await result.current.update('id-123', { name: 'x' });
      expect(axiosInstance.put).toHaveBeenCalledWith(`/api/admin/${slug}/id-123`, { name: 'x' });
    });
  });

  describe('remove()', () => {
    it('DELETEs /api/admin/{slug}/{id}', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.remove('b1');
      expect(axiosInstance.delete).toHaveBeenCalledWith('/api/admin/brands/b1');
    });

    it('returns true on success', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.remove('b1');
      expect(ok).toBe(true);
    });

    it('returns false on error', async () => {
      axiosInstance.delete.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.remove('b1');
      expect(ok).toBe(false);
    });

    it('shows success toast on success', async () => {
      axiosInstance.delete.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.remove('b1');
      expect(toast.success).toHaveBeenCalledWith('Eliminado');
    });

    it('shows error toast on error', async () => {
      axiosInstance.delete.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.remove('b1');
      expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar');
    });
  });

  describe('reorder()', () => {
    it('PUTs to /api/admin/reorder/{slug} with ids array', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.reorder(['a', 'b', 'c']);
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/admin/reorder/brands', {
        ids: ['a', 'b', 'c'],
      });
    });

    it('returns true on success', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.reorder(['a']);
      expect(ok).toBe(true);
    });

    it('returns false on error', async () => {
      axiosInstance.put.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      const ok = await result.current.reorder(['a']);
      expect(ok).toBe(false);
    });

    it('shows success toast with description on success', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.reorder(['a']);
      expect(toast.success).toHaveBeenCalledWith('Orden guardado', {
        description: 'El nuevo orden ya se ve en la landing.',
      });
    });

    it('shows error toast on error', async () => {
      axiosInstance.put.mockRejectedValueOnce(new Error('boom'));
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.reorder(['a']);
      expect(toast.error).toHaveBeenCalledWith('No se pudo reordenar');
    });

    it('handles empty ids array', async () => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection('brands'));
      await result.current.reorder([]);
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/admin/reorder/brands', { ids: [] });
    });

    it.each([
      'brands',
      'experience',
      'process',
      'services',
      'projects',
      'results',
      'testimonials',
      'timeline',
      'faqs',
    ])('PUTs to /api/admin/reorder/%s', async (slug) => {
      axiosInstance.put.mockResolvedValueOnce({ data: {} });
      const { result } = renderHook(() => useCollection(slug));
      await result.current.reorder(['x']);
      expect(axiosInstance.put).toHaveBeenCalledWith(`/api/admin/reorder/${slug}`, { ids: ['x'] });
    });
  });
});
