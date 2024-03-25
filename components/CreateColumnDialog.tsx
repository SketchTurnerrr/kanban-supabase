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
  title: z.string().min(1, {
    message: 'Column name must be at least 1 characters.',
  }),
});

export function CreateColumnDialog({ id }: { id: string }) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
    },
  });

  const supabase = createClient();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await supabase
        .from('columns')
        .insert({
          title: data.title,
          board: id,
        })
        .select()
        .single();
    } catch (error) {
      console.log('error :', error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">+ Column</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a column</DialogTitle>
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
