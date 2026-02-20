"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash } from "lucide-react";
import { Category } from "@/types/catalog";
import { dateFormat } from "@/lib/common";
import { useState } from "react";
import ModifySubcategoryDialog from "./components/modify-subcategory.dialog";
import DeleteModal from "@/components/shared/delete-modal";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/shared/status-badge";
import apiHelper from "@/lib/axios-helper";
import { toast } from "sonner";
import { usePermission } from "@/hooks/usePermission";

interface ActionCellProps {
  subcategory: Category;
  masterData: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActionCell = ({
  subcategory,
  masterData,
  setLoading,
}: ActionCellProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canEdit = usePermission("sub-categories.update");
  const canDelete = usePermission("sub-categories.delete");

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      toast.loading("Deleting subcategory...");
      const resp = await apiHelper.delete(`/category/${subcategory.id}`);

      if (resp.data.statusCode === 200) {
        toast.dismiss();
        toast.success("Subcategory deleted successfully");
        masterData();
        setIsDeleteOpen(false);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to delete subcategory",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={() => setIsEditOpen(true)}
        >
          <Pencil size={16} />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash size={16} />
        </Button>
      )}

      <ModifySubcategoryDialog
        subcategory={subcategory}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        masterData={masterData}
        setLoading={setLoading}
      />

      <DeleteModal
        title="Delete Subcategory"
        description={`Are you sure you want to delete "${subcategory.name}"? This action cannot be undone.`}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={onDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export const getColumns = (
  masterData: () => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
  },
  {
    accessorKey: "parent.name",
    header: "Parent Category",
    size: 200,
  },
  {
    accessorKey: "_count.products",
    header: "Products",
    size: 200,
    cell: ({ row }) => (
      <div className="text-center font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-md inline-block min-w-[3rem]">
        {row.original._count?.products || 0}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      const value = row.getValue("isActive") as boolean;
      return <StatusBadge isActive={value} />;
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    size: 180,
    cell: ({ row }) => (
      <code className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
        {row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 300,
    cell: ({ row }) => {
      const value = row.getValue("description") as string;
      return (
        <p className="line-clamp-2 max-w-[250px]">
          {value || "No description"}
        </p>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    size: 150,
    cell: ({ row }) => {
      const value = row.getValue("updatedAt") as Date;
      return <span>{dateFormat(value)}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => {
      return (
        <ActionCell
          subcategory={row.original}
          masterData={masterData}
          setLoading={setLoading}
        />
      );
    },
  },
];
