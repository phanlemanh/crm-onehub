import { expandRecurrence } from "@crm/ui/components/reui/gantt/gantt-recurrence";
import type { GanttBaseline, GanttBaselineVariance, GanttDateRange, GanttEvent, GanttOccurrence, GanttOffDaysConfig, GanttRecurrenceRule, GanttResource, GanttScale, GanttSegment, } from "@crm/ui/components/reui/gantt/gantt-types";
import { TZDate } from "@date-fns/tz";
import { addDays, addMonths, addWeeks, addYears, differenceInMinutes, format, startOfDay, startOfMonth, startOfQuarter, startOfWeek, startOfYear, } from "date-fns";
type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const MIN_PACK_SLOT = 30;
function toZoned(date: Date, timeZone: string): TZDate {
    return new TZDate(date.getTime(), timeZone);
}
function zonedStartOfDay(date: Date, timeZone: string): TZDate {
    return startOfDay(toZoned(date, timeZone));
}
function getDayKey(date: Date, timeZone: string): string {
    return format(toZoned(date, timeZone), "yyyy-MM-dd");
}
function getDayTotalMinutes(dayStart: Date, timeZone: string): number {
    const next = zonedStartOfDay(addDays(toZoned(dayStart, timeZone), 1), timeZone);
    return differenceInMinutes(next, dayStart);
}
function snapMinutes(minutes: number, snap: number): number {
    return Math.round(minutes / snap) * snap;
}
interface ViewRangeOptions {
    timeZone: string;
    weekStartsOn: WeekStartsOn;
}
interface ViewDateRanges {
    visibleRange: GanttDateRange;
    activeRange: GanttDateRange;
}
function getGanttDateRange(scale: GanttScale, date: Date, opts: ViewRangeOptions): ViewDateRanges {
    const { timeZone, weekStartsOn } = opts;
    const zoned = toZoned(date, timeZone);
    if (scale === "week") {
        const start = startOfWeek(zoned, { weekStartsOn });
        const range = { start, end: addWeeks(start, 1) };
        return { activeRange: range, visibleRange: range };
    }
    if (scale === "month") {
        const start = startOfMonth(zoned);
        const range = { start, end: startOfMonth(addMonths(zoned, 1)) };
        return { activeRange: range, visibleRange: range };
    }
    if (scale === "quarter") {
        const quarterStart = startOfQuarter(zoned);
        const quarterEnd = startOfQuarter(addMonths(zoned, 3));
        const start = startOfWeek(quarterStart, { weekStartsOn });
        let end = startOfWeek(quarterEnd, { weekStartsOn });
        if (end < quarterEnd)
            end = addWeeks(end, 1);
        return {
            activeRange: { start: quarterStart, end: quarterEnd },
            visibleRange: { start, end },
        };
    }
    if (scale === "year") {
        const start = startOfYear(zoned);
        const range = { start, end: startOfYear(addYears(zoned, 1)) };
        return { activeRange: range, visibleRange: range };
    }
    const start = startOfDay(zoned);
    const range = { start, end: addDays(start, 1) };
    return { activeRange: range, visibleRange: range };
}
function stepGanttDate(scale: GanttScale, date: Date, direction: 1 | -1, opts: Pick<ViewRangeOptions, "timeZone">): Date {
    const zoned = toZoned(date, opts.timeZone);
    if (scale === "week")
        return addWeeks(zoned, direction);
    if (scale === "month")
        return addMonths(zoned, direction);
    if (scale === "quarter")
        return addMonths(zoned, direction * 3);
    if (scale === "year")
        return addYears(zoned, direction);
    return addDays(zoned, direction);
}
function rangesIntersect(a: GanttDateRange, b: GanttDateRange): boolean {
    return a.start < b.end && a.end > b.start;
}
function eventsOverlap(a: {
    start: Date;
    end: Date;
}, b: {
    start: Date;
    end: Date;
}): boolean {
    return a.start < b.end && a.end > b.start;
}
function occurrenceIntersects(occ: {
    start: Date;
    end: Date;
}, range: GanttDateRange): boolean {
    if (occ.end.getTime() === occ.start.getTime()) {
        return occ.start >= range.start && occ.start < range.end;
    }
    return rangesIntersect(occ, range);
}
function spansMultipleDays(occ: {
    start: Date;
    end: Date;
}): boolean {
    return occ.end.getTime() - occ.start.getTime() > 24 * 60 * 60 * 1000;
}
function resolveEventBaseline(subject: {
    baselineStart?: Date;
    baselineEnd?: Date;
    recurrence?: GanttRecurrenceRule | string;
}): GanttBaseline | null {
    if (!subject.baselineStart || !subject.baselineEnd || subject.recurrence) {
        return null;
    }
    const startMs = subject.baselineStart.getTime();
    const endMs = subject.baselineEnd.getTime();
    if (endMs < startMs)
        return null;
    return {
        start: subject.baselineStart,
        end: subject.baselineEnd,
        milestone: endMs === startMs,
    };
}
interface GanttDependencyGeometry {
    line: string;
    arrow: string;
}
function buildDependencyPath(from: {
    x: number;
    y: number;
}, to: {
    x: number;
    y: number;
}, opts: {
    clearance: number;
    laneStep: number;
    arrowSize: number;
}): GanttDependencyGeometry {
    const { clearance, laneStep, arrowSize } = opts;
    const lineEndX = to.x - arrowSize;
    const arrow = `M ${to.x} ${to.y} L ${lineEndX} ${to.y - arrowSize * 0.6} L ${lineEndX} ${to.y + arrowSize * 0.6} Z`;
    if (lineEndX >= from.x + clearance) {
        return {
            line: `M ${from.x} ${from.y} H ${from.x + clearance} V ${to.y} H ${lineEndX}`,
            arrow,
        };
    }
    const midY = to.y >= from.y ? from.y + laneStep : from.y - laneStep;
    return {
        line: `M ${from.x} ${from.y} H ${from.x + clearance} V ${midY} H ${to.x - clearance} V ${to.y} H ${lineEndX}`,
        arrow,
    };
}
function getBaselineVariance<TData>(event: GanttEvent<TData>): GanttBaselineVariance | null {
    const baseline = resolveEventBaseline(event);
    if (!baseline)
        return null;
    const deltaMs = event.end.getTime() - baseline.end.getTime();
    return deltaMs > 0 ? "late" : deltaMs < 0 ? "early" : "on-time";
}
interface PackedPosition {
    column: number;
    columnCount: number;
    columnSpan: number;
}
function getLaneKey(occurrence: {
    eventId: string;
    recurrenceIndex?: number;
}): string {
    return `${occurrence.eventId}::${occurrence.recurrenceIndex ?? 0}`;
}
interface GanttLaneMemo {
    lane: number;
    startMs: number;
    endMs: number;
}
interface PackOptions {
    preferredLanes?: Map<string, GanttLaneMemo>;
    mode?: "single" | "multiple";
}
function packTimedSegments<TData>(segments: GanttSegment<TData>[], options: PackOptions = {}): void {
    if (segments.length === 0)
        return;
    if (options.mode === "single") {
        for (const seg of segments) {
            seg.column = 0;
            seg.columnCount = 1;
            seg.columnSpan = 1;
        }
        return;
    }
    const preferredLanes = options.preferredLanes;
    type Working = {
        seg: GanttSegment<TData>;
        startMin: number;
        effEnd: number;
        lane: number;
        interval?: {
            from: number;
            to: number;
        };
    };
    const items: Working[] = segments
        .map((seg) => {
        const startMin = seg.startMin ?? 0;
        const endMin = seg.endMin ?? startMin;
        return {
            seg,
            startMin,
            effEnd: Math.max(endMin, startMin + MIN_PACK_SLOT),
            lane: -1,
        };
    })
        .sort((a, b) => a.startMin - b.startMin ||
        b.effEnd - b.startMin - (a.effEnd - a.startMin) ||
        a.seg.occurrence.key.localeCompare(b.seg.occurrence.key));
    const clusters: Working[][] = [];
    let current: Working[] = [];
    let clusterEnd = -Infinity;
    for (const item of items) {
        if (item.startMin >= clusterEnd) {
            current = [];
            clusters.push(current);
            clusterEnd = -Infinity;
        }
        current.push(item);
        clusterEnd = Math.max(clusterEnd, item.effEnd);
    }
    for (const cluster of clusters) {
        const laneIntervals: Array<Array<{
            from: number;
            to: number;
        }>> = [];
        const isFree = (lane: number, item: Working) => !(laneIntervals[lane] ?? []).some((iv) => iv.from < item.effEnd && iv.to > item.startMin);
        const claim = (lane: number, item: Working) => {
            while (laneIntervals.length <= lane)
                laneIntervals.push([]);
            const interval = { from: item.startMin, to: item.effEnd };
            laneIntervals[lane]?.push(interval);
            item.lane = lane;
            item.interval = interval;
        };
        const release = (item: Working) => {
            const occupants = laneIntervals[item.lane] ?? [];
            const at = occupants.indexOf(item.interval!);
            if (at >= 0)
                occupants.splice(at, 1);
        };
        const pending: Working[] = [];
        for (const item of cluster) {
            const memo = preferredLanes?.get(getLaneKey(item.seg.occurrence));
            const untouched = memo !== undefined &&
                memo.startMs === item.seg.occurrence.start.getTime() &&
                memo.endMs === item.seg.occurrence.end.getTime();
            if (untouched && memo.lane >= 0 && isFree(memo.lane, item)) {
                claim(memo.lane, item);
            }
            else {
                pending.push(item);
            }
        }
        for (const item of pending) {
            let lane = 0;
            while (!isFree(lane, item))
                lane++;
            claim(lane, item);
        }
        const byLane = [...cluster].sort((a, b) => a.lane - b.lane || a.startMin - b.startMin);
        for (const item of byLane) {
            if (item.lane === 0)
                continue;
            let lane = 0;
            while (lane < item.lane && !isFree(lane, item))
                lane++;
            if (lane < item.lane) {
                release(item);
                claim(lane, item);
            }
        }
    }
    const used = [...new Set(items.map((item) => item.lane))].sort((a, b) => a - b);
    const compacted = new Map(used.map((lane, index) => [lane, index]));
    const columnCount = used.length;
    for (const item of items) {
        item.lane = compacted.get(item.lane) ?? 0;
        item.seg.column = item.lane;
        item.seg.columnCount = columnCount;
    }
    for (const cluster of clusters) {
        for (const item of cluster) {
            let span = 1;
            while (item.lane + span < columnCount) {
                const blocked = cluster.some((other) => other !== item &&
                    other.lane === item.lane + span &&
                    other.startMin < item.effEnd &&
                    other.effEnd > item.startMin);
                if (blocked)
                    break;
                span++;
            }
            item.seg.columnSpan = span;
        }
    }
}
function defaultEventOrder(a: GanttOccurrence, b: GanttOccurrence): number {
    return (a.start.getTime() - b.start.getTime() ||
        b.end.getTime() -
            b.start.getTime() -
            (a.end.getTime() - a.start.getTime()) ||
        a.key.localeCompare(b.key));
}
interface BuildIndexOptions<TData = unknown> {
    timeZone: string;
    getOccurrences?: (event: GanttEvent<TData>, range: GanttDateRange, ctx: {
        timeZone: string;
    }) => Array<{
        start: Date;
        end: Date;
    }> | null | undefined;
    eventOrder?: (a: GanttOccurrence<TData>, b: GanttOccurrence<TData>) => number;
}
interface GanttIndex<TData = unknown> {
    occurrences: GanttOccurrence<TData>[];
}
function buildEventIndex<TData>(events: GanttEvent<TData>[], visibleRange: GanttDateRange, opts: BuildIndexOptions<TData>): GanttIndex<TData> {
    const { timeZone } = opts;
    const order = opts.eventOrder ?? defaultEventOrder;
    const overrideTimes = new Map<string, Set<number>>();
    for (const event of events) {
        if (!event.recurringEventId || !event.originalStart)
            continue;
        let times = overrideTimes.get(event.recurringEventId);
        if (!times)
            overrideTimes.set(event.recurringEventId, (times = new Set()));
        times.add(event.originalStart.getTime());
    }
    const occurrences: GanttOccurrence<TData>[] = [];
    for (const event of events) {
        const replaced = overrideTimes.get(event.id);
        const custom = opts.getOccurrences?.(event, visibleRange, { timeZone });
        if (custom) {
            custom.forEach((occ, i) => {
                if (replaced?.has(occ.start.getTime()))
                    return;
                if (!occurrenceIntersects({ start: occ.start, end: occ.end }, visibleRange))
                    return;
                occurrences.push({
                    key: `${event.id}::${occ.start.toISOString()}`,
                    eventId: event.id,
                    event,
                    start: occ.start,
                    end: occ.end,
                    allDay: event.allDay ?? false,
                    isRecurring: true,
                    recurrenceIndex: i,
                });
            });
            continue;
        }
        const expanded = expandRecurrence(event, visibleRange, { timeZone });
        occurrences.push(...(replaced
            ? expanded.filter((occ) => !replaced.has(occ.start.getTime()))
            : expanded));
    }
    occurrences.sort(order);
    return { occurrences };
}
function getRangeKey(range: GanttDateRange): string {
    return `${range.start.getTime()}-${range.end.getTime()}`;
}
function flattenResources(resources: GanttResource[], depth = 0): Array<{
    resource: GanttResource;
    depth: number;
}> {
    const rows: Array<{
        resource: GanttResource;
        depth: number;
    }> = [];
    for (const resource of resources) {
        rows.push({ resource, depth });
        if (resource.children?.length) {
            rows.push(...flattenResources(resource.children, depth + 1));
        }
    }
    return rows;
}
function findResource(resources: GanttResource[], id: string): GanttResource | null {
    for (const resource of resources) {
        if (resource.id === id)
            return resource;
        const found = resource.children?.length
            ? findResource(resource.children, id)
            : null;
        if (found)
            return found;
    }
    return null;
}
function reorderResources(resources: GanttResource[], resourceId: string, parentId: string | null, index: number): GanttResource[] | null {
    let moved: GanttResource | null = null;
    const strip = (nodes: GanttResource[]): GanttResource[] => nodes.flatMap((node) => {
        if (node.id === resourceId) {
            moved = node;
            return [];
        }
        if (!node.children?.length)
            return [node];
        return [{ ...node, children: strip(node.children) }];
    });
    const stripped = strip(resources);
    if (!moved)
        return null;
    const contains = (node: GanttResource, id: string): boolean => node.id === id || !!node.children?.some((child) => contains(child, id));
    if (parentId !== null && contains(moved, parentId))
        return null;
    const insert = (nodes: GanttResource[]): GanttResource[] => {
        if (parentId === null) {
            const next = [...nodes];
            next.splice(Math.min(Math.max(index, 0), next.length), 0, moved!);
            return next;
        }
        return nodes.map((node) => {
            if (node.id === parentId) {
                const children = [...(node.children ?? [])];
                children.splice(Math.min(Math.max(index, 0), children.length), 0, moved!);
                return { ...node, children };
            }
            if (!node.children?.length)
                return node;
            return { ...node, children: insert(node.children) };
        });
    };
    const next = insert(stripped);
    if (parentId !== null) {
        const flat = flattenResources(next);
        if (!flat.some(({ resource }) => resource.id === resourceId))
            return null;
    }
    return next;
}
const DEFAULT_WEEKEND_DAYS = [0, 6];
function resolveOffDay(day: Date, timeZone: string, config: boolean | GanttOffDaysConfig | undefined): boolean {
    if (!config)
        return false;
    const resolved: GanttOffDaysConfig = config === true ? {} : config;
    const weekendDays = resolved.weekendDays ?? DEFAULT_WEEKEND_DAYS;
    const zoned = toZoned(day, timeZone);
    if (weekendDays.includes(zoned.getDay()))
        return true;
    if (resolved.dates?.length) {
        const key = getDayKey(day, timeZone);
        if (resolved.dates.some((date) => getDayKey(date, timeZone) === key)) {
            return true;
        }
    }
    return resolved.isOffDay?.(day) ?? false;
}
export { buildDependencyPath, buildEventIndex, defaultEventOrder, eventsOverlap, findResource, flattenResources, getBaselineVariance, getDayKey, getDayTotalMinutes, getGanttDateRange, getLaneKey, getRangeKey, MIN_PACK_SLOT, occurrenceIntersects, packTimedSegments, rangesIntersect, reorderResources, resolveEventBaseline, resolveOffDay, snapMinutes, spansMultipleDays, stepGanttDate, toZoned, zonedStartOfDay, };
export type { BuildIndexOptions, GanttDependencyGeometry, GanttIndex, GanttLaneMemo, PackOptions, ViewDateRanges, ViewRangeOptions, WeekStartsOn, };
