"use client";

import { useState } from "react";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/helper/common-functions";
import { useRouter } from "next/navigation";
import {
  updateQuantity,
  removeFromCart,
  clearCartDB,
} from "@/redux/slices/cart.slice";

export const CartSidebar = () => {
  const [open, setOpen] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  // Filter items that have variant data loaded
  const items =
    cart?.filter(
      (item) => item.variant !== null && item.variant !== undefined,
    ) ?? [];

  const count = items.length;
  const total = items.reduce((sum, item) => {
    if (!item.variant) return sum;
    const price = parseFloat(item.variant.price);
    return sum + price * item.quantity;
  }, 0);

  const handleUpdateQuantity = async (
    variantId: string,
    newQuantity: number,
  ) => {
    try {
      setUpdatingItem(variantId);
      await updateQuantity(
        dispatch,
        variantId,
        newQuantity,
        cart,
        isAuthenticated,
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (variantId: string) => {
    try {
      setUpdatingItem(variantId);
      await removeFromCart(dispatch, variantId, cart, isAuthenticated);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCartDB(dispatch, isAuthenticated);
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
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
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col p-0 w-full sm:max-w-md"
      >
        <SheetHeader className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <SheetTitle>Cart ({count})</SheetTitle>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 && (
            <div className="py-8 text-sm text-slate-500 text-center">
              Your cart is empty.
            </div>
          )}
          {items.length > 0 && (
            <div className="space-y-4">
              {items.map((item) => {
                if (!item.variant) return null;
                const price = parseFloat(item.variant.price);
                const subtotal = price * item.quantity;
                const isUpdating = updatingItem === item.variantId;

                return (
                  <div
                    key={item.variantId}
                    className="relative border border-slate-100 rounded-md p-3"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveItem(item.variantId)}
                      disabled={isUpdating}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-4 w-4 text-slate-500" />
                    </button>

                    <div className="flex gap-3">
                      <Link
                        href={`/product/${item.variant.product.slug}`}
                        className="flex-shrink-0"
                        onClick={() => setOpen(false)}
                      >
                        <div className="relative h-20 w-20 rounded-md bg-slate-50 overflow-hidden flex items-center justify-center">
                          {item.variant.image?.url ? (
                            <Image
                              src={item.variant.image.url}
                              alt={item.variant.product.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              No Image
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0 pr-6">
                        <Link
                          href={`/product/${item.variant.product.slug}`}
                          className="block text-sm font-medium text-slate-900 line-clamp-2 hover:text-slate-700"
                          onClick={() => setOpen(false)}
                        >
                          {item.variant.product.name}{" "}
                          {Object.entries(item.variant.attributes).map(
                            ([key, value]) => (
                              <span key={key}>{value + " "}</span>
                            ),
                          )}
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

                        {/* Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center border border-slate-100 rounded-sm">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.variantId,
                                  item.quantity - 1,
                                )
                              }
                              disabled={isUpdating || item.quantity <= 1}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-slate-900 border-x border-slate-100 min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.variantId,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                isUpdating ||
                                item.quantity >= item.variant.stockAvailable
                              }
                              className="px-2 py-1 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">
                Total
              </span>
              <span className="text-lg font-bold text-slate-900">
                {formatPrice(total)}
              </span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
