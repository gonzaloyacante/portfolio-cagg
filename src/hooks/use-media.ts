import { useCallback, useState } from 'react';

import { isAxiosError } from 'axios';

import axiosInstance from '@/lib/axios';

export type MediaFile = {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  folder: string;
  createdAt: string;
};

type MediaPage = {
  items: MediaFile[];
  total: number;
  page: number;
  pageSize: number;
};

export function useMedia() {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get<MediaPage>(`/api/admin/media?page=${p}`);
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } catch {
      setError('Error al cargar imágenes.');
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = useCallback(
    async (file: File): Promise<MediaFile | null> => {
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axiosInstance.post<MediaFile>('/api/admin/media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await fetchPage(1);
        return data;
      } catch (err: unknown) {
        const msg =
          isAxiosError(err) && err.response?.data?.error
            ? String(err.response.data.error)
            : 'Error al subir imagen.';
        setError(msg);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [fetchPage]
  );

  const remove = useCallback(async (publicId: string) => {
    setError(null);
    try {
      await axiosInstance.delete(`/api/admin/media?publicId=${encodeURIComponent(publicId)}`);
      setItems((prev) => prev.filter((m) => m.publicId !== publicId));
      setTotal((t) => t - 1);
    } catch {
      setError('Error al eliminar imagen.');
    }
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { items, total, page, totalPages, loading, uploading, error, fetchPage, upload, remove };
}
