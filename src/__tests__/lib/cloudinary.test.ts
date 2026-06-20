import { beforeEach, describe, expect, it, vi } from 'vitest';

const configSpy = vi.fn();
vi.mock('cloudinary', () => ({
  v2: {
    config: configSpy,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('lib/cloudinary.ts', () => {
  it('calls cloudinary.config with the env vars', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';
    await import('@/lib/cloudinary');
    expect(configSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        cloud_name: 'test-cloud',
        api_key: 'test-key',
        api_secret: 'test-secret',
      })
    );
  });

  it('always uses secure: true (HTTPS URLs only)', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'c';
    process.env.CLOUDINARY_API_KEY = 'k';
    process.env.CLOUDINARY_API_SECRET = 's';
    await import('@/lib/cloudinary');
    const call = configSpy.mock.calls[0]?.[0] as { secure?: boolean };
    expect(call?.secure).toBe(true);
  });

  it('does not pass insecure: true', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'c';
    process.env.CLOUDINARY_API_KEY = 'k';
    process.env.CLOUDINARY_API_SECRET = 's';
    await import('@/lib/cloudinary');
    const call = configSpy.mock.calls[0]?.[0] as { insecure?: boolean };
    expect(call?.insecure).toBeUndefined();
  });

  it('passes cloud_name, api_key, api_secret in plain text (SDK expects this)', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'my-cloud';
    process.env.CLOUDINARY_API_KEY = '12345';
    process.env.CLOUDINARY_API_SECRET = 'secret';
    await import('@/lib/cloudinary');
    const call = configSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(call?.cloud_name).toBe('my-cloud');
    expect(call?.api_key).toBe('12345');
    expect(call?.api_secret).toBe('secret');
  });

  it('passes undefined when env vars are missing (will fail at request time)', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    await import('@/lib/cloudinary');
    const call = configSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(call?.cloud_name).toBeUndefined();
    expect(call?.api_key).toBeUndefined();
    expect(call?.api_secret).toBeUndefined();
  });

  it('exports the cloudinary v2 instance', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'c';
    process.env.CLOUDINARY_API_KEY = 'k';
    process.env.CLOUDINARY_API_SECRET = 's';
    const mod = await import('@/lib/cloudinary');
    expect(mod.cloudinary).toBeDefined();
  });
});
