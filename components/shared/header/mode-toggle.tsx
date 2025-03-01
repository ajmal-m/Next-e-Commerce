'use client';

import { Button } from '@/components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuCheckboxItem, 
    DropdownMenuContent, 
    DropdownMenuLabel ,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {SunIcon, MoonIcon, SunMoon} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ModeToggle() {

  const { theme, setTheme} = useTheme();
  const [mounted, setMount] = useState(false);


  useEffect(() => {
    setMount(true);
  }, [])


  if(!mounted){
    return null;
  }

  return (
   <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant='outline' 
          className='focus-visible:ring-0 focus-visible:ring-offset-0'
        >
          {
            theme == 'system' ?(  
              <SunMoon/> 
            ): theme == 'dark' ? (
              <MoonIcon/> 
            ):(
              <SunIcon/>
            )
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
        Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuCheckboxItem 
          checked={theme === 'system'}
          onClick={() => setTheme('system')}
        >
          System
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onClick={() => setTheme('dark')}
        >
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onClick={() => setTheme('light')}
        >
          Light
        </DropdownMenuCheckboxItem>

      </DropdownMenuContent>
    </DropdownMenu>
   </>
  )
}
