import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import apiService from "../../Api/Api";
import { CATEGORY_TITLES } from "../../Constants/Category.ts";

export default function AdminRevenueDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
        const [totalRes, categoryRes] = await Promise.all([
            apiService.getAdminTotalRevenue(),
            apiService.getAdminRevenueByCategory(),
        ]);

        setTotalRevenue(totalRes.data.totalRevenue || 0);
        setTotalOrders(totalRes.data.totalOrders || 0);

        const normalizedData = (categoryRes.data.data || []).map((item) => ({
            ...item,
            categoryTitle:
            CATEGORY_TITLES[item.category] || item.category,
        }));

        setData(normalizedData);
        } catch (err) {
        console.error("Load revenue dashboard failed", err);
        } finally {
        setLoading(false);
        }
    };

    fetchData();
  }, []);

  const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white border rounded-lg shadow px-4 py-3 text-sm">
        <p className="font-semibold mb-1">{label}</p>

        <p className="text-gray-700">
          Doanh thu:{" "}
          <span className="font-medium text-green-600">
            {data.totalRevenue.toLocaleString()} đ
          </span>
        </p>

        <p className="text-gray-700">
          Tổng đơn:{" "}
          <span className="font-medium text-blue-600">
            {data.totalOrders}
          </span>
        </p>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white shadow p-5">
          <p className="text-sm text-gray-500">Tổng doanh thu</p>
          <p className="text-2xl font-semibold text-green-600 mt-2">
            {totalRevenue.toLocaleString()} đ
          </p>
        </div>
        <div className="rounded-xl bg-white shadow p-5">
          <p className="text-sm text-gray-500">Tổng số đơn hàng</p>
          <p className="text-2xl font-semibold text-blue-600 mt-2">
            {totalOrders}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl bg-white shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Doanh thu theo danh mục sản phẩm
        </h2>

        {data.length === 0 ? (
          <p className="text-gray-500">Chưa có dữ liệu</p>
        ) : (
          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="categoryTitle" />

                <YAxis
                tickFormatter={(value) =>
                    `${(value / 1_000_000).toFixed(0)}M`
                }
                />

                <Tooltip content={<RevenueTooltip />} />

                <Bar
                  dataKey="totalRevenue"
                  barSize={36}
                  radius={[6, 6, 0, 0]}
                  fill="#3b82f6"
                />
            </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}