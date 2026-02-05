"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { loginChecker } from "@/helper/login-checker";
import { fetchCart, setCart } from "@/redux/slices/cart.slice";
import { fetchWishlist, setWishlist } from "@/redux/slices/wishlist.slice";

export function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [wishlistInitialized, setWishlistInitialized] = useState(false);
  const [cartInitialized, setCartInitialized] = useState(false);

  useEffect(() => {
    if (hasChecked) return;

    const checkAuth = async () => {
      const isAuthPage =
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password";

      const publicPages = ["/", "/product", "/category"];
      const skipRedirect = publicPages.includes(pathname);

      if (!isAuthPage) {
        await loginChecker(setIsLoading, dispatch, router, skipRedirect);
      }
      setHasChecked(true);
    };

    checkAuth();
  }, [dispatch, router, pathname, hasChecked]);

  useEffect(() => {
    if (hasChecked && !wishlistInitialized) {
      const initWishlist = async () => {
        if (isAuthenticated) {
          await fetchWishlist(dispatch);
        } else {
            dispatch(setWishlist(null));
        }
        setWishlistInitialized(true);
      };
      initWishlist();
    }
  }, [dispatch, isAuthenticated, hasChecked, wishlistInitialized]);

  useEffect(() => {
    if (hasChecked && !cartInitialized) {
      const initCart = async () => {
        if (isAuthenticated) {
            await fetchCart(dispatch);
        } else {
            dispatch(setCart(null));
        }
        setCartInitialized(true);
      };
      initCart();
    }
  }, [dispatch, isAuthenticated, hasChecked, cartInitialized]);

  return null;
}
