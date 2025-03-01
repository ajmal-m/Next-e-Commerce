import {number, string, z} from 'zod';
import { formatNumberWithDecimal } from './utils';

const currency =  z.string().refine( (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), 'Price Must have Two decimal places');

// Schema for inserting Products
export const insertProductSchema = z.object({
    name : z.string().min(3, "Name atleast three characters"),
    slug : z.string().min(3, "slug atleast three characters"),
    category : z.string().min(3, "category atleast three characters"),
    brand : z.string().min(3, "brand atleast three characters"),
    description : z.string().min(3, "description atleast three characters"),
    stock: z.coerce.number(),
    images: z.array(z.string()).min(1, "Product must have atleast one image"),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency
})