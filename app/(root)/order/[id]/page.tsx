import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailTable from "./order-detail-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";


export const metadata: Metadata = {
    title: 'Order Details'
};

export default async function OrderDetailPage(props: { 
    params: Promise<{
        id:string
    }>
}) {

    const {id} = await props.params;

    const order = await getOrderById(id);

    if(!order) notFound();

    const session = await auth();

    
  return (
    <>
      <OrderDetailTable 
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress
        }}

        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
        isAdmin={session?.user?.role === 'admin' || false}
      />
    </>
  )
}
