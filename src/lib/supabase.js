import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://fwzgvtralwreqwmotuzm.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3emd2dHJhbHdyZXF3bW90dXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTM4NzMsImV4cCI6MjA5MzYyOTg3M30.jlxhW8aUJ-G718K9WKKoppY7h6d8yp3ez0A0k3Rl3PQ'
)
