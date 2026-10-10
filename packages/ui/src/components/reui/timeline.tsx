"use client"

import type { HTMLAttributes, TimeHTMLAttributes } from "react"
import { createContext, useCallback, useContext, useState } from "react"
import { Slot } from "radix-ui"

import { cn } from "@crm/ui/lib/utils"

type TimelineContextValue = {
  activeStep: number
  setActiveStep: (step: number) => void
}

const TimelineContext = createContext<TimelineContextValue | undefined>(
  undefined
)

const useTimeline = () => {
  const context = useContext(TimelineContext)
  if (!context) {
    throw new Error("useTimeline must be used within a Timeline")
  }
  return context
}

interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: number
  value?: number
  onValueChange?: (value: number) => void
  orientation?: "horizontal" | "vertical"
  rail?: boolean
}

function Timeline({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "vertical",
  rail,
  className,
  children,
  ...props
}: TimelineProps) {
  const [activeStep, setInternalStep] = useState(defaultValue)

  const setActiveStep = useCallback(
    (step: number) => {
      if (value === undefined) {
        setInternalStep(step)
      }
      onValueChange?.(step)
    },
    [value, onValueChange]
  )

  const currentStep = value ?? activeStep

  return (
    <TimelineContext.Provider
      value={{ activeStep: currentStep, setActiveStep }}
    >
      <div
        className={cn(
          "group/timeline flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
          className
        )}
        data-orientation={orientation}
        data-rail={rail ? "true" : undefined}
        data-slot="timeline"
        {...props}
      >
        {children}
      </div>
    </TimelineContext.Provider>
  )
}

function TimelineContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="timeline-content"
      {...props}
    />
  )
}

interface TimelineDateProps extends TimeHTMLAttributes<HTMLTimeElement> {
  asChild?: boolean
}

function TimelineDate({
  asChild = false,
  className,
  ...props
}: TimelineDateProps) {
  const Comp = asChild ? Slot.Root : "time"

  return (
    <Comp
      className={cn(
        "text-muted-foreground mb-1 block text-xs font-medium group-data-[orientation=vertical]/timeline:max-sm:h-4 group-data-[rail=true]/timeline:tabular-nums sm:group-data-[rail=true]/timeline:absolute sm:group-data-[rail=true]/timeline:-left-36 sm:group-data-[rail=true]/timeline:w-24 sm:group-data-[rail=true]/timeline:text-right",
        className
      )}
      data-slot="timeline-date"
      {...props}
    />
  )
}

function TimelineHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} data-slot="timeline-header" {...props} />
  )
}

interface TimelineIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  variant?: "default" | "icon"
}

function TimelineIndicator({
  asChild = false,
  variant = "default",
  className,
  children,
  ...props
}: TimelineIndicatorProps) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      aria-hidden="true"
      className={cn(
        "border-border group-data-completed/timeline-item:border-muted-foreground absolute size-4 rounded-sm border-2 group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:left-0 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:top-0 group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:-translate-x-1/2",
        variant === "icon" &&
          "flex items-center justify-center border-0 bg-background text-foreground [&_svg]:size-4",
        className
      )}
      data-variant={variant}
      data-slot="timeline-indicator"
      {...props}
    >
      {children}
    </Comp>
  )
}

interface TimelineItemProps extends HTMLAttributes<HTMLDivElement> {
  step: number
}

function TimelineItem({ step, className, ...props }: TimelineItemProps) {
  const { activeStep } = useTimeline()

  return (
    <div
      className={cn(
        "group/timeline-item has-[+[data-completed]]:**:data-[slot=timeline-separator]:bg-muted-foreground relative flex flex-1 flex-col gap-0.5 group-data-[orientation=horizontal]/timeline:mt-8 group-data-[orientation=horizontal]/timeline:not-last:pe-8 group-data-[orientation=vertical]/timeline:ms-8 group-data-[orientation=vertical]/timeline:not-last:pb-6 sm:group-data-[rail=true]/timeline:ms-36",
        className
      )}
      data-completed={step <= activeStep || undefined}
      data-slot="timeline-item"
      {...props}
    />
  )
}

function TimelineSeparator({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-border absolute self-start group-last/timeline-item:hidden group-data-[orientation=horizontal]/timeline:-top-6 group-data-[orientation=horizontal]/timeline:h-0.5 group-data-[orientation=horizontal]/timeline:w-[calc(100%-1rem-0.25rem)] group-data-[orientation=horizontal]/timeline:translate-x-4.5 group-data-[orientation=horizontal]/timeline:-translate-y-1/2 group-data-[orientation=vertical]/timeline:-left-6 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:w-0.5 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=vertical]/timeline:translate-y-4.5",
        className
      )}
      data-slot="timeline-separator"
      {...props}
    />
  )
}

function TimelineTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-sm font-medium sm:group-data-[rail=true]/timeline:-mt-0.5",
        className
      )}
      data-slot="timeline-title"
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
}