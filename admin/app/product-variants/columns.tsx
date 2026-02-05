"use client";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { ProductVariant } from "@/types/catalog";
import { dateFormat, formatCurrency } from "@/lib/common";
import { useState } from "react";
import DeleteModal from "@/components/shared/delete-modal";
import apiHelper from "@/lib/axios-helper";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/shared/status-badge";
import Image from "next/image";

interface ActionCellProps {
  variant: ProductVariant;
  masterData: () => void;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActionCell = ({ variant, masterData, setLoading }: ActionCellProps) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      toast.loading("Deleting variant...");
      const resp = await apiHelper.delete(`/product/variants/${variant.id}`);

      if (resp.data.statusCode === 200) {
        toast.dismiss();
        toast.success("Variant deleted successfully");
        masterData();
        setIsDeleteOpen(false);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to delete variant");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={() =>
          router.push(
            `/product-variants/modify-variants?variantId=${variant.id}`,
          )
        }
      >
        <Pencil size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash size={16} />
      </Button>

      <DeleteModal
        title="Delete Variant"
        description={`Are you sure you want to delete SKU "${variant.sku}"? This action cannot be undone.`}
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
): ColumnDef<ProductVariant>[] => [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("images") as any[];
      if (image.length > 0) {
        return (
          <Image
            width={80}
            height={80}
            src={image[0].url}
            alt="Variant Image"
            className="w-20 h-20 rounded-md object-cover"
          />
        );
      }
      return null;
    },
  },
  {
    accessorKey: "product.name",
    header: "Product",
    size: 200,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    size: 150,
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 120,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <span>{formatCurrency(price)}</span>;
    },
  },
  {
    accessorKey: "mrp",
    header: "MRP",
    size: 120,
    cell: ({ row }) => {
      const mrp = row.getValue("mrp") as number;
      return (
        <span className="text-gray-400 line-through">
          {mrp ? formatCurrency(mrp) : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "stockAvailable",
    header: "Stock",
    size: 100,
    cell: ({ row }) => {
      const stock = row.getValue("stockAvailable") as number;
      return (
        <span
          className={`${
            stock < 10 ? "text-red-600 font-bold" : "text-gray-700"
          }`}
        >
          {stock}
        </span>
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
    id: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => {
      return (
        <ActionCell
          variant={row.original}
          masterData={masterData}
          setLoading={setLoading}
        />
      );
    },
  },
];
