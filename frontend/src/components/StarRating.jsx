import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: '1 Star - Poor',
  2: '2 Stars - Fair',
  3: '3 Stars - Good',
  4: '4 Stars - Very Good',
  5: '5 Stars - Outstanding!',
};

export default function StarRating({ rating = 0, onRatingChange, readOnly = false, size = 'default' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;
  const starSizeClass = size === 'large' ? 'w-8 h-8' : size === 'small' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= displayRating;

          return (
            <button
              key={starValue}
              type="button"
              disabled={readOnly}
              onClick={() => onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={`transition-transform duration-100 p-1 rounded-lg outline-none ${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-500'
              }`}
              aria-label={`${starValue} stars`}
              role="radio"
              aria-checked={rating === starValue}
            >
              <Star
                className={`${starSizeClass} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-stone-300 fill-stone-100 hover:text-stone-400'
                }`}
                strokeWidth={1.75}
              />
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <span className="text-xs font-bold text-slate-700 min-h-[1.25rem] transition-all">
          {displayRating > 0 ? RATING_LABELS[displayRating] : 'Select your rating'}
        </span>
      )}
    </div>
  );
}
