import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://enmpjgfbokkmtpuiwxuc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cnJbJ8ODF51PVbVvJCY0UQ_-2fwuUQm';

// 🛑 THE SILENCER: Hides this specific harmless Vite warning in the console
if (import.meta.env.DEV) {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (typeof args[0] === 'string' && args[0].includes('Multiple GoTrueClient instances detected')) {
            return; // Ignore this specific warning
        }
        originalWarn(...args); // Let all other warnings through
    };
}

// Standard, clean initialization
export const supabase = createClient(supabaseUrl, supabaseAnonKey);