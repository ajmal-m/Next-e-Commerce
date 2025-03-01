import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug } from '@/lib/actions/product.actions';
import React from 'react';
import { notFound } from 'next/navigation';

export default async  function page(props:{
  params: Promise<{ slug : string}>
}) {

  const {slug} = await props.params;
  const product = await getProductBySlug(slug);
  

  if(!product){
    notFound()
  }
  
  return (
    <section>
      <div className='grid grid-cols-1 md:grid-cols-5'>
        {/* Images column */}
        <div className='col-span-2'>
          {/* Image component */}
        </div>
        {/* Details Column */}
        <div className='col-span-2 p-5'>
          <div className='flex flex-col gap-6'>
            <p> {product.brand} {product.category}</p>
            <h2 className="h3-bold">{product.name}</h2>
            <p>{product.rating} of {product.numReviews} Reviews</p>
          </div>
        </div>
      </div>
    </section>
  )
}
