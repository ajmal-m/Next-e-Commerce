'use server';

import { z } from "zod";
import { insertReviewSchema } from "../validators";
import { formatErrors } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";


// Create & Update Reviews
export async function createUpdateReview( data : z.infer<typeof insertReviewSchema>){
    try {
        const session = await auth();

        if(! session) throw new Error('User is not authenticated');

        // validate and store review's
        const review = insertReviewSchema.parse({
            ...data,
            userId: session?.user?.id
        });


        // Get product that being reviewed
        const product = await prisma.product.findFirst({
            where:{
                id: review.productId
            }
        });


        if(!product) throw new Error('Product is not found');


        // Check if user already reviewed
        const reviewExist = await prisma.review.findFirst({
            where:{
                productId: review.productId,
                userId: review.userId
            }
        });


        await prisma.$transaction( async (tx) => {
            if(reviewExist){
                // Update review
                await tx.review.update({
                    where:{ id : reviewExist.id},
                    data:{
                        title: review.title,
                        description: review.description,
                        rating: review.rating
                    }
                });
            }else{
                // Create review
                await tx.review.create({
                    data: review
                })
            }

            // get Average rating
            const averageRating = await tx.review.aggregate({
                _avg: { rating: true},
                where: { productId: review.productId}
            });


            // get number of reviews
            const numReviews = await tx.review.count({
                where: {
                    productId: review.productId
                }
            });


            //Update the rating and numReviews in product table
            await tx.product.update({
                where:{
                    id: review.productId
                },
                data:{
                    rating: averageRating._avg.rating || 0,
                    numReviews
                }
            })


        });


        revalidatePath(`/product/${product.slug}`);

        return {
            success: true,
            message: 'Review updated successfully'
        }

    } catch (error) {
        return {
            success: false,
            message: formatErrors(error)
        }
    }
};


// Get All Reviews for a product
export async function getReviews({ productId }: {
    productId: string
}){
        const data = await prisma.review.findMany({
            where:{ productId: productId},
            include:{
                user:{
                    select:{
                        name:true
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        });

        return {data};
};


// Get the review written by the current user
export async function getReviewByProductId({
    productId
} : { productId : string;}){
        const session = await auth();

        if(!session) throw new Error("user is not authenticated..");

        const res = await prisma.review.findFirst({
            where:{
                productId: productId,
                userId: session.user.id
            }
        });

        return res;
}
