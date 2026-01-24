import { RefAttributes, useEffect, useRef } from "react";
import { Input, InputProps } from "./ui/input";

type TBlurryInputProps = InputProps &
  RefAttributes<HTMLInputElement> & {
    enabled?: boolean;
    onBlurred?: () => void;
  };

export default function BlurryInput({
  enabled,
  onBlurred,
  ...props
}: TBlurryInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        enabled &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onBlurred?.();
      }
    };

    if (enabled) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [props.value, enabled, inputRef]);

  return <Input ref={inputRef} autoFocus {...props} />;
}
