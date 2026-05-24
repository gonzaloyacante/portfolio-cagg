import { revalidateTag } from 'next/cache';

export function revalidateLanding() {
  revalidateTag('landing', { expire: 0 });
}
