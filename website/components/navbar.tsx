"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/slices/user.slice";
import apiHelper from "@/helper/axios-helper";
import { toast } from "sonner";
import { Package, LogOut, ShoppingCart, User, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WishlistSidebar } from "@/components/wishlist-sidebar";
import { CartSidebar } from "@/components/cart-sidebar";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user,
  );

  const handleLogout = async () => {
    try {
      toast.dismiss();
      await apiHelper.post("/auth/logout");
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      dispatch(logout());
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while logging out",
      );
      router.push("/login");
    }
  };

  const getInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.charAt(0) || ""}${
      user.lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const isOnAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/verify-email";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Ecommercely
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <WishlistSidebar />

            {isAuthenticated && <CartSidebar />}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-xl hover:bg-slate-50 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8 border border-slate-100 rounded-xl">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
                        alt={user?.firstName || "User"}
                      />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white border-slate-100 rounded-2xl shadow-(--shadow-soft)"
                  align="end"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-slate-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => router.push("/my-account")}
                    className="text-slate-600 focus:text-slate-900 focus:bg-slate-50 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={() => router.push("/orders")}
                    className="text-slate-600 focus:text-slate-900 focus:bg-slate-50 cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={() => router.push("/my-account/reviews")}
                    className="text-slate-600 focus:text-slate-900 focus:bg-slate-50 cursor-pointer"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    My Reviews
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {!isOnAuthPage ? (
                  <div className="hidden sm:flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/login")}
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => router.push("/register")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-200"
                    >
                      Sign Up
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
