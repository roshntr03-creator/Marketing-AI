import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these placeholder values with your actual Supabase project URL and anon key.
// You can find these in your Supabase project settings under "API".
// FIX: Explicitly type constants as string to avoid literal type comparison error.
const supabaseUrl: string = 'https://yfjmrubgilwlydaemtyr.supabase.co';
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmam1ydWJnaWx3bHlkYWVtdHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIwODMsImV4cCI6MjA3MjU3ODA4M30.cNO4uVGE4R8sZCz01ElRuWvyg0qHmzOgL2wn2KHGUfo';

// This flag allows the UI to show a warning if credentials are not set.
export const supabaseCredentialsProvided =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseKey !== 'placeholder.anon.key';

// Initialize the client. It will not throw an error on init, but API calls will fail
// if the credentials are still placeholders. This prevents the app from crashing.
export const supabase = createClient(supabaseUrl, supabaseKey);