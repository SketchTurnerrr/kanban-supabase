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

import { createClient } from '@/lib/supabase/client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const FormSchema = z.object({
  title: z.string().min(2, {
    message: 'Board title must be at least 2 characters.',
  }),
  description: z.string(),
});

export function CreateBoardDialog() {
  const supabase = createClient();
  const { push } = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const { data: board, error } = await supabase
        .from('boards')
        .insert({
          title: data.title,
          description: data.description ? data.description : null,
        })
        .select()
        .single();

      if (!error) {
        push(`/board/${board.id}`);
      }
    } catch (error) {
      console.log('error :', error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">+ Board</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a board</DialogTitle>
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
                        <Input placeholder="Todo" {...field} />
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
                        <Input placeholder="(Optional)" {...field} />
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
