"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Package,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiHelper from "@/helper/axios-helper";
import { formatPrice } from "@/helper/common-functions";
import { Order } from "@/types/order.types";
import Loader from "@/components/loader";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.id as string;
  const paymentStatus = searchParams.get("payment");
  const stripeSessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaidBanner, setShowPaidBanner] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const handleRequestRefund = async () => {
    if (!refundReason.trim()) {
      toast.error("Add a short reason.");
      return;
    }
    try {
      setIsRefunding(true);
      const response = await apiHelper.post(`/order/${orderId}/refund`, {
        reason: refundReason,
      });
      if (response?.data?.statusCode === 200) {
        const payload = response.data.data;
        if (payload?.outcome === "cancelled_unpaid" && payload?.order) {
          setOrder(payload.order as Order);
        } else {
          setOrder((prev) => (prev ? { ...prev, status: "REFUNDED" } : null));
        }
        toast.success(response.data.message || "Done");
        setIsDialogOpen(false);
        setRefundReason("");
      }
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      toast.error(typeof msg === "string" ? msg : "Request failed");
    } finally {
      setIsRefunding(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (paymentStatus === "success") {
          const response = await apiHelper.post(
            `/payment/sync-checkout/${orderId}`,
            stripeSessionId ? { sessionId: stripeSessionId } : {},
          );
          if (!cancelled && response?.data?.statusCode === 200) {
            const payload = response.data.data;
            if (payload?.order) {
              setOrder(payload.order as Order);
            }
            if (payload?.synced || payload?.alreadyPaid) {
              setShowPaidBanner(true);
              toast.success(response.data.message || "Order updated");
              if (!cancelled) {
                router.replace(`/order/${orderId}`, { scroll: false });
              }
            } else if (!cancelled && response.data.message) {
              toast.info(response.data.message);
            }
          }
        } else {
          const response = await apiHelper.get(`/order/${orderId}`);
          if (!cancelled && response?.data?.statusCode === 200) {
            setOrder(response.data.data);
          }
        }
      } catch {
        if (!cancelled) {
          try {
            const response = await apiHelper.get(`/order/${orderId}`);
            if (!cancelled && response?.data?.statusCode === 200) {
              setOrder(response.data.data);
            }
          } catch {
            toast.error("Could not load order");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, paymentStatus, stripeSessionId, router]);

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === "pending") return "bg-amber-100 text-amber-900";
    if (["paid", "packed"].includes(s)) return "bg-sky-100 text-sky-900";
    if (s === "shipped") return "bg-indigo-100 text-indigo-900";
    if (s === "delivered") return "bg-emerald-100 text-emerald-900";
    if (s === "cancelled" || s === "refunded")
      return "bg-slate-200 text-slate-800";
    return "bg-slate-100 text-slate-800";
  };

  const lineTotal = (o: Order) =>
    o.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

  const canRefundOrCancel =
    order && ["PENDING", "PAID", "PACKED"].includes(order.status);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-md mx-auto py-20 text-center px-4">
        <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-slate-900 mb-2">
          Order not found
        </h1>
        <Button variant="outline" asChild>
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {(showPaidBanner || paymentStatus === "success") &&
        order.status === "PAID" && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Payment received. Your order is paid.</span>
          </div>
        )}
      {paymentStatus === "failure" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 flex gap-2">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>
            Payment did not go through. You can try again from checkout.
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" className="shrink-0" asChild>
          <Link href="/orders" aria-label="Back">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-slate-900">Order</h1>
        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
      </div>

      {canRefundOrCancel && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="mb-6"
            onClick={() => setIsDialogOpen(true)}
          >
            Cancel or refund
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel or refund</DialogTitle>
                <DialogDescription>
                  Paid orders are refunded to your card. Unpaid orders are
                  cancelled and stock is released.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Brief reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isRefunding}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRequestRefund}
                  disabled={isRefunding}
                >
                  {isRefunding ? "Working…" : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-slate-600">
            #{order.id.slice(-10).toUpperCase()} ·{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">
            {formatPrice(lineTotal(order))}
          </p>
          <div className="space-y-4">
            {order.items.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.variant.product.slug}?variantId=${item.variant.id}`}
                className="flex gap-3"
              >
                <div className="relative h-16 w-16 bg-slate-100 rounded-md overflow-hidden shrink-0">
                  {item.variant?.image?.url ? (
                    <Image
                      src={item.variant.image.url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-slate-500">
                    {item.quantity} × {formatPrice(Number(item.price))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            Ship to
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-1">
          <p className="font-medium text-slate-900">{order.address?.name}</p>
          <p>{order.address?.line1}</p>
          {order.address?.line2 && <p>{order.address.line2}</p>}
          <p>
            {order.address?.city}, {order.address?.state}{" "}
            {order.address?.postalCode}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
