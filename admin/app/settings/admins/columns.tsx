"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdminUser } from "@/types/admin-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import apiHelper from "@/lib/axios-helper";
import { toast } from "sonner";
import { usePermission } from "@/hooks/usePermission";

const ActionCell = ({
  user,
  reloadData,
}: {
  user: AdminUser;
  reloadData: () => void;
}) => {
  const router = useRouter();
  const canEdit = usePermission("admins.update");
  const canDelete = usePermission("admins.delete");

  const onDelete = async () => {
    if (confirm("Are you sure you want to delete this admin?")) {
      try {
        await apiHelper.delete(`/admins/${user.id}`);
        toast.success("Admin deleted successfully");
        reloadData();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete admin");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {canEdit && (
          <DropdownMenuItem
            onClick={() => router.push(`/settings/admins/${user.id}`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const getColumns = (reloadData: () => void): ColumnDef<AdminUser>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.firstName ?? row.original.name ?? "-",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const count = row.original.permissions?.length ?? 0;
      return (
        <Badge variant="secondary">
          {count} {count === 1 ? "permission" : "permissions"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={row.original.isActive ? "text-green-600" : "text-red-600"}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionCell user={row.original} reloadData={reloadData} />
    ),
  },
];
