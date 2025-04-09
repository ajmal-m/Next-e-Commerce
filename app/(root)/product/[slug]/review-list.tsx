'use client'

import { Review } from "@/types";
import Link from "next/link";
import { useState } from "react";
import ReviewForm from "./review-form";



export default function ReviewList({ userId, productId, productSlug} : {
    userId : string;
    productId: string;
    productSlug: string;
}) {


  const [reviews, setReview] = useState<Review[]>([]);

  const reload = () => {

  }

  return (
    <div className="space-y-4">
        { reviews.length === 0 && (<div>No Review Yet</div>)}
        {
            userId ? (
              <>
              {/* Review Here */}
              <ReviewForm userId={userId} productId={productId} onReviewSubmitted={reload}/>
              </>
            ) : (
              <div>
                Please <Link className="text-blue-700 px-2" href={`/sign-in?callbackUrl=/product/${productSlug}`}>
                  Sign In
                </Link>
                to write a review
              </div>
            )
        }
        <div className="flex flex-col gap-3">
          {/* Review Here */}
        </div>
    </div>
  )
}
