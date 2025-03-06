import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import {prisma} from './db/prisma';
import Credentials from "next-auth/providers/credentials";
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';

export const config = {
    pages:{
        signIn: '/signin',
        error: '/signin'
    },
    session:{
        strategy:'jwt',
        maxAge: 30 * 24 * 60 * 60,

    },
    adapter:PrismaAdapter(prisma),
    providers:[
        Credentials({
            credentials: {
              email: { type: "email" },
              password: {type: "password" },
            },
            async authorize(credentials) {
                console.log("Cred",credentials )
                if(credentials == null){
                    return null;
                }
                

                // Find user in database
                const user = await prisma.user.findFirst({
                    where:{
                        email: credentials.email as string
                    }
                });

                console.log("user cred ", user)


                // Check if use exist password match
                if(user && user.password){
                    const isMatch = compareSync(credentials.password as string, user.password);

                    console.log("Match ", isMatch)

                    // if password correct return user
                    if(isMatch){
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    }
                }

                // if user doesnot exist or password not match return null
                return null;
            },
        }),
    ],

    callbacks:{
        async session({ session, user, trigger, token }:any) {
            // Set userId from token
            session.user.id = token.sub;
            session.user.role = token.role;
            session.user.name = token.name;

            console.log("Token", token)

            // if any update set username
            if(trigger === 'update'){
                session.user.name = user.name;
            }
            return session
        },

        async jwt({token, user, trigger, session}:any){
            // Assign user field to token
            if(user){
                token.role = user.role;
                // if user has no name use the email
                if(user.name === 'NO_NAME'){
                    token.name = user.email!.split("@")[0];

                    // Update database to reflect the token name
                    await prisma.user.update({
                        where:{id: user.id},
                        data:{name: token.name}
                    })
                }
            }
            return token;
        }
    }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut} = NextAuth(config);