"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeCategories } from "@/components/home/home-categories";
import { HomeFeaturedProducts } from "@/components/home/home-featured-products";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-2xl px-4 py-1.5 text-sm font-medium mb-6">
              New Collection 2026
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Premium products for modern living
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mb-8">
              Curated collection of premium electronics, fashion, and accessories. Quality meets design in every product.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="rounded-2xl h-12 px-8 text-base transition-all duration-200">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-2xl h-12 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200" asChild>
                <Link href="/category">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <HomeCategories />

      <HomeFeaturedProducts />

      <section className="py-16 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <Link
            href="/products"
            className="block rounded-2xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 text-center transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Summer Sale</h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">Up to 30% off on selected items. Limited time only.</p>
            <Button variant="secondary" size="lg" className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
              Shop Sale
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 border-t border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                <Truck className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Free Shipping</h3>
              <p className="text-sm text-slate-600">On orders over ₹2,000</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                <Shield className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Secure Payment</h3>
              <p className="text-sm text-slate-600">100% secure checkout</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-2xl bg-slate-100 p-4 mb-4">
                <CreditCard className="h-8 w-8 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Easy Returns</h3>
              <p className="text-sm text-slate-600">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
