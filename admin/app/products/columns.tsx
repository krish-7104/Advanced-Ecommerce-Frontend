"use client";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { Product } from "@/types/catalog";
import { dateFormat } from "@/lib/common";
import { useState } from "react";
import DeleteModal from "@/components/shared/delete-modal";
import apiHelper from "@/lib/axios-helper";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/shared/status-badge";
import { usePermission } from "@/hooks/usePermission";

interface ActionCellProps {
  product: Product;
  masterData: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActionCell = ({ product, masterData, setLoading }: ActionCellProps) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canEdit = usePermission("products.update");
  const canDelete = usePermission("products.delete");

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      toast.loading("Deleting product...");
      const resp = await apiHelper.delete(`/product/${product.id}`);

      if (resp.data.statusCode === 200) {
        toast.dismiss();
        toast.success("Product deleted successfully");
        masterData();
        setIsDeleteOpen(false);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to delete product");
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
          onClick={() =>
            router.push(`/products/modify-product?productId=${product.id}`)
          }
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

      <DeleteModal
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
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
): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
  },
  {
    accessorKey: "category.name",
    header: "Subcategory",
    size: 200,
  },
  {
    accessorKey: "category.parent.name",
    header: "Category",
    size: 200,
  },
  {
    accessorKey: "_count.variants",
    header: "Variants",
    size: 120,
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    size: 100,
    cell: ({ row }) => {
      const value = row.getValue("isFeatured") as boolean;
      return (
        <StatusBadge isActive={value} activeText="Yes" inactiveText="No" />
      );
    },
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
          product={row.original}
          masterData={masterData}
          setLoading={setLoading}
        />
      );
    },
  },
];
