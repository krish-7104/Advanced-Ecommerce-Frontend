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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Order } from "@/types/order.types";

const OrdersPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      // router.push("/login?redirect=/orders");
      // AuthInitializer handles redirect usually, or we show empty state/redirect here
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
  }, [isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Please log in to view your orders
        </h2>
        <Link href="/login?redirect=/orders">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
          <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No orders yet
          </h2>
          <p className="text-slate-500 mb-6">
            Start shopping to see your orders here.
          </p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            // Calculate total if not provided (fallback)
            const orderTotal = order.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            );

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <Badge
                          className={getStatusColor(order.status)}
                          variant="default"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-slate-500 gap-4">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatPrice(orderTotal)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-4 sm:p-6 flex gap-4">
                        <div className="relative h-20 w-20 bg-slate-100 rounded-md overflow-hidden shrink-0">
                          {item.variant.image?.url ? (
                            <Image
                              src={item.variant.image.url}
                              alt={item.variant.product.name}
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
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-slate-900 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="font-medium text-slate-900 ml-4">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                          <ul className="text-sm text-slate-500 mt-1">
                            {Object.entries(item.attributes).map(
                              ([key, value]) => {
                                return (
                                  <li key={key}>
                                    <b>
                                      {key.charAt(0).toUpperCase() +
                                        key.slice(1)}
                                    </b>
                                    : {value}
                                  </li>
                                );
                              },
                            )}
                          </ul>
                          <p className="text-sm text-slate-500 mt-1">
                            <b>Qty:</b> {item.quantity} x{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-100">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
                      <span>
                        Delivery to: {order.address.line1}, {order.address.city}
                        , {order.address.state}, {order.address.postalCode},{" "}
                        {order.address.country}
                      </span>
                    </div>
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
