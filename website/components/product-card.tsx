"use client";

import { formatPrice } from "@/helper/common-functions";
import { ProductVariantResponse } from "@/types/catalog.types";
import { Heart, Package, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/slices/wishlist.slice";
import { addToCart } from "@/redux/slices/cart.slice";
import { useState } from "react";

interface ProductCardProps {
  product: ProductVariantResponse;
  secondaryImageUrl?: string | null;
}

export default function ProductCard({ product, secondaryImageUrl = null }: ProductCardProps) {
  if (!product) return null;

  const [addingToCart, setAddingToCart] = useState(false);
  const [hover, setHover] = useState(false);

  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const isInWishlist = wishlist?.some((item) => item.variantId === product.id);
  const isInCart = cart?.some((item) => item.variantId === product.id);
  const currentWishlist =
    wishlist?.find((item) => item.variantId === product.id) || null;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const primaryUrl = product.image?.url;
  const displayUrl = hover && secondaryImageUrl ? secondaryImageUrl : primaryUrl;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAddingToCart(true);
      await addToCart(dispatch, product.id, 1, isAuthenticated);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      await removeFromWishlist(dispatch, currentWishlist, wishlist, isAuthenticated);
    } else {
      await addToWishlist(dispatch, product.id, wishlist, isAuthenticated);
    }
  };

  return (
    <Link href={`/product/${product.product.slug}`}>
      <article
        className="group relative overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={product.product.name}
              fill
              className="object-contain p-6 transition-all duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <Package className="h-16 w-16 text-slate-300" />
          )}
          {product.hasDiscount && product.discountPercentage && (
            <Badge className="absolute top-3 left-3 rounded-xl bg-primary text-primary-foreground text-xs">
              {product.discountPercentage}% OFF
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-9 w-9 rounded-xl bg-white/90 hover:bg-white shadow-sm z-10"
            onClick={handleWishlistToggle}
          >
            <Heart
              className={cn("h-4 w-4", isInWishlist && "fill-red-500 text-red-500")}
            />
          </Button>
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {isInCart ? (
              <Button
                size="sm"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push("/checkout");
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Go to Cart
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full rounded-xl"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stockAvailable === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {addingToCart ? "Adding..." : product.stockAvailable === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            )}
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm font-medium text-slate-900 line-clamp-2">
            {product.product.name}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">
              {formatPrice(Number(product.price))}
            </span>
            {product.mrp && Number(product.mrp) > Number(product.price) && (
              <span className="text-sm text-slate-500 line-through">
                {formatPrice(Number(product.mrp))}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
