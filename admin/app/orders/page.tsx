"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import PageTitle from "@/components/shared/page-title";
import { GenericDataTable } from "@/components/shared/generic-data-table";
import { getColumns } from "./columns";
import apiHelper from "@/lib/axios-helper";
import { Order } from "@/types/order";
import { getPageMetadata } from "@/constants/navigation";
import { useRouter } from "next/navigation";
import LoaderComp from "@/components/loader";

const OrdersPage = () => {
  const metadata = getPageMetadata("/orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiHelper.get("/order");

      if (!res?.data?.data) {
        throw new Error("Invalid API response");
      }

      setOrders(res.data.data);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = getColumns(fetchOrders, setLoading);

  const handleOrderClick = (row: any) => {
    router.push(`orders/${row.id}`);
  };

  return (
    <section className="w-full min-h-screen bg-white">
      <PageTitle
        title={metadata?.title || "Orders"}
        icon={
          metadata?.icon ? (
            <metadata.icon size={24} />
          ) : (
            <ShoppingCart size={24} />
          )
        }
      />

      {loading ? (
        <LoaderComp />
      ) : (
        <div className="container mx-auto py-8">
          <GenericDataTable
            columns={columns}
            data={orders}
            searchPlaceholder="Search order..."
            onRowClick={handleOrderClick}
          />
        </div>
      )}
    </section>
  );
};

export default OrdersPage;
