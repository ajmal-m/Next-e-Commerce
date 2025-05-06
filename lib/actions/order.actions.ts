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
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

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


// Approve paypal order and update Order to Paid
export async function approvePaypalOrder(orderId: string, data: { orderID: string}){
    try {
        // Get order from database
        const order = await prisma.order.findFirst({
            where:{
                id: orderId
            }
        });


        if(!order) throw new Error('Order is not found');

        const captureData = await paypal.capturePayment(data.orderID);

        if(!captureData || captureData.id !== (order.paymentResult as PaymentResult).id || captureData.status !== 'COMPLETED' ){
            throw new Error("Error in paypal payment");
        }

        // Update order to paid
        await updateOrderToPaid({
            orderId,
            paymentResult:{
                id: captureData.id,
                status: captureData.status,
                email_address: captureData.payer.email_address,
                pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value
            }
        })

        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message:'Your Order has been paid'
        }
    } catch (error) {
        return { success: false, message: formatErrors(error)};
    }
};



// Update Order to paid
export async function updateOrderToPaid({
    orderId,
    paymentResult
} : {
    orderId: string;
    paymentResult?: PaymentResult;
}){

    // Get order from database
    const order = await prisma.order.findFirst({
        where:{
            id: orderId
        },
        include:{
            orderitems:true
        }
    });


    if(!order) throw new Error("Order not found");

    if(order.isPaid) throw new Error("Order is already paid");

    // Transaction to update order and account for product stock
    await prisma.$transaction(async(tx) => {
        // Iterate over product and update stock
        for(const item of order.orderitems){
            await tx.product.update({
                where:{ id : item.productId},
                data:{
                    stock:{
                        increment: -item.qty
                    }
                }
            });
        };

        // set order to paid
        await tx.order.update({
            where:{id: orderId},
            data:{
                isPaid: true,
                paidAt: new Date(),
                paymentResult
            }
        })
    });


    // get update Order after transaction
    const updatedOrder = await prisma.order.findFirst({
        where:{ id: orderId},
        include:{
            orderitems:true,
            user:{
                select:{
                    name:true,
                    email:true
                }
            }
        }
    });

    if(!updatedOrder) throw new Error("Order is not found");

};


// Get User's orders
export async function getMyOrders({
    limit = PAGE_SIZE,
    page
}: {
    limit ?: number,
    page: number
}){
    const session = await auth();
    if(!session) throw new Error("User is not authorized");

    const data = await prisma.order.findMany({
        where:{ userId: session.user?.id!},
        orderBy:{
            createdAt:'desc'
        },
        take:limit,
        skip: (page-1)*limit
    });


    const dataCount = await prisma.order.count({
        where:{
            userId: session.user?.id!
        }
    });


    return {
        data,
        totalPages:Math.ceil(dataCount/limit)
    }
};

type SalesDataType = {
    month: string;
    totalSales: number
}[];


// Get sales data and Order summary
export async function getOrderSummary(){
    // Get count for each resources
    const orderCount = await prisma.order.count();
    const productCount = await prisma.product.count();
    const usesrCount = await prisma.user.count();


    // Calculate total sales
    const totalSales = await prisma.order.aggregate({
        _sum:{ totalPrice : true}
    });

    // Get monthly sales
    const salesDataRaw = await prisma.$queryRaw<Array<{ month: string, totalPrice: Prisma.Decimal}>>`SELECT to_char("createdAt", "MM/YY") as "month", sum("totalPrice") as
     "totalSales" FROM "Order" GROUP BY to_char("createdAt", "MM/YY")`;

     const salesData: SalesDataType = salesDataRaw.map((entry) => ({
        month: entry.month,
        totalSales: Number(entry.totalPrice)
     }));

    // Get lastest sales
    const latestSales = await prisma.order.findMany({
        orderBy:{
            createdAt:"desc"
        },
        include:{
            user:{
                select:{
                    name:true
                }
            }
        },
        take:6
    });

    return {
        orderCount,
        productCount,
        usesrCount,
        totalSales,
        latestSales,
        salesData
    }
};



// Get all Orders
export async function getAllOrders({
    limit = PAGE_SIZE,
    page ,
    query
}:{
    limit?:number;
    page:number;
    query:string;
}){

    const queryData : Prisma.OrderWhereInput = query && query !== 'all' ? {
        name:{
            contains:query,
            mode:'insensitive'
        } as Prisma.StringFilter
    } : {};
    const data = await prisma.order.findMany({
        where:{
            
        },
        orderBy:{
            createdAt:'desc'
        },
        take:limit,
        skip: (page-1)*limit,
        include:{
            user:{
                select:{
                    name:true
                }
            }
        }
    });

    const dataCount = await prisma.order.count();

    return {
        data,
        totalPages: Math.ceil(dataCount/limit)
    }
};


// Delete an Order
export async function deleteOrder(id : string){
    try {
        await prisma.order.delete({
            where:{id}
        });

        revalidatePath(`/admin/orders`);

        return {
            success: true,
            message: "Order deleted successfully."
        }
    } catch (error) {
        return {
            success: false,
            message: formatErrors(error)
        }
    }
};


// Update COD Order to Paid
export async function updateOrderToPaidCOD(orderId : string){
    try {
        await updateOrderToPaid({ orderId });
        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message:'Order marked as a paid'
        };
    } catch (error) {
        return{
            success: false,
            message: formatErrors(error)
        };
    }
};


// Update CON order as Delivered
export async function deliverOrder(orderId : string){
    try {
        const order = await prisma.order.findFirst({
            where:{
                id:orderId
            }
        });

        if(!order) throw new Error("Order is not found");

        if(!order.isPaid) throw new Error("Order is not paid");

        await prisma.order.update({
           where:{
            id: orderId
           },
           data:{
            isDelivered: true,
            deliveredAt: new Date()
           }
        });


        revalidatePath(`/order/${orderId}`);

        return {
            success: true,
            message: 'Order has been marked as delivered'
        }
        
    } catch (error) {
        return{
            success: false,
            message: formatErrors(error)
        };
    }
}
