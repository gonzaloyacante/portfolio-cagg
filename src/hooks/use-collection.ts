import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { toast } from 'sonner';

import axiosInstance from '@/lib/axios';

export type CollectionItem = Record<string, unknown> & { id: string; _summary: string };

export function useCollection(slug: string) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const create = async (data: Record<string, unknown>): Promise<boolean> => {
    setSaving(true);
    try {
      await axiosInstance.post(`/api/admin/${slug}`, data);
      router.refresh();
      toast.success('Creado correctamente');
      return true;
    } catch {
      toast.error('No se pudo crear');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, data: Record<string, unknown>): Promise<boolean> => {
    setSaving(true);
    try {
      await axiosInstance.put(`/api/admin/${slug}/${id}`, data);
      router.refresh();
      toast.success('Guardado correctamente');
      return true;
    } catch {
      toast.error('No se pudo guardar');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    setSaving(true);
    try {
      await axiosInstance.delete(`/api/admin/${slug}/${id}`);
      router.refresh();
      toast.success('Eliminado');
      return true;
    } catch {
      toast.error('No se pudo eliminar');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (ids: string[]): Promise<boolean> => {
    setSaving(true);
    try {
      await axiosInstance.put(`/api/admin/reorder/${slug}`, { ids });
      router.refresh();
      toast.success('Orden guardado', { description: 'El nuevo orden ya se ve en la landing.' });
      return true;
    } catch {
      toast.error('No se pudo reordenar');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { saving, create, update, remove, reorder };
}
