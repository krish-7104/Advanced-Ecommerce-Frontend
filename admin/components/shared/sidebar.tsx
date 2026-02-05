"use client";

import { removeUserHandler } from "@/redux/actions";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { navigationConfig } from "@/constants/navigation";
import { useEffect, useState } from "react";
import { loginChecker } from "@/helper/LoginChecker";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const hiddenRoutes = ["login", "reset-password", "verify-token"];
  const isHidden = hiddenRoutes.some((r) => pathname.includes(r));

  // Navigation items are now imported from centralized constants
  const navItems = navigationConfig;

  const logoutHandler = () => {
    toast.loading("Logging out...");
    dispatch(removeUserHandler());
    localStorage.clear();
    router.replace("/login");
    toast.dismiss();
    toast.success("Logged out");
  };

  useEffect(() => {
    if (isHidden) return;
    loginChecker(setLoading, dispatch, router);
  }, [isHidden]);

  if (isHidden) return null;

  return (
    <aside className="h-screen w-72 bg-[#121317] border-r border-white/5 flex flex-col px-4 py-6">
      <div className="mb-8">
        <p className="text-lg font-semibold text-white tracking-tight">
          Ecommercely
        </p>
        <p className="text-xs text-gray-500">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
              {group.section}
            </p>

            <ul className="space-y-1">
              {group.items.map(({ title, route, icon: Icon }) => {
                const active = pathname === route;

                return (
                  <Link
                    key={route}
                    href={route}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
                      ${
                        active
                          ? "bg-[#1e1f25] text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#1a1b20]"
                      }
                    `}
                  >
                    <Icon size={18} />
                    {title}
                  </Link>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logoutHandler}
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-[#1a1b20] transition"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
