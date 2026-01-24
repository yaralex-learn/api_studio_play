import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export function LoadingScreen({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (
    <div
      className={cn("min-h-screen flex items-center justify-center", className)}
      {...props}
    >
      <Spinner size="custom" className="text-primary" />
    </div>
  );
}
