import { SubscriptionOverview } from "@/components/market/subscription-overview"

export default async function MarketPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Market Analytics</h1>
      <SubscriptionOverview />
    </div>
  )
}
