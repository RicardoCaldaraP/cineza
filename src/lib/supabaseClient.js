
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grzigmfbwdexeztimhgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyemlnbWZid2RleGV6dGltaGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NjM1MTcsImV4cCI6MjA2MjEzOTUxN30.mucdIULPtwM3AudPCLftOn0TyrxB_zPCHgQnqjpQd3Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
