import { formatPrice } from "@/helper/common-functions";
import { ProductVariantResponse } from "@/types/catalog.types";
import { Heart, Package, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/redux/slices/wishlist.slice";
import { addToCart } from "@/redux/slices/cart.slice";
import { useState } from "react";

const ProductCard = ({ product }: { product: ProductVariantResponse }) => {
  if (!product) return null;

  const [addingToCart, setAddingToCart] = useState(false);

  const wishlist = useSelector((state: RootState) => state.wishlist.wishlist);
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const isInWishlist = wishlist?.some((item) => item.variantId === product.id);
  const isInCart = cart?.some((item) => item.variantId === product.id);

  const currentWishlist =
    wishlist?.find((item) => item.variantId === product.id) || null;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

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

  return (
    <Link href={`/product/${product.product.slug}`}>
      <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className="relative aspect-square bg-slate-50 flex items-center justify-center">
          {product.image?.url ? (
            <Image
              src={product.image.url}
              alt={product.product.name}
              fill
              className="object-contain p-8 transition-transform duration-300 group-hover:scale-105 mix-blend-multiply"
            />
          ) : (
            <Package className="h-14 w-14 text-slate-300" />
          )}
        </div>

        <div className="p-4">
          <p className="text-sm text-slate-600 line-clamp-1">
            {product.product.name}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-semibold text-slate-900">
              {formatPrice(Number(product.price))}
            </span>

            {product.hasDiscount && product.discountPercentage && (
              <span className="text-xs font-medium text-emerald-600">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 hover:bg-slate-100 cursor-pointer z-40"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
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
                  product.id,
                  wishlist,
                  isAuthenticated,
                );
              }
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isInWishlist && "fill-red-500 text-red-500",
              )}
            />
          </Button>

          {/* Add to Cart Button */}
          {isInCart ? (
            <Button
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push("/cart");
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Added in Cart
            </Button>
          ) : (
            <Button
              className="w-full mt-3"
              onClick={handleAddToCart}
              disabled={addingToCart || product.stockAvailable === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {addingToCart
                ? "Adding..."
                : product.stockAvailable === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
            </Button>
          )}
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
