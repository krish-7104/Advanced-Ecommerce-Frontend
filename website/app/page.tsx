"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeCategories } from "@/components/home/home-categories";
import { HomeFeaturedProducts } from "@/components/home/home-featured-products";
import Loader from "@/components/loader";

const HomePage = () => {
  return (
    <div className="flex flex-col bg-white">
      <section className="border-b border-slate-100">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-slate-100 rounded px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              <span className="text-slate-700 text-sm">
                New Collection 2026
              </span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight mb-4">
              Premium products for modern living
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mb-6">
              Curated collection of premium electronics, fashion, and
              accessories. Quality meets design in every product.
            </p>
            <div className="flex gap-3">
              <Link href="/products">
                <Button
                  size="lg"
                  className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded"
                >
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 border-slate-200 text-slate-700 hover:bg-slate-50 rounded"
                asChild
              >
                <Link href="/category">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <HomeCategories />
      <HomeFeaturedProducts />
    </div>
  );
};

export default HomePage;
