// src/types/global.d.ts

// 1. Beri tahu TypeScript tentang environment Vite
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 2. Jika Acode masih gagal baca node_modules, paksa izinkan import supabase
declare module '@supabase/supabase-js';
