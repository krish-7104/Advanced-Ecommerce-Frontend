"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Package, ChevronDown } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASE_API_URL } from "@/helper/api-helper";
import {
  PaginationInfo,
  ProductVariantResponse,
  CategoryResponse,
} from "@/types/catalog.types";
import ProductCard from "@/components/product-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
] as const;

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductVariantResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>(
    (searchParams.get("sort") as any) || "newest"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 500000,
  ]);
  const initialCategory = searchParams.get("categoryId");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true"
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("limit", "32");
        if (sort !== "newest") params.set("sort", sort);
        if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
        if (priceRange[1] < 500000) params.set("maxPrice", priceRange[1].toString());
        if (selectedCategories.length > 0) {
          params.set("categoryId", selectedCategories[0]);
        }
        if (inStockOnly) params.set("inStock", "true");

        // Sync URL without reloading
        router.replace(`?${params.toString()}`, { scroll: false });

        const response = await axios.get(
          `${BASE_API_URL}/product?${params.toString()}`
        );
        if (response.data?.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
        }
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        }
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, sort, priceRange, selectedCategories, inStockOnly, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/category`);
        if (response.data?.data) setCategories(response.data.data);
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  const categoryToggle = (id: string) => {
    // Only allow one category selection for simplicity corresponding to backend "categoryId" schema,
    // or toggle off if same category is clicked again.
    setSelectedCategories((prev) =>
      prev.includes(id) ? [] : [id]
    );
    setCurrentPage(1); // Reset page on filter change
  };

  const clearFilters = () => {
    setPriceRange([0, 500000]);
    setSelectedCategories([]);
    setInStockOnly(false);
    setSort("newest");
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(total - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Breadcrumb items={[{ label: "Products" }]} className="mb-2" />
          <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-8">
          <FilterSidebar
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              parentId: c.parentId,
              level: c.level,
            }))}
            priceRange={priceRange}
            onPriceChange={(range) => {
              setPriceRange(range);
              setCurrentPage(1);
            }}
            selectedCategories={selectedCategories}
            onCategoryToggle={categoryToggle}
            inStockOnly={inStockOnly}
            onInStockToggle={(val) => {
              setInStockOnly(val);
              setCurrentPage(1);
            }}
            onClear={clearFilters}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-slate-600">
                {loading
                  ? "Loading..."
                  : `${products.length} product${products.length !== 1 ? "s" : ""}`}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 w-full sm:w-auto"
                  >
                    {currentSortLabel}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-2xl shadow-[var(--shadow-soft)] w-48"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setCurrentPage(1);
                      }}
                      className="rounded-lg cursor-pointer"
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-square rounded-2xl mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2 rounded-lg" />
                    <Skeleton className="h-5 w-1/2 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="rounded-xl"
                    >
                      Previous
                    </Button>
                    {getPageNumbers().map((page, idx) => (
                      <React.Fragment key={idx}>
                        {page === "..." ? (
                          <span className="px-2 text-slate-400">...</span>
                        ) : (
                          <Button
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(page as number)}
                            className="rounded-xl"
                          >
                            {page}
                          </Button>
                        )}
                      </React.Fragment>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="rounded-xl"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Package}
                title="No products found"
                description="Try adjusting filters or browse all products."
                actionLabel="Clear filters"
                onAction={clearFilters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
