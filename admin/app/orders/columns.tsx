"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import dateFormaterHandler from "@/helper/DataFormatter";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
};

export const getColumns = (
  reloadData: () => void,
  setLoading: (loading: boolean) => void,
): ColumnDef<Order>[] => [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.id.slice(-8).toUpperCase()}
      </span>
    ),
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row.original.user.firstName} {row.original.user.lastName}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.user.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let className = "bg-slate-100 text-slate-800";
      if (status === "DELIVERED")
        className = "bg-green-100 text-green-800 hover:bg-green-100";
      if (status === "SHIPPED")
        className = "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      if (status === "PROCESSING")
        className = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      if (status === "CANCELLED")
        className = "bg-red-100 text-red-800 hover:bg-red-100";

      return (
        <Badge className={className} variant="secondary">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => {
      // Calculate explicitly if needed or use field
      const total = row.original.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
      return formatPrice(total);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => dateFormaterHandler(row.original.createdAt),
  },
];
