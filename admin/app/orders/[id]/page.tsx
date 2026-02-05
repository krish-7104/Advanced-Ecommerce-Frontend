"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  User,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import apiHelper from "@/lib/axios-helper";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const OrderDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStratus, setUpdatingStatus] = useState<boolean>(false);

  const fetchOrder = async () => {
    try {
      const res = await apiHelper.get(`/order/${params.id}`);
      if (res?.data?.data) {
        setOrder(res.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load order");
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const updateStatus = async (status: string) => {
    setUpdatingStatus(true);
    try {
      await apiHelper.patch(`/order/${params.id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrder();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(price));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 mr-2" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 mr-2" />;
      default:
        return <Clock className="h-5 w-5 mr-2" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = order.items.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Link
              href="/orders"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={order.status}
              onValueChange={updateStatus}
              disabled={
                updatingStratus ||
                order.status === "CANCELLED" ||
                order.status === "DELIVERED"
              }
            >
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  Order Items ({totalItems})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 flex gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="h-20 w-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 border">
                        {/* Use valid image URL if available, else placeholder */}
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium line-clamp-2">
                            {item.name}
                          </h4>
                          <div className="text-sm text-muted-foreground mt-1 space-y-1">
                            {Object.entries(item.attributes).map(
                              ([key, value]) => (
                                <p key={key} className="capitalize">
                                  <span className="font-medium">{key}:</span>{" "}
                                  {value}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-sm font-medium">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-semibold">
                            {formatPrice(Number(item.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Customer & Address Info */}
          <div className="space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-1">
                  <p className="font-medium">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <Link
                    href={`mailto:${order.user.email}`}
                    className="text-sm text-primary hover:underline truncate"
                  >
                    {order.user.email}
                  </Link>
                  <p className="text-sm text-primary hover:underline truncate">
                    {order.address.phoneNumber}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-900">
                    {order.address.name}
                  </p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.postalCode}
                  </p>
                  <p>{order.address.country}</p>
                </address>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>Included</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount || subtotal)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
