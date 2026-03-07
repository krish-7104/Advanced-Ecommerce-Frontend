"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import apiHelper from "@/helper/axios-helper";
import { toast } from "sonner";
import {
  Star,
  MessageSquare,
  Package,
  ChevronRight,
  Check,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import Image from "next/image";
import Link from "next/link";
import Loader from "@/components/loader";

interface UserReview {
  id: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
  variant: {
    id: string;
    product: {
      name: string;
      slug: string;
    };
    image: {
      url: string;
    } | null;
    attributes: Record<string, string>;
  };
}

export default function MyReviewsPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        setLoading(true);
        const response = await apiHelper.get("/review/mine");
        if (response.data?.data) {
          setReviews(response.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch reviews:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load your reviews",
        );
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchMyReviews();
    }
  }, [isAuthenticated]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await apiHelper.delete(`/review/${reviewId}`);
      if (response.data?.success) {
        toast.success("Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      toast.error(err?.response?.data?.message || "Failed to delete review");
    }
  };

  const handleEditClick = (review: UserReview) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title || "",
      comment: review.comment,
    });
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      setSubmitting(true);
      const response = await apiHelper.patch(
        `/review/${editingReview.id}`,
        reviewForm,
      );
      if (response.data?.success) {
        toast.success("Review updated successfully");
        setReviews((prev) =>
          prev.map((r) =>
            r.id === editingReview.id
              ? {
                  ...r,
                  rating: reviewForm.rating,
                  title: reviewForm.title,
                  comment: reviewForm.comment,
                }
              : r,
          ),
        );
        setEditingReview(null);
      }
    } catch (err: any) {
      console.error("Failed to update review:", err);
      toast.error(err?.response?.data?.message || "Failed to update review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link
              href="/my-account"
              className="hover:text-blue-600 transition-colors"
            >
              My Account
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 font-medium">My Reviews</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">My Reviews</h1>
          <p className="text-slate-500">History of all reviews you've shared</p>
        </div>

        {reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-slate-500 text-center max-w-sm mb-6">
                You haven't reviewed any products yet. Share your thoughts on
                your purchases to help others!
              </p>
              <Link href="/my-account/orders">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View Recent Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Product Info Sidebar */}
                    <div className="w-full md:w-56 bg-slate-50/50 p-4 border-b md:border-b-0 md:border-r border-slate-100">
                      <div className="flex flex-col gap-4">
                        <div className="relative aspect-square w-20 mx-auto md:mx-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                          {review.variant.image?.url ? (
                            <Image
                              src={review.variant.image.url}
                              alt={review.variant.product.name}
                              fill
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-8 w-8 text-slate-200" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/product/${review.variant.product.slug}`}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors block leading-tight mb-2"
                          >
                            {review.variant.product.name}
                          </Link>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(review.variant.attributes).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-[10px] bg-white"
                                >
                                  {key}: {value}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-lg">
                                {review.title || ""}
                              </h3>
                              {review.isVerified && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                                  <Check className="h-3 w-3 mr-1" /> Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed mb-4 line-clamp-2">
                          {review.comment}
                        </p>
                        <Rating rating={review.rating} size="sm" />
                        <div className="mt-auto pt-2 border-t border-slate-50 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(review)}
                              className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                              title="Edit Review"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <Link
                            href={`/product/${review.variant.product.slug}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              View Product Page{" "}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setEditingReview(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Edit Your Review
                </h3>
                <p className="text-slate-500 text-sm">
                  Reviewing {editingReview.variant.product.name}
                </p>
              </div>
              <button
                onClick={() => setEditingReview(null)}
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateReview} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewForm({ ...reviewForm, rating: star })
                      }
                      className="focus:outline-none group"
                    >
                      <Star
                        className={`h-10 w-10 transition-all duration-200 ${
                          star <= reviewForm.rating
                            ? "fill-amber-400 text-amber-400 scale-110 shadow-star"
                            : "fill-slate-100 text-slate-100 group-hover:fill-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, title: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                  placeholder="Review title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none font-medium min-h-[120px]"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Review"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Button({ className, variant, size, children, ...props }: any) {
  const variants: any = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline:
      "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
    ghost: "hover:bg-slate-100 text-slate-600",
  };
  const sizes: any = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 ${variants[variant || "default"]} ${sizes[size || "default"]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
