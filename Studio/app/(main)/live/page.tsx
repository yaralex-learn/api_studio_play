import { LiveDashboard } from "@/components/live/live-dashboard"

export default async function LivePage() {
  return (
    <div className="container py-6 px-6">
      <h1 className="text-3xl font-bold">Live</h1>
      <p className="mt-4 text-muted-foreground">
        Start a live session, interact with students in real-time, and track their performance.
      </p>
      <LiveDashboard />
    </div>
  )
}
