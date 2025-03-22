import {  z} from 'zod';
import { formatNumberWithDecimal } from './utils';
import { PAYMENT_METHODS } from './constants';

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



// Schema for user signin
export const signInFormSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, 'Password must be atleast 6 characters')
});


// Schema for user signing up a user
export const signUpFormSchema = z.object({
    name: z.string().min(3, 'Name must be atleast 3 characters'),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, 'Password must be atleast 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be atleast 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
    message:"Password don't match",
    path:["confirmPassword"]
});


// Cart Item Schema
export const cartItemSchema = z.object({
    productId : z.string().min(1, 'Product is Required'),
    name: z.string().min(1, 'Name is Required'),
    slug: z.string().min(1, 'Slug is Required'),
    qty: z.number().int().nonnegative("Quantity must be positive"),
    image: z.string().min(1, "Image is Required"),
    price: currency
});


// Insert cart Schema
export const insertCartSchema = z.object({
    items: z.array(cartItemSchema),
    itemsPrice: currency,
    totalPrice: currency,
    shippingPrice: currency,
    taxPrice : currency,
    sessionCartId: z.string().min(1, "Session cart id is required"),
    userId: z.string().optional().nullable()
});


// Schema for shipping address
export const shippingAddressSchema = z.object({
    fullName: z.string().min(3, "Name must be atleast 3 characters."),
    streetAddress: z.string().min(3, "Address must be atleast 3 characters."),
    city: z.string().min(3, "City must be atleast 3 characters."),
    postalCode: z.string().min(3, "Postal code must be atleast 3 characters."),
    country: z.string().min(3, "country must be atleast 3 characters."),
    lat: z.string().optional(),
    lng: z.string().optional()
});


// Schema for Payment Methods
export const paymentMethodSchema = z.object({
    type: z.string().min(1, 'Payment method is required')
}).refine((data) => PAYMENT_METHODS.includes(data.type),{
    path:['type'],
    message:"Invalid payment method"
} );


// Schema for inserting order
export const insertOrderSchema = z.object({
    userId: z.string().min(1, 'User is Required'),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    paymentMethod : z.string().refine((data) => PAYMENT_METHODS.includes(data), {
        message: 'Invalid payment method'
    }),
    shippingAddress: shippingAddressSchema
});


// Schema for inserting an Order item
export const insertOrderItemSchema = z.object({
    productId : z.string(),
    slug : z.string(),
    image : z.string(),
    name : z.string(),
    price: currency,
    qty: z.number()
});
