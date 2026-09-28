import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Obtém valores do ambiente ou localStorage (para testes fáceis na UI)
const getEnvOrStorage = (key: string, envVar: string | undefined): string => {
  return localStorage.getItem(key) || envVar || '';
};

export const getSupabaseConfig = () => {
  const url = getEnvOrStorage('SUPABASE_CUSTOM_URL', import.meta.env.VITE_SUPABASE_URL);
  const anonKey = getEnvOrStorage('SUPABASE_CUSTOM_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY);
  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

let cachedClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  try {
    if (!cachedClient) {
      cachedClient = createClient(url, anonKey);
    }
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar cliente Supabase:', err);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('SUPABASE_CUSTOM_URL', url.trim());
  localStorage.setItem('SUPABASE_CUSTOM_KEY', key.trim());
  cachedClient = null;
};

export const resetSupabaseConfig = () => {
  localStorage.removeItem('SUPABASE_CUSTOM_URL');
  localStorage.removeItem('SUPABASE_CUSTOM_KEY');
  cachedClient = null;
};
