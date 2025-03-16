'use client';
import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addItemToCart } from "@/lib/actions/cart.actions";

export default function AddToCart({item} : { item: CartItem}) {

    const router = useRouter();

    const handleAddToCart = async () => {

        const res = await addItemToCart(item);


        if(!res.success){
           toast.error(res.message);
           return
        }


        // Handle success add to cart
        toast.success(`${item.name} added to cart`, {
                action: {
                label: "Go To cart",
                onClick: () => router.push('/cart'),
            },
        })
    }

    return (
            <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleAddToCart}
            >
                <Plus/>Add To Cart
            </Button>
    )
}
