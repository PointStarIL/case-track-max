
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ohbfivupwnrhkfyaleqa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oYmZpdnVwd25yaGtmeWFsZXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDk2ODgsImV4cCI6MjA1ODM4NTY4OH0.us_7Y_lxCEWQ_iz9SLp1yPwc-WjiDFsnvHIORc7kxe4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
