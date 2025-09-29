import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alodcjpejxmexyawccpf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsb2RjanBlanhtZXh5YXdjY3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MTk5MDksImV4cCI6MjA3NDM5NTkwOX0.Br0kCjhqNzKfDt-bDkS6L25KgQlgra8F7wDOQPuav7U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
