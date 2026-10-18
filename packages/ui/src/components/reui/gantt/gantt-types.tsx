type GanttBarId = string;
type GanttScale = "day" | "week" | "month" | "quarter" | "year";
interface GanttResourceReorder {
    resourceId: string;
    parentId: string | null;
    index: number;
    resources: GanttResource[];
}
type GanttScheduleMode = "single" | "multiple";
type GanttOverlapPolicy = "allow" | "reject" | "clamp";
type GanttRowAlign = "start" | "center";
interface GanttResource {
    id: string;
    title: string;
    color?: string;
    scheduleMode?: GanttScheduleMode;
    baselineStart?: Date;
    baselineEnd?: Date;
    children?: GanttResource[];
}
type GanttNode = GanttResource;
interface GanttDateRange {
    start: Date;
    end: Date;
}
type GanttWeekday = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
interface GanttRecurrenceRule {
    freq: "daily" | "weekly" | "monthly" | "yearly";
    interval?: number;
    count?: number;
    until?: Date;
    byWeekday?: Array<GanttWeekday | {
        day: GanttWeekday;
        ordinal: number;
    }>;
    byMonthDay?: number[];
    byMonth?: number[];
    weekStart?: GanttWeekday;
    exDates?: Date[];
    rDates?: Date[];
}
interface GanttEvent<TData = unknown> {
    id: GanttBarId;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    recurrence?: GanttRecurrenceRule | string;
    recurringEventId?: GanttBarId;
    originalStart?: Date;
    color?: string;
    readOnly?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    priority?: number;
    progress?: number;
    baselineStart?: Date;
    baselineEnd?: Date;
    zIndex?: number;
    resourceId?: string;
    dependencies?: GanttBarId[];
    data?: TData;
}
interface GanttOccurrence<TData = unknown> {
    key: string;
    eventId: GanttBarId;
    event: GanttEvent<TData>;
    start: Date;
    end: Date;
    allDay: boolean;
    isRecurring: boolean;
    recurrenceIndex?: number;
}
interface GanttSegment<TData = unknown> {
    occurrence: GanttOccurrence<TData>;
    day: Date;
    isStart: boolean;
    isEnd: boolean;
    continuesBefore: boolean;
    continuesAfter: boolean;
    startMin?: number;
    endMin?: number;
    column?: number;
    columnCount?: number;
    columnSpan?: number;
}
interface GanttBaseline {
    start: Date;
    end: Date;
    milestone: boolean;
}
type GanttBaselineVariance = "early" | "late" | "on-time";
interface GanttSelection {
    eventKeys: string[];
    slot: {
        start: Date;
        end: Date;
        allDay: boolean;
    } | null;
}
interface GanttInteractions {
    drag: boolean;
    resize: boolean;
    selectSlot: boolean;
}
interface GanttDragState<TData = unknown> {
    kind: "move" | "resize-start" | "resize-end";
    occurrence: GanttOccurrence<TData>;
    proposedStart: Date;
    proposedEnd: Date;
    proposedAllDay: boolean;
    proposedResourceId?: string;
    valid: boolean;
}
interface GanttSlotDraft {
    start: Date;
    end: Date;
    allDay: boolean;
    resourceId?: string;
}
interface GanttState<TData = unknown> {
    scale: GanttScale;
    date: Date;
    visibleRange: GanttDateRange;
    activeRange: GanttDateRange;
    events: GanttEvent<TData>[];
    selection: GanttSelection;
    interactions: GanttInteractions;
    loading: boolean;
    drag: GanttDragState<TData> | null;
    slotDraft: GanttSlotDraft | null;
    viewportCenter: Date | null;
}
interface GanttRangeInfo {
    range: GanttDateRange;
    activeRange: GanttDateRange;
    scale: GanttScale;
    date: Date;
    timeZone: string;
}
interface GanttProposedUpdate<TData = unknown> {
    event: GanttEvent<TData>;
    occurrence: GanttOccurrence<TData> | null;
    start: Date;
    end: Date;
    allDay: boolean;
    resourceId?: string;
    source: "drag" | "resize-start" | "resize-end" | "keyboard" | "api";
}
type GanttUpdateResult = boolean | void | {
    start?: Date;
    end?: Date;
    allDay?: boolean;
};
interface GanttSlotInfo {
    date: Date;
    end?: Date;
    allDay: boolean;
    resourceId?: string;
}
interface GanttOffDaysConfig {
    weekendDays?: number[];
    dates?: Date[];
    isOffDay?: (day: Date) => boolean;
    className?: string;
}
interface GanttDataAdapter<TData = unknown> {
    getEvents(range: GanttDateRange, signal?: AbortSignal): Promise<GanttEvent<TData>[]>;
}
export type { GanttBaseline, GanttBaselineVariance, GanttEvent, GanttDataAdapter, GanttDateRange, GanttDragState, GanttBarId, GanttInteractions, GanttNode, GanttOccurrence, GanttOffDaysConfig, GanttOverlapPolicy, GanttProposedUpdate, GanttRangeInfo, GanttRecurrenceRule, GanttResource, GanttRowAlign, GanttScheduleMode, GanttSegment, GanttSelection, GanttSlotDraft, GanttSlotInfo, GanttState, GanttResourceReorder, GanttScale, GanttUpdateResult, GanttWeekday, };
