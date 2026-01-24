"use client";

import type React from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UseMutationResult } from "@tanstack/react-query";
import { SendHorizontal, Sparkles } from "lucide-react";
import { useState } from "react";

type TAIPromptButtonProps<T> = ButtonProps & {
  mutation?: UseMutationResult<T, Error, string, unknown>;
};

export function AIPromptButton<T>({
  mutation,
  ...buttonProps
}: TAIPromptButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async () => {
    const _prompt = prompt.trim();
    if (_prompt.length > 0) {
      mutation?.mutate(_prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Popover open={mutation?.isPending ? true : open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" {...buttonProps}>
          <Sparkles className="h-4 w-4 text-purple-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 flex items-center gap-0 p-1 rounded-full overflow-hidden">
        <Sparkles className="h-4 w-4 ms-3 text-purple-400" />

        <Input
          placeholder="Ask AI anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={mutation?.isPending}
          className="flex-1 border-none outline-none ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || mutation?.isPending}
          size="icon"
          variant="ghost"
          className="rounded-full shrink-0"
        >
          {mutation?.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
