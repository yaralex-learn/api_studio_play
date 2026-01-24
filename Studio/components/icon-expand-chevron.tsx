import { ChevronDownIcon, ChevronRightIcon, LucideProps } from "lucide-react";
import { PropsWithChildren } from "react";

type TExpandChevronIconProps = LucideProps & {
  expanded?: boolean;
};

export default function ExpandChevronIcon({
  expanded,
  children,
  ...props
}: PropsWithChildren<TExpandChevronIconProps>) {
  return (
    <div className="flex flex-row items-center gap-2">
      {expanded ? (
        <ChevronDownIcon className="h-3 w-3 text-foreground" {...props} />
      ) : (
        <ChevronRightIcon className="h-3 w-3 text-foreground" {...props} />
      )}

      {children}
    </div>
  );
}
