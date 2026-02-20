"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, UserPlus } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { AdminUser } from "@/types/admin-user";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/shared/permission-guard";
import { usePermission } from "@/hooks/usePermission";

const AdminsPage = () => {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const canCreate = usePermission("admins.create");

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await apiHelper.get("/admins");
      setAdmins(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const columns = getColumns(fetchAdmins);

  return (
    <PermissionGuard permission="admins.view">
      <section className="w-full min-h-screen bg-white">
        <div className="flex justify-between items-center pr-8">
          <PageTitle title="Admin Users" icon={<Users size={24} />} />
        </div>

        <div className="container mx-auto py-8">
          <GenericDataTable
            columns={columns}
            data={admins}
            searchPlaceholder="Search admins..."
            renderButtons={
              canCreate
                ? [
                    <Button
                      key="add-admin"
                      onClick={() => router.push("/settings/admins/new")}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Admin
                    </Button>,
                  ]
                : []
            }
          />
        </div>
      </section>
    </PermissionGuard>
  );
};

export default AdminsPage;
