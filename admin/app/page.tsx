"use client";
import apiHelper from "@/lib/axios-helper";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
const GREETINGS = {
  morning: "Good Morning",
  afternoon: "Good Afternoon",
  evening: "Good Evening",
};

const Home = () => {
  const [greet, setGreeting] = useState(GREETINGS.morning);
  const userData = useSelector((state: any) => state?.userData);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    users: {
      total: number;
      dayChange: number;
      dayChangePercentage: number;
    };
    orders: {
      total: number;
      dayChange: number;
      dayChangePercentage: number;
    };
    revenue: {
      total: number;
      dayChange: number;
      dayChangePercentage: number;
    };
    stockAdded: {
      total: number;
      dayChange: number;
      dayChangePercentage: number;
    };
    products: {
      total: number;
      dayChange: number;
      dayChangePercentage: number;
    };
  }>({
    users: { total: 0, dayChange: 0, dayChangePercentage: 0 },
    orders: { total: 0, dayChange: 0, dayChangePercentage: 0 },
    revenue: { total: 0, dayChange: 0, dayChangePercentage: 0 },
    stockAdded: { total: 0, dayChange: 0, dayChangePercentage: 0 },
    products: { total: 0, dayChange: 0, dayChangePercentage: 0 },
  });

  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    getGreetText();
  }, []);

  const getGreetText = () => {
    const hour = new Date().getHours();
    if (hour <= 12) {
      setGreeting(GREETINGS.morning);
    } else if (hour <= 18) {
      setGreeting(GREETINGS.afternoon);
    } else {
      setGreeting(GREETINGS.evening);
    }
  };

  useEffect(() => {
    getStatsForCards();
    fetchGraphData();
  }, []);

  const getChangeMeta = (value: number, percentage: number) => {
    const isIncrease = percentage > 0;
    const isDecrease = percentage < 0;

    const colorClass = isIncrease
      ? "text-emerald-600"
      : isDecrease
        ? "text-red-600"
        : "text-indigo-600";

    const signedValue =
      value > 0 ? `+${value}` : value < 0 ? `${value}` : `${value}`;
    const signedPercentage =
      percentage > 0
        ? `+${percentage}`
        : percentage < 0
          ? `${percentage}`
          : `${percentage}`;

    return {
      colorClass,
      label: `${signedValue} (${signedPercentage}%)`,
    };
  };

  const getStatsForCards = async () => {
    setLoading(true);
    try {
      const response = await apiHelper.get("/dashboard/stats");
      if (response?.data?.statusCode === 200) {
        setStats(response?.data?.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphData = async () => {
    try {
      const [statusRes, productsRes] = await Promise.all([
        apiHelper.get("/dashboard/orders/status-graph"),
        apiHelper.get("/dashboard/products/top-selling?limit=5"),
      ]);
      
      if (statusRes?.data?.statusCode === 200) {
        setOrderStatusData(statusRes.data.data);
      }
      if (productsRes?.data?.statusCode === 200) {
        setTopProducts(productsRes.data.data);
      }
    } catch (e) {
      console.error("Failed to load graphs", e);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF0', '#F368E0', '#FF3F3F'];

  return (
    <main className="mx-auto bg-[#f6f6f6] flex justify-center h-[100vh] container overflow-x-hidden">
      {!userData && (
        <div className="flex justify-center items-center flex-col">
          <Loader2 className="animate-spin" />
          <p className="mt-2 text-gray-700">Getting Things Ready!</p>
        </div>
      )}
      {userData && !loading && (
        <section className="mt-6 w-[92%]">
          <div className="w-full mb-4">
            <p className="font-semibold text-xl">
              {`${greet}, ${userData?.name || ""}`}
            </p>
            <p className="text-sm mt-1 text-slate-500">
              Here what&lsquo;s happening with your store
            </p>
          </div>
          <section className="mt-6 overflow-x-auto">
            <div className="w-full mb-4 flex gap-4 flex-nowrap justify-between items-stretch">
              <div className="bg-white shadow-sm border p-4 rounded-xl flex-1 min-w-[180px]">
                <p className="text-sm text-gray-500">Users</p>
                <p className="text-xl font-semibold">{stats.users.total}</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    getChangeMeta(
                      stats.users.dayChange,
                      stats.users.dayChangePercentage,
                    ).colorClass
                  }`}
                >
                  {
                    getChangeMeta(
                      stats.users.dayChange,
                      stats.users.dayChangePercentage,
                    ).label
                  }
                </p>
              </div>
              <div className="bg-white shadow-sm border p-4 rounded-xl flex-1 min-w-[180px]">
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-xl font-semibold">{stats.orders.total}</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    getChangeMeta(
                      stats.orders.dayChange,
                      stats.orders.dayChangePercentage,
                    ).colorClass
                  }`}
                >
                  {
                    getChangeMeta(
                      stats.orders.dayChange,
                      stats.orders.dayChangePercentage,
                    ).label
                  }
                </p>
              </div>
              <div className="bg-white shadow-sm border p-4 rounded-xl flex-1 min-w-[180px]">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-xl font-semibold">
                  {stats.revenue.total.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    getChangeMeta(
                      stats.revenue.dayChange,
                      stats.revenue.dayChangePercentage,
                    ).colorClass
                  }`}
                >
                  {
                    getChangeMeta(
                      stats.revenue.dayChange,
                      stats.revenue.dayChangePercentage,
                    ).label
                  }
                </p>
              </div>
              <div className="bg-white shadow-sm border p-4 rounded-xl flex-1 min-w-[180px]">
                <p className="text-sm text-gray-500">Products</p>
                <p className="text-xl font-semibold">{stats.products.total}</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    getChangeMeta(
                      stats.products.dayChange,
                      stats.products.dayChangePercentage,
                    ).colorClass
                  }`}
                >
                  {
                    getChangeMeta(
                      stats.products.dayChange,
                      stats.products.dayChangePercentage,
                    ).label
                  }
                </p>
              </div>
              <div className="bg-white shadow-sm border p-4 rounded-xl flex-1 min-w-[180px]">
                <p className="text-sm text-gray-500">Stock Added</p>
                <p className="text-xl font-semibold">
                  {stats.stockAdded.total}
                </p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    getChangeMeta(
                      stats.stockAdded.dayChange,
                      stats.stockAdded.dayChangePercentage,
                    ).colorClass
                  }`}
                >
                  {
                    getChangeMeta(
                      stats.stockAdded.dayChange,
                      stats.stockAdded.dayChangePercentage,
                    ).label
                  }
                </p>
              </div>
            </div>
          </section>

          {/* Graphs Section */}
          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
            {/* Order Status Distribution Pie Chart */}
            <div className="bg-white shadow-sm border p-6 rounded-xl flex flex-col h-[400px]">
              <p className="font-semibold text-lg text-slate-800 mb-6">Order Status Distribution</p>
              {orderStatusData.length > 0 ? (
                <div className="flex-1 w-full h-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-slate-400">No data available</p>
                </div>
              )}
            </div>

            {/* Top Selling Products Bar Chart */}
            <div className="bg-white shadow-sm border p-6 rounded-xl flex flex-col h-[400px]">
              <p className="font-semibold text-lg text-slate-800 mb-6">Top Selling Variants</p>
              {topProducts.length > 0 ? (
                <div className="flex-1 w-full h-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sku" />
                      <YAxis />
                      <Tooltip formatter={(val, name) => [val, 'Total Sold']} labelFormatter={(label) => `SKU: ${label}`} />
                      <Legend />
                      <Bar dataKey="totalSold" fill="#6366f1" radius={[4, 4, 0, 0]} name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-slate-400">No data available</p>
                </div>
              )}
            </div>
          </section>
        </section>
      )}
    </main>
  );
};

export default Home;
