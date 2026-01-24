import Link from "next/link"
import { Button } from "@/components/ui/button"
import { YaralexLogo } from "@/components/icons"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mb-8 flex items-center gap-2">
        <YaralexLogo className="h-12 w-12" />
        <h1 className="text-4xl font-bold text-yaralex-green">Yaralex Play</h1>
      </div>
      <h2 className="mb-6 text-2xl font-semibold text-white">Learn languages the fun way</h2>
      <p className="mb-8 max-w-md text-lg text-white/80">
        Start your language learning journey with fun, game-like lessons
      </p>
      <div className="flex gap-4">
        <Button
          asChild
          className="bg-yaralex-green hover:bg-yaralex-green/90 text-black font-bold rounded-xl px-8 py-6 text-lg"
        >
          <Link href="/learn">Get Started</Link>
        </Button>
      </div>
    </div>
  )
}
