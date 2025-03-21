export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'NEXT E-COMMERCE APP';
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A modern ecommerce store built with Next.js";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/';
export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 6;
export const SignInDefaultValue = {
    email: '',
    password:''
}

export const SignUpDefaultValue = {
    name:'',
    email: '',
    password:'',
    confirmPassword:''
};


export const ShippingAddressDefaultValues = {
    fullName: 'John Doe',
    streetAddress:'123 Main st.',
    city:'Anytown',
    postalCode:'12345',
    country:'USA',
    lat:'',
    lng:''
}


export const PAYMENT_METHODS = process.env.PAYMENT_METHODS ? process.env.PAYMENT_METHODS.split(", ") : ['PayPal', 'Stripe', 'CashOnDelivery'];
export const DEFAULT_PAYMENT_MATHOD = process.env.DEFAULT_PAYMENT_MATHOD ? process.env.DEFAULT_PAYMENT_MATHOD : 'PayPal';