'use client'

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reviewDefaultFormValues } from "@/lib/constants";
import { insertReviewSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { Form, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createUpdateReview, getReviewByProductId } from "@/lib/actions/review-action";

export default function ReviewForm({ userId, productId, onReviewSubmitted} : {
    userId: string;
    productId: string;
    onReviewSubmitted : () => void
}) {

    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof insertReviewSchema>>({
        resolver: zodResolver(insertReviewSchema),
        defaultValues: reviewDefaultFormValues
    });

    // Open Form handler
    const handleOpenForm = async () => {
        form.setValue('productId', productId);
        form.setValue('userId', userId);

        const review = await getReviewByProductId({ productId});

        if(review){
            form.setValue('title', review.title);
            form.setValue('description', review.description);
            form.setValue('rating', review.rating);
        }

        setOpen(true);
    };

    // Submit form handler
    const onSubmit:SubmitHandler<z.infer<typeof insertReviewSchema>> = async (values) => {
        const res = await createUpdateReview({...values, productId});

        if(! res.success){
            toast.error(res.message);
            return
        }

        setOpen(false);


        onReviewSubmitted();


        toast.success(res.message);

    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant={'default'} onClick={handleOpenForm}>
                Write a Review
            </Button>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form  method="post" onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogTitle>
                            Write a Review
                        </DialogTitle>
                        <DialogDescription>
                            Share your thoughts with other customers
                        </DialogDescription>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={
                                    ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter title" {...field}/>
                                            </FormControl>
                                        </FormItem>
                                    )
                                }
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={
                                    ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter description" {...field}/>
                                            </FormControl>
                                        </FormItem>
                                    )
                                }
                            />


                            <FormField
                                control={form.control}
                                name="rating"
                                render={
                                    ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a rating"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {
                                                        Array.from({length:5}).map((_, index) => (
                                                            <SelectItem key={index} value={(index+1).toString()}>
                                                                {index+1} { ' '}<StarIcon className="w-4 h-4 inline"/>
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )
                                }
                            />


                            
                        </div>
                        <Button
                            type="submit"
                            size={'lg'}
                            className="w-full"
                            disabled={form.formState.isSubmitting}
                        >
                            { form.formState.isSubmitting ? 'Submitting....' : 'Submit'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
