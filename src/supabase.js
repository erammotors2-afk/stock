import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://enmpjgfbokkmtpuiwxuc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cnJbJ8ODF51PVbVvJCY0UQ_-2fwuUQm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);