import { BASE_URL, COOKIE_TOKEN_KEY } from "@/lib/constants";
import { cookies } from "next/headers";
import { Readable } from "stream";

export const GET = async (
  _: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_TOKEN_KEY)?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;

  try {
    const response = await fetch(`${BASE_URL}/studio/space/file/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok || !response.body) {
      return new Response("Failed to fetch file", { status: response.status });
    }

    const nodeStream = Readable.fromWeb(response.body as any);

    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";

    return new Response(nodeStream as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response("Server error", { status: 500 });
  }
};
