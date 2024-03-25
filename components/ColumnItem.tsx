'use client';
import React, { useMemo } from 'react';
import { CardItem } from './CardItem';
import { CreateCardDialog } from './CreateCardDialog';
import { Card, Column } from '@/types';
import { SortableContext } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  column: Column;
  cards: Card[];
}

export function ColumnItem({ column, cards }: Props) {
  const cardIds = useMemo(() => {
    return cards.map((card) => card.id);
  }, [cards]);

  const supabase = createClient();

  async function deleteColumn(id: number) {
    await supabase.from('columns').delete().eq('id', id);
  }

  return (
    <div className="min-w-[375px] w-[375px] bg-slate-50 p-4">
      <div className="flex justify-between">
        <div className="text-2xl font-bold">{column.title}</div>
        <Button
          variant={'ghost'}
          className="hover:bg-slate-200"
          onClick={() => deleteColumn(column.id)}
        >
          <Trash />
        </Button>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <CreateCardDialog columnId={column.id} />
        <SortableContext items={cardIds}>
          {cards.map((card) => (
            <CardItem
              key={card.id}
              title={card.title}
              description={card.description}
              id={card.id}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
