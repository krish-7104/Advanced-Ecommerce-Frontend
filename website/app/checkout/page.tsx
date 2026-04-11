"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { formatPrice } from "@/helper/common-functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Package } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import apiHelper from "@/helper/axios-helper";
import { fetchCart } from "@/redux/slices/cart.slice";
import Loader from "@/components/loader";
import Link from "next/link";

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

const CheckoutPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cart } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.user,
  );

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const response = await apiHelper.get("/address");
      const data =
        response?.data?.statusCode === 200 ? response.data.data : [];
      setAddresses(data);
      const defaultAddr = data.find((a: Address) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data.length > 0) setSelectedAddressId(data[0].id);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadAddresses();
    else setLoadingAddresses(false);
  }, [isAuthenticated]);

  const startPayment = async (orderId: string) => {
    const resp = await apiHelper.post(
      `/payment/create-payment-intent/${orderId}`,
    );
    if (resp?.data?.statusCode !== 200 || !resp?.data?.data?.url) {
      throw new Error(
        resp?.data?.message || "Could not start secure payment. Try again.",
      );
    }
    window.location.href = resp.data.data.url;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Choose a delivery address");
      return;
    }
    setPlacingOrder(true);
    try {
      const response = await apiHelper.post("/order", {
        addressId: selectedAddressId,
      });
      if (response?.data?.statusCode !== 201) {
        throw new Error(response?.data?.message || "Could not place order");
      }
      const orderId = response.data.data?.id;
      if (!orderId) throw new Error("Missing order id");
      await fetchCart(dispatch);
      await startPayment(orderId);
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message;
      toast.error(
        typeof message === "string"
          ? message
          : error instanceof Error
            ? error.message
            : "Something went wrong",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const items = cart?.filter((item) => item.variant) || [];
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.variant?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  if (!isAuthenticated) return null;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Checkout</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ship to</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAddresses ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <p className="mb-4">Add an address to continue.</p>
                <Button variant="outline" asChild>
                  <Link href="/my-account?redirect=/checkout">Add address</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <button
                    type="button"
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left rounded-lg border p-4 transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center ${
                          selectedAddressId === addr.id
                            ? "border-primary bg-primary"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedAddressId === addr.id && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-slate-900">{addr.name}</p>
                        <p className="text-slate-600 mt-1">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}
                        </p>
                        <p className="text-slate-600">
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-slate-600 text-sm">Your cart is empty.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-14 bg-slate-100 rounded-md overflow-hidden shrink-0">
                    {item.variant?.image ? (
                      <Image
                        src={item.variant.image.url}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-5 w-5 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.variant?.product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Qty {item.quantity} ·{" "}
                      {formatPrice(
                        Number(item.variant?.price || 0) * item.quantity,
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
              <span className="text-slate-600">Total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-slate-500">
              You will pay securely on the next screen (card).
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={
                placingOrder ||
                !selectedAddressId ||
                items.length === 0 ||
                !user?.emailVerified
              }
            >
              {placingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Continue…
                </>
              ) : (
                "Continue to payment"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
