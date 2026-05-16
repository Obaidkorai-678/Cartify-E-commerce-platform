"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsSkeleton } from "@/components/admin/SkeletonLoaders";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface AnalyticsData {
  revenue: { total: number; change: number };
  orders: { total: number; change: number; pending: number };
  customers: { total: number; change: number };
  products: { total: number; change: number };
  topProducts: { name: string; sales: number; revenue: number }[];
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/admin/analytics?period=${timeRange}`);

      if (!res.ok) throw new Error("Failed to fetch analytics");

      const data = await res.json();

      setAnalytics(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    format,
  }: any) => {
    const safeValue = value ?? 0;
    const isPositive = change >= 0;

    return (
      <Card className="hover:shadow-lg transition">
        <div className={`h-1 bg-gradient-to-r ${color}`} />

        <CardHeader>
          <CardTitle className="flex justify-between text-sm">
            {title}
            <Icon className="w-4 h-4" />
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {format === "currency"
              ? `$${safeValue.toLocaleString()}`
              : safeValue.toLocaleString()}
          </div>

          <div className="flex items-center gap-2 mt-2">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}

            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? "+" : ""}
              {change ?? 0}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const chartData =
    analytics?.topProducts?.map((p) => ({
      name: p.name ?? "Unknown",
      revenue: p.revenue ?? 0,
      sales: p.sales ?? 0,
    })) ?? [];

  if (loading) return <AnalyticsSkeleton />;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchAnalytics}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 />
          Analytics
        </h1>

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <StatCard
          title="Revenue"
          value={analytics?.revenue?.total}
          change={analytics?.revenue?.change}
          icon={DollarSign}
          color="from-green-500 to-emerald-600"
          format="currency"
        />

        <StatCard
          title="Orders"
          value={analytics?.orders?.total}
          change={analytics?.orders?.change}
          icon={ShoppingCart}
          color="from-blue-500 to-cyan-600"
        />

        <StatCard
          title="Customers"
          value={analytics?.customers?.total}
          change={analytics?.customers?.change}
          icon={Users}
          color="from-purple-500 to-pink-600"
        />

        <StatCard
          title="Products"
          value={analytics?.products?.total}
          change={analytics?.products?.change}
          icon={Package}
          color="from-orange-500 to-red-600"
        />

      </div>

      {/* CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />

              <Tooltip
                formatter={(value, name) => {
                  const safe = typeof value === "number" ? value : 0;

                  return [
                    name === "revenue"
                      ? `$${safe.toLocaleString()}`
                      : safe,
                    name,
                  ];
                }}
              />

              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminAnalytics;
