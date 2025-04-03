'use client';

import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@prisma/client";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from 'zod';
import { Form } from "../ui/form";

export default function ProductForm({ type, product, productId} : { 
    type: 'create' | 'update' ;
    product?:Product;
    productId?:string
 }) {

    const router = useRouter();
    const form = useForm<z.infer<typeof insertProductSchema>>({
        resolver:type==='create' ? zodResolver(insertProductSchema) : zodResolver(updateProductSchema),
        defaultValues : product && type=='update' ? product : productDefaultValues
    })
  return (
    <Form {...form}>
        <form className="space-y-8">
            <div className="flex flex-col gap-5">
              {/* Name */}
              {/* Slug */}
            </div>

            <div className="flex flex-col gap-5">
              {/* Category */}
              {/* Brand */}
            </div>

            <div className="flex flex-col gap-5">
              {/* Price */}
              {/* Stock */}
            </div>

            <div className="upload-field flex flex-col gap-5">
               {/* Images */}
            </div>
            <div className="upload-field">
              {/* isFeatured */}
            </div>
            <div>
              {/* Description */}
            </div>
            <div>
              {/* Submit */}
            </div>
        </form>
    </Form>
  )
}
