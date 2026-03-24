"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/types/catalog";
import { dateFormat } from "@/lib/common";
import { CopyToClipboard } from "@/helper/CopyToClipboard";

export const getColumns = (): ColumnDef<Category>[] => [
  {
    accessorKey: "action",
    header: "Action",
    size: 50,
  },
  {
    accessorKey: "admin.name",
    header: "Modified By",
    size: 150,
  },
  {
    accessorKey: "remarks",
    header: "remarks",
    size: 400,
  },
  {
    accessorKey: "entity",
    header: "Entity",
    cell: ({ row }) => {
      const value = row.getValue("entity") as string;
      return <span>{value?.replaceAll("_", " ")}</span>;
    },
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
    cell: ({ row }) => {
      const value = row.getValue("entityId") as string;
      return (
        <span
          className="cursor-pointer block"
          onClick={() => CopyToClipboard(value)}
        >
          {value}
        </span>
      );
    },
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
