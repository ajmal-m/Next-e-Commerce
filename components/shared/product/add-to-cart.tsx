'use client';
import { CartItem, Cart } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { toast } from "sonner";
import { addItemToCart, removeItemDromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

export default function AddToCart({item, cart} : { item: CartItem, cart ?: Cart}) {

    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = async () => {

        startTransition(async () => {
            const res = await addItemToCart(item);
            if(!res.success){
                toast.error(res.message);
                return
            }
            // Handle success add to cart
            toast.success(`${res.message}`, {
                    action: {
                    label: "Go To cart",
                    onClick: () => router.push('/cart'),
                },
            });
            return;
        })

    }


    // Handle remove from cart
    const handleRemoveFromCart = async () => {
        startTransition(async () => {
            try {
                const res = await removeItemDromCart(item.productId);
                toast(`${res.message}`, {
                    action: {
                    label: "Go To cart",
                    onClick: () => router.push('/cart'),
                    },
                });
                return;
            } catch (error) {
                console.log(error);
            }
        })
    }

    // Check if item is in cart
    const existItem = cart && cart.items.find((x) => x.productId === item.productId);

    return existItem ? (
        <div>
            <Button type="button" variant={'outline'} onClick={handleRemoveFromCart}>
                {
                    isPending ? (<Loader/>) : ( <Minus className="h-4 w-4"/>)
                }
            </Button>
            <span className="px-2">{existItem.qty}</span>
            <Button type="button" variant={'outline'} onClick={handleAddToCart}>
                {
                    isPending ? (<Loader/>) : (<Plus className="h-4 w-4"/>)
                }
            </Button>
        </div>  
    ) : (
        <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleAddToCart}
        >
           { isPending ? (<Loader/>) : ( <Plus/>)} Add To Cart
        </Button>   
    );
}
