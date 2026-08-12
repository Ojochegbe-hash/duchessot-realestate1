import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jchhlbwqtgloerkdfiiy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaGhsYndxdGdsb2Vya2RmaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTUyMzQsImV4cCI6MjEwMTA5MTIzNH0.GrBo8FtEeJF17WMPxDnvvO0S-eXQ6GPy4dzbimQJHug'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
