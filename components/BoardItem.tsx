import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Column } from '@/types';

interface PageProps {
  id: string;
  title: string;
  description: string | null;
  columns: Column[];
}

export function BoardItem({ id, title, description, columns }: PageProps) {
  const cardCount = columns.reduce(
    //@ts-ignore
    (acc, column) => acc + column.cards.length,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <ListIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">
            {cardCount} tasks
          </span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/board/${id}`}>View</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
