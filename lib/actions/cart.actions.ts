'use server';

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject, formatErrors, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";


// Calculate cart prices
const calcPrices = (items : CartItem[] ) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc+ Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2( itemsPrice > 100  ? 0 : 10 ),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    return {
        itemsPrice : itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
    }
}


export async function addItemToCart(data : CartItem){
    try {
        // check for cart cookie
        const sessionCartId = (await cookies()).get("sessionCartId")?.value;

        if(!sessionCartId) throw Error('Cart session is not found');


        // Get session and user Id
        const session = await auth();
        const userId = session?.user?.id ?( session.user.id as string ): undefined;


        // get cart
        const cart = await getMyCart();

        // Parse and validate item
        const item = cartItemSchema.parse(data);


        // Find product from database
        const product = await prisma.product.findFirst({
            where:{
                id : item.productId
            }
        });

        // product is not found
        if(!product) throw new Error("product is not found");


        if(!cart){
            // Create new cart object
            const newCart = insertCartSchema.parse({
                userId: userId,
                items: [item],
                sessionCartId: sessionCartId,
                ...calcPrices([item]),
            });

            // Add to database
            await prisma.cart.create({
                data: newCart
            });

            // Revalidate product page
            revalidatePath(`/product/${product.slug}`);

            return {
                success: true,
                message: `${product.name} added to cart`
            }

        }else{
            // check if item already in cart
            const existItem = (cart.items as CartItem[]).find((x) => (x.productId === item.productId))


            // Check if items exist
            if(existItem){
                // Check stock
                if(product.stock < existItem.qty+1){
                    throw new Error("Not enough stock");
                }

                // Increase the quantity
                (cart.items as CartItem[]).find((x) => (x.productId === item.productId))!.qty = existItem.qty + 1;

            }else{
                // if Item does not exist in cart


                // Check stock
                if(product.stock < 1) throw new Error("Not enough stock");


                // Add Item to cart.items
                cart.items.push(item);
            }


            // Save to database
            await prisma.cart.update({
                where: { id : cart.id},
                data:{
                    items: cart.items as Prisma.CartUpdateitemsInput[],
                    ...calcPrices(cart.items as CartItem[])
                }
            });


            revalidatePath(`/product/${product.slug}`);


            return {
                success: true,
                message: `${product.name} ${existItem ? 'updated in' : 'added into'} cart`
            }
        }

    } catch (error) {
        return {
            success:false,
            message:formatErrors(error)
        }
    }
}


export async function getMyCart(){
    try {
        // check for cart cookie
        const sessionCartId = (await cookies()).get("sessionCartId")?.value;

        if(!sessionCartId) throw Error('Cart session is not found');


        // Get session and user Id
        const session = await auth();
        const userId = session?.user?.id ?( session.user.id as string ): undefined;

        // Get user cart from database
        const cart = await prisma.cart.findFirst({
            where: userId ? { id : userId } : { sessionCartId : sessionCartId}
        });

        if(!cart) return undefined;


        // Convert decimals and return
        return convertToPlainObject({
            ...cart,
            items: cart.items as CartItem[],
            itemsPrice : cart.itemsPrice.toString(),
            totalPrice: cart.totalPrice.toString(),
            shippingPrice: cart.shippingPrice.toString(),
            taxPrice: cart.taxPrice.toString(),

        });

    } catch (error) {
        throw new Error(formatErrors(error));
    }
}


export async function removeItemDromCart(productId: string){
    try {

        // check for cart cookie
        const sessionCartId = (await cookies()).get("sessionCartId")?.value;

        if(!sessionCartId) throw Error('Cart session is not found');

        // Get product
        const product = await prisma.product.findFirst({
            where:{
                id: productId
            }
        });
        if(!product) throw new Error("product is not found");


        // get user cart
        const cart = await getMyCart();
        if(!cart) throw new Error("Cart not found");


        // Check for item
        const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
        if(!exist) throw new Error("item is not found");

        // check if only one Quantity
        if(exist.qty === 1){
            // Remove from cart
            cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId);
        }else{
            // Decrease quantity
            (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = exist.qty-1;
        }

        // Update cart in database
        await prisma.cart.update({
            where:{
                id: cart.id
            },
            data:{
                items:cart.items as Prisma.CartUpdateitemsInput[],
                ...calcPrices(cart.items as CartItem[]),
            }
        });


        revalidatePath(`/product/${product.slug}`);

        return {
            success:true,
            message:`${product.name} was removed from cart.`
        }
        
    } catch (error) {
        return {
            success: false,
            message: formatErrors(error)
        }
    }
}