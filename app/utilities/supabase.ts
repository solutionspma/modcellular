import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabaseUrl = 'https://cpgzsjqmkvhmshcvnyyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ3pzanFta3ZobXNoY3ZueXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTQ1NTIsImV4cCI6MjA3OTA3MDU1Mn0.YBFqK88HjWcrwYZII9NbZKiVMdYZU5DvA7R7Hm8fgKE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
