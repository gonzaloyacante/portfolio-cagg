// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@testing-library/react';

import { useSecurity } from '@/hooks/use-security';

const { authClient, routerRefresh } = vi.hoisted(() => ({
  authClient: {
    twoFactor: { enable: vi.fn(), disable: vi.fn(), verifyTotp: vi.fn() },
  },
  routerRefresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: routerRefresh, replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/auth-client', () => ({ authClient }));

describe('useSecurity()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns enabled reflecting initialEnabled=true', () => {
      const { result } = renderHook(() => useSecurity(true));
      expect(result.current.enabled).toBe(true);
    });

    it('returns enabled reflecting initialEnabled=false', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.enabled).toBe(false);
    });

    it('starts in step=idle', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.step).toBe('idle');
    });

    it('loading starts as false', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.loading).toBe(false);
    });

    it('totpSetup starts as null', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.totpSetup).toBeNull();
    });

    it('exposes enableForm, verifyForm, disableForm', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.enableForm).toBeDefined();
      expect(result.current.verifyForm).toBeDefined();
      expect(result.current.disableForm).toBeDefined();
    });

    it('exposes startEnable, startDisable, cancel', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.startEnable).toBeTypeOf('function');
      expect(result.current.startDisable).toBeTypeOf('function');
      expect(result.current.cancel).toBeTypeOf('function');
    });

    it('exposes submitEnable, submitVerify, submitDisable', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.submitEnable).toBeTypeOf('function');
      expect(result.current.submitVerify).toBeTypeOf('function');
      expect(result.current.submitDisable).toBeTypeOf('function');
    });

    it('exposes acknowledgeBackupCodes', () => {
      const { result } = renderHook(() => useSecurity(false));
      expect(result.current.acknowledgeBackupCodes).toBeTypeOf('function');
    });
  });

  describe('acknowledgeBackupCodes()', () => {
    it('returns step to idle when called from a non-idle step', () => {
      const { result, rerender } = renderHook(() => useSecurity(false));
      act(() => {
        result.current.startEnable();
      });
      rerender();
      expect(result.current.step).toBe('enabling');

      act(() => {
        result.current.acknowledgeBackupCodes();
      });
      rerender();

      expect(result.current.step).toBe('idle');
    });

    it('clears totpSetup when called from a non-idle step', () => {
      const { result, rerender } = renderHook(() => useSecurity(false));
      act(() => {
        result.current.startEnable();
      });
      rerender();

      act(() => {
        result.current.acknowledgeBackupCodes();
      });
      rerender();

      expect(result.current.totpSetup).toBeNull();
    });

    it('is safe to call when already idle (idempotent)', () => {
      const { result, rerender } = renderHook(() => useSecurity(false));
      expect(result.current.step).toBe('idle');
      expect(result.current.totpSetup).toBeNull();

      act(() => {
        result.current.acknowledgeBackupCodes();
      });
      rerender();

      expect(result.current.step).toBe('idle');
      expect(result.current.totpSetup).toBeNull();
    });

    it('flips step back to idle when called from disabling', () => {
      const { result, rerender } = renderHook(() => useSecurity(true));
      act(() => {
        result.current.startDisable();
      });
      rerender();
      expect(result.current.step).toBe('disabling');

      act(() => {
        result.current.acknowledgeBackupCodes();
      });
      rerender();

      expect(result.current.step).toBe('idle');
    });
  });

  describe('startEnable()', () => {
    it('flips step to enabling', () => {
      const { result, rerender } = renderHook(() => useSecurity(false));
      act(() => {
        result.current.startEnable();
      });
      rerender();
      expect(result.current.step).toBe('enabling');
    });

    it('resets enableForm', () => {
      const { result, rerender } = renderHook(() => useSecurity(false));
      const resetSpy = vi.spyOn(result.current.enableForm, 'reset');
      act(() => {
        result.current.startEnable();
      });
      rerender();
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('startDisable()', () => {
    it('flips step to disabling', () => {
      const { result, rerender } = renderHook(() => useSecurity(true));
      act(() => {
        result.current.startDisable();
      });
      rerender();
      expect(result.current.step).toBe('disabling');
    });
  });

  describe('cancel()', () => {
    it('flips step back to idle', () => {
      const { result, rerender } = renderHook(() => useSecurity(false));
      act(() => {
        result.current.startEnable();
      });
      rerender();
      act(() => {
        result.current.cancel();
      });
      rerender();
      expect(result.current.step).toBe('idle');
    });

    it('clears totpSetup', () => {
      const { result, rerender } = renderHook(() => useSecurity(false));
      act(() => {
        result.current.cancel();
      });
      rerender();
      expect(result.current.totpSetup).toBeNull();
    });
  });
});
