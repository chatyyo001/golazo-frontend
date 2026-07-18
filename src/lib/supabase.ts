import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_PLATFORM_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error('Faltan las variables públicas de Supabase Platform');
}

export const supabase = createClient(url, publishableKey);

export async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
