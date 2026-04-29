import { getSupabaseConfig } from './supabase';
import { getStorageUrl } from './storage';

describe('getSupabaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws when env vars are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getSupabaseConfig()).toThrow('Missing Supabase environment variables');
  });

  it('returns config when env vars are set', () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    const config = getSupabaseConfig();
    expect(config.url).toBe('https://test.supabase.co');
    expect(config.key).toBe('test-key');
  });
});

describe('getStorageUrl', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
  });

  it('returns null for empty key', () => {
    expect(getStorageUrl('campaigns', null)).toBeNull();
    expect(getStorageUrl('campaigns', '')).toBeNull();
  });

  it('builds correct campaign image URL', () => {
    const url = getStorageUrl('campaigns', 'my-image.jpg');
    expect(url).toBe(
      'https://test.supabase.co/storage/v1/object/public/camp-man-files/cover-images/campaigns/my-image.jpg',
    );
  });

  it('does not double-prefix campaign images', () => {
    const url = getStorageUrl('campaigns', 'cover-images/campaigns/my-image.jpg');
    expect(url).toContain('/cover-images/campaigns/my-image.jpg');
    expect(url).not.toContain('/cover-images/campaigns/cover-images/campaigns/');
  });

  it('builds generic bucket URL', () => {
    const url = getStorageUrl('profile-photos', 'user123/photo.png');
    expect(url).toBe(
      'https://test.supabase.co/storage/v1/object/public/profile-photos/user123/photo.png',
    );
  });
});
