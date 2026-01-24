"use client";

import {
  COOKIE_REFRESH_TOKEN_KEY,
  COOKIE_TOKEN_EXPIRATION_DATE_KEY,
  COOKIE_TOKEN_KEY,
  COOKIE_USER_KEY,
} from "@/lib/constants";
import Toast from "@/lib/toast";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { deleteCookie } from "cookies-next/client";
import { useState, type ReactNode } from "react";

function onError(error: any) {
  const status = error?.status;
  const message = error?.response?.data?.message;

  if (status === 401) {
    deleteCookie(COOKIE_TOKEN_KEY);
    deleteCookie(COOKIE_REFRESH_TOKEN_KEY);
    deleteCookie(COOKIE_TOKEN_EXPIRATION_DATE_KEY);
    deleteCookie(COOKIE_USER_KEY);
    // Refresh the page
    window.location.reload();
  } else {
    Toast.e({
      title: "Something went wrong!",
      description:
        message?.["en"] ?? "Please check your credentials and try again.",
    });
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      queryCache: new QueryCache({ onError }),
      defaultOptions: {
        queries: {
          gcTime: 0,
          staleTime: Infinity,
          retry: 0,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: 0,
          onError,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
