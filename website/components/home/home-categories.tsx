"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3, ChevronRight } from "lucide-react";
import apiHelper from "@/helper/axios-helper";
import { BASE_API_URL } from "@/helper/api-helper";
import { CategoryResponse } from "@/types/catalog.types";
import { Skeleton } from "@/components/ui/skeleton";

export const HomeCategories = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiHelper.get(`/category?level=0`);
        if (response.data?.data) {
          setCategories(response.data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 border-b border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <Skeleton className="h-7 w-44 mb-8 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] rounded-2xl mb-3" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 border-b border-slate-100">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
          <Link
            href="/category"
            className="text-sm font-medium text-primary hover:text-primary/90 flex items-center gap-1 transition-all duration-200"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group block rounded-2xl overflow-hidden bg-slate-50 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                {category.image?.url ? (
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Grid3X3 className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>
              <h3 className="p-4 text-sm font-medium text-slate-900 group-hover:text-primary transition-colors duration-200">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
