"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import dateFormaterHandler from "@/helper/DataFormatter";

export const getColumns = (
  reloadData: () => void,
  setLoading: (loading: boolean) => void,
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.email}</span>
        {row.original.emailVerified ? (
          <span className="text-xs text-green-600 flex items-center gap-1">
            Verified
          </span>
        ) : (
          <span className="text-xs text-yellow-600 flex items-center gap-1">
            Unverified
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => <span>{row.original.phoneNumber || "-"}</span>,
  },
  {
    accessorKey: "cartCount",
    header: "Cart",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
      >
        {row.original.cartCount || 0}
      </Badge>
    ),
  },
  {
    accessorKey: "wishlistCount",
    header: "Wishlist",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className="bg-pink-50 text-pink-700 hover:bg-pink-100"
      >
        {row.original.wishlistCount || 0}
      </Badge>
    ),
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original._count?.orders || 0}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => dateFormaterHandler(row.original.createdAt),
  },
];
