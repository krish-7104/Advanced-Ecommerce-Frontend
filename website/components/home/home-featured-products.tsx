"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import axios from "axios";
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
        const response = await axios.get(
          `${BASE_API_URL}/product?featured=true&limit=4`
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
      <section className="py-12 border-b border-slate-100">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-lg mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
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
    <section className="py-12 border-b border-slate-100">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {products && products.length
            ? products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            : null}
        </div>
      </div>
    </section>
  );
};
