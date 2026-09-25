"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { useMessages } from "@crm/ui/components/locale-provider"
import { cn } from "@crm/ui/lib/utils"

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  variant?: "neutral"
  expected?: number | null
  label?: string
}

const kep = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

function Progress({
  className,
  value,
  variant,
  expected,
  label,
  ...props
}: ProgressProps) {
  const msg = useMessages()
  if (variant !== "neutral") {
    return (
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="size-full flex-1 bg-primary transition-all"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    )
  }
  const phan = kep(value ?? 0)
  const vach = expected === null || expected === undefined ? null : kep(expected)
  const nhan = label ?? msg.tienDo.nhan
  const doc =
    vach === null
      ? msg.tienDo.khongVach(nhan, String(phan))
      : msg.tienDo.coVach(nhan, String(phan), String(vach))
  return (
    <div
      data-slot="progress-neutral"
      className={cn("relative flex h-3 w-full min-w-0 items-center", className)}
      title={vach === null ? undefined : msg.tienDo.leRa(String(vach))}
    >
      <ProgressPrimitive.Root
        data-slot="progress"
        data-variant="neutral"
        value={phan}
        getValueLabel={() => doc}
        aria-label={doc}
        className="relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted"
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="size-full flex-1 rounded-full bg-muted-foreground transition-all"
          style={{ transform: `translateX(-${100 - phan}%)` }}
        />
      </ProgressPrimitive.Root>
      {vach === null ? null : (
        <span
          aria-hidden="true"
          data-expected={vach}
          className="pointer-events-none absolute inset-y-0 w-0.5 rounded-full bg-foreground"
          style={{ left: `calc(${vach}% - 1px)` }}
        />
      )}
    </div>
  )
}

export { Progress }
