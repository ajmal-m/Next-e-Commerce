import React from 'react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title:`Home`
}

export default function Home() {
  return (
    <>
      <div className='main-heading'>
        Home Page
      </div>
      <Button>Button</Button>
    </>
  )
}
