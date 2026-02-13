"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import apiHelper from "@/helper/axios-helper";
import { formatPrice } from "@/helper/common-functions";
import { Package, Calendar, MapPin, ChevronRight, Clock } from "lucide-react";
import Loader from "@/components/loader";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import { Order } from "@/types/order.types";
import { cn } from "@/lib/utils";

const OrdersPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await apiHelper.get("/order");
        if (response?.data?.statusCode === 200) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-800 rounded-xl";
      case "confirmed":
      case "processing":
      case "paid":
        return "bg-primary/10 text-primary rounded-xl";
      case "shipped":
        return "bg-indigo-50 text-indigo-800 rounded-xl";
      case "delivered":
        return "bg-emerald-50 text-emerald-800 rounded-xl";
      case "cancelled":
        return "bg-red-50 text-red-700 rounded-xl";
      default:
        return "bg-slate-100 text-slate-700 rounded-xl";
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Sign in to view your orders
          </h2>
          <p className="text-slate-600 mb-6">
            Log in to see order history and track deliveries.
          </p>
          <Link href="/login?redirect=/orders">
            <Button size="lg" className="rounded-2xl">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">My Orders</h1>
      <p className="text-slate-600 mb-10">
        View and track your order history.
      </p>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-slate-50/50 shadow-[var(--shadow-card)] overflow-hidden">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Start shopping to see your orders here."
            actionLabel="Start Shopping"
            onAction={() => router.push("/products")}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const orderTotal = order.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            return (
              <Card
                key={order.id}
                className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] transition-all duration-200"
              >
                <CardHeader className="bg-slate-50/50 px-6 sm:px-8 py-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-slate-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 text-xs font-medium",
                            getStatusStyles(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Total
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatPrice(orderTotal)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="px-6 sm:px-8 py-5 flex gap-4 sm:gap-6"
                      >
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                          {item.variant?.image?.url ? (
                            <Image
                              src={item.variant.image.url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-8 w-8 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                            <h3 className="font-medium text-slate-900 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="font-semibold text-slate-900 shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                          {item.attributes &&
                            Object.keys(item.attributes).length > 0 && (
                              <p className="text-sm text-slate-500 mt-1">
                                {Object.entries(item.attributes)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(" · ")}
                              </p>
                            )}
                          <p className="text-sm text-slate-500 mt-0.5">
                            Qty {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50/50 px-6 sm:px-8 py-4 flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600">
                      Delivery to: {order.address.line1}, {order.address.city},{" "}
                      {order.address.state} {order.address.postalCode},{" "}
                      {order.address.country}
                    </p>
                  </div>
                  <div className="px-6 sm:px-8 py-4 border-t border-slate-100">
                    <Link href={`/order/${order.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/90 hover:bg-primary/5 rounded-xl -ml-2"
                      >
                        View details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
