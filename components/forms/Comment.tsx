"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { usePathname, useRouter } from 'next/navigation';
import { addCommentToThread, createThread } from '@/lib/actions/thread.actions';
import { CommentValidation } from '@/lib/validations/thread';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import Image from 'next/image';

interface Props {
    threadId: string,
    currentUserImage: string,
    currentUserId: string
}

const Comment = ({ threadId, currentUserImage, currentUserId }: Props) => {

    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: '',
        }
    });

    const onSubmit = async (value: z.infer<typeof CommentValidation>) => {
        console.log("Inside submit");
        
        await addCommentToThread(JSON.parse(threadId), value.thread, JSON.parse(currentUserId), pathname);
        form.reset();
    }
        
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className='flex items-center gap-3 w-full'>
                            <FormLabel>
                                <Image src={currentUserImage} alt='Profile Image' width={48} height={48} className="rounded-full"/>
                            </FormLabel>
                            <FormControl className='border-none bg-transparent'>
                                <Input type='text' placeholder='Comment...' {...field} className='no-focus text-light-1 outline-none' />
                            </FormControl>
                            {/* <FormMessage className='text-white'/> */}
                        </FormItem>
                    )}
                />

                <Button type='submit' className='comment-form_btn'>Reply</Button>
            </form>
        </Form>
    )
}

export default Comment
