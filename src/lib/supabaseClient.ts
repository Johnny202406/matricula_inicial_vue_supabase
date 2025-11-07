import type { Database } from '@/database/types'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://svxbwpqoprcsujqfautc.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eGJ3cHFvcHJjc3VqcWZhdXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDU3NTEsImV4cCI6MjA3NjgyMTc1MX0.Qiokmuufxc2ZdYCjf_V7f3COdFweePWEusJPUnCxV7U"
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

