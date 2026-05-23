import { useRouter } from 'next/navigation';
import { useState } from 'react';

import axiosInstance from '@/lib/axios';

export function useMessages() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const markRead = async (id: string, read: boolean): Promise<boolean> => {
    setPending(id);
    try {
      await axiosInstance.patch(`/api/admin/messages/${id}`, { read });
      router.refresh();
      return true;
    } catch {
      return false;
    } finally {
      setPending(null);
    }
  };

  const remove = async (id: string): Promise<boolean> => {
    setPending(id);
    try {
      await axiosInstance.delete(`/api/admin/messages/${id}`);
      router.refresh();
      return true;
    } catch {
      return false;
    } finally {
      setPending(null);
    }
  };

  return { pending, markRead, remove };
}
