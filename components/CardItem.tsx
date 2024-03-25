import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { CheckIcon, EditIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UniqueIdentifier } from '@dnd-kit/core';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Card title must be at least 1 character.',
  }),
  description: z.string(),
});

interface Props {
  id: UniqueIdentifier;
  title: string;
  description: string | null;
}

export function CardItem({ description, title, id }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
    transition,
  } = useSortable({
    id: id,
    data: {
      type: 'card',
      card: {
        id,
        title,
        description,
      },
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const [isEditing, setIsEditing] = useState(false);

  const supabase = createClient();
  const { refresh } = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: title,
      description: description ? description : '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (
      (isEditing && values.title !== title) ||
      description !== values.description
    ) {
      await supabase
        .from('cards')
        .update({
          title: values.title,
          description: values.description ? values.description : null,
        })
        .eq('id', id);

      refresh();
    }

    setIsEditing(!isEditing);
  }

  async function handleDelete() {
    await supabase.from('cards').delete().eq('id', id);
    window.location.reload();
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30  min-h-[180px] rounded-xl border-2 border-rose-500  cursor-grab relative"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            <CardHeader>
              {isEditing ? (
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <p className="font-bold">{title}</p>
              )}
            </CardHeader>
            <CardContent>
              {isEditing && description ? (
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <p className="text-gray-600">{description}</p>
              )}

              <div className="flex ml-auto gap-2 pt-4 justify-end">
                {isEditing ? (
                  <Button variant="ghost" size="icon" type="submit">
                    <CheckIcon />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon">
                    <EditIcon />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleDelete}
                >
                  <TrashIcon />
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
