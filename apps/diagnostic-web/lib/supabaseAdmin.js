import { createClient } from '@supabase/supabase-js';

// Cliente administrativo com Service Role Key
// Usado APENAS em API Routes (server-side) para operações privilegiadas
// como enviar magic links e manipular auth.users

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY não configurada — funcionalidades admin desabilitadas.');
}

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
