import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../../types/supabase';

export const createClient = () =>
  createBrowserClient<Database>(
    'https://giwjjkxqwklczyuzdbmt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpd2pqa3hxd2tsY3p5dXpkYm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwNDY0MjQsImV4cCI6MjAyNjYyMjQyNH0.39Eoy-ySxtLpzdqEDxWRiRwhkiiFwXRf5pvRM1c_AHE'
  );
