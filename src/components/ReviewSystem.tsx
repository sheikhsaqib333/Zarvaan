import React, { useState } from 'react';
import { ProductReview } from '../types/clothing';
import { Star, CheckCircle, MessageSquare, ThumbsUp, Sparkles, Plus } from 'lucide-react';
import { replaceBrandName, useBrandName } from '../context/BrandNameContext';

interface ReviewSystemProps {
  productId: string;
  productName: string;
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  onAddReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  productId,
  productName,
  reviews,
  averageRating,
  totalReviews,
  onAddReview,
}) => {
  const brandName = useBrandName();
  const displayBrand = (text: string) => replaceBrandName(text, brandName);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [softness, setSoftness] = useState('10/10 Ultra Soft');
  const [colorFastness, setColorFastness] = useState('100% Colorfast Verified');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || !title.trim()) return;

    onAddReview({
      productId,
      author: author.trim(),
      city: city.trim() || 'Verified Buyer',
      rating,
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
      fabricFeedback: {
        softness,
        colorFastness,
        shrinkingTested: 'Tested in wash',
      },
    });

    setFormSubmitted(true);
    setShowForm(false);
    // Reset form
    setTitle('');
    setComment('');
  };

  // Calculate rating stars count
  const starCounts = [5, 4, 3, 2, 1].map((s) => {
    const count = reviews.filter((r) => Math.round(r.rating) === s).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars: s, count, percentage };
  });

  return (
    <div className="pt-6 border-t border-stone-200 space-y-6">
      {/* Header and Rating Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-900 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Fabric Reviews</span>
          </span>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-base font-semibold text-stone-900 tabular-nums">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-stone-500">({totalReviews} verified reviews)</span>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-4 py-2 uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-white border border-stone-300 rounded-xs space-y-4 text-xs animate-fadeIn shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h4 className="font-serif text-base text-stone-900 font-medium">
              Review This Unstitched Fabric: {displayBrand(productName)}
            </h4>
            <span className="text-stone-400 text-[11px]">* Required fields</span>
          </div>

          {/* Star Selector */}
          <div>
            <label className="block text-stone-700 font-medium mb-1">Your Overall Star Rating *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer"
                  aria-label={`${s} stars`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      s <= (hoverRating || rating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-mono text-xs text-stone-600">
                {rating === 5
                  ? '5/5 - Outstanding Fabric'
                  : rating === 4
                  ? '4/5 - Very Good Quality'
                  : rating === 3
                  ? '3/5 - Average Fabric'
                  : `${rating}/5 Stars`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Zainab Malik"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-medium mb-1">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Lahore / Karachi / Islamabad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
              />
            </div>
          </div>

          {/* Fabric specific ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 border border-stone-200">
            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">Fabric Softness & Touch</label>
              <select
                value={softness}
                onChange={(e) => setSoftness(e.target.value)}
                className="w-full bg-white border border-stone-300 p-1.5 text-xs text-stone-800"
              >
                <option value="10/10 Ultra Soft & Breathable">10/10 Ultra Soft & Breathable</option>
                <option value="Crisp Structured Hand Feel">Crisp Structured Hand Feel</option>
                <option value="Silky Smooth Finish">Silky Smooth Finish</option>
                <option value="Cozy Brushed Texture">Cozy Brushed Texture</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-stone-600 font-medium mb-1">Colorfast & Dye Quality</label>
              <select
                value={colorFastness}
                onChange={(e) => setColorFastness(e.target.value)}
                className="w-full bg-white border border-stone-300 p-1.5 text-xs text-stone-800"
              >
                <option value="100% Colorfast (Zero Bleeding)">100% Colorfast (Zero Bleeding)</option>
                <option value="Vibrant High-Definition Reactive Dyes">Vibrant High-Definition Reactive Dyes</option>
                <option value="Pre-tested in wash">Pre-tested in wash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Review Headline *</label>
            <input
              type="text"
              required
              placeholder="e.g. Beautiful weave and generous unstitched cut"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-medium mb-1">Detailed Review & Tailoring Experience *</label>
            <textarea
              required
              rows={3}
              placeholder="Tell others about the yarn softness, print sharpness, tailoring ease, or pre-shrinking results..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-stone-300 p-2 text-xs text-stone-900 focus:outline-stone-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-stone-900 text-white font-medium hover:bg-stone-800 cursor-pointer uppercase tracking-wider"
            >
              Submit Review
            </button>
          </div>
        </form>
      )}

      {formSubmitted && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>Thank you! Your verified fabric review has been published.</span>
        </div>
      )}

      {/* Existing Customer Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-stone-500 py-3">No reviews yet for this design. Be the first to review!</p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 bg-white border border-stone-200/90 rounded-xs space-y-2 text-xs shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <Star
                        key={st}
                        className={`w-3.5 h-3.5 ${
                          st <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                    <h5 className="font-semibold text-stone-900">{displayBrand(rev.title)}</h5>
                </div>

                <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
              </div>

              <p className="text-stone-700 leading-relaxed font-light">{rev.comment}</p>
                <p className="text-stone-700 leading-relaxed font-light">{displayBrand(rev.comment)}</p>

              {rev.fabricFeedback && (
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs">
                    Softness: {rev.fabricFeedback.softness}
                  </span>
                  <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-xs">
                    Dye: {rev.fabricFeedback.colorFastness}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5">
                    <span className="font-medium text-stone-800">{displayBrand(rev.author)}</span>
                  <span>({rev.city})</span>
                  {rev.verifiedPurchase && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium ml-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-stone-400 hover:text-stone-600 cursor-pointer">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Helpful</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
