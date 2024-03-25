'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CirclePlus, Plus } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  title: z.string().min(1, {
    message: 'Card name must be at least 1 character.',
  }),
  description: z.string(),
});

export function CreateCardDialog({ columnId }: { columnId: number }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { refresh } = useRouter();

  const supabase = createClient();
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { data: existingCards, error } = await supabase
      .from('cards')
      .select('order')
      .eq('column', columnId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching existing cards:', error.message);
      // Handle error appropriately (e.g., show error message to user)
      return;
    }

    // Calculate the order for the new card
    const newOrder = existingCards ? existingCards.length : 0;

    await supabase.from('cards').insert({
      title: data.title,
      description: data.description ? data.description : '',
      column: columnId,
      order: newOrder,
    });
    window.location.reload();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="self-start">
          <Plus className="mr-2" /> Create New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a card</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className=" grid-cols-4 items-center gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogClose asChild>
                  <Button className="self-end" type="submit">
                    Create
                  </Button>
                </DialogClose>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
