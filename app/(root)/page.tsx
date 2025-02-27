import React from 'react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title:`Home`
}

const delay = (time: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, time);
  })
}

export default async  function Home() {
  await delay(5000)
  return (
    <>
      <div className='main-heading'>
        Home Page
      </div>
      <Button>Button</Button>
    </>
  )
}
