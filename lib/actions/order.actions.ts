'use server'

import { isRedirectError } from "next/dist/client/components/redirect-error"
import { convertToPlainObject, formatErrors } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";

// Create Order and Order items
export async function createOrder(){
    try {
        const session = await auth();
        if(!session) throw new Error("User not authenticated.");

        const cart = await getMyCart();
        const userId =  session.user?.id;
        if(!userId) throw new Error("User not found");

        const user = await getUserById(userId);

        if(!cart || cart.items.length == 0) {
            return { success: false, message: 'Your cart is empty', redirectTo:'/cart' }
        }

        if(!user.address) {
            return { success: false, message: 'No shipping Address', redirectTo:'/shipping-address' }
        }

        if(!user.paymentMethod) {
            return { success: false, message: 'No payment Method', redirectTo:'/payment-method' }
        }

        // Create order Object
        const order = insertOrderSchema.parse({
            userId : user.id,
            shippingAddress: user.address,
            paymentMethod : user.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice:cart.taxPrice,
            totalPrice:cart.totalPrice
        });


        // Create a transaction to create Order and Order Item in database
        const insertedOrderId = await prisma.$transaction(async (tx) => {
            // Create Order
            const insertedOrder = await tx.order.create({ data: order});

            // Create Order Items from cart Items
            for(const item of cart.items as CartItem[]){
                await tx.orderItem.create({
                    data: {
                        ...item,
                        price:item.price,
                        orderId: insertedOrder.id,

                    },
                });
            }

            // Clear cart
            await tx.cart.update({
                where:{ id : cart.id},
                data: {
                    items: [],
                    totalPrice: 0,
                    shippingPrice: 0,
                    taxPrice: 0,
                    itemsPrice: 0
                }
            });

            return insertedOrder.id;
        });

        if(!insertedOrderId) throw new Error('Order not Created');

        return { success: true, message: 'Order created', redirectTo:`/order/${insertedOrderId}`};
    } catch (error) {
        if(isRedirectError(error)) throw error;
        return { success: false, message: formatErrors(error)};
    }
}



// get Order by Id
export async function getOrderById(orderId : string){
    const data = await prisma.order.findFirst({
        where:{
            id: orderId
        },
        include:{
            orderitems: true,
            user: {
                select:{
                    name:true,
                    email: true
                }
            }
        }
    })

    return convertToPlainObject(data);
}


// Create new paypal order
export  async function createPaypalOrder(orderId: string){
    try {
        // Get order from database
        const order = await prisma.order.findFirst({
            where:{
                id: orderId
            }
        });

        if(order){
            // Create a paypal order
            const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

            // Update Order with paypal order id
            await prisma.order.update({
                where:{id : orderId},
                data: {
                    paymentResult:{
                        id: paypalOrder.id,
                        email_address: '',
                        status:'',
                        pricePaid:0
                    }
                }
            });

            return {
                success: true,
                message:'Item order created successfully.',
                data: paypalOrder.id
            }
        }else{
            throw new Error("Order is not found");
        }
    } catch (error) {
        return { success: false, message: formatErrors(error)};
    }
}