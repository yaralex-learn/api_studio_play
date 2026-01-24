"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { subscriptionData, channelData } from "@/lib/market-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function SubscriptionOverview() {
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [channel, setChannel] = useState<"all" | "web" | "ios" | "android">("all")
  const [promotion, setPromotion] = useState<"all" | "coupon1" | "coupon2" | "coupon3">("all")

  // Determine which data to use based on channel selection
  const data = channel === "all" ? subscriptionData : channelData[channel]

  // Use data directly without filtering by user type
  const filteredData = data

  // Apply promotion filter (this is a placeholder - you would need actual promotion data)
  const promotionFilteredData =
    promotion === "all"
      ? filteredData
      : filteredData.map((item) => {
          // This is a simple simulation - in a real app, you would have actual promotion data
          const multiplier =
            promotion === "coupon1" ? 1.1 : promotion === "coupon2" ? 1.2 : promotion === "coupon3" ? 1.3 : 1

          return {
            ...item,
            free: Math.round(item.free * multiplier),
            paid: Math.round(item.paid * multiplier),
            total: Math.round(item.total * multiplier),
          }
        })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Subscription Overview</CardTitle>
        <CardDescription>Track subscription growth over time across different channels and user types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div>
            <Label htmlFor="chart-type" className="mb-2 block">
              Chart Type
            </Label>
            <Tabs
              value={chartType}
              onValueChange={(value) => setChartType(value as "line" | "bar")}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="line">Line Plot</TabsTrigger>
                <TabsTrigger value="bar">Bar Plot</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <Label htmlFor="channel" className="mb-2 block">
              Channel
            </Label>
            <Select value={channel} onValueChange={(value) => setChannel(value as any)}>
              <SelectTrigger className="w-[180px]" id="channel">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="android">Android</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="promotion" className="mb-2 block">
              Promotion
            </Label>
            <Select value={promotion} onValueChange={(value) => setPromotion(value as any)}>
              <SelectTrigger className="w-[180px]" id="promotion">
                <SelectValue placeholder="Select promotion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">No Discount</SelectItem>
                <SelectItem value="coupon1">Coupon 1</SelectItem>
                <SelectItem value="coupon2">Coupon 2</SelectItem>
                <SelectItem value="coupon3">Coupon 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={promotionFilteredData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "total" ? "Total" : name === "free" ? "Free Users" : "Paid Users",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="free" name="Free Users" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="paid" name="Paid Users" stroke="#82ca9d" />
                <Line type="monotone" dataKey="total" name="Total Users" stroke="#ff7300" />
              </LineChart>
            ) : (
              <BarChart
                data={promotionFilteredData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "total" ? "Total" : name === "free" ? "Free Users" : "Paid Users",
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Bar dataKey="free" name="Free Users" fill="#8884d8" />
                <Bar dataKey="paid" name="Paid Users" fill="#82ca9d" />
                <Bar dataKey="total" name="Total Users" fill="#ff7300" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
