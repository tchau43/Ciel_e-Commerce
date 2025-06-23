import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAllInvoicesQuery } from "@/services/invoice/getAllInvoicesQuery";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { vi } from "date-fns/locale";

// Cập nhật bảng màu cho dark mode
const COLORS = {
  light: [
    "rgba(79, 70, 229, 1)",
    "rgba(16, 185, 129, 1)",
    "rgba(245, 158, 11, 1)",
    "rgba(239, 68, 68, 1)",
    "rgba(139, 92, 246, 1)",
  ],
  dark: [
    "rgba(129, 140, 248, 1)",
    "rgba(52, 211, 153, 1)",
    "rgba(252, 211, 77, 1)",
    "rgba(248, 113, 113, 1)",
    "rgba(167, 139, 250, 1)",
  ],
};

// Thêm một số màu gradient cho biểu đồ
// const CHART_COLORS = {
//   light: {
//     primary: "rgba(79, 70, 229, 1)",
//     success: "rgba(16, 185, 129, 1)",
//     warning: "rgba(245, 158, 11, 1)",
//     error: "rgba(239, 68, 68, 1)",
//     purple: "rgba(139, 92, 246, 1)",
//     gradientFrom: "rgba(79, 70, 229, 1)",
//     gradientTo: "rgba(129, 140, 248, 1)",
//   },
//   dark: {
//     primary: "rgba(129, 140, 248, 1)",
//     success: "rgba(52, 211, 153, 1)",
//     warning: "rgba(252, 211, 77, 1)",
//     error: "rgba(248, 113, 113, 1)",
//     purple: "rgba(167, 139, 250, 1)",
//     gradientFrom: "rgba(129, 140, 248, 1)",
//     gradientTo: "rgba(199, 210, 254, 1)",
//   },
// };

// Add interface definition at the top
interface Invoice {
  createdAt: string | Date;
  paymentStatus: string;
  totalAmount: number;
  items: Array<{
    product?: { name: string };
    quantity?: number;
  }>;
  orderStatus: string;
}

// Add interfaces for chart data
interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface ProductDataPoint {
  name: string;
  sales: number;
}

interface StatusDataPoint {
  name: string;
  value: number;
}

const AdminDashboardPage = () => {
  const [period, setPeriod] = useState("weekly");
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [productData, setProductData] = useState<ProductDataPoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [orderStatusData, setOrderStatusData] = useState<StatusDataPoint[]>([]);

  // Fetch all invoices with a large limit to get comprehensive data
  const { data } = useGetAllInvoicesQuery({
    limit: 1000,
    sortBy: "createdAt",
    sortOrder: "desc",
    paymentStatus: "paid", // Only consider paid invoices for revenue
  });

  useEffect(() => {
    if (data?.invoices) {
      processInvoiceData(data.invoices);
    }
  }, [data, period]);

  const processInvoiceData = (invoices: Invoice[]) => {
    // Calculate date ranges based on selected period
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    let dateFormat: string;

    if (period === "weekly") {
      startDate = startOfWeek(today, { locale: vi });
      endDate = endOfWeek(today, { locale: vi });
      dateFormat = "EEE";
    } else if (period === "monthly") {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      dateFormat = "dd/MM";
    } else {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
      dateFormat = "MMM";
    }

    // Filter invoices by date range
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      return (
        isWithinInterval(invoiceDate, { start: startDate, end: endDate }) &&
        invoice.paymentStatus === "paid"
      );
    });

    // Calculate total revenue
    const total = filteredInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );
    setTotalRevenue(total);

    // Calculate today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      return (
        isWithinInterval(invoiceDate, { start: todayStart, end: todayEnd }) &&
        invoice.paymentStatus === "paid"
      );
    });

    setTodayRevenue(
      todayInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
    );
    setOrderCount(filteredInvoices.length);

    // Create revenue by date data
    const revenueByDate: Record<string, number> = {};

    // Initialize all dates in range
    let current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = format(current, dateFormat, { locale: vi });
      revenueByDate[dateKey] = 0;
      current.setDate(current.getDate() + 1);
    }

    // Fill with actual data
    filteredInvoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.createdAt);
      const dateKey = format(invoiceDate, dateFormat, { locale: vi });
      revenueByDate[dateKey] =
        (revenueByDate[dateKey] || 0) + invoice.totalAmount;
    });

    // Convert to array format for charts
    const revenueDataArray = Object.keys(revenueByDate).map((date) => ({
      date,
      revenue: revenueByDate[date],
    }));

    setRevenueData(revenueDataArray);

    // Process products data (top selling)
    const productSales: Record<string, number> = {};
    filteredInvoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const productName = item.product?.name || "Unknown Product";
        productSales[productName] =
          (productSales[productName] || 0) + (item.quantity || 1);
      });
    });

    // Convert to array and sort
    const productDataArray = Object.keys(productSales)
      .map((name) => ({ name, sales: productSales[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5 products

    setProductData(productDataArray);

    // Process order status data
    const statusCounts: Record<string, number> = {};
    invoices.forEach((invoice) => {
      statusCounts[invoice.orderStatus] =
        (statusCounts[invoice.orderStatus] || 0) + 1;
    });

    const statusDataArray = Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));

    setOrderStatusData(statusDataArray);
  };

  // Format currency
  const formatCurrency = (amount: number | string): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <Tabs value={period} onValueChange={setPeriod} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Tuần này</TabsTrigger>
            <TabsTrigger value="monthly">Tháng này</TabsTrigger>
            <TabsTrigger value="yearly">Năm nay</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Tổng doanh thu
            </CardDescription>
            <CardTitle className="text-3xl text-indigo-600 dark:text-indigo-400">
              {formatCurrency(totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tổng doanh thu{" "}
              {period === "weekly"
                ? "tuần này"
                : period === "monthly"
                ? "tháng này"
                : "năm nay"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Doanh thu hôm nay
            </CardDescription>
            <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-400">
              {formatCurrency(todayRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tính từ 00:00 hôm nay
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Số đơn hàng
            </CardDescription>
            <CardTitle className="text-3xl text-amber-600 dark:text-amber-400">
              {orderCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Số đơn hàng{" "}
              {period === "weekly"
                ? "tuần này"
                : period === "monthly"
                ? "tháng này"
                : "năm nay"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">
              Doanh thu theo thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(229, 231, 235, 1)"
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(107, 114, 128, 1)"
                  className="dark:stroke-gray-400"
                />
                <YAxis
                  stroke="rgba(107, 114, 128, 1)"
                  className="dark:stroke-gray-400"
                />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                  contentStyle={{
                    backgroundColor:
                      "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                    borderRadius: "8px",
                    border:
                      "1px solid var(--tooltip-border, rgba(229, 231, 235, 1))",
                    color: "var(--tooltip-color, currentColor)",
                    background: "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                  }}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="rgba(79, 70, 229, 0.8)"
                      stopOpacity={0.8}
                      className="dark:stop-color-indigo-400"
                    />
                    <stop
                      offset="95%"
                      stopColor="rgba(129, 140, 248, 0)"
                      stopOpacity={0}
                      className="dark:stop-color-indigo-500"
                    />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-primary, rgba(79, 70, 229, 1))"
                  strokeWidth={3}
                  dot={{ fill: "var(--chart-primary, rgba(79, 70, 229, 1))" }}
                  activeDot={{ r: 8 }}
                  className="dark:stroke-indigo-400 dark:fill-indigo-400"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">
              Top 5 sản phẩm bán chạy
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(229, 231, 235, 1)"
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(107, 114, 128, 1)"
                  className="dark:stroke-gray-400"
                />
                <YAxis
                  stroke="rgba(107, 114, 128, 1)"
                  className="dark:stroke-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                    borderRadius: "8px",
                    border:
                      "1px solid var(--tooltip-border, rgba(229, 231, 235, 1))",
                    color: "var(--tooltip-color, currentColor)",
                    background: "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="var(--chart-success, rgba(16, 185, 129, 1))"
                  radius={[4, 4, 0, 0]}
                  className="dark:fill-emerald-400"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">
              Trạng thái đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  nameKey="name"
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {orderStatusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.light[index % COLORS.light.length]}
                      className={`dark:fill-${
                        COLORS.dark[index % COLORS.dark.length]
                      }`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                    borderRadius: "8px",
                    border:
                      "1px solid var(--tooltip-border, rgba(229, 231, 235, 1))",
                    color: "var(--tooltip-color, currentColor)",
                    background: "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-white">
              Doanh thu theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(229, 231, 235, 1)"
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(107, 114, 128, 1)"
                  className="dark:stroke-gray-400"
                />
                <YAxis
                  stroke="rgba(107, 114, 128, 1)"
                  className="dark:stroke-gray-400"
                />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                  contentStyle={{
                    backgroundColor:
                      "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                    borderRadius: "8px",
                    border:
                      "1px solid var(--tooltip-border, rgba(229, 231, 235, 1))",
                    color: "var(--tooltip-color, currentColor)",
                    background: "var(--tooltip-bg, rgba(255, 255, 255, 1))",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--chart-purple, rgba(139, 92, 246, 1))"
                  radius={[4, 4, 0, 0]}
                  className="dark:fill-purple-400"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
