"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { User } from "@/types/user";
import { getPageMetadata } from "@/constants/navigation";
import PermissionGuard from "@/components/shared/permission-guard";

const UsersPage = () => {
  const metadata = getPageMetadata("/users");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("/users");
      if (!res?.data?.data) throw new Error("Invalid API response");
      setUsers(res.data.data);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = getColumns(fetchUsers, setLoading);

  return (
    <PermissionGuard permission="users.view">
      <section className="w-full min-h-screen bg-white">
        <PageTitle
          title={metadata?.title || "Users"}
          icon={
            metadata?.icon ? <metadata.icon size={24} /> : <Users size={24} />
          }
        />

        <div className="container mx-auto py-8">
          <GenericDataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search users..."
          />
        </div>
      </section>
    </PermissionGuard>
  );
};

export default UsersPage;
