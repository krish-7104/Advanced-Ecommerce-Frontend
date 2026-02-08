"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { formatPrice } from "@/helper/common-functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, MapPin } from "lucide-react"; // Added MapPin
import Image from "next/image";
import { toast } from "sonner";
import apiHelper from "@/helper/axios-helper";
import { fetchCart } from "@/redux/slices/cart.slice";

interface Address {
  id: string;
  name: string;
  phoneNumber?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CreateAddressPayload {
  name: string;
  phoneNumber?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

const CheckoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cart } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Inline functions for Address and Order
  const getAddresses = async () => {
    try {
      const response = await apiHelper.get("/address");
      if (response?.data?.statusCode === 200) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error("Failed to fetch addresses:", error);
      return [];
    }
  };

  const createOrder = async (addressId: string) => {
    try {
      const response = await apiHelper.post("/order", { addressId });
      if (response?.data?.statusCode === 201) {
        toast.success("Order placed successfully!");
        // Refresh cart
        await fetchCart(dispatch);
        return response.data.data;
      }
    } catch (error: any) {
      console.error("Failed to create order:", error);
      toast.error(error?.response?.data?.message || "Failed to place order");
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    } else {
      setLoadingAddresses(false);
    }
  }, [isAuthenticated, router]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    const data = await getAddresses();
    setAddresses(data);

    // Select default address if available
    const defaultAddr = data.find((a: Address) => a.isDefault);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    } else if (data.length > 0) {
      setSelectedAddressId(data[0].id);
    }

    setLoadingAddresses(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setPlacingOrder(true);
    try {
      await createOrder(selectedAddressId);
      router.push("/orders");
      // Use "Order Placed" toast which is already in createOrder
    } catch (error) {
      // Error handled in helper
    } finally {
      setPlacingOrder(false);
    }
  };

  // Calculate totals
  const items = cart?.filter((item) => item.variant) || [];
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.variant?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  const shipping = 0;
  const total = subtotal + shipping;

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAddresses ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No addresses found. Please add a delivery address.
                  </p>
                  <Button
                    variant={"outline"}
                    onClick={() => router.push("/my-account")}
                  >
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div
                            className={`mt-1 h-5 w-5 rounded-full border border-primary flex items-center justify-center ${selectedAddressId === addr.id ? "bg-primary" : "bg-transparent"}`}
                          >
                            {selectedAddressId === addr.id && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {addr.name}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {addr.line1}
                            </p>
                            {addr.line2 && (
                              <p className="text-sm text-slate-600">
                                {addr.line2}
                              </p>
                            )}
                            <p className="text-sm text-slate-600">
                              {addr.city}, {addr.state} {addr.postalCode}
                            </p>
                            <p className="text-sm text-slate-600">
                              {addr.country}
                            </p>
                            {addr.phoneNumber && (
                              <p className="text-sm text-slate-600 mt-1">
                                Phone: {addr.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Payment integration will be added later. Proceeding will create
                order.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-h-75 overflow-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 bg-slate-100 rounded-md overflow-hidden shrink-0">
                      {item.variant?.image ? (
                        <Image
                          src={item.variant.image.url}
                          alt={item.variant.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <MapPin className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {item.variant?.product.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {formatPrice(
                        Number(item.variant?.price || 0) * item.quantity,
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder || !selectedAddressId || items.length === 0
                }
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
