'use client';
import { createClient } from '@/lib/supabase/client';
import { Suspense, useEffect, useState } from 'react';
import { BoardWithColumnsAndCards } from '@/types';
import { BoardSkeleton } from '@/components/BoardSkeleton';
import { BoardItem } from '@/components/BoardItem';
import { CreateBoardDialog } from '@/components/CreateBoardDialog';

export default function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const supabase = createClient();

  const [boards, setBoards] = useState<BoardWithColumnsAndCards[] | null>([]);

  useEffect(() => {
    async function getBoards() {
      try {
        const { data } = await supabase
          .from('boards')
          .select(`*,columns(*, cards(*))`)
          .textSearch('title', query, {
            type: 'websearch',
            config: 'english',
          });
        setBoards(data);
      } catch (error) {
        console.log('error :', error);
      }
    }

    getBoards();
  }, [supabase, query]);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <main>
        <Suspense key={query} fallback={<BoardSkeleton />}></Suspense>
        <div className="container grid items-start gap-6 px-4 py-6 lg:grid-cols-2 lg:gap-10 lg:px-6 lg:py-10">
          {boards?.map((board) => (
            <BoardItem
              id={board.id}
              title={board.title}
              description={board.description}
              key={board.id}
              columns={board.columns}
            />
          ))}
        </div>
        {!query && boards && boards.length === 0 && (
          <div className="bg-gray-50/70 w-full py-12">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 md:gap-8 lg:gap-10">
                <div className="flex justify-evenly space-y-2">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                      Your tasks, your way
                    </h1>
                    <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                      Manage your work with the flexibility of the Kanban
                      method. Move tasks across columns to reflect their status,
                      and customize your boards to match your workflow.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">
                      Get started by creating a board
                    </h2>
                    <CreateBoardDialog />
                    <div className="self-end"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {query && boards?.length === 0 && (
          <div className="flex justify-center items-center">
            <h2 className="font-bold text-2xl">
              Nothing was found, try a different search
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}
