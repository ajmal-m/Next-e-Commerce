import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import Menu from './menu';
import CategoryDrawer from './category-drawer';
import Search from './search';


export default function Header() {
  return (
    <header className="w-full border-b">
        <div className="wrapper flex-between">
            <div className="flex-start">
                <CategoryDrawer/>
                <Link href='/' className='flex-start'>
                    <Image src={'/images/logo.svg'} alt={`${APP_NAME} logo`} width={48} height={48} priority={true}/>
                    <span className="hidden lg:block font-bold ml-3 text-2xl">{APP_NAME}</span>
                </Link>
            </div>
            <div className="space-x-2">
              <Search/>
              <Menu/>
            </div>
        </div>
    </header>
  )
}
