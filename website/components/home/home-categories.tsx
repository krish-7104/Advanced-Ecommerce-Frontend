"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3, ChevronRight } from "lucide-react";
import axios from "axios";
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
        const response = await axios.get(`${BASE_API_URL}/category?level=0`);
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
      <section className="py-12 border-b border-slate-100">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="aspect-4/3 rounded mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
    <section className="py-12 border-b border-slate-100">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Shop by Category
          </h2>
          <Link
            href="/category"
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group block"
            >
              <div className="aspect-4/3 rounded-lg bg-slate-50 overflow-hidden mb-2 border border-slate-100 relative">
                {category.image?.url ? (
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Grid3X3 className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-slate-800 group-hover:text-slate-600">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
