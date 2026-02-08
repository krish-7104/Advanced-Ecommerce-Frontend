"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Package, ShoppingCart, Heart, ChevronLeft, Check } from "lucide-react";
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

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

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
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-slate-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-10 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-6 w-1/2 bg-slate-200 rounded"></div>
                <div className="h-24 bg-slate-200 rounded"></div>
                <div className="h-12 bg-slate-200 rounded"></div>
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

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-6">
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

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
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
                    className="relative aspect-square bg-slate-50 rounded-lg border border-slate-200 overflow-hidden"
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
              <Link
                href={`/category/${product.category.slug}`}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {product.category.name}
              </Link>
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
                <div className="border-t border-slate-200 pt-6 space-y-4">
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
                                    "px-4 py-2 rounded-lg border-2 font-medium transition-all text-sm",
                                    isSelected
                                      ? "border-slate-900 bg-slate-900 text-white"
                                      : isAvailable
                                        ? "border-slate-300 hover:border-slate-400 text-slate-900"
                                        : "border-slate-200 text-slate-400 cursor-not-allowed opacity-50",
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
              <div className="border-t border-slate-200 pt-6">
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
            <div className="border-t border-slate-200 pt-6 space-y-4">
              {selectedVariant && !isOutOfStock && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-900">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-slate-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-6 py-2 text-slate-900 font-medium border-x border-slate-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            selectedVariant.stockAvailable,
                            quantity + 1,
                          ),
                        )
                      }
                      className="px-4 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
                      disabled={quantity >= selectedVariant.stockAvailable}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    // Add to cart and proceed to checkout
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
                  className="flex-1 h-12"
                  size="lg"
                >
                  {isOutOfStock ? "Out of Stock" : "Buy Now"}
                </Button>
                <Button
                  variant={isInCart ? "default" : "outline"}
                  onClick={() =>
                    isInCart ? router.push("/cart") : handleAddToCart()
                  }
                  disabled={isOutOfStock || addingToCart || !selectedVariant}
                  className={cn(
                    "flex-1 h-12",
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
                  className="h-12 w-12"
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
      </div>
    </div>
  );
};

export default ProductDetailPage;
