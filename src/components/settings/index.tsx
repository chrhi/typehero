'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { RichMarkdownEditor } from '../ui/rich-markdown-editor';
import { toast } from '../ui/use-toast';
import { updateProfile } from './settings.action';
import Link from 'next/link';
import { MagicIcon } from '../ui/magic-icon';
import { Select, SelectTrigger } from '@radix-ui/react-select';

export interface UserLinkType {
  id: string | null;
  url: string;
}

const formSchema = z.object({
  userLinks: z.array(
    z.object({
      id: z.union([z.string(), z.null()]),
      url: z.union([z.string().url().max(256), z.literal('')]),
    }),
  ),
  bio: z.string().max(256).optional(),
});

export type FormSchema = z.infer<typeof formSchema>;

export const Settings = ({
  profileData,
  username,
}: {
  profileData: FormSchema;
  username: string;
}) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...profileData,
    },
  });

  const {
    formState: { errors },
    control,
    getValues,
    register,
  } = form;

  const userLinks = useWatch({ control: form.control, name: 'userLinks' });

  const { fields } = useFieldArray({
    control,
    name: 'userLinks',
  });

  const onSubmit = async (values: FormSchema) => {
    const isValid = await form.trigger();

    if (!isValid) return;
    // call the server action
    await updateProfile(values);

    toast({
      variant: 'success',
      title: 'Your settings have been updated',
    });
  };

  return (
    <div className="container">
      <div className="mt-10 flex w-full justify-between">
        <div className="mr-10">
          <h2 className="text-3xl font-bold">Settings</h2>
          <h4 className="mb-4 mt-6 text-xl font-bold">Bio</h4>
        </div>

        <Link href={`@${username}`} className="mb-6">
          <Button variant="outline" type="button">
            View profile
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form action={() => onSubmit(getValues())}>
          <div >
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="h-[300px] w-[600px]">
                  <RichMarkdownEditor value={field.value as string} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-8 flex flex-col items-start space-y-3">
            <h4 className="text-xl font-bold">Social accounts</h4>
            {fields.map((val, i) => {
              return (
                <FormItem className="mb-3" key={`url-link-${i}`}>
                  <div className="flex items-center gap-2">
                    <MagicIcon url={userLinks?.[i]?.url ?? ''} />
                    <Input
                      defaultValue={val?.url}
                      placeholder="Link to social profile"
                      className="w-64"
                      {...register(`userLinks.${i}.url`)}
                    />
                    {errors.userLinks?.[i]?.url?.message && (
                      <div className="text-destructive">{errors.userLinks?.[i]?.url?.message}</div>
                    )}
                  </div>
                </FormItem>
              );
            })}
          </div>

          <Button type="submit" className="mt-6">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};