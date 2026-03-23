"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/types/catalog";
import { dateFormat } from "@/lib/common";

export const getColumns = (): ColumnDef<Category>[] => [
  {
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "admin.name",
    header: "Modified By",
  },
  {
    accessorKey: "remarks",
    header: "remarks",
    size: 400,
  },
  {
    accessorKey: "entity",
    header: "Entity",
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    size: 150,
    cell: ({ row }) => {
      const value = row.getValue("createdAt") as Date;
      return <span>{dateFormat(value)}</span>;
    },
  },
];
