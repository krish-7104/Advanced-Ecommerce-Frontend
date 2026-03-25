"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Folder } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { Category } from "@/types/catalog";
import { getPageMetadata } from "@/constants/navigation";
import LoaderComp from "@/components/loader";
import { usePermission } from "@/hooks/usePermission";

const LogsPage = () => {
  const metadata = getPageMetadata("/logs");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const canViewLogs = usePermission("logs.view");

  const getAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("/audit-logs");
      if (!res?.data?.data) throw new Error("Invalid API response");
      setCategories(res.data.data);
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to load audit logs",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewLogs) {
      getAuditLogs();
    }
  }, [canViewLogs]);

  const columns = getColumns();

  if (!canViewLogs) {
    return (
      <section className="w-full min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-500">Only Super Admins can view audit logs.</p>
        </div>
      </section>
    );
  }

  return (
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
            searchKey="action"
            searchPlaceholder="Search audit logs by action..."
          />
        </div>
      )}
    </section>
  );
};

export default LogsPage;
