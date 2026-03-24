"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Star,
  Eye,
  EyeOff,
  Check,
  User,
  Package,
  Trash2,
  Pencil,
} from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import apiHelper from "@/lib/axios-helper";
import { getPageMetadata } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import LoaderComp from "@/components/loader";
import PermissionGuard from "@/components/shared/permission-guard";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import DeleteModal from "@/components/shared/delete-modal";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  variant: {
    id: string;
    product: {
      name: string;
    };
    attributes: Record<string, string>;
  };
}

const ReviewsPage = () => {
  const metadata = getPageMetadata("/reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const canUpdate = usePermission("reviews.update");
  const canDelete = usePermission("reviews.delete");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("/review");
      if (!res?.data?.data) throw new Error("Invalid API response");
      setReviews(res.data.data.reviews || []);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleVisibility = async (reviewId: string) => {
    try {
      const res = await apiHelper.patch(`/admin/review/${reviewId}/visibility`);
      if (res.data?.success) {
        toast.success(res.data.message || "Visibility toggled");
        // Update local state optmistically or re-fetch
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, isVisible: !r.isVisible } : r,
          ),
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to toggle visibility",
      );
    }
  };

  const deleteReview = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      const res = await apiHelper.delete(`/review/${reviewToDelete}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete));
        setIsDeleteModalOpen(false);
        setReviewToDelete(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Review>[] = [
    {
      id: "product",
      accessorKey: "variant.product.name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.variant.product;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{product.name}</span>
            {Object.entries(row.original.variant.attributes).map(
              ([key, value]) => (
                <span key={key} className="text-[12px] me-1 rounded">
                  {value}
                </span>
              ),
            )}
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.original.user.firstName} {row.original.user.lastName}
          </span>
          <span className="text-slate-500 text-xs">
            {row.original.user.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <span className="font-bold">{row.original.rating}</span>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        </div>
      ),
    },
    {
      accessorKey: "comment",
      header: "Review",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          {row.original.title && (
            <p className="font-bold text-xs truncate">{row.original.title}</p>
          )}
          <p className="text-xs text-slate-600 line-clamp-2">
            {row.original.comment}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) =>
        row.original.isVerified ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-none pointer-events-none">
            <Check className="h-3 w-3 mr-1" /> Yes
          </Badge>
        ) : (
          <span className="text-xs text-slate-400">No</span>
        ),
    },
    {
      accessorKey: "isVisible",
      header: "Visible",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.isVisible}
            onCheckedChange={() => toggleVisibility(row.original.id)}
            disabled={!canUpdate}
          />
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-slate-500">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setReviewToDelete(row.original.id);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard permission="reviews.view">
      <section className="w-full min-h-screen bg-white">
        <PageTitle
          title={metadata?.title || "Reviews"}
          icon={
            metadata?.icon ? <metadata.icon size={24} /> : <Star size={24} />
          }
        />

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="container mx-auto py-8">
            <GenericDataTable
              columns={columns}
              data={reviews}
              searchKey="product"
              searchPlaceholder="Search reviews by product name..."
            />
          </div>
        )}
      </section>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={deleteReview}
        loading={isDeleting}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
      />
    </PermissionGuard>
  );
};

export default ReviewsPage;
