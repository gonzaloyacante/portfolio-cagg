import { beforeEach, describe, expect, it, vi } from 'vitest';

import { revalidateLanding } from '@/lib/revalidate';

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }));

vi.mock('next/cache', () => ({
  revalidateTag,
}));

describe('revalidateLanding()', () => {
  beforeEach(() => {
    revalidateTag.mockClear();
  });

  it('calls revalidateTag with the "landing" tag', () => {
    revalidateLanding();
    expect(revalidateTag).toHaveBeenCalledWith('landing', { expire: 0 });
  });

  it('is idempotent and safe to call multiple times', () => {
    revalidateLanding();
    revalidateLanding();
    revalidateLanding();
    expect(revalidateTag).toHaveBeenCalledTimes(3);
  });

  it('always passes expire: 0 to invalidate immediately', () => {
    revalidateLanding();
    const call = revalidateTag.mock.calls[0];
    expect(call?.[1]).toEqual({ expire: 0 });
  });
});
