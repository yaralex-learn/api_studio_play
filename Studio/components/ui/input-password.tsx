import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { forwardRef, PropsWithChildren, useState } from "react";
import { Input, InputProps } from "./input";

const InputPassword = forwardRef<
  HTMLInputElement,
  PropsWithChildren<InputProps>
>(({ className, type, children, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {children}

      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        placeholder="Create a password"
        autoCapitalize="none"
        {...props}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </div>
  );
});

Input.displayName = "InputPassword";

export { InputPassword };
