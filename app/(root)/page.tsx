import React from 'react';
import ProductList from '@/components/shared/product/product-list';
import { getLatestProducts } from '@/lib/actions/product.actions';

export const metadata = {
  title:`Home`
}


export default async  function Home() {

  const latestProducts = await getLatestProducts();
  console.log(latestProducts);
  
  return (
    <>
      <ProductList data={latestProducts} title='Newest Arrivals'/>
    </>
  )
}
