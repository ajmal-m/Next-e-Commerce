'use client'
import { useSession } from 'next-auth/react';
import { useForm} from 'react-hook-form';

import React from 'react'
import { updateProfileSchema } from '@/lib/validators';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/lib/actions/user.actions';

export default async  function ProfileForm() {

    const {data : session, update} =  useSession();

    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues:{
            name: session?.user?.name ?? '',
            email: session?.user?.email ?? '',
        }
    });

    const onSubmit = async (values : z.infer<typeof updateProfileSchema>) => {
        const res = await updateProfile(values);

        if(!res.success){
            return toast.error(res.message);
        }

        const newSession = {
            ...session,
            user:{
                ...session?.user,
                name: values.name
            }
        };

        await update(newSession);

        toast(res.message);
    };


    return (
        <Form {...form}>
            <form className='flex flex-col gap-5' onClick={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name='email'
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input disabled placeholder='Email' className='input-field' {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='name'
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Input disabled placeholder='Name' className='input-field' {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
                <Button type='submit' size={'lg'} className='button col-span-2 w-full' disabled={form.formState.isSubmitting}>
                    {
                        form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'
                    }
                </Button>
            </form>
        </Form>
    )
}
