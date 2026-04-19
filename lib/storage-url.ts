export function getStorageUrl(bucket: string, key: string | null | undefined): string | null {
  if (!key) return null;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  const safeKey = key.replace(/\.\.\//g, '').replace(/^\/+/, '');
  return `${url}/storage/v1/object/public/${bucket}/${safeKey}`;
}
