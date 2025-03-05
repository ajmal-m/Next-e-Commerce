import React from 'react'
import ModeToggle from './mode-toggle'
import { Button } from '@/components/ui/button'
import {  EllipsisVertical, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Sheet,  SheetContent,SheetTitle,SheetTrigger } from '@/components/ui/sheet';
import UserButton from './user-button'

export default function menu() {
  return (
    <div className='flex justify-end gap-3'>
        <nav className="hidden md:flex w-full max-w-xs gap-1">
            <ModeToggle/>
            <Button asChild>
                <Link href='/cart'>
                    <ShoppingCart/> Cart
                </Link>
            </Button>
          <UserButton/>
        </nav>

        <nav className="md:hidden">
            <Sheet>
                <SheetTrigger asChild className='align-middle'>
                    <EllipsisVertical/>
                </SheetTrigger>
                <SheetContent className='flex flex-col items-start'>
                   <SheetTitle>Menu</SheetTitle>
                   <ModeToggle/>
                   <Button asChild variant={'ghost'}>
                    <Link href='/cart'>
                        <ShoppingCart></ShoppingCart> Cart
                    </Link>
                   </Button>
                   <UserButton/>
                </SheetContent>
            </Sheet>
        </nav>
    </div>
  )
}
