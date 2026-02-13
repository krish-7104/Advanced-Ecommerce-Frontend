"use client";

import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/helper/common-functions";
import { addToCart } from "@/redux/slices/cart.slice";

export const WishlistSidebar = () => {
  const [open, setOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  // Filter items that have variant data loaded
  const items = wishlist?.filter((item) => item.variant !== null && item.variant !== undefined) ?? [];
  
  const count = items.length;

  const handleAddToCart = async (variantId: string) => {
    try {
      setAddingToCart(variantId);
      await addToCart(
        dispatch,
        variantId,
        1,
        isAuthenticated
      );
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          <Heart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-slate-100">
          <SheetTitle>Wishlist</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 && (
            <div className="py-8 text-sm text-slate-500">
              Your wishlist is empty.
            </div>
          )}
          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => {
                if (!item.variant) return null;
                const price = parseFloat(item.variant.price);
                const isInCart = cart?.some((cartItem) => cartItem.variantId === item.variantId);
                
                return (
                  <div
                    key={item.variantId}
                    className="flex gap-3 border border-slate-100 rounded-md p-3"
                  >
                    <Link
                      href={`/product/${item.variant.product.slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative h-16 w-16 rounded-md bg-slate-50 overflow-hidden flex items-center justify-center">
                        {item.variant.image?.url ? (
                          <Image
                            src={item.variant.image.url}
                            alt={item.variant.product.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No Image</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.variant.product.slug}`}
                        className="block text-sm font-medium text-slate-900 line-clamp-1"
                      >
                        {item.variant.product.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatPrice(price)}
                        </span>
                        {item.variant.hasDiscount &&
                          item.variant.discountPercentage && (
                            <span className="text-xs font-medium text-emerald-600">
                              {item.variant.discountPercentage}% OFF
                            </span>
                          )}
                      </div>
                      <Button
                        size="sm"
                        className="mt-2 w-full h-8"
                        onClick={() => handleAddToCart(item.variantId)}
                        disabled={addingToCart === item.variantId || item.variant.stockAvailable === 0}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {addingToCart === item.variantId 
                          ? "Adding..." 
                          : isInCart 
                          ? "Added to Cart" 
                          : item.variant.stockAvailable === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

