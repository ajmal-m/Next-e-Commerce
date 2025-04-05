import ProductForm from "@/components/admin/product-form";
import { getProductByID } from "@/lib/actions/product.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title:'Update Product'
}
export default async function AdminProductUpdatePage(props: { params: Promise<{ id: string;}>} ) {

    const {id} = await props.params;

    const product = await getProductByID(id);

    if(!product){
        return notFound();
    }



    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="h2-bold">Update Product</h1>
            <ProductForm type='update' product={product} productId={product.id}/>
        </div>
    )
}
