import { cn } from "@/lib/utils";
import { RefAttributes, useEffect, useRef } from "react";
import { Textarea, TextareaProps } from "./textarea";

type TGrowableTextareaProps = TextareaProps &
  RefAttributes<HTMLTextAreaElement>;

export default function GrowableTextarea({
  value,
  onChange,
  className,
  ...props
}: TGrowableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + 3 + "px";
    }
  };

  useEffect(() => handleInput(), []);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onInput={handleInput}
      rows={1}
      className={cn("min-h-fit resize-none", className)}
      {...props}
    />
  );
}
