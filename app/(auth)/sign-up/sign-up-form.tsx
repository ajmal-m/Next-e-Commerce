'use client'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { SignUpDefaultValue } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signUpUser } from '@/lib/actions/user.actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

export default function SignUpForm() {
    const [data, action] = useActionState(signUpUser, {
        success:false,
        message:''
    });

    const SignUpButton = () => {
        const {pending} = useFormStatus();
        return(
            <Button disabled={pending} className='w-full' variant={'default'}>
                {
                    pending ? "Submitting...": "SignUp"
                }
            </Button>
        )
    }
  return (
    <form action={action}>
        <div className="space-y-6">
            <div>
                <Label htmlFor='name'>Name</Label>
                <Input 
                    id='name' 
                    name='name' 
                    type='text' 
                    autoComplete='name'
                    defaultValue={SignUpDefaultValue.name}
                />
            </div>

            <div>
                <Label htmlFor='email'>Email</Label>
                <Input 
                    id='email' 
                    name='email' 
                    type='text' 
                    autoComplete='email'
                    defaultValue={SignUpDefaultValue.email}
                />
            </div>

            <div>
                <Label htmlFor='password'>Password</Label>
                <Input 
                    id='password' 
                    name='password' 
                    type='password' 
                    required 
                    autoComplete='password'
                    defaultValue={SignUpDefaultValue.password}
                />
            </div>

            <div>
                <Label htmlFor='password'>Confirm Password</Label>
                <Input 
                    id='confirmPassword' 
                    name='confirmPassword' 
                    type='password' 
                    required 
                    autoComplete='confirmPassword'
                    defaultValue={SignUpDefaultValue.confirmPassword}
                />
            </div>
            <div>
                <SignUpButton/>
            </div>
            {
                data && !data.success && (
                    <div className="text-center text-destructive">
                        {
                            data.message
                        }
                    </div>
                )
            }
            <div className='text-sm text-center text-muted-foreground'>
               Already have an account {" "}
                <Link href={'/sign-in'} target='_self' className='link'>
                    Sign In
                </Link>
            </div>
        </div>
    </form>
  )
}
