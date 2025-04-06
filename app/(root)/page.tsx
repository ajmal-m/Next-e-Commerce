import React from 'react';
import ProductList from '@/components/shared/product/product-list';
import { getLatestProducts , getFeaturedProducts } from '@/lib/actions/product.actions';
import ProductCarousel from '@/components/shared/product/product-carousel';

export const metadata = {
  title:`Home`
}


export default async  function Home() {

  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  
  return (
    <>
      {
        featuredProducts.length > 0 && (
          <ProductCarousel data={featuredProducts}/>
        )
      }
      <ProductList data={latestProducts} title='Newest Arrivals'/>
    </>
  )
}
