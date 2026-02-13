"use client";

import React, { useEffect, useState, useMemo } from "react";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductVariantResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["value"]>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_API_URL}/product?page=${currentPage}&limit=32`
        );
        if (response.data?.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        }
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/category?level=0`);
        if (response.data?.data) setCategories(response.data.data);
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    list = list.filter((p) => {
      const price = Number(p.price);
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (selectedCategories.length && p.product?.category?.id) {
        if (!selectedCategories.includes(p.product.category.id)) return false;
      }
      if (inStockOnly && p.stockAvailable <= 0) return false;
      return true;
    });
    if (sort === "price-asc")
      list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc")
      list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name")
      list.sort((a, b) =>
        (a.product?.name ?? "").localeCompare(b.product?.name ?? "")
      );
    return list;
  }, [products, priceRange, selectedCategories, inStockOnly, sort]);

  const categoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 500000]);
    setSelectedCategories([]);
    setInStockOnly(false);
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
            }))}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            selectedCategories={selectedCategories}
            onCategoryToggle={categoryToggle}
            inStockOnly={inStockOnly}
            onInStockToggle={setInStockOnly}
            onClear={clearFilters}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-slate-600">
                {loading
                  ? "Loading..."
                  : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
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
                      onClick={() => setSort(opt.value)}
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
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
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
