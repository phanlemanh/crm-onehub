import type { GanttDateRange, GanttScale, } from "@crm/ui/components/reui/gantt/gantt-types";
import { format, isSameMonth, isSameYear, subMilliseconds, type Locale, } from "date-fns";
interface GanttI18nConfig {
    labels: {
        today: string;
        previous: string;
        next: string;
        addEvent: string;
        addTask: string;
        allDay: string;
        loading: string;
        event: string;
        events: (count: number) => string;
        week: (weekNumber: number) => string;
        resources: string;
        goToDate: string;
        scheduleHint: string;
        scheduleHintDrag: string;
        reorder: string;
        selectView: string;
        zoomIn: string;
        zoomOut: string;
        resizePanel: string;
        jumpToBar: (title: string) => string;
        progress: (percent: number) => string;
        durationDays: (days: number) => string;
        continues: string;
        planned: (rangeLabel: string) => string;
        milestone: string;
        scales: {
            day: string;
            week: string;
            month: string;
            quarter: string;
            year: string;
        };
    };
    formats: {
        monthTitle: string;
        dayTitle: string;
        timeGutter: string;
        eventTime: string;
    };
    functions: {
        formatTitle: (scale: GanttScale, ctx: {
            date: Date;
            activeRange: GanttDateRange;
            visibleRange: GanttDateRange;
            locale?: Locale;
        }) => string;
        formatEventTime: (start: Date, end: Date, allDay: boolean, locale?: Locale) => string;
        formatDayRange: (range: GanttDateRange, locale?: Locale) => string;
        formatEventAriaLabel: (parts: {
            title: string;
            timeLabel: string;
            milestoneLabel?: string;
            rowTitle?: string;
            progressLabel?: string;
            plannedLabel?: string;
            continues: boolean;
        }) => string;
    };
}
const DEFAULT_LABELS: GanttI18nConfig["labels"] = {
    today: "Today",
    previous: "Previous",
    next: "Next",
    addEvent: "Add event",
    addTask: "Add task",
    allDay: "All day",
    loading: "Loading events",
    event: "event",
    events: (count) => (count === 1 ? "1 event" : `${count} events`),
    week: (weekNumber) => `W${weekNumber}`,
    resources: "Resources",
    goToDate: "Go to date",
    scheduleHint: "Click to add a schedule",
    scheduleHintDrag: "Click or drag to add a schedule",
    reorder: "Reorder",
    selectView: "Select view",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    resizePanel: "Resize panel",
    jumpToBar: (title) => `Scroll to "${title}"`,
    progress: (percent) => `${percent}% complete`,
    durationDays: (days) => (days === 1 ? "1 day" : `${days} days`),
    continues: "continues",
    planned: (rangeLabel) => `Planned ${rangeLabel}`,
    milestone: "milestone",
    scales: {
        day: "Day",
        week: "Week",
        month: "Month",
        quarter: "Quarter",
        year: "Year",
    },
};
const DEFAULT_FORMATS: GanttI18nConfig["formats"] = {
    monthTitle: "MMMM yyyy",
    dayTitle: "EEEE, MMMM d, yyyy",
    timeGutter: "h a",
    eventTime: "h:mm a",
};
function makeDefaultGanttFunctions(cfg: Pick<GanttI18nConfig, "labels" | "formats">): GanttI18nConfig["functions"] {
    return {
        formatTitle: (scale, { date, activeRange, locale }) => {
            const opts = { locale };
            if (scale === "day") {
                return format(date, cfg.formats.dayTitle, opts);
            }
            if (scale === "month") {
                return format(date, cfg.formats.monthTitle, opts);
            }
            if (scale === "quarter") {
                return format(date, "QQQ yyyy", opts);
            }
            if (scale === "year") {
                return format(date, "yyyy", opts);
            }
            const rangeEnd = subMilliseconds(activeRange.end, 1);
            const start = activeRange.start;
            if (isSameMonth(start, rangeEnd)) {
                return `${format(start, "MMMM d", opts)} - ${format(rangeEnd, "d, yyyy", opts)}`;
            }
            if (isSameYear(start, rangeEnd)) {
                return `${format(start, "MMM d", opts)} - ${format(rangeEnd, "MMM d, yyyy", opts)}`;
            }
            return `${format(start, "MMM d, yyyy", opts)} - ${format(rangeEnd, "MMM d, yyyy", opts)}`;
        },
        formatEventTime: (start, end, allDay, locale) => {
            const opts = { locale };
            if (end.getTime() === start.getTime()) {
                return allDay
                    ? format(start, "MMM d, yyyy", opts)
                    : format(start, `MMM d, ${cfg.formats.eventTime}`, opts);
            }
            if (allDay) {
                const last = end.getTime() - 1 >= start.getTime() ? subMilliseconds(end, 1) : start;
                const sameDay = format(start, "yyyy-MM-dd") === format(last, "yyyy-MM-dd");
                if (sameDay)
                    return format(start, "MMM d, yyyy", opts);
                if (isSameYear(start, last)) {
                    return `${format(start, "MMM d", opts)} - ${format(last, "MMM d, yyyy", opts)}`;
                }
                return `${format(start, "MMM d, yyyy", opts)} - ${format(last, "MMM d, yyyy", opts)}`;
            }
            const fmt = cfg.formats.eventTime;
            const lastInstant = end.getTime() - 1 >= start.getTime() ? subMilliseconds(end, 1) : start;
            if (format(start, "yyyy-MM-dd") !== format(lastInstant, "yyyy-MM-dd")) {
                return `${format(start, `MMM d, ${fmt}`, opts)} - ${format(end, `MMM d, ${fmt}`, opts)}`;
            }
            return `${format(start, fmt, opts)} - ${format(end, fmt, opts)}`;
        },
        formatDayRange: (range, locale) => {
            const opts = { locale };
            const rangeEnd = subMilliseconds(range.end, 1);
            return `${format(range.start, "MMM d", opts)} - ${format(rangeEnd, "MMM d", opts)}`;
        },
        formatEventAriaLabel: ({ title, timeLabel, milestoneLabel, rowTitle, progressLabel, plannedLabel, continues, }) => [
            title,
            timeLabel,
            milestoneLabel,
            rowTitle,
            progressLabel,
            plannedLabel,
            continues ? cfg.labels.continues : undefined,
        ]
            .filter(Boolean)
            .join(", "),
    };
}
const DEFAULT_GANTT_I18N: GanttI18nConfig = {
    labels: DEFAULT_LABELS,
    formats: DEFAULT_FORMATS,
    functions: makeDefaultGanttFunctions({
        labels: DEFAULT_LABELS,
        formats: DEFAULT_FORMATS,
    }),
};
interface GanttI18nOverrides {
    labels?: Partial<Omit<GanttI18nConfig["labels"], "scales">> & {
        scales?: Partial<GanttI18nConfig["labels"]["scales"]>;
    };
    formats?: Partial<GanttI18nConfig["formats"]>;
    functions?: Partial<GanttI18nConfig["functions"]>;
}
function mergeGanttI18n(overrides?: GanttI18nOverrides): GanttI18nConfig {
    if (!overrides)
        return DEFAULT_GANTT_I18N;
    const labels = {
        ...DEFAULT_LABELS,
        ...overrides.labels,
        scales: {
            ...DEFAULT_LABELS.scales,
            ...overrides.labels?.scales,
        },
    };
    const formats = { ...DEFAULT_FORMATS, ...overrides.formats };
    return {
        labels,
        formats,
        functions: {
            ...makeDefaultGanttFunctions({ labels, formats }),
            ...overrides.functions,
        },
    };
}
export { DEFAULT_GANTT_I18N, mergeGanttI18n };
export type { GanttI18nConfig, GanttI18nOverrides };
