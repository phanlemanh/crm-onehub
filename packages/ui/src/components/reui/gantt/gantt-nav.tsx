"use client";
import { useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, } from "react";
import { useGanttNavigation, useGanttScale, useGanttSelector, useGanttSettings, useGanttViewConfig, } from "@crm/ui/components/reui/gantt/gantt";
import { toZoned } from "@crm/ui/components/reui/gantt/gantt-lib";
import type { GanttScale } from "@crm/ui/components/reui/gantt/gantt-types";
import { format } from "date-fns";
import { Slot } from "radix-ui";
import { cn } from "@crm/ui/lib/utils";
import { Button } from "@crm/ui/components/button";
import { Calendar } from "@crm/ui/components/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from "@crm/ui/components/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger, } from "@crm/ui/components/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@crm/ui/components/tooltip";
import ChevronLeftIcon from "@carbon/icons-react/es/ChevronLeft";
import ChevronRightIcon from "@carbon/icons-react/es/ChevronRight";
import ChevronDownIcon from "@carbon/icons-react/es/ChevronDown";
import CalendarIcon from "@carbon/icons-react/es/Calendar";
const GANTT_SCALES: GanttScale[] = ["day", "week", "month", "quarter", "year"];
function useNavButtonProps(): {
    variant: "ghost" | "outline" | "secondary" | "default";
    size: "sm" | "default";
    iconSize: "icon-sm" | "icon";
} {
    const viewConfig = useGanttViewConfig();
    return {
        variant: viewConfig.navButtonVariant,
        size: viewConfig.navButtonSize,
        iconSize: viewConfig.navButtonSize === "sm" ? "icon-sm" : "icon",
    };
}
type NavButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    children?: ReactNode;
    tooltip?: ReactNode | null;
    asChild?: boolean;
};
function NavTooltip({ content, children, }: {
    content: ReactNode | null;
    children: React.ReactElement;
}) {
    if (content === null || content === undefined)
        return children;
    return (<Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom">{content}</TooltipContent>
    </Tooltip>);
}
function GanttNavToday({ className, asChild = false, children, tooltip, ...props }: NavButtonProps) {
    const { today, isToday } = useGanttNavigation();
    const settings = useGanttSettings();
    const nav = useNavButtonProps();
    const defaultTooltip = useGanttSelector(() => format(toZoned(new Date(), settings.timeZone), settings.i18n.formats.dayTitle, { locale: settings.locale }));
    return (<NavTooltip content={tooltip === undefined ? defaultTooltip : tooltip}>
      <Button variant={nav.variant} size={nav.size} data-slot="gantt-nav-today" data-active={isToday || undefined} className={cn(className)} onClick={today} asChild={asChild} {...props}>
        {children ?? settings.i18n.labels.today}
      </Button>
    </NavTooltip>);
}
function GanttNavPrev({ className, asChild = false, children, tooltip, ...props }: NavButtonProps) {
    const { prev } = useGanttNavigation();
    const settings = useGanttSettings();
    const nav = useNavButtonProps();
    return (<NavTooltip content={tooltip === undefined ? settings.i18n.labels.previous : tooltip}>
      <Button variant={nav.variant} size={nav.iconSize} data-slot="gantt-nav-prev" aria-label={settings.i18n.labels.previous} className={cn(className)} onClick={prev} asChild={asChild} {...props}>
        {children ?? (<ChevronLeftIcon className="size-4" aria-hidden="true"/>)}
      </Button>
    </NavTooltip>);
}
function GanttNavNext({ className, asChild = false, children, tooltip, ...props }: NavButtonProps) {
    const { next } = useGanttNavigation();
    const settings = useGanttSettings();
    const nav = useNavButtonProps();
    return (<NavTooltip content={tooltip === undefined ? settings.i18n.labels.next : tooltip}>
      <Button variant={nav.variant} size={nav.iconSize} data-slot="gantt-nav-next" aria-label={settings.i18n.labels.next} className={cn(className)} onClick={next} asChild={asChild} {...props}>
        {children ?? (<ChevronRightIcon className="size-4" aria-hidden="true"/>)}
      </Button>
    </NavTooltip>);
}
interface GanttTitleProps extends HTMLAttributes<HTMLDivElement> {
    format?: (ctx: {
        title: string;
    }) => ReactNode;
    asChild?: boolean;
}
function GanttTitle({ className, asChild = false, children, format: formatTitle, ...props }: GanttTitleProps) {
    const { title } = useGanttNavigation();
    const Comp = asChild ? Slot.Root : "div";
    return (<Comp data-slot="gantt-title" aria-live="polite" className={cn("min-w-0 truncate text-sm font-semibold", className)} {...props}>
      {children ?? formatTitle?.({ title }) ?? title}
    </Comp>);
}
interface GanttScaleSwitcherProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    children?: ReactNode;
    tooltip?: ReactNode | null;
    scales?: GanttScale[];
    asChild?: boolean;
}
function GanttScaleSwitcher({ className, asChild, children, tooltip, scales = GANTT_SCALES, ...props }: GanttScaleSwitcherProps) {
    const { scale, setScale } = useGanttScale();
    const settings = useGanttSettings();
    const nav = useNavButtonProps();
    const labels = settings.i18n.labels;
    const [open, setOpen] = useState(false);
    const [tipOpen, setTipOpen] = useState(false);
    const selectScale = (next: GanttScale) => {
        setOpen(false);
        setScale(next);
    };
    return (<DropdownMenu open={open} onOpenChange={(next: boolean) => {
            setOpen(next);
            if (next)
                setTipOpen(false);
        }}>
      
      <Tooltip open={tipOpen && !open} onOpenChange={(next: boolean) => setTipOpen(next)}>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
            <Button variant={nav.variant} size={nav.size} data-slot="gantt-scale-switcher" aria-label={labels.selectView} className={cn("gap-1", className)} {...props}>
              {children ?? (<>
                  {labels.scales[scale]}
                  <ChevronDownIcon className="size-4 opacity-60" aria-hidden="true"/>
                </>)}
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        {tipOpen && !open && tooltip !== null && (<TooltipContent side="bottom">
            {tooltip ?? labels.selectView}
          </TooltipContent>)}
      </Tooltip>
      <DropdownMenuContent align="start" className="min-w-36">
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground font-normal">
            {labels.selectView}
          </DropdownMenuLabel>
          {scales.map((value) => (<DropdownMenuItem key={value} data-active={scale === value || undefined} onClick={() => selectScale(value)}>
              {labels.scales[value]}
            </DropdownMenuItem>))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>);
}
interface GanttDatePickerProps {
    className?: string;
}
function GanttDatePicker({ className }: GanttDatePickerProps) {
    const { date, goTo } = useGanttNavigation();
    const settings = useGanttSettings();
    const nav = useNavButtonProps();
    const [open, setOpen] = useState(false);
    const zoned = toZoned(date, settings.timeZone);
    return (<Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={nav.variant} size={nav.iconSize} data-slot="gantt-date-picker" aria-label={settings.i18n.labels.goToDate} className={cn(className)}>
          <CalendarIcon className="size-4" aria-hidden="true"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0!">
        <Calendar mode="single" selected={zoned} defaultMonth={zoned} locale={settings.locale} weekStartsOn={settings.weekStartsOn} onSelect={(next: Date | undefined) => {
            if (next) {
                goTo(next);
                setOpen(false);
            }
        }}/>
      </PopoverContent>
    </Popover>);
}
interface GanttToolbarProps extends HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}
function GanttToolbar({ className, asChild = false, children, ...props }: GanttToolbarProps) {
    const viewConfig = useGanttViewConfig();
    const Comp = asChild ? Slot.Root : "div";
    return (<Comp data-slot="gantt-toolbar" className={cn("flex items-center gap-2", viewConfig.classNames?.toolbar, className)} {...props}>
      {children}
    </Comp>);
}
interface GanttNavProps extends HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}
function GanttNav({ className, asChild = false, children, ...props }: GanttNavProps) {
    const viewConfig = useGanttViewConfig();
    const Comp = asChild ? Slot.Root : "div";
    return (<Comp data-slot="gantt-nav" className={cn("flex min-w-0 flex-wrap items-center gap-2 border-b px-3 py-2", viewConfig.stickyNav && "bg-background sticky top-0 z-30", viewConfig.classNames?.nav, className)} {...props}>
      {children ?? (<TooltipProvider delayDuration={600} skipDelayDuration={300}>
          <GanttNavToday />
          <GanttScaleSwitcher />
          <div className="flex items-center">
            <GanttNavPrev />
            <GanttNavNext />
          </div>
          <GanttTitle />
          <div className="grow"/>
        </TooltipProvider>)}
    </Comp>);
}
export { GANTT_SCALES, GanttDatePicker, GanttNav, GanttNavNext, GanttNavPrev, GanttNavToday, GanttScaleSwitcher, GanttTitle, GanttToolbar, };
export type { GanttNavProps, GanttScaleSwitcherProps, GanttTitleProps, GanttToolbarProps, };
