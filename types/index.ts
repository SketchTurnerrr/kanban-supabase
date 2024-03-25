import { createClient } from '@/lib/supabase/server';
import { QueryData } from '@supabase/supabase-js';
import { Tables } from './supabase';

const supabase = createClient();

const data = supabase.from('boards').select(`*,columns(*, cards(*))`).single();
export type BoardWithColumnsAndCards = QueryData<typeof data>;
export type Card = Tables<'cards'>;
export type Column = Tables<'columns'>;
