"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/category" },
  ],
  help: [
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "/shipping" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">
              Ecommercely
            </Link>
            <p className="mt-4 text-sm text-slate-600 max-w-xs">
              Premium products for modern living. Quality meets design.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-all duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Newsletter</h4>
            <p className="text-sm text-slate-600 mb-3">Get updates and offers.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Email"
                className="rounded-xl flex-1"
              />
              <Button type="submit" size="icon" className="rounded-xl shrink-0">
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Ecommercely.</p>
          <div className="flex gap-6">
            {footerLinks.company.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-slate-500 hover:text-slate-900 transition-all duration-200"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
