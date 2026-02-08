"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Package,
  Calendar,
  Clock,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import apiHelper from "@/helper/axios-helper";
import { formatPrice } from "@/helper/common-functions";
import { Order } from "@/types/order.types";
import Loader from "@/components/loader";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const paymentStatus = searchParams.get("payment");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await apiHelper.get(`/order/${orderId}`);
        if (response?.data?.statusCode === 200) {
          setOrder(response.data.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "paid":
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Package className="h-16 w-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Order Not Found
        </h1>
        <p className="text-slate-500 mb-6">
          The order you are looking for does not exist.
        </p>
        <Link href="/orders">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Payment Status Banner */}
        {paymentStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">
                Payment Successful!
              </h3>
              <p className="text-green-700 text-sm">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>
          </div>
        )}

        {paymentStatus === "failure" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Payment Failed</h3>
              <p className="text-red-700 text-sm">
                Something went wrong with your payment. Please try again or
                contact support.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
          </div>
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>

        <div className="grid gap-6">
          {/* Order Info Card */}
          <Card>
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Order ID</p>
                  <p className="font-mono font-medium text-slate-900">
                    #{order.id.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Date Placed</p>
                  <p className="font-medium text-slate-900 flex items-center">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Total Amount</p>
                  <p className="font-bold text-slate-900">
                    {formatPrice(
                      order.items.reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
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
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-slate-900 line-clamp-2 pr-4">
                          {item.name}
                        </h3>
                        <p className="font-semibold text-slate-900 whitespace-nowrap">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 space-y-1">
                        <p>
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                        {item.attributes &&
                          Object.entries(item.attributes).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className="inline-block mr-3 bg-slate-100 px-2 py-0.5 rounded text-xs"
                              >
                                <span className="font-medium capitalize">
                                  {key}:
                                </span>{" "}
                                {value}
                              </span>
                            ),
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Billing Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-1">
                <p className="font-medium text-slate-900">
                  {order.address?.name}
                </p>
                <p>{order.address?.line1}</p>
                {order.address?.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address?.city}, {order.address?.state}{" "}
                  {order.address?.postalCode}
                </p>
                <p>{order.address?.country}</p>
                {order.address?.phoneNumber && (
                  <p className="mt-2">Phone: {order.address.phoneNumber}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(
                      order.items.reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0,
                      ),
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      order.items.reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0,
                      ),
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
