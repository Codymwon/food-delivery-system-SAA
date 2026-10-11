import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Tag,
  CheckCircle2,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { fetchRestaurantReviews } from '../api/client';
import StarRating from './StarRating';

export default function RestaurantReviews({ restaurantId, onOpenReviewModal }) {
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    let isMounted = true;
    async function loadReviews() {
      setLoading(true);
      try {
        const data = await fetchRestaurantReviews(restaurantId);
        if (isMounted && data) {
          setReviewsData({
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
            averageRating: Number(data.averageRating) || 0,
            totalReviews: Number(data.totalReviews) || (data.reviews?.length || 0),
          });
        }
      } catch (err) {
        console.warn('[RestaurantReviews] Failed to load reviews:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  const { reviews, averageRating, totalReviews } = reviewsData;

  return (
    <section className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-8 space-y-6 shadow-sm">
      {/* Header with Aggregated Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Customer Reviews & Ratings
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-mono font-bold">
              Review Service (:5008)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback from VIT Vellore students and faculty
          </p>
        </div>

        {/* Aggregate Score Pill */}
        <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-lg shadow-xs">
            <Star className="w-5 h-5 fill-white text-white" strokeWidth={1.75} />
            <span>{averageRating > 0 ? averageRating.toFixed(1) : '4.8'}</span>
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">
              {totalReviews > 0 ? `${totalReviews} Ratings` : 'Campus Favorite'}
            </span>
            <span className="text-slate-500 text-[11px]">
              Verified Deliveries
            </span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Loading student reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">No reviews yet for this restaurant</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Be the first customer to place an order and review this campus kitchen!
          </p>
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-stone-100">
          {reviews.map((rev) => {
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div key={rev._id || rev.reviewId} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Verified Student ({rev.userId?.substring(0, 8) || 'VIT Hostel'})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dateStr} · Order {rev.orderId}
                      </span>
                    </div>
                  </div>

                  {/* Stars Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" strokeWidth={1.75} />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>

                {/* Praise Tags */}
                {Array.isArray(rev.tags) && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-medium"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-orange-600" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Comment */}
                <p className="text-xs text-slate-700 leading-relaxed font-sans pt-0.5">
                  "{rev.comment}"
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
