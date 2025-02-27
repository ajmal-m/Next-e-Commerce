import React from 'react';
import sampleData from '@/db/sample-data';
import ProductList from '@/components/shared/product/product-list';

export const metadata = {
  title:`Home`
}


export default async  function Home() {
  return (
    <>
      <ProductList data={sampleData.products} title='Newest Arrivals'/>
    </>
  )
}
