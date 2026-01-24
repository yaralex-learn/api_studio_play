import { redirect } from "next/navigation"

export default function ChannelPage({ params }: { params: { id: string } }) {
  // Redirect to the content page
  redirect(`/channels/${params.id}/content`)
}
