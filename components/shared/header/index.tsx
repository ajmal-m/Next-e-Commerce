import { UserIcon, ShoppingCart } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import ModeToggle from './mode-toggle';

export default function Header() {
  return (
    <header className="w-full border-b">
        <div className="wrapper flex-between">
            <div className="flex-start">
                <Link href='/' className='flex-start'>
                    <Image src={'/images/logo.svg'} alt={`${APP_NAME} logo`} width={48} height={48} priority={true}/>
                    <span className="hidden lg:block font-bold ml-3 text-2xl">{APP_NAME}</span>
                </Link>
            </div>
            <div className="space-x-2">
                <ModeToggle/>
                <Button asChild>
                    <Link href='/cart'>
                        <ShoppingCart/> Cart
                    </Link>
                </Button>
                <Button asChild>
                    <Link href='/sign-in'>
                        <UserIcon/> Sign In
                    </Link>
                </Button>
            </div>
        </div>
    </header>
  )
}
