"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BASE_API_URL } from "@/helper/api-helper";
import { PaginationInfo, ProductVariantResponse } from "@/types/catalog.types";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(total - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < total - 2) pages.push("...");
    pages.push(total);

    return pages;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <Breadcrumb items={[{ label: "Products" }]} className="mb-3" />
          <h1 className="text-2xl font-semibold text-slate-900">
            All Products
          </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-10">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-lg mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>


            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="text-slate-600"
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
                        className={
                          currentPage === page
                            ? "bg-slate-900 text-white"
                            : "text-slate-600"
                        }
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="text-slate-600"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
