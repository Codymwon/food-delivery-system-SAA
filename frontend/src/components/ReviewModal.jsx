import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitReview } from '../api/client';
import StarRating from './StarRating';

const PRAISE_TAGS = [
  'Hot & Fresh',
  'Lightning Fast Delivery',
  'Great Packaging',
  'Delicious Taste',
  'Polite Delivery Partner',
];

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  restaurantId,
  restaurantName = 'Campus Restaurant',
  onReviewSubmitted,
}) {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Hot & Fresh', 'Lightning Fast Delivery']);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (rating === 0) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    if (!comment.trim()) {
      setErrorMessage('Please share a few words about your meal.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: user?.userId || 'user-demo-1',
        orderId: orderId,
        restaurantId: restaurantId || 'rest-kfc',
        rating: Number(rating),
        comment: comment.trim(),
        tags: selectedTags,
      };

      const result = await submitReview(payload);
      setIsSubmitted(true);

      if (onReviewSubmitted) {
        onReviewSubmitted(result);
      }

      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error('[ReviewModal] Submit failed:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Could not submit review. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shadow-xs">
              <Star className="w-4 h-4 fill-orange-500 text-orange-500" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                Rate Your Experience
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Order {orderId} · {restaurantName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3.5 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              Review Submitted Successfully!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Thank you for sharing your feedback. Your review is now live on the {restaurantName} campus page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Star Rating Section */}
            <div className="text-center py-2 space-y-2">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="large"
              />
            </div>

            {/* Praise Tags Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>What went great?</span>
              </label>

              <div className="flex flex-wrap gap-2">
                {PRAISE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`btn-tactile px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                        isSelected
                          ? 'bg-orange-100 text-orange-800 border border-orange-300 font-medium shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-slate-600 border border-stone-200 font-normal'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer Comment</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {comment.length}/500
                </span>
              </div>

              <textarea
                rows={3}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about food temperature, portion size, and delivery speed..."
                className="w-full text-xs p-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-slate-800 placeholder:text-slate-400 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-slate-700 hover:bg-stone-50 font-bold text-xs transition-colors cursor-pointer outline-none hover:-translate-y-[1px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all cursor-pointer outline-none hover:-translate-y-[1px] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing Review...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
