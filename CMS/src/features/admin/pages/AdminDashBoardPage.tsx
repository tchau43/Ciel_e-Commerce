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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng doanh thu</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Tổng doanh thu{" "}
              {period === "weekly"
                ? "tuần này"
                : period === "monthly"
                ? "tháng này"
                : "năm nay"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Doanh thu hôm nay</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(todayRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Tính từ 00:00 hôm nay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Số đơn hàng</CardDescription>
            <CardTitle className="text-3xl">{orderCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo thời gian</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
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
                  fill="#8884d8"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {orderStatusData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
