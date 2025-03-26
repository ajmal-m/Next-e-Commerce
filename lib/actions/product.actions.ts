'use server';

import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatErrors } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";


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



// Get ALl Products
export async function getAllProducts({
    query,
    limit= PAGE_SIZE,
    page,
    category
}:{
    query:string;
    limit?:number;
    page:number;
    category?:string
}){
    const data = await prisma.product.findMany({
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
}