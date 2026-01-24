"use client";

import type React from "react";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          content: "flex-1",
          toast: "group toast group-[.toaster]:shadow-lg",
          actionButton: "group-[.toast]:bg-primary",
          cancelButton: "group-[.toast]:bg-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
