"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Folder } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { Category } from "@/types/catalog";
import ModifyCategoryDialog from "./components/modify-category.dialog";
import { getPageMetadata } from "@/constants/navigation";
import LoaderComp from "@/components/loader";
import PermissionGuard from "@/components/shared/permission-guard";
import { usePermission } from "@/hooks/usePermission";

const CategoryPage = () => {
  const metadata = getPageMetadata("/category");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const canCreate = usePermission("categories.create");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("/category?level=0");
      if (!res?.data?.data) throw new Error("Invalid API response");
      setCategories(res.data.data);
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns = getColumns(fetchCategories, setLoading);

  return (
    <PermissionGuard permission="categories.view">
      <section className="w-full min-h-screen bg-white">
        <PageTitle
          title={metadata?.title || "Category"}
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
              data={categories}
              searchPlaceholder="Search category by name..."
              renderButtons={
                canCreate ? (
                  <>
                    <ModifyCategoryDialog
                      masterData={fetchCategories}
                      setLoading={setLoading}
                    />
                  </>
                ) : undefined
              }
            />
          </div>
        )}
      </section>
    </PermissionGuard>
  );
};

export default CategoryPage;
