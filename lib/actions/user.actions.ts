'use server'
import { paymentMethodSchema, shippingAddressSchema, signInFormSchema, signUpFormSchema, updateUserSchema } from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { formatErrors } from "../utils";
import { ShippingAddress } from "@/types";
import {z} from 'zod';
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";


// Sign in user with credentails
export async function signInWithCredentials( prevState : unknown, formData: FormData){
    try {
        const user = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get("password")
        });

        console.log("User --", user)


        await signIn("credentials", user);

        return { success: true, message: "Signed in successfully"};
    } catch (error) {
        if(isRedirectError(error)){
            throw error;
        }
        return { success: false, message: 'Invalid email or password'};
        
    }
}


// User sign out
export async function signOutUser() {
    await signOut();
}


// Sign Up user
export async function signUpUser(prevState : unknown, formData: FormData){
    try {
        const user = signUpFormSchema.parse({
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword")
        })

        const plainPassword = user.password;

        user.password = hashSync(user.password, 10);

        console.log("User --> ", user, plainPassword);
        

        const update = await prisma.user.create({
            data:{
                name:user.name ,
                email: user.email,
                password:user.password,
            }
        })

        console.log(" after User --> ", update);

        await signIn("credentials", {
            email: user.email,
            password:plainPassword,
        })

        // console.log("after user", prisma.user.findMany())

        return {
            success: true,
            message:"User registered successfully"
        };
    } catch (error) {
        if(isRedirectError(error)){
            throw error;
        }
        return { success: false, message: formatErrors(error)};
        
    }
};



// Get User By Id
export async function getUserById(userId : string){
    const user = await prisma.user.findFirst({
        where:{
            id: userId
        }
    });
    if(!user) throw new Error("User not found");
    return user;
};


//Update the user's address
export async function updateUserAddress(data: ShippingAddress){
    try {
        const session = await auth();


        const currentUser = await prisma.user.findFirst({
            where:{
                id: session?.user?.id
            }
        });

        if(!currentUser) throw new Error('User not found');

        const address = shippingAddressSchema.parse(data);

        await prisma.user.update({
            where:{
                id: currentUser.id
            },
            data:{address}
        });


        return {
            success:true,
            message:"User updated successfully.."
        }

    } catch (error) {
        return { success: false, message: formatErrors(error)};
    }
};



// Update user's payment method
export async function updateUserPaymentMethod(data : z.infer<typeof paymentMethodSchema>){
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where:{id : session?.user?.id}
        });
        if(!currentUser) throw new Error("User not found");

        const paymentMethod = paymentMethodSchema.parse(data);

        await prisma.user.update({
            where:{ id: currentUser.id},
            data: { paymentMethod : paymentMethod.type}
        });


        return {
            success:false,
            message:"User updated successfully"
        }
    } catch (error) {
        return { success: false, message: formatErrors(error)};
    }
};


// Update the user profile
export async function updateProfile(user: { name : string; email: string ;}){
    try {
        const session = await auth();

        const currentUser = await prisma.user.findFirst({
            where:{
                id: session?.user?.id
            }
        });

        if(!currentUser) throw new Error("User is not found");

        await prisma.user.update({
            where:{
                id: currentUser.id
            },
            data:{
                name: user.name,
            }
        });

        return {
            success: true,
            message:"User updated successfully.."
        }

    } catch (error) {
        return { success: false, message : formatErrors(error)};
    }
};


// get All Users
export async function getAllUsers({
    limit = PAGE_SIZE,
    page,
    query
}:{
    limit?:number;
    page:number;
    query:string;
}){


    const queryData : Prisma.UserWhereInput = query && query !== 'all' ? {
            name:{
                contains:query,
                mode:'insensitive'
            } as Prisma.StringFilter
    } : {};

    const data = await prisma.user.findMany({
        orderBy:{
            createdAt:'desc'
        },
        take: limit,
        skip: (page-1)*limit
    });

    const dataCount = await prisma.user.count();

    return{
        data,
        totalPages: Math.ceil(dataCount/limit)
    }
};


// Delete a User
export async function deleteUser( id : string){
    try {
        await prisma.user.delete({
            where:{
                id
            }
        });

        revalidatePath(`admin/users`);

        return {
            success: true,
            message: "User deleted successfully,"
        }
    } catch (error) {
        return{
            success: false,
            message: formatErrors(error)
        }
    }
};



// Update a user
export async function updateUser( user : z.infer<typeof updateUserSchema>){
    try {
        await prisma.user.update({
            where:{
                id : user.id
            },
            data: {
                name: user.name,
                role: user.role
            }
        });

        revalidatePath('/admin/users');

        return {
            success: true,
            message:'User updated successfully.'
        }
    } catch (error) {
        return {
            success: false,
            message: formatErrors(error)
        }
    }
}