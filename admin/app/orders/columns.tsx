"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import dateFormaterHandler from "@/helper/DataFormatter";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiHelper from "@/lib/axios-helper";
import { toast } from "react-hot-toast";
import Link from "next/link";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
};

export const getColumns = (
  reloadData: () => void,
  setLoading: (loading: boolean) => void
): ColumnDef<Order>[] => [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.slice(-8).toUpperCase()}</span>,
  },
  {
    accessorKey: "user",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.user.firstName} {row.original.user.lastName}</span>
        <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let className = "bg-slate-100 text-slate-800";
      if (status === "DELIVERED") className = "bg-green-100 text-green-800 hover:bg-green-100";
      if (status === "SHIPPED") className = "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      if (status === "PROCESSING") className = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      if (status === "CANCELLED") className = "bg-red-100 text-red-800 hover:bg-red-100";
      
      return <Badge className={className} variant="secondary">{status}</Badge>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => {
        // Calculate explicitly if needed or use field
        const total = row.original.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        return formatPrice(total);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => dateFormaterHandler(row.original.createdAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      
      const updateStatus = async (status: string) => {
        setLoading(true);
        try {
          await apiHelper.patch(`/order/${order.id}/status`, { status });
          toast.success(`Order status updated to ${status}`);
          reloadData();
        } catch (error: any) {
          toast.error(error?.response?.data?.message || "Failed to update status");
        } finally {
          setLoading(false);
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
            <DropdownMenuItem asChild>
                <Link href={`/orders/${order.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus("PENDING")}>
              Mark as Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus("PROCESSING")}>
              Mark as Processing
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => updateStatus("SHIPPED")}>
              Mark as Shipped
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => updateStatus("DELIVERED")}>
              Mark as Delivered
            </DropdownMenuItem>
             <DropdownMenuItem onClick={() => updateStatus("CANCELLED")} className="text-red-600">
              Mark as Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
