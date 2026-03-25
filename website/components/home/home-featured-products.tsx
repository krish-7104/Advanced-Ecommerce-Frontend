"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import apiHelper from "@/helper/axios-helper";
import { BASE_API_URL } from "@/helper/api-helper";
import { ProductVariantResponse } from "@/types/catalog.types";
import ProductCard from "../product-card";
import { Skeleton } from "@/components/ui/skeleton";

export const HomeFeaturedProducts = () => {
  const [products, setProducts] = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await apiHelper.get(
          `/product?featured=true&limit=4`
        );
        if (response.data?.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 border-b border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
            <Skeleton className="h-5 w-24 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-2xl mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2 rounded-lg" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 border-b border-slate-100">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:text-primary/90 flex items-center gap-1 transition-all duration-200"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
