import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://yfjmrubgilwlydaemtyr.supabase.co';
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmam1ydWJnaWx3bHlkYWVtdHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDIwODMsImV4cCI6MjA3MjU3ODA4M30.cNO4uVGE4R8sZCz01ElRuWvyg0qHmzOgL2wn2KHGUfo';

export const supabaseCredentialsProvided =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseKey !== 'placeholder.anon.key';

export const supabase = createClient(supabaseUrl, supabaseKey);
