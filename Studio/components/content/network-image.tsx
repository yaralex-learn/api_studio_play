"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface INetworkImageProps {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
}

export function NetworkImage({
  src,
  alt = "Image",
  className = "",
}: INetworkImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [src]);

  return (
    <div className="relative">
      {isLoading && (
        <Skeleton className={`absolute inset-0 w-full h-full rounded-md`} />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
