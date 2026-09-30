import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Chaves padrão do projeto fornecido
export const DEFAULT_SUPABASE_URL = 'https://ocnojaerwfjpozvzwfxo.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_3dhrzPtrb-23M419wijm-A_LbJX5wGP';

// Obtém valores do ambiente ou localStorage (para testes fáceis na UI) ou default oficial
const getEnvOrStorage = (key: string, envVar: string | undefined, defaultVal: string): string => {
  return localStorage.getItem(key) || envVar || defaultVal;
};

export const getSupabaseConfig = () => {
  const url = getEnvOrStorage('SUPABASE_CUSTOM_URL', import.meta.env.VITE_SUPABASE_URL, DEFAULT_SUPABASE_URL);
  const anonKey = getEnvOrStorage('SUPABASE_CUSTOM_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_KEY);
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
