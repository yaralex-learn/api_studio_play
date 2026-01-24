"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { revenueData } from "@/lib/market-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Sample promotion data
const promotions = [
  { id: "all", name: "All Promotions" },
  { id: "summer", name: "Summer Sale" },
  { id: "holiday", name: "Holiday Special" },
  { id: "newuser", name: "New User Discount" },
]

export function RevenueAnalytics() {
  const [chartType, setChartType] = useState<"area" | "bar">("area")
  const [channel, setChannel] = useState<"all" | "web" | "ios" | "android">("all")
  const [promotion, setPromotion] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  // Filter data based on channel, promotion, and date range
  const filteredData = (() => {
    let data = [...revenueData]

    // Apply channel filter
    if (channel !== "all") {
      // This is a simplified example - in a real app, you'd have channel-specific data
      // Here we're just reducing the values by a factor based on the channel
      const channelFactors = {
        web: 0.6,
        ios: 0.25,
        android: 0.15,
      }

      data = data.map((item) => ({
        ...item,
        totalRevenue: Math.round(item.totalRevenue * channelFactors[channel as keyof typeof channelFactors]),
        monthlyRevenue: Math.round(item.monthlyRevenue * channelFactors[channel as keyof typeof channelFactors]),
        netProfit: Math.round(item.netProfit * channelFactors[channel as keyof typeof channelFactors]),
      }))
    }

    // Apply promotion filter
    if (promotion !== "all") {
      // This is a simplified example - in a real app, you'd have promotion-specific data
      // Here we're just adjusting values based on the promotion
      const promotionFactors = {
        summer: 1.2,
        holiday: 1.5,
        newuser: 0.8,
      }

      if (promotionFactors[promotion as keyof typeof promotionFactors]) {
        const factor = promotionFactors[promotion as keyof typeof promotionFactors]
        data = data.map((item) => ({
          ...item,
          totalRevenue: Math.round(item.totalRevenue * factor),
          monthlyRevenue: Math.round(item.monthlyRevenue * factor),
          netProfit: Math.round(item.netProfit * factor),
        }))
      }
    }

    // Apply date range filter
    if (dateRange.from && dateRange.to) {
      // Convert dates to strings for comparison (format: "YYYY-MM")
      const fromStr = format(dateRange.from, "yyyy-MM")
      const toStr = format(dateRange.to, "yyyy-MM")

      return data.filter((item) => {
        return item.date >= fromStr && item.date <= toStr
      })
    }

    return data // Default: show all data
  })()

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Get latest data for summary cards
  const latestData =
    filteredData.length > 0 ? filteredData[filteredData.length - 1] : revenueData[revenueData.length - 1]
  const previousData =
    filteredData.length > 1 ? filteredData[filteredData.length - 2] : revenueData[revenueData.length - 2]

  // Calculate growth percentages
  const revenueGrowth =
    previousData.monthlyRevenue > 0
      ? Math.round((latestData.monthlyRevenue / previousData.monthlyRevenue - 1) * 100)
      : 0

  const profitGrowth =
    previousData.netProfit > 0 ? Math.round((latestData.netProfit / previousData.netProfit - 1) * 100) : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>Track your revenue, monthly earnings, and net profit over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Tabs
                value={chartType}
                onValueChange={(value) => setChartType(value as "area" | "bar")}
                className="w-[200px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="area">Area Chart</TabsTrigger>
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <Select value={channel} onValueChange={(value) => setChannel(value as any)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Select value={promotion} onValueChange={setPromotion}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Promotion" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map((promo) => (
                    <SelectItem key={promo.id} value={promo.id}>
                      {promo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL yyyy")} - {format(dateRange.to, "LLL yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={filteredData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), ""]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  name="Total Revenue"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  name="Net Profit"
                  stackId="3"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={filteredData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), ""]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar dataKey="totalRevenue" name="Total Revenue" fill="#8884d8" />
                <Bar dataKey="netProfit" name="Net Profit" fill="#ffc658" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(latestData.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {revenueGrowth >= 0 ? "+" : ""}
                {revenueGrowth}% from previous period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(latestData.netProfit)}</div>
              <p className="text-xs text-muted-foreground">
                {profitGrowth >= 0 ? "+" : ""}
                {profitGrowth}% from previous period
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
