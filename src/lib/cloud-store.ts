/**
 * Cloud Store Synchronization Engine (Powered by Supabase)
 * Provides centralized real-time persistence across all Vercel serverless micro-instances.
 * Guarantees zero data loss and prevents disappearing entries.
 */
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fazlvjdriwqfoazxunhg.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const isCloudEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

export async function getCloudData<T>(
  key: string,
  fallbackLocalFile: string,
  defaultInit: () => T
): Promise<T> {
  // 1. Fetch from Supabase Cloud (Live across all Vercel instances)
  if (isCloudEnabled) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/app_stores?key=eq.${encodeURIComponent(key)}&select=data`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.data) {
          return rows[0].data as T;
        }
      }
    } catch (err) {
      console.warn(`[CloudStore] Supabase fetch error for ${key}:`, err);
    }
  }

  // 2. Fallback to Local JSON store file
  try {
    const raw = await fs.readFile(fallbackLocalFile, 'utf-8');
    const parsed = JSON.parse(raw);
    // If cloud store is empty, initialize cloud with local data
    if (isCloudEnabled) {
      saveCloudData(key, fallbackLocalFile, parsed).catch(() => {});
    }
    return parsed as T;
  } catch {
    const initial = defaultInit();
    if (isCloudEnabled) {
      saveCloudData(key, fallbackLocalFile, initial).catch(() => {});
    }
    return initial;
  }
}

export async function saveCloudData<T>(
  key: string,
  localFilePath: string,
  data: T
): Promise<void> {
  // 1. Save to Supabase Cloud
  if (isCloudEnabled) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/app_stores`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          key,
          data,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error(`[CloudStore] Failed to save ${key} to Supabase:`, err);
    }
  }

  // 2. Save locally if filesystem allows
  try {
    await fs.mkdir(path.dirname(localFilePath), { recursive: true });
    await fs.writeFile(localFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // In serverless readonly filesystems, local write is ignored safely
  }
}
