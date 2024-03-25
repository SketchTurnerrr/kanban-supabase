import { Board } from '@/components/Board';
import { createClient } from '@/lib/supabase/server';

interface BoardPageProps {
  params: { id: string };
}

export default async function Page({ params }: BoardPageProps) {
  const supabase = createClient();

  const { data } = await supabase
    .from('boards')
    .select(`*,columns(*, cards(*))`)
    .eq('id', params.id)
    .limit(1)
    .single();

  if (!data) {
    return null;
  }

  return <Board data={data} boardId={params.id} />;
}
