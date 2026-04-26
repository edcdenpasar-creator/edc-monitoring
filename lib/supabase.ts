import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nfzlfdgbolfgtbrzpdcc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5memxmZGdib2xmZ3RicnpwZGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjU5MzIsImV4cCI6MjA5MjcwMTkzMn0.yfVIs3muo7UkTPSjtlVTdSTKze5xDITZFnGVcXXy2O0'

export const supabase = createClient(supabaseUrl, supabaseKey)