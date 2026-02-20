"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Folder, Plus } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { ProductVariant } from "@/types/catalog";
import { getPageMetadata } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LoaderComp from "@/components/loader";
import PermissionGuard from "@/components/shared/permission-guard";
import { usePermission } from "@/hooks/usePermission";

const ProductVariantPage = () => {
  const metadata = getPageMetadata("/product/variants");
  const router = useRouter();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const canCreate = usePermission("product-variants.create");

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("product/variants/all");
      if (res?.data?.data) {
        setVariants(res.data.data);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  const columns = getColumns(fetchVariants, setLoading);

  return (
    <PermissionGuard permission="product-variants.view">
      <section className="w-full min-h-screen bg-white">
        <PageTitle
          title={metadata?.title || "Product Variants"}
          icon={
            metadata?.icon ? <metadata.icon size={24} /> : <Folder size={24} />
          }
        />

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="container mx-auto py-8">
            <GenericDataTable
              columns={columns}
              data={variants}
              searchKey="sku"
              searchPlaceholder="Search variants by SKU..."
              renderButtons={
                canCreate ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/product-variants/modify-variants`)
                    }
                  >
                    <Plus size={16} className="mr-2" /> Add Variant
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </section>
    </PermissionGuard>
  );
};

export default ProductVariantPage;
