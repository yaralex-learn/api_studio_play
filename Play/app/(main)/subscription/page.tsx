"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { CircularProgressBar } from "@/components/circular-progress-bar"
import { ChannelSelector } from "@/components/channel-selector"
import { useState } from "react"

// Mock subscription data
const subscriptionData = {
  type: "Premium",
  status: "Active",
  startDate: "April 15, 2025",
  endDate: "April 15, 2026",
  nextBillingDate: "April 15, 2026",
  price: "$79.99",
  period: "yearly",
  features: [
    "Unlimited live sessions",
    "Personalized learning path",
    "Advanced grammar exercises",
    "Pronunciation analysis",
    "Offline mode",
    "Priority support",
  ],
  paymentMethod: "Visa ending in 4242",
  remainingDays: 275, // 275 days remaining in subscription
  totalDays: 365, // total days in subscription period
}

// Mock channels data - these are the learning community channels
const channels = [
  { id: 1, name: "Beginners Hub", image: "/placeholder.svg?height=24&width=24&text=BH" },
  { id: 2, name: "Grammar Masters", image: "/placeholder.svg?height=24&width=24&text=GM" },
  { id: 3, name: "Conversation Club", image: "/placeholder.svg?height=24&width=24&text=CC" },
  { id: 4, name: "Study Buddies", image: "/placeholder.svg?height=24&width=24&text=SB" },
  { id: 5, name: "Advanced Learners", image: "/placeholder.svg?height=24&width=24&text=AL" },
]

// Calculate progress as remaining days percentage
const remainingProgress = (subscriptionData.remainingDays / subscriptionData.totalDays) * 100

// Other subscription plans
const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic",
    price: "$4.99",
    period: "monthly",
    color: "#1CB0F6",
    features: ["Basic lessons and exercises", "Limited live sessions (2/month)", "Standard support"],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    period: "monthly",
    color: "#58CC02",
    features: [
      "All basic features",
      "Unlimited live sessions",
      "Personalized learning path",
      "Advanced grammar exercises",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "premium-yearly",
    name: "Premium Yearly",
    price: "$79.99",
    period: "yearly",
    color: "#FF9600",
    features: ["All premium features", "2 months free", "Offline mode", "Pronunciation analysis", "VIP support"],
    popular: false,
  },
]

export default function SubscriptionPage() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0])
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Subscription</h1>
        <ChannelSelector channels={channels} selectedChannel={selectedChannel} onChannelChange={setSelectedChannel} />
      </div>

      {/* Current Subscription Card */}
      <Card className="border-2 border-white/10 bg-[#1E2B31] mb-10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12">
                <Image src="/crown.png" alt="Premium" width={48} height={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{subscriptionData.type} Subscription</h2>
                <p className="text-white/70">
                  <span className="bg-yaralex-green text-black text-xs font-bold px-2 py-0.5 rounded-full mr-2">
                    {subscriptionData.status}
                  </span>
                  {subscriptionData.period === "yearly" ? "Annual Plan" : "Monthly Plan"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <CircularProgressBar
                progress={remainingProgress}
                size={60}
                color="#58CC02"
                text={`${subscriptionData.remainingDays}`}
              />
              <span className="text-white/70 text-xs mt-1">days left</span>
            </div>
          </div>

          {/* Subscription details cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="text-sm text-white/70 mb-1">Start Date</h3>
              <p className="text-white font-medium">{subscriptionData.startDate}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="text-sm text-white/70 mb-1">End Date</h3>
              <p className="text-white font-medium">{subscriptionData.endDate}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="text-sm text-white/70 mb-1">Plan Duration</h3>
              <p className="text-white font-medium">{subscriptionData.totalDays} days</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-4">Included Features</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {subscriptionData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-yaralex-green flex-shrink-0" />
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Subscription Plans */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Other Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-2 ${plan.popular ? "border-yaralex-green" : "border-white/10"} bg-[#1E2B31] relative overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-yaralex-green text-black text-xs font-bold px-3 py-1 rounded-bl-md">
                  POPULAR
                </div>
              )}
              <CardContent className="h-full flex flex-col items-stretch p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-end mt-2">
                    <span className="text-2xl font-bold" style={{ color: plan.color }}>
                      {plan.price}
                    </span>
                    <span className="text-white/70 ml-1">/{plan.period}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 mt-0.5" style={{ color: plan.color }} />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full font-bold text-black" style={{ backgroundColor: plan.color, color: "black" }}>
                  {plan.id === "premium" ? "Current Plan" : "Switch Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
