"use client";

import { useEffect, useState } from "react";
import apiHelper from "@/helper/axios-helper";
import { Skeleton } from "@/components/ui/skeleton";
import { BASE_API_URL } from "@/helper/api-helper";
import { ProductResponse, ProductVariantResponse } from "@/types/catalog.types";
import { useParams } from "next/navigation";
import PageTitleComponent from "@/components/page-title";
import ProductCard from "@/components/product-card";

interface CategoryVariant {
  id: string;
  sku: string;
  price: string;
  mrp: string | null;
  stockAvailable: number;
  isDefault: boolean;
  attributes: Record<string, string>;
}

interface CategoryProduct extends ProductResponse {
  variants: CategoryVariant[];
  images: {
    id: string;
    fileName: string;
    isPrimary: boolean;
    url: string;
  }[];
}

const CategoriesPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiHelper.get(
          `/product/category/${slug}`,
        );
        if (response.data?.data) {
          setProducts(response.data.data);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

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
        title={products[0]?.category.name || "Category"}
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/category" },
          {
            label: products[0]?.category.name || slug,
          },
        ]}
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No products found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              if (!product.variants || product.variants.length === 0) {
                return null;
              }

              const defaultVariant =
                product.variants.find((v) => v.isDefault) ||
                product.variants[0];

              if (!defaultVariant) return null;

              const cardVariant: ProductVariantResponse = {
                id: defaultVariant.id,
                sku: defaultVariant.sku,
                price: defaultVariant.price,
                mrp: defaultVariant.mrp,
                stockAvailable: defaultVariant.stockAvailable,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  description: product.description,
                  category: product.category,
                },
                hasDiscount: false,
                discountPercentage: null,
                image: product.images?.[0] || null,
                attributes: [defaultVariant.attributes],
              };

              const secondaryImageUrl =
                product.images && product.images.length > 1
                  ? product.images[1].url
                  : null;

              return (
                <ProductCard
                  key={defaultVariant.id}
                  product={cardVariant}
                  secondaryImageUrl={secondaryImageUrl}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
