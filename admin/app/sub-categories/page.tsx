"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Boxes } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { Category } from "@/types/catalog";
import ModifySubcategoryDialog from "./components/modify-subcategory.dialog";
import { getPageMetadata } from "@/constants/navigation";
import LoaderComp from "@/components/loader";
import PermissionGuard from "@/components/shared/permission-guard";
import { usePermission } from "@/hooks/usePermission";

const SubcategoryPage = () => {
  const metadata = getPageMetadata("/sub-categories");
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const canCreate = usePermission("sub-categories.create");

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("/category?level=1");
      if (!res?.data?.data) throw new Error("Invalid API response");
      setSubcategories(res.data.data);
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to load subcategories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const columns = getColumns(fetchSubcategories, setLoading);

  return (
    <PermissionGuard permission="sub-categories.view">
      <section className="w-full min-h-screen bg-white">
        <PageTitle
          title={metadata?.title || "Subcategories"}
          icon={
            metadata?.icon ? <metadata.icon size={24} /> : <Boxes size={24} />
          }
        />

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="container mx-auto py-8">
            <GenericDataTable
              columns={columns}
              data={subcategories}
              searchPlaceholder="Search subcategory by name..."
              renderButtons={
                canCreate ? (
                  <>
                    <ModifySubcategoryDialog
                      masterData={fetchSubcategories}
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

export default SubcategoryPage;
