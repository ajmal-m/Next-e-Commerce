'use server';

import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatErrors } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validators";
import { z } from "zod";
import { Prisma } from "@prisma/client";


// Get The latest Products
export async function getLatestProducts(){
    const data = await   prisma.product.findMany({
        take:LATEST_PRODUCTS_LIMIT,
        orderBy:{
            createdAt:'desc'
        }
    });

    return convertToPlainObject(data);
}


// Get single products by slug
export async function getProductBySlug(slug: string){
    const data = await prisma.product.findFirst({
        where:{
            slug:slug
        }
    })

   return convertToPlainObject(data);
};


// Get single products by ID
export async function getProductByID(productId: string){
    const data = await prisma.product.findFirst({
        where:{
            id: productId
        }
    });

   return convertToPlainObject(data);
};



// Get ALl Products
export async function getAllProducts({
    query,
    limit= PAGE_SIZE,
    page,
    category,
    price,
    rating,
    sort
}:{
    query:string;
    limit?:number;
    page:number;
    category?:string;
    price?:string;
    rating?:string;
    sort?:string;
}){

    // Query Filter
    const queryFilter:Prisma.ProductWhereInput = query && query !== 'all' ? {
        name:{
            contains:query,
            mode:'insensitive'
        } as Prisma.StringFilter
    } : {

    };

    // Category Filter
    const categoryFilter = category && category !== 'all' ? {
        category
    }:{};



    // Price Filter
    const priceFilter : Prisma.ProductWhereInput = price && price !== 'all' ? {
        price:{
            gte:Number(price.split("-")[0]),
            lte: Number(price.split("-")[1])
        }
    } : {};


    // Rating Filter
    const ratingFilter = rating && rating !== 'all' ? {
        rating:{
            gte:Number(rating)
        }
    } : {};

    const data = await prisma.product.findMany({
        orderBy:sort === 'lowest' ? { price : 'asc'} : sort === 'highest' ? { price:'desc'} : sort === 'rating' ? {
            'rating' : 'desc'
        } : {createdAt:'desc'},
        where:{...queryFilter, ...categoryFilter, ...priceFilter, ...ratingFilter},
        skip:(page-1)*limit,
        take:limit
    });

    const dataCount = await prisma.product.count();

    return {
        data,
        totalPages: Math.ceil(dataCount/limit)
    };
};


// Delete a Product
export async function deleteProduct(id: string){
    try {
       const productExist = await prisma.product.findFirst({
        where:{
            id
        }
       });

       if(!productExist) throw new Error("Product  not found");

       await prisma.product.delete({ where:{id}});

       revalidatePath(`/admin/products`);

       return {
        success: true,
        message: "Product deleted successfully.."
       }
    } catch (error) {
        return {
            success: false,
            message: formatErrors(error)
        }
    }
};



// Create a product
export async function  createProduct( data: z.infer<typeof insertProductSchema>){
    try {
        const product = insertProductSchema.parse(data);
        await prisma.product.create({
            data:product
        });

        revalidatePath('/admin/products');

        return {
            success:true,
            message: "Product created successfully.."
        }
    } catch (error) {
        return {
            success: false,
            message: formatErrors(error)
        };
    }
}


// Update the product
export async function  updateProduct( data: z.infer<typeof updateProductSchema>){
    try {
        const product = updateProductSchema.parse(data);

        const productExist = await prisma.product.findFirst({
            where:{
                id: product.id
            }
        });

        if(!productExist) throw new Error("Product is not found");

        await prisma.product.update({
            where:{
                id: product.id
            },
            data:product
        })

        revalidatePath('/admin/products');

        return {
            success:true,
            message: "Product updated successfully.."
        }
    } catch (error) {
        return {
            success: false,
            message: formatErrors(error)
        };
    }
}


// Get all categories
export async function getAllCategories(){
    const data = await prisma.product.groupBy({
        by:['category'],
        _count:true
    });

    return data;
};



// Get Featured Product's
export async function getFeaturedProducts(){
    const data = await prisma.product.findMany({
        where:{
            isFeatured: true
        },
        orderBy:{
            createdAt:'desc'
        },
        take:4
    });

    return convertToPlainObject(data);
}