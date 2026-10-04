"use client";

import { Button } from "@crm/ui/components/button";
import {
  ScrollArea,
  ScrollBar,
} from "@crm/ui/components/scroll-area";
import { cn } from "@crm/ui/lib/utils";
import type { ComponentProps } from "react";
import { useCallback } from "react";

export type SuggestionsProps = ComponentProps<typeof ScrollArea> & {
  xuongDong?: boolean;
};

export const Suggestions = ({
  className,
  children,
  xuongDong = false,
  ...props
}: SuggestionsProps) =>
  xuongDong ? (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-2 [&>*]:h-auto [&>*]:min-h-7 [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:py-1 [&>*]:text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  ) : (
    <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
      <div className={cn("flex w-max flex-nowrap items-center gap-2", className)}>
        {children}
      </div>
      <ScrollBar className="hidden" orientation="horizontal" />
    </ScrollArea>
  );

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = useCallback(() => {
    onClick?.(suggestion);
  }, [onClick, suggestion]);

  return (
    <Button
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
