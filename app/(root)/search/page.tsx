import ProductCard from '@/components/shared/product/product-card';
import { getAllProducts } from '@/lib/actions/product.actions';
import React from 'react'

export default async function SearchPage( props : {
    searchParams: Promise<{
        q?:string;
        category?:string;
        price?:string;
        rating?:string;
        sort?:string;
        page?:string;
    }>
}) {
    const {
        q='all',
        category='all',
        price='all',
        rating='all',
        sort='newest',
        page='1'
    } = await props.searchParams;

    const products = await getAllProducts({
        query:q,
        category,
        price,
        rating,
        sort,
        page: Number(page)

    });

    // Construct Filter URL
    const getFilterUrl = ({
        c,
        s,
        r,
        p,
        pg
    }: {
        c ?: string;
        s ?: string;
        r ?: string;
        p ?: string;
        pg ?: string;

    }) => {
        const params = {q, category, price, rating, sort, page};

        if(c) params.category = c;
        if(p) params.price = p;
        if(r) params.rating = r;
        if(s) params.sort = s;
        if(pg) params.page = pg;

        return `/search?${new URLSearchParams(params).toString()}`;

    };


    return (
        <div className="grid md:grid-cols-5 md:gap-5">
            <div className="filters-link">
                {/* Filter */}
            </div>
            <div className="md:col-span-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {
                        products.data.length === 0 && (
                            <div>
                                No Products found
                            </div>
                        )
                    }
                    {
                        products.data.map((product) => (
                            <ProductCard key={product.id} product={product}/>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
