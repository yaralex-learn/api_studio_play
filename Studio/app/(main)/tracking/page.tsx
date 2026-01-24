import { redirect } from "next/navigation"

export default async function TrackingPage() {
  // Redirect to the overall tracking page
  redirect("/tracking/overall")
}
