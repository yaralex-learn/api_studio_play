import { NewChannelForm } from "@/components/new-channel-form"

export default async function NewChannelPage() {
  return (
    <div className="container py-6 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Create a new channel</h1>
        <p className="text-muted-foreground text-sm mb-6">Fill in the details below to create your learning channel</p>
        <NewChannelForm />
      </div>
    </div>
  )
}
