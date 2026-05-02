"use client";
import apiHelper from "@/lib/axios-helper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { socket } from "@/lib/socket";
import {
  Activity,
  Users,
  ShoppingBag,
  IndianRupee,
  Package as PackageIcon,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
const GREETINGS = {
  morning: "Good Morning",
  afternoon: "Good Afternoon",
  evening: "Good Evening",
};

const Home = () => {
  const [greet, setGreeting] = useState(GREETINGS.morning);
  const userData = useSelector((state: any) => state?.userData);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    getGreetText();

    // Socket connection
    socket.connect();
    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));

    socket.on("dashboard_update", (data: any) => {
      if (data.stats) setStats(data.stats);
      if (data.orderStatus) setOrderStatusData(data.orderStatus);
      if (data.topSelling) setTopProducts(data.topSelling);
    });

    socket.on(
      "dashboard_notification",
      (data: {
        title: string;
        message: string;
        type: "success" | "info";
        orderId?: string;
      }) => {
        toast.custom((t) => (
          <div
            className="shadow text-slate-900 bg-white p-4 rounded-lg cursor-pointer border border-slate-200"
            onClick={() => {
              toast.dismiss(t);
              if (data.orderId) router.push(`/orders/${data.orderId}`);
            }}
          >
            <h3 className="font-bold">{data.title}</h3>
            <p className="text-sm">{data.message}</p>
          </div>
        ));
      },
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("dashboard_update");
      socket.off("dashboard_notification");
      socket.disconnect();
    };
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

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28CF0",
    "#F368E0",
    "#FF3F3F",
  ];

  return (
    <main className="mx-auto bg-slate-50 flex justify-center h-screen container overflow-x-hidden">
      {!userData && (
        <div className="flex justify-center items-center flex-col">
          <Activity className="animate-spin h-8 w-8 text-indigo-600" />
          <p className="mt-2 text-slate-600 font-medium">
            Preparing Dashboard...
          </p>
        </div>
      )}
      {userData && (
        <section className="mt-6 w-[94%] max-w-7xl animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="font-bold text-2xl text-slate-900 tracking-tight">
                {`${greet}, ${userData?.name || "Admin"}`}
              </p>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                A real-time overview of your business performance
                {isLive && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    LIVE
                  </span>
                )}
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Users Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                <Users size={64} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-500">Users</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.users.total}
              </p>
              <p
                className={`text-xs font-bold mt-2 flex items-center gap-1 ${getChangeMeta(stats.users.dayChange, stats.users.dayChangePercentage).colorClass}`}
              >
                {
                  getChangeMeta(
                    stats.users.dayChange,
                    stats.users.dayChangePercentage,
                  ).label
                }
              </p>
            </div>

            {/* Orders Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                <ShoppingBag size={64} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                  <ShoppingBag size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-500">Orders</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.orders.total}
              </p>
              <p
                className={`text-xs font-bold mt-2 flex items-center gap-1 ${getChangeMeta(stats.orders.dayChange, stats.orders.dayChangePercentage).colorClass}`}
              >
                {
                  getChangeMeta(
                    stats.orders.dayChange,
                    stats.orders.dayChangePercentage,
                  ).label
                }
              </p>
            </div>

            {/* Revenue Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                <IndianRupee size={64} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <IndianRupee size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-500">Revenue</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.revenue.total.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                })}
              </p>
              <p
                className={`text-xs font-bold mt-2 flex items-center gap-1 ${getChangeMeta(stats.revenue.dayChange, stats.revenue.dayChangePercentage).colorClass}`}
              >
                {
                  getChangeMeta(
                    stats.revenue.dayChange,
                    stats.revenue.dayChangePercentage,
                  ).label
                }
              </p>
            </div>

            {/* Products Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                <PackageIcon size={64} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <PackageIcon size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-500">Products</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.products.total}
              </p>
              <p
                className={`text-xs font-bold mt-2 flex items-center gap-1 ${getChangeMeta(stats.products.dayChange, stats.products.dayChangePercentage).colorClass}`}
              >
                {
                  getChangeMeta(
                    stats.products.dayChange,
                    stats.products.dayChangePercentage,
                  ).label
                }
              </p>
            </div>

            {/* Stock Added Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                <BarChart3 size={64} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <BarChart3 size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-500">Stock In</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stats.stockAdded.total}
              </p>
              <p
                className={`text-xs font-bold mt-2 flex items-center gap-1 ${getChangeMeta(stats.stockAdded.dayChange, stats.stockAdded.dayChangePercentage).colorClass}`}
              >
                {
                  getChangeMeta(
                    stats.stockAdded.dayChange,
                    stats.stockAdded.dayChangePercentage,
                  ).label
                }
              </p>
            </div>
          </section>

          {/* Graphs Section */}
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mb-12">
            {/* Order Status Distribution Pie Chart */}
            <div className="bg-white shadow-sm border border-slate-100 p-8 rounded-2xl flex flex-col h-[450px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="font-bold text-lg text-slate-800">
                    Order Distribution
                  </p>
                  <p className="text-sm text-slate-500">
                    Breakdown by current order status
                  </p>
                </div>
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                  <ShoppingBag size={20} />
                </div>
              </div>
              {orderStatusData.length > 0 ? (
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl">
                  <p className="text-slate-400 italic">No activity yet</p>
                </div>
              )}
            </div>

            {/* Top Selling Products Bar Chart */}
            <div className="bg-white shadow-sm border border-slate-100 p-8 rounded-2xl flex flex-col h-[450px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="font-bold text-lg text-slate-800">
                    Top Selling Products
                  </p>
                  <p className="text-sm text-slate-500">
                    Most popular items in your inventory
                  </p>
                </div>
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                  <BarChart3 size={20} />
                </div>
              </div>
              {topProducts.length > 0 ? (
                <div className="flex-1 w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="#E2E8F0"
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="productName"
                        type="category"
                        width={100}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: "12px", fontWeight: 500 }}
                        tickFormatter={(val) =>
                          val.length > 12 ? `${val.substring(0, 10)}...` : val
                        }
                      />
                      <Tooltip
                        cursor={{ fill: "#F8FAFC" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(val, name) => [val, "Units Sold"]}
                        labelFormatter={(label) => `Product: ${label}`}
                      />
                      <Bar
                        dataKey="totalSold"
                        fill="#6366f1"
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl">
                  <p className="text-slate-400 italic">No sales data yet</p>
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
