"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Grid3X3, ChevronRight } from "lucide-react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_API_URL } from "@/helper/api-helper";
import { CategoryResponse } from "@/types/catalog.types";
import PageTitleComponent from "@/components/page-title";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_API_URL}/category`);
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

  const parentCategories = categories.filter(
    (c) => c.level === 0 || !c.parentId,
  );
  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-slate-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="container mx-auto max-w-7xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="w-28 shrink-0">
                    <Skeleton className="aspect-square rounded-lg mb-2" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PageTitleComponent
        title="All Categories"
        breadcrumbItems={[{ label: "All Categories" }]}
      />

      <div className="container mx-auto max-w-7xl">
        {parentCategories.length === 0 ? (
          <div className="text-center py-12">
            <Grid3X3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No categories found</p>
          </div>
        ) : (
          <div className="space-y-12">
            {parentCategories.map((parent) => {
              const subcategories = getSubcategories(parent.id);

              return (
                <section key={parent.id}>
                  <div className="flex items-center justify-between mb-5">
                    <Link
                      href={`/category/${parent.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      {parent.image?.url ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-50 shrink-0">
                          <Image
                            src={parent.image.url}
                            alt={parent.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-100 shrink-0">
                          <Grid3X3 className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-slate-600">
                        {parent.name}
                      </h2>
                    </Link>
                    <Link
                      href={`/category/${parent.id}`}
                      className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {subcategories.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.id}`}
                          className="shrink-0 w-28 group"
                        >
                          <div className="aspect-square rounded-lg bg-slate-50 overflow-hidden mb-2 border border-slate-50 relative">
                            {sub.image?.url ? (
                              <Image
                                src={sub.image.url}
                                alt={sub.name}
                                width={112}
                                height={112}
                                className="w-full h-full object-contain p-3"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Grid3X3 className="h-8 w-8 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 text-center truncate group-hover:text-slate-900">
                            {sub.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No subcategories</p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
