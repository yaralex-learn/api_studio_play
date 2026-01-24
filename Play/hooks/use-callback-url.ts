"use client";

import { useSearchParams } from "next/navigation";

export default function useCallbackUrl(key: string = "cb") {
  const searchParams = useSearchParams();
  const cb = searchParams.get(key);

  return {
    callbackUrl: cb
      ? {
          asParam: `?${key}=${cb}`,
          value: cb,
        }
      : {
          asParam: "",
          value: "",
        },
  };
}
