'use client';
import { BoardWithColumnsAndCards, Card } from '@/types';
import { CreateColumnDialog } from './CreateColumnDialog';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { ColumnItem } from './ColumnItem';
import { createClient } from '@/lib/supabase/client';
import { CardItem } from './CardItem';

interface BoardPropTypes {
  data: BoardWithColumnsAndCards;
  boardId: string;
}

export function Board({ data, boardId }: BoardPropTypes) {
  const [rtBoard, setRTBoard] = useState(data);

  const supabase = createClient();

  useEffect(() => {
    const boardInserts = supabase
      .channel('insert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        async () => {
          const { data } = await supabase
            .from('boards')
            .select(`*,columns(*, cards(*))`)
            .eq('id', boardId)
            .limit(1)
            .single();

          setRTBoard(data as BoardWithColumnsAndCards);
        }
      )
      .subscribe();

    const boardDeletes = supabase
      .channel('deletes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
        },
        async () => {
          const { data } = await supabase
            .from('boards')
            .select(`*,columns(*, cards(*))`)
            .eq('id', boardId)
            .limit(1)
            .single();

          setRTBoard(data as BoardWithColumnsAndCards);
        }
      )
      .subscribe();

    return () => {
      // Unsubscribe from real-time changes when component unmounts
      boardInserts.unsubscribe();
      boardDeletes.unsubscribe();
    };
  }, [rtBoard]);

  const allCards = rtBoard.columns.flatMap((column) => column.cards);

  const [cards, setCards] = useState(allCards);

  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  async function updateCardOrderInDB(cards: Card[]) {
    const updates = cards.map((card, index) => ({
      title: card.title,
      description: card.description,
      column: card.column,
      id: card.id,
      order: index,
    }));

    const { error } = await supabase.from('cards').upsert(updates);

    if (error) {
      console.error('Error updating card order:', error.message);
    }
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'card') {
      setActiveCard(event.active.data.current.card);
    }
  }

  // Card sorting within a column
  function onDragEnd(event: DragEndEvent) {
    setActiveCard(null);

    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setCards((cards) => {
        const activeColumnIndex = cards.findIndex((card) => {
          return card.id === active.id;
        });

        const overColumnIndex = cards.findIndex((card) => card.id === over.id);

        const updatedCards = arrayMove(
          cards,
          activeColumnIndex,
          overColumnIndex
        );
        updateCardOrderInDB(updatedCards);

        return updatedCards;
      });
    }
  }

  // Card sorting between columns
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const isActiveACard = active.data.current?.type === 'card';
    const isOverACard = over.data.current?.type === 'card';

    if (!isActiveACard) return;

    if (isActiveACard && isOverACard) {
      setCards((cards) => {
        const activeIndex = cards.findIndex((card) => card.id === active.id);
        const overIndex = cards.findIndex((card) => card.id === over.id);

        if (cards[activeIndex].column != cards[overIndex].column) {
          cards[activeIndex].column = cards[overIndex].column;
          const updatedCards = arrayMove(cards, activeIndex, overIndex - 1);
          updateCardOrderInDB(updatedCards);
          return updatedCards;
        }

        const updatedCards = arrayMove(cards, activeIndex, overIndex);
        updateCardOrderInDB(updatedCards);
        return updatedCards;
      });
    } else {
      // Handle dragging over an empty column
      setCards((cards) => {
        const activeIndex = cards.findIndex((card) => card.id === active.id);
        const overIndex = 0; // Place the card at the top of the column
        const updatedCards = arrayMove(cards, activeIndex, overIndex);
        updateCardOrderInDB(updatedCards);
        return updatedCards;
      });
    }
  }

  return (
    <div className="flex flex-col p-6">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold ">{rtBoard?.title}</h1>
        <CreateColumnDialog id={rtBoard.id} />
      </div>
      <div className="flex flex-wrap mt-4 gap-4 ">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          collisionDetection={closestCorners}
        >
          {rtBoard.columns.map((column) => (
            <ColumnItem
              key={column.id}
              column={column}
              cards={cards.filter((card) => card.column === column.id)}
            />
          ))}
          <DragOverlay>
            {activeCard ? (
              <CardItem
                id={activeCard.id}
                title={activeCard.title}
                description={activeCard.description}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
