export function getStorageUrl(bucket: string, key: string | null | undefined): string | null {
  if (!key) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return `${url}/storage/v1/object/public/${bucket}/${key}`;
}
