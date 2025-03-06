import React from 'react';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

export default  function Loading() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
        <Image src={'/images/loader.gif'} width={48} height={48} alt={`${APP_NAME} loading`}>
        </Image>
    </div>
  )
}
