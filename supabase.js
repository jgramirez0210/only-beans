// Replace these two values with your Supabase project credentials.
// Find them at: https://app.supabase.com → your project → Settings → API
const SUPABASE_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';

(function () {
  const { createClient } = window.supabase;
  window.supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  window.currentUser = null;
})();
