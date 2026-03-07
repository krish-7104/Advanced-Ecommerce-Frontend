"use client";

import { useEffect, useState, useMemo } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  Package,
  ShoppingCart,
  Heart,
  ChevronLeft,
  Check,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { BASE_API_URL } from "@/helper/api-helper";
import {
  ProductDetailResponse,
  ProductVariantDetail,
} from "@/types/catalog.types";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatPrice } from "@/helper/common-functions";
import { cn } from "@/lib/utils";
import { addToCart } from "@/redux/slices/cart.slice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/slices/wishlist.slice";
import { Rating } from "@/components/ui/rating";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProductDetailPage = () => {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const slug = params.slug as string;
  const searchParams = useSearchParams();

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [fetchingReviews, setFetchingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const { isAuthenticated, user: currentUser } = useSelector(
    (state: RootState) => state.user,
  );

  useEffect(() => {}, []);

  // Find variant matching selected attributes
  const selectedVariant = useMemo(() => {
    if (!product || Object.keys(selectedAttributes).length === 0) return null;

    return (
      product.variants.find((variant) => {
        return Object.keys(selectedAttributes).every(
          (key) => variant.attributes[key] === selectedAttributes[key],
        );
      }) || null
    );
  }, [product, selectedAttributes]);

  // Fetch reviews when selectedVariant changes
  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedVariant) return;
      try {
        setFetchingReviews(true);
        const response = await axios.get(
          `${BASE_API_URL}/review/variant/${selectedVariant.id}`,
        );
        if (response.data?.data) {
          setReviews(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setFetchingReviews(false);
      }
    };

    fetchReviews();
  }, [selectedVariant]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || !isAuthenticated) return;

    try {
      setSubmittingReview(true);
      const response = await axios.post(
        `${BASE_API_URL}/review/${selectedVariant.id}`,
        reviewForm,
        { withCredentials: true },
      );
      if (response.data?.success) {
        // Refresh reviews
        const res = await axios.get(
          `${BASE_API_URL}/review/variant/${selectedVariant.id}`,
        );
        setReviews(res.data.data);
        setIsReviewDialogOpen(false);
        setReviewForm({ rating: 5, title: "", comment: "" });
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get available options for each attribute based on current selections
  const getAvailableOptions = (attributeName: string): string[] => {
    if (!product) return [];

    const matchingVariants = product.variants.filter((variant) => {
      return Object.keys(selectedAttributes)
        .filter((key) => key !== attributeName)
        .every((key) => variant.attributes[key] === selectedAttributes[key]);
    });

    return [
      ...new Set(matchingVariants.map((v) => v.attributes[attributeName])),
    ].filter(Boolean);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_API_URL}/product/slug/${slug}`,
        );
        if (response.data?.data) {
          const productData = response.data.data;
          setProduct(productData);

          // Set default variant's attributes as initial selection
          const defaultVariant =
            productData.variants.find(
              (v: ProductVariantDetail) => v.isDefault,
            ) || productData.variants[0];
          if (defaultVariant) {
            setSelectedAttributes(defaultVariant.attributes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    // Only add if not already in cart
    if (isInCart) return;

    try {
      setAddingToCart(true);
      await addToCart(dispatch, selectedVariant.id, quantity, isAuthenticated);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const isInWishlist = selectedVariant
    ? wishlist?.some((item) => item.variantId === selectedVariant.id)
    : false;

  const isInCart = selectedVariant
    ? cart?.some((item) => item.variantId === selectedVariant.id)
    : false;

  const currentWishlist =
    wishlist?.find((item) => item.variantId === selectedVariant?.id) || null;

  const handleWishlistToggle = async () => {
    if (!selectedVariant) return;

    if (isInWishlist) {
      await removeFromWishlist(
        dispatch,
        currentWishlist,
        wishlist,
        isAuthenticated,
      );
    } else {
      await addToWishlist(
        dispatch,
        selectedVariant.id,
        wishlist,
        isAuthenticated,
      );
    }
  };

  const handleAttributeChange = (attributeName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
    params.set(attributeName, value);
    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-pulse space-y-8">
            <div className="h-5 w-48 bg-slate-100 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div className="aspect-square bg-slate-100 rounded-2xl" />
              <div className="space-y-6">
                <div className="h-9 w-3/4 bg-slate-100 rounded-xl" />
                <div className="h-8 w-1/2 bg-slate-100 rounded-xl" />
                <div className="h-24 bg-slate-100 rounded-2xl" />
                <div className="h-14 bg-slate-100 rounded-2xl w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Product not found
            </h2>
            <p className="text-slate-500 mb-6">
              The product you're looking for doesn't exist.
            </p>
            <Link href="/products">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const price = selectedVariant ? Number(selectedVariant.price) : 0;
  const mrp = selectedVariant?.mrp ? Number(selectedVariant.mrp) : null;
  const isOutOfStock = !selectedVariant || selectedVariant.stockAvailable === 0;

  const averageRating = reviews.length
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Breadcrumb
            items={[
              { label: "Products", href: "/products" },
              {
                label: product.category.name,
                href: `/category/${product.category.slug}`,
              },
              { label: product.name },
            ]}
            className="mb-3"
          />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center shadow-[var(--shadow-card)]">
              {selectedVariant?.image?.url ? (
                <Image
                  src={selectedVariant.image.url}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <Package className="h-24 w-24 text-slate-300" />
              )}
            </div>

            {/* Variant Images Thumbnails */}
            {selectedVariant?.images && selectedVariant.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {selectedVariant.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden"
                  >
                    <Image
                      src={img.url}
                      alt={product.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <Link
                  href={`/category/${product.category.slug}`}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {product.category.name}
                </Link>
                {reviews.length > 0 && (
                  <Rating
                    rating={averageRating}
                    reviewCount={reviews.length}
                    showValue
                    size="sm"
                  />
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">
                {formatPrice(price)}
              </span>
              {selectedVariant?.hasDiscount && mrp && (
                <>
                  <span className="text-xl text-slate-500 line-through">
                    {formatPrice(mrp)}
                  </span>
                  <span className="text-lg font-semibold text-emerald-600">
                    {selectedVariant.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Attribute Selectors */}
            {product.attributesSchema &&
              Object.keys(product.attributesSchema).length > 0 && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  {Object.entries(product.attributesSchema).map(
                    ([name, values]) => {
                      const availableOptions = getAvailableOptions(name);
                      return (
                        <div key={name}>
                          <h3 className="text-sm font-semibold text-slate-900 mb-3">
                            {name}:{" "}
                            <span className="font-normal text-slate-600">
                              {selectedAttributes[name] || "Select"}
                            </span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {values.map((value) => {
                              const isAvailable =
                                availableOptions.includes(value);
                              const isSelected =
                                selectedAttributes[name] === value;

                              return (
                                <button
                                  key={value}
                                  onClick={() =>
                                    isAvailable &&
                                    handleAttributeChange(name, value)
                                  }
                                  disabled={!isAvailable}
                                  className={cn(
                                    "px-4 py-2 rounded-xl border-2 font-medium transition-all duration-200 text-sm",
                                    isSelected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : isAvailable
                                        ? "border-slate-200 hover:border-primary/50 text-slate-900"
                                        : "border-slate-100 text-slate-400 cursor-not-allowed opacity-50",
                                  )}
                                >
                                  {value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

            {/* Description */}
            {product.description && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Description
                </h3>
                <div
                  className="text-slate-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              {selectedVariant && !isOutOfStock && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-900">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 py-2.5 text-slate-900 font-medium border-x border-slate-200 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            selectedVariant.stockAvailable,
                            quantity + 1,
                          ),
                        )
                      }
                      className="px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                      disabled={quantity >= selectedVariant.stockAvailable}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={async () => {
                    if (!isInCart && selectedVariant) {
                      await addToCart(
                        dispatch,
                        selectedVariant.id,
                        quantity,
                        isAuthenticated,
                      );
                    }
                    router.push("/checkout");
                  }}
                  disabled={isOutOfStock || !selectedVariant}
                  className="flex-1 h-12 rounded-2xl w-full sm:w-auto transition-all duration-200"
                  size="lg"
                >
                  {isOutOfStock ? "Out of Stock" : "Buy Now"}
                </Button>
                <Button
                  variant={isInCart ? "default" : "outline"}
                  onClick={() =>
                    isInCart ? router.push("/checkout") : handleAddToCart()
                  }
                  disabled={isOutOfStock || addingToCart || !selectedVariant}
                  className={cn(
                    "flex-1 h-12 rounded-2xl w-full sm:w-auto transition-all duration-200",
                    isInCart &&
                      "bg-emerald-600 hover:bg-emerald-700 text-white",
                  )}
                  size="lg"
                >
                  {isInCart ? (
                    <Check className="h-5 w-5 mr-2" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 mr-2" />
                  )}
                  {addingToCart
                    ? "Adding..."
                    : isInCart
                      ? "Go to Cart"
                      : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className="h-12 w-12 rounded-2xl shrink-0 transition-all duration-200"
                  disabled={!selectedVariant}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      isInWishlist && "fill-red-500 text-red-500",
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t border-slate-100 pt-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-3">
                <Rating rating={averageRating} size="lg" />
                <span className="text-slate-600 font-medium">
                  {averageRating.toFixed(1)} out of 5 based on {reviews.length}{" "}
                  reviews
                </span>
              </div>
            </div>

            <Dialog
              open={isReviewDialogOpen}
              onOpenChange={setIsReviewDialogOpen}
            >
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  if (isAuthenticated) {
                    setIsReviewDialogOpen(true);
                  } else {
                    router.push(`/login?redirect=${pathname}`);
                  }
                }}
              >
                Write a Review
              </Button>
              <DialogContent className="sm:max-w-125 rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Write a Review
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleReviewSubmit} className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-900">
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
                          className="focus:outline-none"
                        >
                          <Star
                            className={cn(
                              "h-8 w-8 transition-all duration-200",
                              star <= reviewForm.rating
                                ? "fill-amber-400 text-amber-400 scale-110"
                                : "fill-slate-100 text-slate-100 hover:fill-slate-200",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">
                      Title
                    </label>
                    <Input
                      placeholder="Review title"
                      value={reviewForm.title}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          title: e.target.value,
                        })
                      }
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900">
                      Review
                    </label>
                    <textarea
                      placeholder="Share your thoughts about the product..."
                      rows={5}
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          comment: e.target.value,
                        })
                      }
                      className="flex min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-8">
            {fetchingReviews ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse space-y-3">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                    <div className="h-6 w-full bg-slate-50 rounded" />
                    <div className="h-4 w-2/3 bg-slate-50 rounded" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="group pb-8 border-b border-slate-50 last:border-0"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm uppercase">
                          {review.user.firstName?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none mb-1 flex items-center gap-2">
                            {review.user.firstName} {review.user.lastName}
                            {review.isVerified && (
                              <span
                                className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white"
                                title="Verified Purchase"
                              >
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </p>
                          <Rating rating={review.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {review.title && (
                          <h4 className="font-bold text-slate-900">
                            {review.title}
                          </h4>
                        )}
                        {review.isVerified && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <Star className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  No reviews yet
                </h3>
                <p className="text-slate-500">
                  Be the first to share your thoughts on this product!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
