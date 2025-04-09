'use client'

import { Review } from "@/types";
import Link from "next/link";
import { useState } from "react";
import ReviewForm from "./review-form";
import { useEffect } from "react";
import { getReviews } from "@/lib/actions/review-action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";



export default function ReviewList({ userId, productId, productSlug} : {
    userId : string;
    productId: string;
    productSlug: string;
}) {


  const [reviews, setReview] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId});
      setReview(res.data || []);
    };

    loadReviews();
  }, [productId])

  // Reload review after created / Updated
  const reload = async () => {
    const res = await getReviews({productId});
    setReview([ ...res.data]);
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
          {/* Review Here */}{
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex-between">
                    <CardTitle>{review.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {review.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    {/* RATING */}
                    {review.rating}
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1"/>
                      {
                        review.user ? review.user.name : 'User'
                      }
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3"/>
                      { formatDateTime(review.createdAt).dateTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
    </div>
  )
}
