"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Folder, Plus } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { Product } from "@/types/catalog";
import { getPageMetadata } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LoaderComp from "@/components/loader";

const ProductPage = () => {
  const metadata = getPageMetadata("/products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("/product");

      if (!res?.data?.data) {
        throw new Error("Invalid API response");
      }

      setProducts(res.data.data);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns = getColumns(fetchProducts, setLoading);

  return (
    <section className="w-full min-h-screen bg-white">
      <PageTitle
        title={metadata?.title || "Products"}
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
            data={products}
            searchPlaceholder="Search product by name..."
            renderButtons={
              <>
                <Button
                  size="sm"
                  onClick={() => router.push("/products/modify-product")}
                >
                  <Plus size={16} className="mr-2" /> Product
                </Button>
              </>
            }
          />
        </div>
      )}
    </section>
  );
};

export default ProductPage;
