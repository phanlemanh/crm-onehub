"use client";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type RefObject, } from "react";
import { DEFAULT_ROW_ALIGN, resolveScheduleMode, resolveTimelineLines, useGantt, useGanttSelector, useGanttSettings, useGanttViewConfig, type GanttColumn, } from "@crm/ui/components/reui/gantt/gantt";
import { GanttBar } from "@crm/ui/components/reui/gantt/gantt-bar";
import { cancelActiveGanttGestures, markGestureEnd, useGanttGestures, useGanttGestureTeardown, wasRecentDrag, } from "@crm/ui/components/reui/gantt/gantt-dnd";
import { buildDependencyPath, getBaselineVariance, getDayKey, getLaneKey, getRangeKey, MIN_PACK_SLOT, packTimedSegments, reorderResources, resolveEventBaseline, resolveOffDay, toZoned, zonedStartOfDay, type GanttLaneMemo, } from "@crm/ui/components/reui/gantt/gantt-lib";
import type { GanttBaseline, GanttBaselineVariance, GanttDateRange, GanttEvent, GanttOccurrence, GanttResource, GanttResourceReorder, GanttSegment, } from "@crm/ui/components/reui/gantt/gantt-types";
import { addDays, addMinutes, addMonths, format, getWeek, startOfMonth, startOfQuarter, startOfWeek, type Locale, } from "date-fns";
import { Slot } from "radix-ui";
import { cn } from "@crm/ui/lib/utils";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, } from "@crm/ui/components/context-menu";
import { ScrollArea, ScrollBar } from "@crm/ui/components/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@crm/ui/components/tooltip";
import AddIcon from "@carbon/icons-react/es/Add";
import SubtractIcon from "@carbon/icons-react/es/Subtract";
import DraggableIcon from "@carbon/icons-react/es/Draggable";
import ChevronRightIcon from "@carbon/icons-react/es/ChevronRight";
import ChevronLeftIcon from "@carbon/icons-react/es/ChevronLeft";
function useNow(intervalMs = 30000): Date {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const tick = () => setNow(new Date());
        const id = setInterval(tick, intervalMs);
        document.addEventListener("visibilitychange", tick);
        window.addEventListener("focus", tick);
        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", tick);
            window.removeEventListener("focus", tick);
        };
    }, [intervalMs]);
    return now;
}
function useTodayKey(timeZone: string): string {
    const [key, setKey] = useState(() => getDayKey(new Date(), timeZone));
    useEffect(() => {
        const tick = () => setKey((prev) => {
            const next = getDayKey(new Date(), timeZone);
            return next === prev ? prev : next;
        });
        tick();
        const id = setInterval(tick, 60000);
        document.addEventListener("visibilitychange", tick);
        window.addEventListener("focus", tick);
        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", tick);
            window.removeEventListener("focus", tick);
        };
    }, [timeZone]);
    return key;
}
function lowestFreeLane(segments: GanttSegment[], startMs: number, endMs: number): number {
    const padMs = MIN_PACK_SLOT * 60000;
    const to = Math.max(endMs, startMs + padMs);
    const busy = new Set<number>();
    for (const segment of segments) {
        const segStart = segment.occurrence.start.getTime();
        const segEnd = Math.max(segment.occurrence.end.getTime(), segStart + padMs);
        if (segStart < to && segEnd > startMs)
            busy.add(segment.column ?? 0);
    }
    let lane = 0;
    while (busy.has(lane))
        lane += 1;
    return lane;
}
function trackPoint(el: HTMLElement, clientX: number): {
    fraction: number;
    offset: number;
} {
    const rect = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === "rtl";
    const offset = rtl ? rect.right - clientX : clientX - rect.left;
    const snapped = rtl
        ? rect.right - Math.round(clientX)
        : Math.round(clientX) - rect.left;
    return {
        fraction: rect.width > 0 ? offset / rect.width : 0,
        offset: snapped,
    };
}
function trackFraction(el: HTMLElement, clientX: number): number {
    return trackPoint(el, clientX).fraction;
}
const LANE_HEIGHT_REM = 1.25;
const LANE_GAP_REM = 0.1875;
const ROW_PADDING_REM = 0.5;
const GHOST_HEIGHT_REM = 1.25;
function laneTopRem(laneOffsetRem: number, lane: number, laneHeightRem: number, laneGapRem: number): number {
    return laneOffsetRem + lane * (laneHeightRem + laneGapRem);
}
function laneBlockRem(count: number, laneHeightRem: number, laneGapRem: number): number {
    return count * laneHeightRem + (count - 1) * laneGapRem;
}
const AUTO_LABEL_MIN_REM = 7;
const DEFAULT_TREE_PANEL = {
    width: 288,
    minWidth: 180,
    maxWidth: 640,
    resizable: true,
    nameColumnWidth: 208,
};
const DEFAULT_COLUMN_WIDTH = 96;
const DEFAULT_ZOOM_RANGE = { min: 0.5, max: 3 };
const MIN_TIMELINE_WIDTH = 200;
const INFINITE_EDGE_PX = 160;
interface TimelineUnit {
    key: string;
    label: string;
    ms: number;
    weight: number;
    isToday?: boolean;
    isOff?: boolean;
    day?: string;
}
interface TimelineGroup {
    key: string;
    label: string;
    span: number;
}
interface TimelineRow {
    resource: GanttResource;
    parentId: string | null;
    depth: number;
    isGroup: boolean;
    collapsed: boolean;
}
interface RowBaseline {
    event: GanttEvent;
    baseline: GanttBaseline;
    startMin: number;
    endMin: number;
    lane: number;
    variance: GanttBaselineVariance;
}
interface RowLevelBaseline {
    baseline: GanttBaseline;
    startMin: number;
    endMin: number;
    variance: GanttBaselineVariance | null;
}
interface TimelineRowBars {
    segments: GanttSegment[];
    laneCount: number;
    baselines: RowBaseline[];
    rowBaseline: RowLevelBaseline | null;
    draftLane: number | null;
    scheduleMode: "single" | "multiple";
    heightRem: number;
    laneOffsetRem: number;
    bandRem: number;
    extent: {
        from: number;
        to: number;
        color?: string;
        label: string;
        startMs: number;
    } | null;
    summary: {
        from: number;
        to: number;
        progress: number | null;
    } | null;
}
interface TimelineReorderState {
    resourceId: string;
    top: number;
    valid: boolean;
    proposal: GanttResourceReorder | null;
}
const EMPTY_ID_SET: ReadonlySet<string> = new Set();
interface DependencyEdge {
    key: string;
    fromId: string;
    toId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}
interface GanttViewProps extends HTMLAttributes<HTMLDivElement> {
    interval?: number;
    asChild?: boolean;
}
function getPaneViewport(pane: HTMLElement | null): HTMLElement | null {
    return (pane?.querySelector<HTMLElement>("[data-slot=scroll-area-viewport]") ?? null);
}
function getScrollStart(viewport: HTMLElement): number {
    return Math.abs(viewport.scrollLeft);
}
function setScrollStart(viewport: HTMLElement, value: number) {
    viewport.scrollLeft =
        getComputedStyle(viewport).direction === "rtl" ? -value : value;
}
function GanttView({ className, asChild = false, interval: intervalProp, ...props }: GanttViewProps) {
    const instance = useGantt();
    const settings = useGanttSettings();
    const viewConfig = useGanttViewConfig();
    const range = useGanttSelector<unknown, GanttDateRange>((state) => state.visibleRange, { isEqual: (a, b) => getRangeKey(a) === getRangeKey(b) });
    const occurrences = useGanttSelector<unknown, GanttOccurrence[]>(() => instance.api.getOccurrences(), {
        calendar: instance,
        isEqual: (a, b) => a.length === b.length &&
            a.every((occ, i) => occ.key === b[i]?.key &&
                occ.start.getTime() === b[i]?.start.getTime() &&
                occ.end.getTime() === b[i]?.end.getTime() &&
                occ.event === b[i]?.event),
    });
    const [internalCollapsed, setInternalCollapsed] = useState<string[]>(() => viewConfig.defaultCollapsedGroups ?? []);
    const collapsedIds = viewConfig.collapsedGroups ?? internalCollapsed;
    const collapsedGroups = useMemo(() => new Set(collapsedIds), [collapsedIds]);
    const scale = useGanttSelector((state) => state.scale);
    const interval = Math.min(Math.max(intervalProp ?? viewConfig.interval, 15), 240);
    const metrics = viewConfig.metrics;
    const laneHeightRem = metrics?.laneHeight ?? LANE_HEIGHT_REM;
    const rowPaddingRem = metrics?.rowPadding ?? ROW_PADDING_REM;
    const laneGapRem = metrics?.laneGap ?? LANE_GAP_REM;
    const minRowRem = metrics?.minRowHeight ?? 2.5;
    const ghostHeightRem = metrics?.ghostHeight ?? GHOST_HEIGHT_REM;
    const minTimelineWidth = metrics?.minTimelineWidth ?? MIN_TIMELINE_WIDTH;
    const infiniteEdgePx = metrics?.infiniteScrollEdge ?? INFINITE_EDGE_PX;
    const timeZone = settings.timeZone;
    const rangeStartMs = range.start.getTime();
    const rangeEndMs = range.end.getTime();
    const rangeKey = getRangeKey(range);
    const snapMin = scale === "day" ? settings.snapDuration : 24 * 60;
    const todayDayKey = useTodayKey(timeZone);
    const rows = useMemo(() => {
        const result: TimelineRow[] = [];
        const walk = (resources: GanttResource[], depth: number, parentId: string | null) => {
            for (const resource of resources) {
                const isGroup = !!resource.children?.length;
                const collapsed = collapsedGroups.has(resource.id);
                result.push({ resource, parentId, depth, isGroup, collapsed });
                if (isGroup && !collapsed)
                    walk(resource.children!, depth + 1, resource.id);
            }
        };
        walk(settings.resources, 0, null);
        return result;
    }, [settings.resources, collapsedGroups]);
    const { units, groups, unitWidthRem } = useMemo(() => {
        const units: TimelineUnit[] = [];
        const groups: TimelineGroup[] = [];
        const todayStartMs = zonedStartOfDay(new Date(), timeZone).getTime();
        if (scale === "day") {
            const labelFormat = interval % 60 === 0 ? settings.i18n.formats.timeGutter : "h:mm";
            let dayCursor = zonedStartOfDay(range.start, timeZone);
            while (dayCursor.getTime() < rangeEndMs) {
                const zonedDay = toZoned(dayCursor, timeZone);
                const nextDay = zonedStartOfDay(addDays(zonedDay, 1), timeZone);
                const dayMinutes = (nextDay.getTime() - dayCursor.getTime()) / 60000;
                const dayOff = resolveOffDay(dayCursor, timeZone, viewConfig.offDays ?? true);
                let span = 0;
                for (let m = 0; m < dayMinutes; m += interval) {
                    const time = addMinutes(zonedDay, m);
                    const weight = Math.min(interval, dayMinutes - m) / interval;
                    units.push({
                        key: `${getDayKey(dayCursor, timeZone)}-m${m}`,
                        label: format(time, labelFormat, { locale: settings.locale }),
                        ms: time.getTime(),
                        weight,
                        isOff: dayOff,
                        day: getDayKey(dayCursor, timeZone),
                    });
                    span += weight;
                }
                groups.push({
                    key: getDayKey(dayCursor, timeZone),
                    label: format(zonedDay, settings.i18n.formats.dayTitle, {
                        locale: settings.locale,
                    }),
                    span,
                });
                dayCursor = nextDay;
            }
            return {
                units,
                groups,
                unitWidthRem: metrics?.unitWidths?.day ?? Math.max(2.5, 5 * (interval / 60)),
            };
        }
        if (scale === "quarter") {
            let cursor = zonedStartOfDay(range.start, timeZone);
            while (cursor.getTime() < rangeEndMs) {
                const zoned = toZoned(cursor, timeZone);
                const next = zonedStartOfDay(addDays(zoned, 7), timeZone);
                const weight = (next.getTime() - cursor.getTime()) / (7 * 24 * 60 * 60000);
                units.push({
                    key: getDayKey(cursor, timeZone),
                    label: format(zoned, "MMM d", { locale: settings.locale }),
                    ms: cursor.getTime(),
                    weight,
                    isToday: todayStartMs >= cursor.getTime() && todayStartMs < next.getTime(),
                });
                const monthKey = format(zoned, "yyyy-MM");
                const lastGroup = groups[groups.length - 1];
                if (lastGroup && lastGroup.key === monthKey) {
                    lastGroup.span += weight;
                }
                else {
                    groups.push({
                        key: monthKey,
                        label: format(zoned, "MMMM", { locale: settings.locale }),
                        span: weight,
                    });
                }
                cursor = next;
            }
            return { units, groups, unitWidthRem: metrics?.unitWidths?.quarter ?? 8 };
        }
        if (scale === "year") {
            let cursor: Date = startOfMonth(toZoned(range.start, timeZone));
            while (cursor.getTime() < rangeEndMs) {
                const next = startOfMonth(addMonths(cursor, 1));
                const weight = (next.getTime() - cursor.getTime()) / (24 * 60 * 60000);
                units.push({
                    key: format(cursor, "yyyy-MM"),
                    label: format(cursor, "MMM", { locale: settings.locale }),
                    ms: cursor.getTime(),
                    weight,
                    isToday: todayStartMs >= cursor.getTime() && todayStartMs < next.getTime(),
                });
                const quarterStart = startOfQuarter(cursor);
                const quarterKey = format(quarterStart, "yyyy-QQQ");
                const lastGroup = groups[groups.length - 1];
                if (lastGroup && lastGroup.key === quarterKey) {
                    lastGroup.span += weight;
                }
                else {
                    groups.push({
                        key: quarterKey,
                        label: format(quarterStart, "QQQ yyyy", {
                            locale: settings.locale,
                        }),
                        span: weight,
                    });
                }
                cursor = next;
            }
            return { units, groups, unitWidthRem: metrics?.unitWidths?.year ?? 10 };
        }
        let cursor = zonedStartOfDay(range.start, timeZone);
        while (cursor.getTime() < rangeEndMs) {
            const zoned = toZoned(cursor, timeZone);
            const nextDay = zonedStartOfDay(addDays(zoned, 1), timeZone);
            const weight = (nextDay.getTime() - cursor.getTime()) / (24 * 60 * 60000);
            units.push({
                key: getDayKey(cursor, timeZone),
                label: format(zoned, "EEE d", { locale: settings.locale }),
                ms: cursor.getTime(),
                weight,
                isToday: getDayKey(cursor, timeZone) === todayDayKey,
                isOff: resolveOffDay(cursor, timeZone, viewConfig.offDays ?? true),
                day: getDayKey(cursor, timeZone),
            });
            const weekNumber = getWeek(zoned, {
                locale: settings.locale,
                weekStartsOn: settings.weekStartsOn,
            });
            const weekStart = startOfWeek(zoned, {
                weekStartsOn: settings.weekStartsOn,
            });
            const weekKey = `w-${format(weekStart, "yyyy-MM-dd")}`;
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.key === weekKey) {
                lastGroup.span += weight;
            }
            else {
                groups.push({
                    key: weekKey,
                    label: `${settings.i18n.labels.week(weekNumber)} ${format(weekStart, "MMM d", { locale: settings.locale })} - ${format(addDays(weekStart, 6), "d", { locale: settings.locale })}`,
                    span: weight,
                });
            }
            cursor = nextDay;
        }
        return {
            units,
            groups,
            unitWidthRem: metrics?.unitWidths?.[scale] ?? (scale === "week" ? 10 : 4),
        };
    }, [
        scale,
        interval,
        range.start,
        rangeEndMs,
        timeZone,
        settings.i18n,
        settings.locale,
        settings.weekStartsOn,
        viewConfig.offDays,
        todayDayKey,
        metrics,
    ]);
    const zoomRange = { ...DEFAULT_ZOOM_RANGE, ...viewConfig.zoomRange };
    const clampZoom = (value: number) => Math.min(Math.max(value, zoomRange.min), zoomRange.max);
    const [internalZoom, setInternalZoom] = useState(() => viewConfig.defaultZoom ?? 1);
    const zoom = clampZoom(viewConfig.zoom ?? internalZoom);
    const setZoomValue = (next: number) => {
        const clamped = clampZoom(next);
        if (viewConfig.zoom === undefined)
            setInternalZoom(clamped);
        viewConfig.onZoomChange?.(clamped);
    };
    const canZoomIn = zoom < zoomRange.max - 1e-9;
    const canZoomOut = zoom > zoomRange.min + 1e-9;
    const trackRemWidth = units.length * unitWidthRem * zoom;
    const trackWidth = `${trackRemWidth}rem`;
    const uniform = units.every((unit) => Math.abs(unit.weight - (units[0]?.weight ?? unit.weight)) < 1e-9);
    const totalWeight = units.reduce((sum, unit) => sum + unit.weight, 0);
    const unitFractions = useMemo(() => {
        let acc = 0;
        return units.map((unit) => {
            const start = acc / totalWeight;
            acc += unit.weight;
            return { unit, start, width: unit.weight / totalWeight };
        });
    }, [units, totalWeight]);
    const resolveHintStop = useMemo(() => {
        return (fraction: number): {
            index: number;
            center: number;
            ms: number;
            endMs: number;
        } | null => {
            for (let i = 0; i < unitFractions.length; i++) {
                const fraction_ = unitFractions[i];
                if (!fraction_)
                    continue;
                const { unit, start, width } = fraction_;
                if (fraction < start + width || i === unitFractions.length - 1) {
                    return {
                        index: i,
                        center: start + width / 2,
                        ms: unit.ms,
                        endMs: unitFractions[i + 1]?.unit.ms ?? unit.ms,
                    };
                }
            }
            return null;
        };
    }, [unitFractions]);
    const groupBoundaries = useMemo(() => {
        const fractions: number[] = [];
        let acc = 0;
        for (let i = 0; i < groups.length - 1; i++) {
            acc += groups[i]?.span ?? 0;
            fractions.push(acc / totalWeight);
        }
        return fractions;
    }, [groups, totalWeight]);
    const descendantIds = useMemo(() => {
        const map = new Map<string, string[]>();
        const walk = (resource: GanttResource): string[] => {
            const ids = (resource.children ?? []).flatMap((child) => [
                child.id,
                ...walk(child),
            ]);
            map.set(resource.id, ids);
            return ids;
        };
        settings.resources.forEach(walk);
        return map;
    }, [settings.resources]);
    const allEvents = useGanttSelector<unknown, GanttEvent[]>((state) => state.events);
    const subtreeProgress = useMemo(() => {
        if (viewConfig.getSummaryProgress) {
            const byResource = new Map<string, GanttEvent[]>();
            for (const ev of allEvents) {
                if (!ev.resourceId)
                    continue;
                const list = byResource.get(ev.resourceId);
                if (list)
                    list.push(ev);
                else
                    byResource.set(ev.resourceId, [ev]);
            }
            const map = new Map<string, number | null>();
            for (const row of rows) {
                if (!row.isGroup)
                    continue;
                const events: GanttEvent[] = [];
                for (const id of descendantIds.get(row.resource.id) ?? []) {
                    const list = byResource.get(id);
                    if (list)
                        events.push(...list);
                }
                map.set(row.resource.id, viewConfig.getSummaryProgress({ resource: row.resource, events }));
            }
            return map;
        }
        const perResource = new Map<string, {
            weighted: number;
            total: number;
            saw: boolean;
        }>();
        for (const ev of allEvents) {
            if (!ev.resourceId)
                continue;
            let agg = perResource.get(ev.resourceId);
            if (!agg) {
                agg = { weighted: 0, total: 0, saw: false };
                perResource.set(ev.resourceId, agg);
            }
            const dur = Math.max(ev.end.getTime() - ev.start.getTime(), 1);
            agg.total += dur;
            if (typeof ev.progress === "number") {
                agg.saw = true;
                agg.weighted += ev.progress * dur;
            }
        }
        const map = new Map<string, number | null>();
        for (const row of rows) {
            if (!row.isGroup)
                continue;
            let weighted = 0;
            let weightTotal = 0;
            let saw = false;
            for (const id of descendantIds.get(row.resource.id) ?? []) {
                const agg = perResource.get(id);
                if (!agg)
                    continue;
                weightTotal += agg.total;
                if (agg.saw) {
                    saw = true;
                    weighted += agg.weighted;
                }
            }
            map.set(row.resource.id, saw && weightTotal > 0
                ? Math.min(Math.max(Math.round(weighted / weightTotal), 0), 100)
                : null);
        }
        return map;
    }, [rows, allEvents, descendantIds, viewConfig.getSummaryProgress]);
    const laneMemory = useRef(new Map<string, GanttLaneMemo>());
    const scheduleMode = viewConfig.scheduleMode;
    const draftLayout = useGanttSelector<unknown, {
        resourceId: string;
        startMs: number;
        endMs: number;
    } | null>((state) => {
        const slotDraft = state.slotDraft;
        if (!slotDraft?.resourceId)
            return null;
        return {
            resourceId: slotDraft.resourceId,
            startMs: slotDraft.start.getTime(),
            endMs: slotDraft.end.getTime(),
        };
    }, {
        isEqual: (a, b) => a === b ||
            (a !== null &&
                b !== null &&
                a.resourceId === b.resourceId &&
                a.startMs === b.startMs &&
                a.endMs === b.endMs),
    });
    const baseRowBars = useMemo(() => {
        const map = new Map<string, TimelineRowBars>();
        const previousLanes = laneMemory.current;
        const nextLanes = new Map<string, GanttLaneMemo>();
        const totalMin = (rangeEndMs - rangeStartMs) / 60000;
        const byResource = new Map<string, GanttOccurrence[]>();
        const envelopes = new Map<string, {
            fromMin: number;
            toMin: number;
        }>();
        for (const occ of occurrences) {
            const rid = occ.event.resourceId;
            if (!rid)
                continue;
            const list = byResource.get(rid);
            if (list)
                list.push(occ);
            else
                byResource.set(rid, [occ]);
            const fromMin = Math.max((occ.start.getTime() - rangeStartMs) / 60000, 0);
            const toMin = Math.min((occ.end.getTime() - rangeStartMs) / 60000, totalMin);
            const env = envelopes.get(rid);
            if (!env) {
                envelopes.set(rid, { fromMin, toMin });
            }
            else {
                env.fromMin = Math.min(env.fromMin, fromMin);
                env.toMin = Math.max(env.toMin, toMin);
            }
        }
        const baselinesByResource = new Map<string, Array<{
            event: GanttEvent;
            baseline: GanttBaseline;
        }>>();
        const latestEndByResource = new Map<string, number>();
        if (viewConfig.baselineBars) {
            for (const event of allEvents) {
                if (!event.resourceId)
                    continue;
                const endMsActual = event.end.getTime();
                const prev = latestEndByResource.get(event.resourceId);
                if (prev === undefined || endMsActual > prev) {
                    latestEndByResource.set(event.resourceId, endMsActual);
                }
                const baseline = resolveEventBaseline(event);
                if (!baseline)
                    continue;
                const startMs = baseline.start.getTime();
                const endMs = baseline.end.getTime();
                const visible = baseline.milestone
                    ? startMs >= rangeStartMs && startMs <= rangeEndMs
                    : startMs < rangeEndMs && endMs > rangeStartMs;
                if (!visible)
                    continue;
                const list = baselinesByResource.get(event.resourceId);
                const entry = { event, baseline };
                if (list)
                    list.push(entry);
                else
                    baselinesByResource.set(event.resourceId, [entry]);
            }
        }
        for (const row of rows) {
            const mine = byResource.get(row.resource.id) ?? [];
            const segments: GanttSegment[] = mine.map((occurrence) => ({
                occurrence,
                day: new Date(rangeStartMs),
                isStart: occurrence.start.getTime() >= rangeStartMs,
                isEnd: occurrence.end.getTime() <= rangeEndMs,
                continuesBefore: occurrence.start.getTime() < rangeStartMs,
                continuesAfter: occurrence.end.getTime() > rangeEndMs,
                startMin: Math.max((occurrence.start.getTime() - rangeStartMs) / 60000, 0),
                endMin: Math.min((occurrence.end.getTime() - rangeStartMs) / 60000, totalMin),
            }));
            const mode = resolveScheduleMode(row.resource, scheduleMode);
            packTimedSegments(segments, { mode, preferredLanes: previousLanes });
            for (const segment of segments) {
                nextLanes.set(getLaneKey(segment.occurrence), {
                    lane: segment.column ?? 0,
                    startMs: segment.occurrence.start.getTime(),
                    endMs: segment.occurrence.end.getTime(),
                });
            }
            const laneCount = segments.reduce((max, segment) => Math.max(max, (segment.column ?? 0) + 1), 1);
            const plans = baselinesByResource.get(row.resource.id);
            const laneByEvent = plans
                ? new Map(segments.map((segment) => [
                    segment.occurrence.eventId,
                    segment.column ?? 0,
                ]))
                : null;
            const baselines: RowBaseline[] = plans
                ? plans.flatMap(({ event, baseline }) => {
                    let lane = laneByEvent?.get(event.id);
                    if (lane === undefined) {
                        if (mode === "single" || segments.length === 0) {
                            lane = 0;
                        }
                        else {
                            const free = lowestFreeLane(segments, baseline.start.getTime(), baseline.end.getTime());
                            if (free >= laneCount)
                                return [];
                            lane = free;
                        }
                    }
                    return [
                        {
                            event,
                            baseline,
                            startMin: Math.max((baseline.start.getTime() - rangeStartMs) / 60000, 0),
                            endMin: Math.min((baseline.end.getTime() - rangeStartMs) / 60000, totalMin),
                            lane,
                            variance: getBaselineVariance(event) ?? "on-time",
                        },
                    ];
                })
                : [];
            let from = Infinity;
            let to = -Infinity;
            for (const segment of segments) {
                from = Math.min(from, (segment.startMin ?? 0) / totalMin);
                to = Math.max(to, (segment.endMin ?? 0) / totalMin);
            }
            let summary: TimelineRowBars["summary"] = null;
            if (row.isGroup && segments.length === 0 && viewConfig.summaryBars) {
                let sumFrom = Infinity;
                let sumTo = -Infinity;
                for (const id of descendantIds.get(row.resource.id) ?? []) {
                    const env = envelopes.get(id);
                    if (!env)
                        continue;
                    sumFrom = Math.min(sumFrom, env.fromMin / totalMin);
                    sumTo = Math.max(sumTo, env.toMin / totalMin);
                }
                if (sumTo > sumFrom) {
                    summary = {
                        from: sumFrom,
                        to: sumTo,
                        progress: subtreeProgress.get(row.resource.id) ?? null,
                    };
                }
            }
            let rowBaseline: RowLevelBaseline | null = null;
            if (viewConfig.baselineBars) {
                const plan = resolveEventBaseline(row.resource);
                if (plan) {
                    const planStartMs = plan.start.getTime();
                    const planEndMs = plan.end.getTime();
                    const planVisible = plan.milestone
                        ? planStartMs >= rangeStartMs && planStartMs <= rangeEndMs
                        : planStartMs < rangeEndMs && planEndMs > rangeStartMs;
                    if (planVisible) {
                        const ids = row.isGroup
                            ? [row.resource.id, ...(descendantIds.get(row.resource.id) ?? [])]
                            : [row.resource.id];
                        let latest: number | undefined;
                        for (const id of ids) {
                            const end = latestEndByResource.get(id);
                            if (end !== undefined && (latest === undefined || end > latest)) {
                                latest = end;
                            }
                        }
                        rowBaseline = {
                            baseline: plan,
                            startMin: Math.max((planStartMs - rangeStartMs) / 60000, 0),
                            endMin: Math.min((planEndMs - rangeStartMs) / 60000, totalMin),
                            variance: latest === undefined
                                ? null
                                : latest > planEndMs
                                    ? "late"
                                    : latest < planEndMs
                                        ? "early"
                                        : "on-time",
                        };
                    }
                }
            }
            const blockRem = laneBlockRem(laneCount, laneHeightRem, laneGapRem);
            const heightRem = Math.max(minRowRem, blockRem + 2 * rowPaddingRem);
            const laneOffsetRem = (heightRem - blockRem) / 2;
            map.set(row.resource.id, {
                segments,
                laneCount,
                baselines,
                rowBaseline,
                draftLane: null,
                scheduleMode: mode,
                heightRem,
                laneOffsetRem,
                bandRem: laneHeightRem + laneOffsetRem * 2,
                extent: segments.length > 0
                    ? {
                        from,
                        to,
                        color: segments[0]?.occurrence.event.color,
                        label: segments.length === 1
                            ? (segments[0]?.occurrence.event.title ?? "")
                            : settings.i18n.labels.events(segments.length),
                        startMs: Math.min(...segments.map((s) => s.occurrence.start.getTime())),
                    }
                    : summary
                        ? {
                            from: summary.from,
                            to: summary.to,
                            label: row.resource.title,
                            startMs: rangeStartMs + summary.from * (rangeEndMs - rangeStartMs),
                        }
                        : null,
                summary,
            });
        }
        laneMemory.current = nextLanes;
        return map;
    }, [
        rows,
        occurrences,
        allEvents,
        rangeStartMs,
        rangeEndMs,
        settings.i18n,
        viewConfig.summaryBars,
        viewConfig.baselineBars,
        descendantIds,
        subtreeProgress,
        laneHeightRem,
        rowPaddingRem,
        laneGapRem,
        minRowRem,
        scheduleMode,
    ]);
    const treeConfig = { ...DEFAULT_TREE_PANEL, ...viewConfig.treePanel };
    const clampTree = (width: number) => Math.min(Math.max(width, treeConfig.minWidth), treeConfig.maxWidth);
    const [treeWidth, setTreeWidth] = useState(treeConfig.width);
    const configuredTreeWidth = clampTree(treeWidth);
    const columns = viewConfig.columns ?? [];
    const rowBars = useMemo(() => {
        if (!draftLayout)
            return baseRowBars;
        const base = baseRowBars.get(draftLayout.resourceId);
        if (!base)
            return baseRowBars;
        const next = new Map(baseRowBars);
        if (base.scheduleMode === "single") {
            next.set(draftLayout.resourceId, { ...base, draftLane: 0 });
            return next;
        }
        const draftLane = lowestFreeLane(base.segments, draftLayout.startMs, draftLayout.endMs);
        const trackCount = Math.max(base.laneCount, draftLane + 1);
        const draftBlockRem = laneBlockRem(trackCount, laneHeightRem, laneGapRem);
        next.set(draftLayout.resourceId, {
            ...base,
            draftLane,
            heightRem: Math.max(base.heightRem, base.laneOffsetRem * 2 + draftBlockRem),
        });
        return next;
    }, [baseRowBars, draftLayout, laneHeightRem, laneGapRem]);
    const dependencySourceIds = useMemo(() => {
        if (!viewConfig.dependencyLines)
            return EMPTY_ID_SET;
        let ids: Set<string> | null = null;
        for (const event of allEvents) {
            if (!event.dependencies?.length)
                continue;
            for (const id of event.dependencies) {
                if (!ids)
                    ids = new Set();
                ids.add(id);
            }
        }
        return ids ?? EMPTY_ID_SET;
    }, [allEvents, viewConfig.dependencyLines]);
    const dependencyEdges = useMemo(() => {
        const none = { edges: [] as DependencyEdge[], totalRem: 0 };
        if (!viewConfig.dependencyLines)
            return none;
        const totalMin = (rangeEndMs - rangeStartMs) / 60000;
        if (totalMin <= 0)
            return none;
        type Pending = {
            id: string;
            dependencies: string[];
            startX: number;
            y: number;
        };
        const anchors = new Map<string, {
            endX: number;
            y: number;
        }>();
        const pending: Pending[] = [];
        let topRem = 0;
        for (const row of rows) {
            const bars = rowBars.get(row.resource.id);
            if (bars) {
                for (const segment of bars.segments) {
                    const occ = segment.occurrence;
                    if (occ.isRecurring)
                        continue;
                    const lane = segment.column ?? 0;
                    const y = topRem +
                        laneTopRem(bars.laneOffsetRem, lane, laneHeightRem, laneGapRem) +
                        laneHeightRem / 2;
                    const startX = ((segment.startMin ?? 0) / totalMin) * trackRemWidth;
                    const endX = ((segment.endMin ?? 0) / totalMin) * trackRemWidth;
                    anchors.set(occ.eventId, { endX, y });
                    if (occ.event.dependencies?.length) {
                        pending.push({
                            id: occ.eventId,
                            dependencies: occ.event.dependencies,
                            startX,
                            y,
                        });
                    }
                }
            }
            topRem += bars?.heightRem ?? minRowRem;
        }
        if (pending.length === 0)
            return none;
        const edges: DependencyEdge[] = [];
        for (const item of pending) {
            for (const depId of item.dependencies) {
                if (depId === item.id)
                    continue;
                const from = anchors.get(depId);
                if (!from)
                    continue;
                edges.push({
                    key: `${depId}->${item.id}`,
                    fromId: depId,
                    toId: item.id,
                    fromX: from.endX,
                    fromY: from.y,
                    toX: item.startX,
                    toY: item.y,
                });
            }
        }
        return { edges, totalRem: topRem };
    }, [
        rows,
        rowBars,
        rangeStartMs,
        rangeEndMs,
        trackRemWidth,
        laneHeightRem,
        laneGapRem,
        minRowRem,
        viewConfig.dependencyLines,
    ]);
    const showCreateTask = viewConfig.displayCreateTaskHint &&
        !!settings.onCreateTask &&
        (settings.canCreateTask?.({ parentId: null }) ?? true);
    const [containerWidth, setContainerWidth] = useState(0);
    const clampContainer = (width: number, container: number) => {
        if (container <= 0)
            return width;
        const ceiling = container - minTimelineWidth - 1;
        const floor = Math.min(treeConfig.minWidth, Math.max(ceiling, 0));
        return Math.max(Math.min(width, ceiling), Math.min(floor, container - 1));
    };
    const clampedTreeWidth = clampContainer(configuredTreeWidth, containerWidth);
    const liveTreeWidthRef = useRef<number | null>(null);
    useGanttGestureTeardown();
    useEffect(() => {
        cancelActiveGanttGestures();
    }, [zoom, scale, rangeKey, clampedTreeWidth, rows.length]);
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const selectedRows = viewConfig.selectedRows ?? internalSelected;
    const selectedSet = useMemo(() => new Set(selectedRows), [selectedRows]);
    const viewConfigRef = useRef(viewConfig);
    viewConfigRef.current = viewConfig;
    const selectedRowsRef = useRef(selectedRows);
    selectedRowsRef.current = selectedRows;
    const toggleRowSelected = useCallback((id: string, checked: boolean) => {
        const current = selectedRowsRef.current;
        const next = checked
            ? [...current.filter((rowId) => rowId !== id), id]
            : current.filter((rowId) => rowId !== id);
        if (viewConfigRef.current.selectedRows === undefined) {
            setInternalSelected(next);
        }
        viewConfigRef.current.onSelectedRowsChange?.(next);
    }, []);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const treePaneRef = useRef<HTMLDivElement | null>(null);
    const timelinePaneRef = useRef<HTMLDivElement | null>(null);
    const treeRowsRef = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const body = bodyRef.current;
        if (!body)
            return;
        const update = () => setContainerWidth(body.clientWidth);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(body);
        return () => observer.disconnect();
    }, []);
    const beginSplit = (e: React.PointerEvent) => {
        if (e.button !== 0)
            return;
        e.preventDefault();
        const pointerId = e.pointerId;
        const startX = e.clientX;
        const startWidth = clampedTreeWidth;
        const splitter = e.currentTarget as HTMLElement;
        const dir = getComputedStyle(splitter).direction === "rtl" ? -1 : 1;
        splitter.setAttribute("data-resizing", "");
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        let liveWidth = startWidth;
        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId)
                return;
            liveWidth = clampContainer(clampTree(startWidth + (ev.clientX - startX) * dir), bodyRef.current?.clientWidth ?? 0);
            liveTreeWidthRef.current = liveWidth;
            if (treePaneRef.current) {
                treePaneRef.current.style.width = `${liveWidth}px`;
            }
        };
        const finish = (ev?: PointerEvent) => {
            if (ev && ev.pointerId !== pointerId)
                return;
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", finish);
            window.removeEventListener("pointercancel", finish);
            splitter.removeAttribute("data-resizing");
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            liveTreeWidthRef.current = null;
            if (liveWidth !== startWidth) {
                setTreeWidth(liveWidth);
                viewConfigRef.current.treePanel?.onWidthChange?.(liveWidth);
            }
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", finish);
        window.addEventListener("pointercancel", finish);
    };
    useEffect(() => {
        const treeViewport = getPaneViewport(treePaneRef.current);
        const timelineViewport = getPaneViewport(timelinePaneRef.current);
        if (!treeViewport || !timelineViewport)
            return;
        const link = (source: HTMLElement, target: HTMLElement) => {
            let lastTop = source.scrollTop;
            const onScroll = () => {
                if (source.scrollTop === lastTop)
                    return;
                lastTop = source.scrollTop;
                if (target.scrollTop !== source.scrollTop) {
                    target.scrollTop = source.scrollTop;
                }
            };
            source.addEventListener("scroll", onScroll);
            return () => source.removeEventListener("scroll", onScroll);
        };
        const unlinkTree = link(treeViewport, timelineViewport);
        const unlinkTimeline = link(timelineViewport, treeViewport);
        let unforward: (() => void) | null = null;
        if (treeViewport.hasAttribute("data-gantt-native-scroll")) {
            const onWheel = (e: WheelEvent) => {
                if (e.ctrlKey || e.metaKey)
                    return;
                if (Math.abs(e.deltaY) <= Math.abs(e.deltaX))
                    return;
                const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
                timelineViewport.scrollTop += dy;
                e.preventDefault();
            };
            treeViewport.addEventListener("wheel", onWheel, { passive: false });
            unforward = () => treeViewport.removeEventListener("wheel", onWheel);
        }
        else {
            const onWheel = (e: WheelEvent) => {
                if (e.ctrlKey || e.metaKey)
                    return;
                if (Math.abs(e.deltaY) <= Math.abs(e.deltaX))
                    return;
                const max = timelineViewport.scrollHeight - timelineViewport.clientHeight;
                if (max <= 0)
                    return;
                const unit = e.deltaMode === 1
                    ? 16
                    : e.deltaMode === 2
                        ? timelineViewport.clientHeight
                        : 1;
                const next = Math.max(0, Math.min(max, timelineViewport.scrollTop + e.deltaY * unit));
                e.preventDefault();
                timelineViewport.scrollTop = next;
                treeViewport.scrollTop = next;
            };
            treeViewport.addEventListener("wheel", onWheel, { passive: false });
            timelineViewport.addEventListener("wheel", onWheel, { passive: false });
            unforward = () => {
                treeViewport.removeEventListener("wheel", onWheel);
                timelineViewport.removeEventListener("wheel", onWheel);
            };
        }
        return () => {
            unlinkTree();
            unlinkTimeline();
            unforward?.();
        };
    }, [scale, viewConfig.scrollbars]);
    useEffect(() => {
        const body = bodyRef.current;
        if (!body)
            return;
        let current: string | null = null;
        const apply = (id: string | null) => {
            if (id === current)
                return;
            if (current) {
                body
                    .querySelectorAll(`[data-gantt-row-id="${CSS.escape(current)}"]`)
                    .forEach((el) => el.removeAttribute("data-hover"));
            }
            if (id) {
                body
                    .querySelectorAll(`[data-gantt-row-id="${CSS.escape(id)}"]`)
                    .forEach((el) => el.setAttribute("data-hover", ""));
            }
            current = id;
        };
        const onOver = (e: PointerEvent) => {
            const row = (e.target as HTMLElement | null)?.closest?.("[data-gantt-row-id]");
            apply(row?.getAttribute("data-gantt-row-id") ?? null);
        };
        const onLeave = () => apply(null);
        body.addEventListener("pointerover", onOver);
        body.addEventListener("pointerleave", onLeave);
        return () => {
            body.removeEventListener("pointerover", onOver);
            body.removeEventListener("pointerleave", onLeave);
            apply(null);
        };
    }, []);
    const anchorMs = useGanttSelector((state) => state.date.getTime());
    const initialCenter = viewConfig.initialCenter instanceof Date
        ? viewConfig.initialCenter.getTime()
        : viewConfig.initialCenter;
    const manageRef = useRef({ key: "", buffered: false, userTook: false });
    useLayoutEffect(() => {
        const key = `${scale}:${anchorMs}:${viewConfig.scrollbars}`;
        if (manageRef.current.key !== key) {
            const slideContinuation = manageRef.current.userTook && instance.internals.didAnchorSlide();
            manageRef.current = slideContinuation
                ? { key, buffered: manageRef.current.buffered, userTook: true }
                : { key, buffered: false, userTook: false };
        }
        if (manageRef.current.userTook)
            return;
        let waiter: ResizeObserver | null = null;
        const run = () => {
            waiter?.disconnect();
            waiter = null;
            const viewport = getPaneViewport(timelinePaneRef.current);
            const axis = viewport?.querySelector<HTMLElement>("[data-gantt-axis]");
            if (!viewport || !axis)
                return;
            if (viewport.clientWidth === 0) {
                waiter = new ResizeObserver(() => {
                    if (viewport.clientWidth > 0)
                        run();
                });
                waiter.observe(viewport);
                return;
            }
            if (viewConfig.infiniteScroll && !manageRef.current.buffered) {
                manageRef.current.buffered = true;
                extendLockRef.current = true;
                instance.internals.extendRange("before");
                instance.internals.extendRange("after");
                return;
            }
            extendLockRef.current = false;
            if (viewport.scrollWidth <= viewport.clientWidth)
                return;
            const active = instance.getState().activeRange;
            let target: number;
            if (typeof initialCenter === "number") {
                target = initialCenter;
            }
            else if (initialCenter === "anchor") {
                target = anchorMs;
            }
            else {
                const nowMs = Date.now();
                target =
                    nowMs >= active.start.getTime() && nowMs < active.end.getTime()
                        ? nowMs
                        : anchorMs;
            }
            const fraction = Math.min(Math.max((target - rangeStartMs) / (rangeEndMs - rangeStartMs), 0), 1);
            setScrollStart(viewport, Math.max(0, fraction * viewport.scrollWidth - viewport.clientWidth / 2));
        };
        run();
        return () => {
            waiter?.disconnect();
        };
    }, [
        scale,
        anchorMs,
        initialCenter,
        viewConfig.scrollbars,
        viewConfig.infiniteScroll,
        rangeKey,
        rangeStartMs,
        rangeEndMs,
        instance,
    ]);
    const pendingRestoreRef = useRef<{
        ms: number;
        align: "start" | "center";
        offsetPx?: number;
    } | null>(null);
    const extendLockRef = useRef(false);
    const lastUserScrollRef = useRef(0);
    const fineCenterRef = useRef<number | null>(null);
    const lastZoomRef = useRef<number | null>(null);
    useEffect(() => {
        const pane = timelinePaneRef.current;
        if (!pane)
            return;
        const markIntent = () => {
            lastUserScrollRef.current = performance.now();
        };
        const markWheelIntent = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey)
                return;
            markIntent();
        };
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest("[data-slot=scroll-area-scrollbar], [data-slot=gantt-timeline-header], [data-gantt-native-scroll]")) {
                markIntent();
            }
        };
        pane.addEventListener("wheel", markWheelIntent, { passive: true });
        pane.addEventListener("pointerdown", onPointerDown);
        pane.addEventListener("touchstart", markIntent, { passive: true });
        pane.addEventListener("keydown", markIntent);
        return () => {
            pane.removeEventListener("wheel", markWheelIntent);
            pane.removeEventListener("pointerdown", onPointerDown);
            pane.removeEventListener("touchstart", markIntent);
            pane.removeEventListener("keydown", markIntent);
        };
    }, []);
    useEffect(() => {
        if (!viewConfig.infiniteScroll)
            return;
        const viewport = getPaneViewport(timelinePaneRef.current);
        if (!viewport)
            return;
        const tryExtend = (direction: "before" | "after") => {
            const axis = viewport.querySelector<HTMLElement>("[data-gantt-axis]");
            const liveStart = Number(axis?.dataset.ganttRangeStart);
            const liveEnd = Number(axis?.dataset.ganttRangeEnd);
            if (!axis || Number.isNaN(liveStart) || Number.isNaN(liveEnd))
                return;
            extendLockRef.current = true;
            manageRef.current.userTook = true;
            pendingRestoreRef.current = {
                ms: liveStart +
                    (getScrollStart(viewport) / viewport.scrollWidth) *
                        (liveEnd - liveStart),
                align: "start",
            };
            if (!instance.internals.extendRange(direction)) {
                pendingRestoreRef.current = null;
                extendLockRef.current = false;
            }
        };
        const isRtl = getComputedStyle(viewport).direction === "rtl";
        const onScroll = () => {
            if (extendLockRef.current)
                return;
            if (performance.now() - lastUserScrollRef.current > 1200)
                return;
            if (viewport.scrollWidth <= viewport.clientWidth + 8)
                return;
            const fromStart = getScrollStart(viewport);
            const fromEnd = viewport.scrollWidth - fromStart - viewport.clientWidth;
            const direction = fromStart < infiniteEdgePx
                ? ("before" as const)
                : fromEnd < infiniteEdgePx
                    ? ("after" as const)
                    : null;
            if (!direction)
                return;
            tryExtend(direction);
        };
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey)
                return;
            if (extendLockRef.current || e.deltaX === 0)
                return;
            if (viewport.scrollWidth <= viewport.clientWidth + 8)
                return;
            const towardStart = isRtl ? e.deltaX > 0 : e.deltaX < 0;
            if (towardStart && getScrollStart(viewport) <= 0) {
                tryExtend("before");
            }
            else if (!towardStart &&
                getScrollStart(viewport) + viewport.clientWidth >=
                    viewport.scrollWidth - 1) {
                tryExtend("after");
            }
        };
        viewport.addEventListener("scroll", onScroll);
        viewport.addEventListener("wheel", onWheel, { passive: true });
        return () => {
            viewport.removeEventListener("scroll", onScroll);
            viewport.removeEventListener("wheel", onWheel);
        };
    }, [
        instance,
        viewConfig.infiniteScroll,
        scale,
        viewConfig.scrollbars,
        infiniteEdgePx,
    ]);
    useEffect(() => {
        const viewport = getPaneViewport(timelinePaneRef.current);
        if (!viewport)
            return;
        const keyFmt = scale === "day"
            ? "yyyy-MM-dd"
            : scale === "week"
                ? "RRRR-'W'II"
                : scale === "month"
                    ? "yyyy-MM"
                    : scale === "quarter"
                        ? "yyyy-qqq"
                        : "yyyy";
        let raf = 0;
        let lastKey = "";
        const measure = () => {
            raf = 0;
            const axis = viewport.querySelector<HTMLElement>("[data-gantt-axis]");
            const liveStart = Number(axis?.dataset.ganttRangeStart);
            const liveEnd = Number(axis?.dataset.ganttRangeEnd);
            if (!axis || Number.isNaN(liveStart) || Number.isNaN(liveEnd))
                return;
            const fraction = (getScrollStart(viewport) + viewport.clientWidth / 2) /
                Math.max(1, viewport.scrollWidth);
            const centerMs = liveStart + fraction * (liveEnd - liveStart);
            fineCenterRef.current = centerMs;
            const center = new Date(centerMs);
            const key = format(toZoned(center, timeZone), keyFmt);
            if (key === lastKey)
                return;
            lastKey = key;
            instance.internals.setViewportCenter(center);
        };
        const schedule = () => {
            if (!raf)
                raf = requestAnimationFrame(measure);
        };
        viewport.addEventListener("scroll", schedule);
        schedule();
        return () => {
            viewport.removeEventListener("scroll", schedule);
            if (raf)
                cancelAnimationFrame(raf);
        };
    }, [instance, scale, timeZone, viewConfig.scrollbars, rangeKey]);
    useLayoutEffect(() => {
        if (lastZoomRef.current !== null &&
            lastZoomRef.current !== zoom &&
            !pendingRestoreRef.current &&
            fineCenterRef.current !== null) {
            pendingRestoreRef.current = { ms: fineCenterRef.current, align: "center" };
        }
        lastZoomRef.current = zoom;
        let raf: number | null = null;
        let attempts = 0;
        const seat = () => {
            raf = null;
            const viewport = getPaneViewport(timelinePaneRef.current);
            if (viewport && pendingRestoreRef.current) {
                if (viewport.clientWidth === 0 && attempts++ < 20) {
                    raf = requestAnimationFrame(seat);
                    return;
                }
                const { ms, align, offsetPx } = pendingRestoreRef.current;
                pendingRestoreRef.current = null;
                const fraction = Math.min(Math.max((ms - rangeStartMs) / (rangeEndMs - rangeStartMs), 0), 1);
                const offset = offsetPx ?? (align === "center" ? viewport.clientWidth / 2 : 0);
                setScrollStart(viewport, Math.max(0, fraction * viewport.scrollWidth - offset));
            }
            extendLockRef.current = false;
        };
        seat();
        return () => {
            if (raf !== null)
                cancelAnimationFrame(raf);
        };
    }, [
        rangeKey,
        zoom,
        rangeStartMs,
        rangeEndMs,
        scale,
        viewConfig.scrollbars,
        instance,
    ]);
    const anchorZoomCenter = () => {
        const viewport = getPaneViewport(timelinePaneRef.current);
        const axis = viewport?.querySelector<HTMLElement>("[data-gantt-axis]");
        if (!viewport || !axis)
            return;
        const liveStart = Number(axis.dataset.ganttRangeStart);
        const liveEnd = Number(axis.dataset.ganttRangeEnd);
        if (Number.isNaN(liveStart) || Number.isNaN(liveEnd))
            return;
        pendingRestoreRef.current = {
            ms: liveStart +
                ((getScrollStart(viewport) + viewport.clientWidth / 2) /
                    viewport.scrollWidth) *
                    (liveEnd - liveStart),
            align: "center",
        };
    };
    const anchorZoomPointer = (clientX: number) => {
        const viewport = getPaneViewport(timelinePaneRef.current);
        const axis = viewport?.querySelector<HTMLElement>("[data-gantt-axis]");
        if (!viewport || !axis)
            return;
        const liveStart = Number(axis.dataset.ganttRangeStart);
        const liveEnd = Number(axis.dataset.ganttRangeEnd);
        if (Number.isNaN(liveStart) || Number.isNaN(liveEnd))
            return;
        const offsetPx = trackPoint(viewport, clientX).offset;
        pendingRestoreRef.current = {
            ms: liveStart +
                ((getScrollStart(viewport) + offsetPx) / viewport.scrollWidth) *
                    (liveEnd - liveStart),
            align: "start",
            offsetPx,
        };
    };
    const wheelZoomRef = useRef<((e: WheelEvent) => void) | null>(null);
    useEffect(() => {
        wheelZoomRef.current = (e: WheelEvent) => {
            if (!viewConfig.wheelZoom)
                return;
            if (!e.ctrlKey && !e.metaKey)
                return;
            const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
            const next = clampZoom(zoom * Math.exp(-e.deltaY * lines * 0.002));
            if (Math.abs(next - zoom) < 1e-4)
                return;
            e.preventDefault();
            if (viewConfig.zoom === undefined)
                anchorZoomPointer(e.clientX);
            setZoomValue(+next.toFixed(4));
        };
    });
    useEffect(() => {
        const viewport = getPaneViewport(timelinePaneRef.current);
        if (!viewport)
            return;
        const onWheel = (e: WheelEvent) => wheelZoomRef.current?.(e);
        viewport.addEventListener("wheel", onWheel, { passive: false });
        return () => viewport.removeEventListener("wheel", onWheel);
    }, [viewConfig.scrollbars, scale]);
    const beginHeaderPan = (e: React.PointerEvent) => {
        if (e.button !== 0)
            return;
        const viewport = getPaneViewport(timelinePaneRef.current);
        if (!viewport)
            return;
        const pointerId = e.pointerId;
        const startX = e.clientX;
        const startLeft = viewport.scrollLeft;
        let active = false;
        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId)
                return;
            const dx = ev.clientX - startX;
            if (!active && Math.abs(dx) < 4)
                return;
            if (!active) {
                markGestureEnd();
                setIsPanning(true);
            }
            active = true;
            lastUserScrollRef.current = performance.now();
            document.body.style.cursor = "grabbing";
            document.body.style.userSelect = "none";
            viewport.scrollLeft = startLeft - dx;
        };
        const finish = (ev?: PointerEvent) => {
            if (ev && ev.pointerId !== pointerId)
                return;
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", finish);
            window.removeEventListener("pointercancel", finish);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            if (active)
                setIsPanning(false);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", finish);
        window.addEventListener("pointercancel", finish);
    };
    const [isPanning, setIsPanning] = useState(false);
    const [reorder, setReorder] = useState<TimelineReorderState | null>(null);
    const reorderEnabled = !!settings.onResourceReorder;
    const settingsRef = useRef(settings);
    settingsRef.current = settings;
    const rowsRef = useRef(rows);
    rowsRef.current = rows;
    const beginRowReorder = useCallback((e: React.PointerEvent, dragRow: TimelineRow) => {
        const settings = settingsRef.current;
        const rows = rowsRef.current;
        if (e.button !== 0 || !settings.onResourceReorder)
            return;
        e.preventDefault();
        e.stopPropagation();
        const container = treeRowsRef.current;
        const pane = treePaneRef.current;
        if (!container || !pane)
            return;
        const rowEls = Array.from(container.querySelectorAll<HTMLElement>("[data-slot=gantt-row-group]"));
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        let current: TimelineReorderState | null = null;
        let lastBoundary = -1;
        const pointerId = e.pointerId;
        const rowEl = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-slot=gantt-row-group]");
        const overlay = document.createElement("div");
        overlay.setAttribute("data-slot", "gantt-drag-overlay");
        overlay.className =
            "bg-background pointer-events-none fixed overflow-hidden opacity-95";
        overlay.style.zIndex = "100";
        const ganttRoot = pane.closest<HTMLElement>("[data-slot=gantt]");
        if (ganttRoot) {
            const rootStyle = getComputedStyle(ganttRoot);
            overlay.style.fontSize = rootStyle.fontSize;
            overlay.style.lineHeight = rootStyle.lineHeight;
            overlay.style.fontFamily = rootStyle.fontFamily;
            overlay.style.letterSpacing = rootStyle.letterSpacing;
            overlay.style.direction = rootStyle.direction;
        }
        if (rowEl) {
            const rowRect = rowEl.getBoundingClientRect();
            overlay.style.width = `${rowRect.width}px`;
            overlay.style.height = `${rowRect.height}px`;
            const clone = rowEl.cloneNode(true) as HTMLElement;
            clone.removeAttribute("data-gantt-row-id");
            clone.classList.remove("border-b");
            clone.style.height = "100%";
            overlay.appendChild(clone);
        }
        document.body.appendChild(overlay);
        const grabRect = rowEl?.getBoundingClientRect();
        const grabDY = grabRect ? e.clientY - grabRect.top : 8;
        const lockedX = grabRect?.left ?? pane.getBoundingClientRect().left;
        const paneRect = pane.getBoundingClientRect();
        const rowH = grabRect?.height ?? 40;
        const rects = rowEls.map((el) => el.getBoundingClientRect());
        const place = (y: number) => {
            const top = Math.min(Math.max(y - grabDY, paneRect.top), paneRect.bottom - rowH);
            overlay.style.left = `${lockedX}px`;
            overlay.style.top = `${top}px`;
        };
        place(e.clientY);
        const propose = (boundary: number): TimelineReorderState => {
            const below = rows[boundary];
            const parentId = below?.parentId ?? rows[rows.length - 1]?.parentId ?? null;
            let index = 0;
            for (let i = 0; i < boundary; i++) {
                if (rows[i]?.parentId === parentId &&
                    rows[i]?.resource.id !== dragRow.resource.id) {
                    index++;
                }
            }
            const next = reorderResources(settings.resources, dragRow.resource.id, parentId, index);
            const proposal: GanttResourceReorder | null = next
                ? {
                    resourceId: dragRow.resource.id,
                    parentId,
                    index,
                    resources: next,
                }
                : null;
            const valid = !!proposal && (settings.canReorderResource?.(proposal) ?? true);
            const top = boundary < rects.length
                ? (rects[boundary]?.top ?? paneRect.top) - paneRect.top
                : (rects[rects.length - 1]?.bottom ?? paneRect.top) - paneRect.top;
            return { resourceId: dragRow.resource.id, top, valid, proposal };
        };
        const onMove = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId)
                return;
            place(ev.clientY);
            let boundary = rects.length;
            for (let i = 0; i < rects.length; i++) {
                const rect_ = rects[i];
                if (rect_ && ev.clientY < rect_.top + rect_.height / 2) {
                    boundary = i;
                    break;
                }
            }
            if (boundary === lastBoundary)
                return;
            lastBoundary = boundary;
            const nextState = propose(boundary);
            if (current &&
                current.top === nextState.top &&
                current.valid === nextState.valid) {
                return;
            }
            current = nextState;
            document.body.style.cursor = nextState.valid
                ? "grabbing"
                : "not-allowed";
            setReorder(nextState);
        };
        const finish = (commit: boolean) => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onCancelEvent);
            window.removeEventListener("keydown", onKey);
            overlay.remove();
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            if (commit && current?.proposal && !current.valid) {
                settings.onResourceReorderReject?.(current.proposal);
            }
            else if (commit && current?.valid && current.proposal) {
                settings.onResourceReorder?.(current.proposal);
                const announcer = pane
                    .closest<HTMLElement>("[data-slot=gantt]")
                    ?.querySelector<HTMLElement>("[data-slot=gantt-announcer]");
                if (announcer) {
                    announcer.textContent = `${dragRow.resource.title}: ${settings.i18n.labels.reorder}`;
                }
            }
            setReorder(null);
        };
        const onUp = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId)
                return;
            finish(true);
        };
        const onCancelEvent = (ev: PointerEvent) => {
            if (ev.pointerId !== pointerId)
                return;
            finish(false);
        };
        const onKey = (ev: KeyboardEvent) => {
            if (ev.key === "Escape")
                finish(false);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onCancelEvent);
        window.addEventListener("keydown", onKey);
    }, []);
    const collapsedIdsRef = useRef(collapsedIds);
    collapsedIdsRef.current = collapsedIds;
    const onToggleRow = useCallback((row: TimelineRow) => {
        const current = collapsedIdsRef.current;
        const next = current.includes(row.resource.id)
            ? current.filter((id) => id !== row.resource.id)
            : [...current, row.resource.id];
        if (viewConfigRef.current.collapsedGroups === undefined) {
            setInternalCollapsed(next);
        }
        viewConfigRef.current.onCollapsedGroupsChange?.(next);
    }, []);
    const loading = useGanttSelector<unknown, boolean>((state) => state.loading);
    const customScrollbars = viewConfig.scrollbars !== "native";
    const gridLines = resolveTimelineLines(viewConfig.timelineLines);
    const showVerticalLines = gridLines.vertical !== null;
    const offDayClassName = (typeof viewConfig.offDays === "object" && viewConfig.offDays.className) ||
        "bg-muted/40";
    const offDayBodyClassName = (typeof viewConfig.offDays === "object" && viewConfig.offDays.className) ||
        "bg-muted/25 bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,color-mix(in_oklab,var(--color-border)_35%,transparent)_5px,color-mix(in_oklab,var(--color-border)_35%,transparent)_6px)]";
    const showUnitLines = !uniform || showVerticalLines;
    const namePaddingStart = reorderEnabled ? "3.125rem" : "2.25rem";
    const treeContent = (<div className={cn("flex min-h-full w-max min-w-full flex-col", customScrollbars && "pb-2.5")}>
      
      <div data-slot="gantt-tree-header" className="bg-background sticky top-0 z-30 box-content h-16 shrink-0 border-b border-b-transparent">
        <div className="flex h-8 border-b">
          <div className="flex h-full min-w-0 flex-1">
            <div className="flex h-full shrink-0 items-center" style={{
            width: treeConfig.nameColumnWidth,
            paddingInlineStart: namePaddingStart,
        }}>
              <span className="text-muted-foreground truncate font-medium">
                {settings.i18n.labels.resources}
              </span>
            </div>
            {columns.map((column) => (<div key={column.id} data-slot="gantt-column-header" data-column={column.id} className={cn("text-muted-foreground flex h-full shrink-0 items-center px-2 font-medium", column.align === "center" && "justify-center", column.align === "end" && "justify-end", column.className)} style={{ width: column.width ?? DEFAULT_COLUMN_WIDTH }}>
                <span className="truncate">{column.title ?? column.id}</span>
              </div>))}
            <div className="min-w-0 flex-1"/>
          </div>
          {viewConfig.columnsMenu && (<div data-slot="gantt-columns-menu" className="bg-background before:from-background sticky end-0 z-10 flex h-full shrink-0 items-center ps-1.5 pe-2.5 before:pointer-events-none before:absolute before:inset-y-0 before:-start-5 before:w-5 before:bg-linear-to-l before:to-transparent rtl:before:bg-linear-to-r">
              {viewConfig.columnsMenu}
            </div>)}
        </div>
      </div>
      <div ref={treeRowsRef} className="flex flex-col">
        {rows.map((row) => (<GanttTreeRow key={row.resource.id} row={row} heightRem={rowBars.get(row.resource.id)?.heightRem ?? minRowRem} bandRem={rowBars.get(row.resource.id)?.bandRem ?? minRowRem} columns={columns} nameWidth={treeConfig.nameColumnWidth} dimmed={reorder?.resourceId === row.resource.id} selected={selectedSet.has(row.resource.id)} onSelectedChange={row.isGroup ? undefined : toggleRowSelected} onGripPointerDown={reorderEnabled ? beginRowReorder : undefined} onToggle={onToggleRow}/>))}
        {showCreateTask && (<button type="button" data-slot="gantt-create-task" className="text-muted-foreground hover:text-foreground hover:bg-muted/40 flex h-10 w-full shrink-0 items-center border-b ps-3 pe-3" onClick={() => settings.onCreateTask?.({
                parentId: null,
                index: settings.resources.length,
            })}>
            <span className="flex h-full w-full items-center">
              {reorderEnabled && (<span aria-hidden className="w-3.5 shrink-0"/>)}
              
              <span className="me-1 flex w-5 shrink-0 items-center justify-center">
                <AddIcon className="size-3.5" aria-hidden="true"/>
              </span>
              <span>{settings.i18n.labels.addTask}</span>
            </span>
          </button>)}
      </div>
    </div>);
    const timelineContent = (<div className={cn("flex min-h-full w-max min-w-full grow flex-col", customScrollbars && "pb-2.5")}>
      
      <div data-slot="gantt-timeline-header" className="bg-background sticky top-0 z-30 shrink-0 border-b" style={{ minWidth: trackWidth }} onPointerDown={beginHeaderPan}>
        
        <div className="relative h-8 border-b">
          <div className="flex h-full">
            {groups.map((group) => (<div key={group.key} data-slot="gantt-axis-group" className="text-muted-foreground flex min-w-0 items-center ps-3 pe-2" style={{ flex: `${group.span} 0 0px` }}>
                
                <span data-slot="gantt-axis-group-label" className="sticky start-3 max-w-full truncate">
                  {group.label}
                </span>
              </div>))}
          </div>
          
          {groupBoundaries.map((fraction) => (<span key={fraction} aria-hidden className="bg-border absolute inset-y-0 w-px" style={{ insetInlineStart: `calc(${fraction * 100}% - 1px)` }}/>))}
        </div>
        
        <div data-gantt-axis="" data-gantt-range-start={rangeStartMs} data-gantt-range-end={rangeEndMs} data-gantt-snap={snapMin} className="relative h-8">
          
          <div aria-hidden className="absolute inset-0">
            {unitFractions.map(({ unit, start, width }) => unit.isOff && (<span key={unit.key} data-off-day={unit.day} className={cn("absolute inset-y-0", offDayClassName)} style={{
                insetInlineStart: `${start * 100}%`,
                width: `${width * 100}%`,
            }}/>))}
          </div>
          <div className="flex h-full">
            {units.map((unit) => (<div key={unit.key} data-today={unit.isToday || undefined} data-off={unit.isOff || undefined} className={cn("flex min-w-0 items-center justify-center truncate px-1.5 text-center", "text-muted-foreground", unit.isToday && "text-primary font-medium")} style={{ flex: `${unit.weight} 0 0px` }}>
                
                {unit.isToday ? (<span className="bg-primary/10 truncate rounded-full px-1.5 py-px">
                    {unit.label}
                  </span>) : (unit.label)}
              </div>))}
          </div>
          {showUnitLines &&
            unitFractions.slice(1).map(({ unit, start }) => (<span key={unit.key} aria-hidden data-slot="gantt-grid-line" data-axis="vertical" className={cn("absolute inset-y-0 w-px", gridLines.vertical === "dashed"
                    ? "bg-[repeating-linear-gradient(to_bottom,var(--color-border)_0,var(--color-border)_3px,transparent_3px,transparent_6px)]"
                    : "bg-border")} style={{ insetInlineStart: `calc(${start * 100}% - 1px)` }}/>))}
          {viewConfig.nowIndicator && (<GanttNowDot rangeStartMs={rangeStartMs} rangeEndMs={rangeEndMs}/>)}
        </div>
      </div>
      
      <div className="relative flex min-h-0 grow flex-col" onPointerDown={beginHeaderPan}>
        
        <div aria-hidden data-slot="gantt-timeline-backdrop" className="pointer-events-none absolute inset-0">
          {unitFractions.map(({ unit, start, width }) => (<span key={unit.key} className="contents">
              {unit.isOff && (<span data-off="" data-off-day={unit.day} className={cn("absolute inset-y-0", offDayBodyClassName)} style={{
                    insetInlineStart: `${start * 100}%`,
                    width: `${width * 100}%`,
                }}/>)}
              {unit.isToday && scale !== "day" && (<span data-today="" className="bg-primary/5 absolute inset-y-0" style={{
                    insetInlineStart: `${start * 100}%`,
                    width: `${width * 100}%`,
                }}/>)}
            </span>))}
          
          {gridLines.vertical !== null &&
            unitFractions
                .slice(1)
                .map(({ unit, start }) => (<span key={`grid-${unit.key}`} data-slot="gantt-grid-line" data-axis="vertical" className={cn("absolute inset-y-0 w-px", gridLines.vertical === "dashed"
                    ? "bg-[repeating-linear-gradient(to_bottom,var(--color-border)_0,var(--color-border)_3px,transparent_3px,transparent_6px)]"
                    : "bg-border")} style={{ insetInlineStart: `calc(${start * 100}% - 1px)` }}/>))}
          {viewConfig.nowIndicator && (<GanttNowLine rangeStartMs={rangeStartMs} rangeEndMs={rangeEndMs}/>)}
        </div>
        
        {dependencyEdges.edges.length > 0 && (<GanttDependencyLayer edges={dependencyEdges.edges} totalRem={dependencyEdges.totalRem} trackRemWidth={trackRemWidth} rangeStartMs={rangeStartMs} rangeEndMs={rangeEndMs} laneHeightRem={laneHeightRem} laneGapRem={laneGapRem}/>)}
        {rows.map((row, rowIndex) => (<GanttTimelineRow key={row.resource.id} row={row} rowIndex={rowIndex} bars={rowBars.get(row.resource.id)} rangeStartMs={rangeStartMs} rangeEndMs={rangeEndMs} trackWidth={trackWidth} trackRemWidth={trackRemWidth} rowBorder={gridLines.horizontal} selected={selectedSet.has(row.resource.id)} resolveHintStop={resolveHintStop} isPanning={isPanning} laneHeightRem={laneHeightRem} laneGapRem={laneGapRem} minRowRem={minRowRem} ghostHeightRem={ghostHeightRem} dependencySourceIds={dependencySourceIds}/>))}
        {rows.length === 0 && viewConfig.renderNoResources && (<div data-slot="gantt-no-resources" className="text-muted-foreground flex grow items-center justify-center p-6 text-sm">
            {viewConfig.renderNoResources()}
          </div>)}
        {showCreateTask && (<div aria-hidden data-slot="gantt-create-task-spacer" className="h-10 border-b" style={{ minWidth: trackWidth }}/>)}
      </div>
    </div>);
    const horizontalScrollbar = (<ScrollBar orientation="horizontal" className="bg-background border-t-border! end-0! z-40 h-4! rounded-none py-1"/>);
    const Comp = asChild ? Slot.Root : "div";
    return (<Comp data-slot="gantt-view" data-scale={scale} aria-busy={loading || undefined} className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", viewConfig.classNames?.view, className)} {...props}>
      <div ref={bodyRef} className="relative flex min-h-0 flex-1">
        
        <div ref={treePaneRef} data-slot="gantt-tree-pane" className="relative h-full shrink-0" style={{ width: liveTreeWidthRef.current ?? clampedTreeWidth }}>
          {customScrollbars ? (<ScrollArea key={scale} className="h-full [&>[data-orientation=vertical]]:hidden">
              {treeContent}
              {horizontalScrollbar}
            </ScrollArea>) : (<div data-slot="scroll-area-viewport" data-gantt-native-scroll="" className="h-full overflow-x-auto overflow-y-hidden overscroll-contain">
              {treeContent}
            </div>)}
          
          {customScrollbars && (<div aria-hidden data-slot="gantt-tree-scrollbar-rail" className="bg-background border-t-border pointer-events-none absolute inset-x-0 bottom-0 h-4 border-t"/>)}
          
          {reorder && (<div data-slot="gantt-reorder-indicator" data-invalid={!reorder.valid || undefined} className="pointer-events-none absolute inset-x-0 flex items-center" style={{ top: reorder.top - 4, zIndex: 110 }}>
              
              <span className={cn("ms-0.5 size-0 shrink-0 border-y-4 border-s-8 border-y-transparent", reorder.valid ? "border-s-primary" : "border-s-destructive")}/>
              <span className={cn("h-px min-w-0 flex-1", reorder.valid ? "bg-primary" : "bg-destructive")}/>
            </div>)}
        </div>
        
        {treeConfig.resizable ? (<div role="separator" aria-orientation="vertical" aria-label={settings.i18n.labels.resizePanel} aria-valuenow={Math.round(clampedTreeWidth)} aria-valuemin={Math.round(Math.min(treeConfig.minWidth, clampedTreeWidth))} aria-valuemax={Math.round(Math.max(treeConfig.maxWidth, clampedTreeWidth))} tabIndex={0} data-slot="gantt-splitter" className={cn("group/gantt-splitter bg-border hover:bg-primary/60 data-resizing:bg-primary relative z-30 w-px shrink-0 cursor-col-resize touch-none outline-none", "focus-visible:ring-ring/50 focus-visible:ring-2", "after:absolute after:inset-y-0 after:-start-1 after:-end-1")} onPointerDown={beginSplit} onDoubleClick={() => {
                setTreeWidth(treeConfig.width);
                treeConfig.onWidthChange?.(treeConfig.width);
            }} onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                    e.preventDefault();
                    const dir = getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1;
                    const delta = (e.key === "ArrowLeft" ? -16 : 16) * dir;
                    const next = clampTree(clampedTreeWidth + delta);
                    setTreeWidth(next);
                    treeConfig.onWidthChange?.(next);
                }
            }}>
            
            <span aria-hidden data-slot="gantt-splitter-grip" className="bg-primary/60 group-data-resizing/gantt-splitter:bg-primary absolute top-1/2 left-1/2 h-6 w-0.75 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150 group-hover/gantt-splitter:opacity-100 group-focus-visible/gantt-splitter:opacity-100 group-data-resizing/gantt-splitter:opacity-100"/>
          </div>) : (<div aria-hidden className="bg-border w-px shrink-0"/>)}
        
        <div ref={timelinePaneRef} data-slot="gantt-timeline-pane" className="relative h-full min-w-0 flex-1">
          {viewConfig.zoomControl && (<div data-slot="gantt-zoom" className="bg-background absolute end-[calc(0.75rem+var(--gantt-zoom-shift,0px))] bottom-5 z-40 flex flex-col rounded-md border shadow-sm transition-[inset-inline-end] duration-200">
              
              <TooltipProvider delayDuration={600} skipDelayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-xs" aria-label={settings.i18n.labels.zoomIn} aria-disabled={!canZoomIn || undefined} className="text-muted-foreground hover:text-foreground size-5! rounded-b-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent" onClick={() => {
                if (!canZoomIn)
                    return;
                if (viewConfig.zoom === undefined)
                    anchorZoomCenter();
                setZoomValue(+(zoom + (zoomRange.step ?? 0.25)).toFixed(2));
            }}>
                      <AddIcon className="size-3" aria-hidden="true"/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {settings.i18n.labels.zoomIn}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-xs" aria-label={settings.i18n.labels.zoomOut} aria-disabled={!canZoomOut || undefined} className="text-muted-foreground hover:text-foreground size-5! rounded-t-none border-t aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent" onClick={() => {
                if (!canZoomOut)
                    return;
                if (viewConfig.zoom === undefined)
                    anchorZoomCenter();
                setZoomValue(+(zoom - (zoomRange.step ?? 0.25)).toFixed(2));
            }}>
                      <SubtractIcon className="size-3" aria-hidden="true"/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {settings.i18n.labels.zoomOut}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>)}
          {customScrollbars ? (<ScrollArea key={scale} className="h-full [&>[data-orientation=vertical]]:top-[65px]! [&>[data-orientation=vertical]]:bottom-4! [&>[data-orientation=vertical]]:h-auto! [&>[data-slot=scroll-area-viewport]>div]:flex! [&>[data-slot=scroll-area-viewport]>div]:min-h-full [&>[data-slot=scroll-area-viewport]>div]:flex-col">
              {timelineContent}
              {horizontalScrollbar}
            </ScrollArea>) : (<div data-slot="scroll-area-viewport" data-gantt-native-scroll="" className="h-full overflow-auto overscroll-contain">
              {timelineContent}
            </div>)}
          
          {customScrollbars && (<div aria-hidden data-slot="gantt-timeline-scrollbar-rail" className="bg-background border-t-border pointer-events-none absolute inset-x-0 bottom-0 h-4 border-t"/>)}
          {viewConfig.offscreenIndicators && (<GanttOffscreenChips paneRef={timelinePaneRef} occurrences={occurrences} locale={settings.locale} refreshKey={`${scale}:${rangeKey}:${zoom}:${rows.length}:${clampedTreeWidth}:${viewConfig.scrollbars}`}/>)}
        </div>
        {loading && (<div data-slot="gantt-loading" className="bg-background/60 absolute inset-0 z-50 flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse text-sm">
              {settings.i18n.labels.loading}
            </span>
          </div>)}
        {(viewConfig.renderDragPreview || viewConfig.renderResizeIndicator) && (<GanttCustomDragLayer />)}
      </div>
    </Comp>);
}
function GanttNowLine({ rangeStartMs, rangeEndMs, }: {
    rangeStartMs: number;
    rangeEndMs: number;
}) {
    const now = useNow();
    const ms = now.getTime();
    if (ms < rangeStartMs || ms >= rangeEndMs)
        return null;
    const fraction = (ms - rangeStartMs) / (rangeEndMs - rangeStartMs);
    return (<div data-slot="gantt-now-indicator" className="from-destructive/80 via-destructive/45 to-destructive/15 absolute inset-y-0 z-10 w-px bg-linear-to-b" style={{ insetInlineStart: `${fraction * 100}%` }}/>);
}
function GanttNowDot({ rangeStartMs, rangeEndMs, }: {
    rangeStartMs: number;
    rangeEndMs: number;
}) {
    const now = useNow();
    const ms = now.getTime();
    if (ms < rangeStartMs || ms >= rangeEndMs)
        return null;
    const fraction = (ms - rangeStartMs) / (rangeEndMs - rangeStartMs);
    return (<span aria-hidden data-slot="gantt-now-dot" className="bg-destructive absolute -bottom-0.75 z-10 size-1.5 -translate-x-1/2 rounded-full" style={{ insetInlineStart: `${fraction * 100}%` }}/>);
}
function GanttCustomDragLayer() {
    const viewConfig = useGanttViewConfig();
    const drag = useGanttSelector((state) => state.drag);
    if (!drag)
        return null;
    const render = drag.kind === "move"
        ? viewConfig.renderDragPreview
        : viewConfig.renderResizeIndicator;
    if (!render)
        return null;
    return (<div data-slot={drag.kind === "move" ? "gantt-drag-overlay" : "gantt-resize-indicator"} data-custom="" className="pointer-events-none fixed top-0 left-0 z-100 will-change-transform" style={{ visibility: "hidden" }}>
      {render({
            occurrence: drag.occurrence,
            kind: drag.kind,
            start: drag.proposedStart,
            end: drag.proposedEnd,
            valid: drag.valid,
            baseline: resolveEventBaseline(drag.occurrence.event),
        })}
    </div>);
}
const GanttDependencyLayer = memo(function GanttDependencyLayer({ edges, totalRem, trackRemWidth, rangeStartMs, rangeEndMs, laneHeightRem, laneGapRem, }: {
    edges: DependencyEdge[];
    totalRem: number;
    trackRemWidth: number;
    rangeStartMs: number;
    rangeEndMs: number;
    laneHeightRem: number;
    laneGapRem: number;
}) {
    const viewConfig = useGanttViewConfig();
    const dragLink = useGanttSelector<unknown, {
        eventId: string;
        startMs: number;
        endMs: number;
    } | null>((state) => state.drag
        ? {
            eventId: state.drag.occurrence.eventId,
            startMs: state.drag.proposedStart.getTime(),
            endMs: state.drag.proposedEnd.getTime(),
        }
        : null, {
        isEqual: (a, b) => a === b ||
            (a !== null &&
                b !== null &&
                a.eventId === b.eventId &&
                a.startMs === b.startMs &&
                a.endMs === b.endMs),
    });
    const totalMin = (rangeEndMs - rangeStartMs) / 60000;
    const liveX = (ms: number) => (Math.min(Math.max((ms - rangeStartMs) / 60000, 0), totalMin) / totalMin) *
        trackRemWidth;
    return (<svg aria-hidden data-slot="gantt-dependencies" className={cn("text-muted-foreground/70 pointer-events-none absolute start-0 top-0 w-full overflow-visible rtl:-scale-x-100", viewConfig.classNames?.dependencies)} style={{ height: `${totalRem}rem` }} viewBox={`0 0 ${trackRemWidth} ${totalRem}`} preserveAspectRatio="none">
      {edges.map((edge) => {
            const dragged = dragLink !== null &&
                (edge.fromId === dragLink.eventId || edge.toId === dragLink.eventId);
            const fromX = dragged && edge.fromId === dragLink.eventId
                ? liveX(dragLink.endMs)
                : edge.fromX;
            const toX = dragged && edge.toId === dragLink.eventId
                ? liveX(dragLink.startMs)
                : edge.toX;
            const geometry = buildDependencyPath({ x: fromX, y: edge.fromY }, { x: toX, y: edge.toY }, {
                clearance: 0.625,
                laneStep: laneHeightRem / 2 + laneGapRem,
                arrowSize: 0.375,
            });
            return (<g key={edge.key} data-slot="gantt-dependency" data-gantt-dependency="" data-tu={edge.fromId} data-den={edge.toId} data-dragging={dragged || undefined} className={dragged ? "opacity-50" : undefined}>
            <path d={geometry.line} fill="none" stroke="currentColor" strokeWidth={1.5} vectorEffect="non-scaling-stroke"/>
            <path d={geometry.arrow} fill="currentColor"/>
          </g>);
        })}
    </svg>);
});
const GanttTreeRow = memo(function GanttTreeRow({ row, heightRem, bandRem, columns, nameWidth, dimmed, selected, onSelectedChange, onGripPointerDown, onToggle, }: {
    row: TimelineRow;
    heightRem: number;
    bandRem: number;
    columns: GanttColumn[];
    nameWidth: number;
    dimmed: boolean;
    selected: boolean;
    onSelectedChange?: (id: string, checked: boolean) => void;
    onGripPointerDown?: (e: React.PointerEvent, row: TimelineRow) => void;
    onToggle: (row: TimelineRow) => void;
}) {
    const settings = useGanttSettings();
    const viewConfig = useGanttViewConfig();
    const ctx = {
        resource: row.resource,
        depth: row.depth,
        isGroup: row.isGroup,
        collapsed: row.collapsed,
    };
    const menu = viewConfig.renderResourceMenu?.(ctx);
    const alignStart = (viewConfig.rowAlign ?? DEFAULT_ROW_ALIGN) === "start";
    const rowNode = (<div data-slot="gantt-row-group" data-gantt-row-id={row.resource.id} data-gantt-cha={row.parentId ?? undefined} data-selected={selected || undefined} className={cn("group/gantt-row data-hover:bg-muted/40 data-selected:bg-primary/5 data-selected:data-hover:bg-primary/5 flex border-b", dimmed && "opacity-50")} style={{ height: `${heightRem}rem` }} onClick={settings.onResourceClick
            ? (e: React.MouseEvent) => {
                if ((e.target as HTMLElement).closest("button, [role=checkbox]"))
                    return;
                settings.onResourceClick?.(ctx, e);
            }
            : undefined} onDoubleClick={settings.onResourceDoubleClick
            ? (e: React.MouseEvent) => {
                if ((e.target as HTMLElement).closest("button, [role=checkbox]"))
                    return;
                settings.onResourceDoubleClick?.(ctx, e);
            }
            : undefined}>
      <div className="flex h-full w-full min-w-0">
        
        <div data-slot="gantt-tree-cell" className={cn("flex shrink-0 ps-3 pe-3", alignStart ? "items-start" : "items-center", row.isGroup && "font-medium")} style={{ width: nameWidth }}>
          
          <div className="flex w-full min-w-0 items-center" style={{ height: `${bandRem}rem` }}>
            {onGripPointerDown && (<button type="button" data-slot="gantt-row-grip" aria-label={settings.i18n.labels.reorder} className="text-muted-foreground/60 hover:text-foreground -ms-1.5 me-1.5 flex w-3.5 shrink-0 cursor-grab touch-none items-center justify-center opacity-0 group-hover/gantt-row:opacity-100 group-data-hover/gantt-row:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100" onPointerDown={(e) => onGripPointerDown(e, row)} onClick={(e) => e.stopPropagation()}>
                <DraggableIcon className="size-3" aria-hidden="true"/>
              </button>)}
            
            <span aria-hidden className="shrink-0" style={{ width: `${row.depth * 0.875}rem` }}/>
            
            <span className="me-1 flex w-5 shrink-0 items-center justify-start">
              {row.isGroup ? (<Button variant="ghost" size="icon-xs" aria-expanded={!row.collapsed} aria-label={row.resource.title} className={cn("size-5! aria-expanded:bg-transparent!", row.collapsed
                ? "text-foreground"
                : "text-muted-foreground aria-expanded:text-muted-foreground! hover:text-foreground!")} onClick={() => onToggle(row)}>
                  <ChevronRightIcon className={cn("size-3.5 transition-transform", !row.collapsed && "rotate-90")} aria-hidden="true"/>
                </Button>) : (viewConfig.rowCheckboxes &&
            onSelectedChange && (<Checkbox data-slot="gantt-row-checkbox" checked={selected} onCheckedChange={(checked: boolean) => onSelectedChange(row.resource.id, checked)} aria-label={row.resource.title} className={cn("size-3.5 opacity-0 transition-opacity group-hover/gantt-row:opacity-100 group-data-hover/gantt-row:opacity-100 focus-visible:opacity-100", selected && "opacity-100")}/>))}
            </span>
            {viewConfig.renderResourceLabel?.(ctx) ?? (<span className="truncate">{row.resource.title}</span>)}
          </div>
        </div>
        {columns.map((column) => (<div key={column.id} data-slot="gantt-tree-column-cell" data-column={column.id} className={cn("flex shrink-0 px-2", alignStart ? "items-start" : "items-center", column.className)} style={{ width: column.width ?? DEFAULT_COLUMN_WIDTH }}>
            <div className={cn("flex w-full min-w-0 items-center", column.align === "center" && "justify-center", column.align === "end" && "justify-end")} style={{ height: `${bandRem}rem` }}>
              {column.render?.(ctx)}
            </div>
          </div>))}
        <div className="min-w-0 flex-1"/>
      </div>
    </div>);
    if (!menu)
        return rowNode;
    return (<ContextMenu>
      <ContextMenuTrigger asChild>{rowNode}</ContextMenuTrigger>
      <ContextMenuContent data-slot="gantt-resource-menu" className="min-w-44">
        {menu}
      </ContextMenuContent>
    </ContextMenu>);
});
const GanttTimelineRow = memo(function GanttTimelineRow({ row, rowIndex, bars, rangeStartMs, rangeEndMs, trackWidth, trackRemWidth, rowBorder, selected, resolveHintStop, isPanning, laneHeightRem, laneGapRem, minRowRem, ghostHeightRem, dependencySourceIds, }: {
    row: TimelineRow;
    rowIndex: number;
    bars: TimelineRowBars | undefined;
    rangeStartMs: number;
    rangeEndMs: number;
    trackWidth: string;
    trackRemWidth: number;
    rowBorder: "solid" | "dashed" | null;
    selected: boolean;
    resolveHintStop: (fraction: number) => {
        index: number;
        center: number;
        ms: number;
        endMs: number;
    } | null;
    isPanning: boolean;
    laneHeightRem: number;
    laneGapRem: number;
    minRowRem: number;
    ghostHeightRem: number;
    dependencySourceIds: ReadonlySet<string>;
}) {
    const instance = useGantt();
    const settings = useGanttSettings();
    const viewConfig = useGanttViewConfig();
    const gestures = useGanttGestures();
    const segments = bars?.segments ?? [];
    const schedulable = !row.isGroup || viewConfig.parentScheduling;
    const heightRem = bars?.heightRem ?? minRowRem;
    const laneCount = bars?.laneCount ?? 1;
    const singleTrack = resolveScheduleMode(row.resource, viewConfig.scheduleMode) === "single";
    const laneOffsetRem = bars?.laneOffsetRem ?? (minRowRem - laneHeightRem) / 2;
    const [hintStop, setHintStop] = useState<{
        index: number;
        center: number;
        ms: number;
        endMs: number;
    } | null>(null);
    const hintSuppressed = useGanttSelector<unknown, boolean>((state) => hintStop !== null && (state.drag !== null || state.slotDraft !== null));
    const canSchedule = useGanttSelector<unknown, boolean>((state) => state.interactions.selectSlot);
    const hintFreeLane = hintStop
        ? lowestFreeLane(segments, hintStop.ms, hintStop.endMs)
        : 0;
    const hintLane = bars?.scheduleMode === "single" ? 0 : hintFreeLane;
    const hintTopRem = Math.min(laneTopRem(laneOffsetRem, hintLane, laneHeightRem, laneGapRem) +
        laneHeightRem / 2, Math.max(heightRem - laneHeightRem / 2, laneHeightRem / 2));
    const hintVisible = hintStop !== null &&
        hintFreeLane < laneCount &&
        !hintSuppressed &&
        !isPanning;
    const hintLabel = viewConfig.dragCreate
        ? settings.i18n.labels.scheduleHintDrag
        : settings.i18n.labels.scheduleHint;
    const showHint = viewConfig.displayScheduleHint &&
        schedulable &&
        canSchedule &&
        !isPanning &&
        !!(settings.onSelectSlot || settings.onSlotClick);
    const fractionOf = (ms: number) => Math.min(Math.max((ms - rangeStartMs) / (rangeEndMs - rangeStartMs), 0), 1);
    const dragTarget = useGanttSelector<unknown, "valid" | "invalid" | null>((state) => {
        const drag = state.drag;
        if (!drag || drag.proposedResourceId !== row.resource.id)
            return null;
        return drag.valid ? "valid" : "invalid";
    });
    const ghost = useGanttSelector<unknown, {
        from: number;
        to: number;
        color?: string;
        valid: boolean;
        title: string;
        kind: string;
        occurrenceKey: string;
        milestone: boolean;
    } | null>((state) => {
        const drag = state.drag;
        if (!drag || drag.proposedResourceId !== row.resource.id)
            return null;
        return {
            from: fractionOf(drag.proposedStart.getTime()),
            to: fractionOf(drag.proposedEnd.getTime()),
            color: drag.occurrence.event.color,
            valid: drag.valid,
            title: drag.occurrence.event.title,
            kind: drag.kind,
            occurrenceKey: drag.occurrence.key,
            milestone: drag.proposedEnd.getTime() === drag.proposedStart.getTime(),
        };
    }, {
        isEqual: (a, b) => a === b ||
            (a !== null &&
                b !== null &&
                a.from === b.from &&
                a.to === b.to &&
                a.valid === b.valid),
    });
    const draft = useGanttSelector<unknown, {
        from: number;
        to: number;
        startMs: number;
        endMs: number;
    } | null>((state) => {
        const slotDraft = state.slotDraft;
        if (!slotDraft || slotDraft.resourceId !== row.resource.id)
            return null;
        const startMs = slotDraft.start.getTime();
        const endMs = slotDraft.end.getTime();
        return {
            from: fractionOf(startMs),
            to: fractionOf(endMs),
            startMs,
            endMs,
        };
    }, {
        isEqual: (a, b) => a === b ||
            (a !== null &&
                b !== null &&
                a.startMs === b.startMs &&
                a.endMs === b.endMs &&
                a.from === b.from &&
                a.to === b.to),
    });
    const draftLane = bars?.draftLane ?? 0;
    const draftTopRem = Math.min(laneTopRem(laneOffsetRem, draftLane, laneHeightRem, laneGapRem), Math.max(heightRem - laneHeightRem, 0));
    const draftLabel = draft
        ? settings.i18n.functions.formatEventTime(toZoned(new Date(draft.startMs), settings.timeZone), toZoned(new Date(draft.endMs), settings.timeZone), false, settings.locale)
        : "";
    const createAt = (stop: {
        ms: number;
        endMs: number;
    }, e: React.MouseEvent) => {
        if (settings.onSlotClick) {
            settings.onSlotClick({ date: new Date(stop.ms), allDay: false, resourceId: row.resource.id }, e);
        }
        else {
            settings.onSelectSlot?.({
                start: new Date(stop.ms),
                end: new Date(Math.max(stop.endMs, stop.ms + 1)),
                allDay: false,
                resourceId: row.resource.id,
            });
        }
    };
    const ghostLane = ghost
        ? (segments.find((segment) => segment.occurrence.key === ghost.occurrenceKey)?.column ?? 0)
        : 0;
    const ghostLaneOffsetRem = laneTopRem(laneOffsetRem, ghostLane, laneHeightRem, laneGapRem) +
        (laneHeightRem - ghostHeightRem) / 2;
    return (<div data-gantt-row="" data-gantt-resource={row.resource.id} data-gantt-row-id={row.resource.id} data-gantt-row-static={!schedulable || undefined} data-gantt-bar-min={bars?.extent?.from} data-gantt-bar-max={bars?.extent?.to} data-gantt-bar-color={bars?.extent?.color} data-gantt-bar-label={bars?.extent?.label} data-gantt-bar-start-ms={bars?.extent?.startMs} data-drop-target={dragTarget ?? undefined} data-selected={selected || undefined} className={cn("data-hover:bg-muted/30 data-selected:bg-primary/5 data-selected:data-hover:bg-primary/5 relative w-full min-w-0", hintVisible && "cursor-crosshair", rowBorder !== null && "border-b", rowBorder === "dashed" && "border-dashed", dragTarget === "valid" && "bg-muted/40", dragTarget === "invalid" && "bg-destructive/10")} style={{
            height: `${heightRem}rem`,
            minWidth: trackWidth,
        }} onPointerDown={(e) => {
            if (viewConfig.dragCreate &&
                e.button === 0 &&
                schedulable &&
                canSchedule &&
                (e.target === e.currentTarget ||
                    !!(e.target as HTMLElement).closest?.("[data-slot=gantt-schedule-hint]")) &&
                !!settings.onSelectSlot) {
                const stop = resolveHintStop(trackFraction(e.currentTarget, e.clientX));
                const allowed = stop !== null &&
                    (settings.canSelectSlot?.({
                        start: new Date(stop.ms),
                        end: new Date(Math.max(stop.endMs, stop.ms + 1)),
                        allDay: false,
                        resourceId: row.resource.id,
                    }) ??
                        true);
                if (!allowed)
                    return;
                e.stopPropagation();
                gestures.beginCreate(e);
            }
        }} onPointerMove={(e) => {
            const interacting = instance.getState().drag !== null ||
                instance.getState().slotDraft !== null;
            if (!showHint || e.pointerType !== "mouse" || interacting) {
                if (hintStop)
                    setHintStop(null);
                return;
            }
            if (e.target !== e.currentTarget) {
                if (hintStop)
                    setHintStop(null);
                return;
            }
            const { fraction, offset } = trackPoint(e.currentTarget, e.clientX);
            e.currentTarget.style.setProperty("--gantt-hint-x", `${offset}px`);
            const stop = resolveHintStop(fraction);
            const allowed = stop !== null &&
                (settings.canSelectSlot?.({
                    start: new Date(stop.ms),
                    end: new Date(Math.max(stop.endMs, stop.ms + 1)),
                    allDay: false,
                    resourceId: row.resource.id,
                }) ??
                    true);
            const next = allowed ? stop : null;
            if (next?.index !== hintStop?.index)
                setHintStop(next);
        }} onPointerLeave={() => {
            if (hintStop)
                setHintStop(null);
        }} onClick={(e) => {
            if (!viewConfig.dragCreate || e.target !== e.currentTarget)
                return;
            if (!schedulable || !canSchedule)
                return;
            if (wasRecentDrag())
                return;
            if (!settings.onSlotClick && !settings.onSelectSlot)
                return;
            const stop = resolveHintStop(trackFraction(e.currentTarget, e.clientX));
            if (!stop)
                return;
            const allowed = settings.canSelectSlot?.({
                start: new Date(stop.ms),
                end: new Date(Math.max(stop.endMs, stop.ms + 1)),
                allDay: false,
                resourceId: row.resource.id,
            }) ?? true;
            if (!allowed)
                return;
            createAt(stop, e);
            setHintStop(null);
        }}>
      
      
      <div className="pointer-events-none absolute inset-0" style={{ contentVisibility: "auto" }}>
        
        {bars?.rowBaseline &&
            (() => {
                const plan = bars.rowBaseline;
                const from = fractionOf(rangeStartMs + plan.startMin * 60000);
                const to = fractionOf(rangeStartMs + plan.endMin * 60000);
                const bandRemHeight = laneBlockRem(laneCount, laneHeightRem, laneGapRem);
                const content = viewConfig.renderRowBaseline?.({
                    resource: row.resource,
                    start: plan.baseline.start,
                    end: plan.baseline.end,
                    milestone: plan.baseline.milestone,
                    variance: plan.variance,
                });
                return (<div data-slot="gantt-row-baseline" data-milestone={plan.baseline.milestone || undefined} data-variance={plan.variance ?? undefined} aria-hidden className={cn("absolute", plan.baseline.milestone
                        ? "flex items-center justify-center"
                        : "px-px", viewConfig.classNames?.baseline)} style={{
                        "--gantt-event-color": row.resource.color ?? "var(--color-primary)",
                        insetInlineStart: plan.baseline.milestone
                            ? `clamp(0rem, ${from * 100}% - ${laneHeightRem / 2}rem, 100% - ${laneHeightRem}rem)`
                            : `${from * 100}%`,
                        width: plan.baseline.milestone
                            ? `${laneHeightRem}rem`
                            : `${Math.max((to - from) * 100, 0.5)}%`,
                        top: `${laneOffsetRem}rem`,
                        height: `${bandRemHeight}rem`,
                    } as CSSProperties}>
                {content ??
                        (plan.baseline.milestone ? (<span className="size-2.5 rotate-45 rounded-[2px] border border-(--gantt-event-color)/60 bg-(--gantt-event-color)/15"/>) : (<span className="relative block h-full w-full rounded-sm border border-(--gantt-event-color)/25 bg-(--gantt-event-color)/6"/>))}
              </div>);
            })()}
        
        {bars?.baselines.map((plan) => {
            const from = fractionOf(rangeStartMs + plan.startMin * 60000);
            const to = fractionOf(rangeStartMs + plan.endMin * 60000);
            const content = viewConfig.renderBaseline?.({
                event: plan.event,
                start: plan.baseline.start,
                end: plan.baseline.end,
                milestone: plan.baseline.milestone,
                variance: plan.variance,
            });
            return (<div key={`baseline-${plan.event.id}`} data-slot="gantt-baseline" data-milestone={plan.baseline.milestone || undefined} data-variance={plan.variance} aria-hidden className={cn("absolute", plan.baseline.milestone
                    ? "flex items-center justify-center"
                    : "px-px", viewConfig.classNames?.baseline)} style={{
                    "--gantt-event-color": plan.event.color ?? "var(--color-primary)",
                    insetInlineStart: plan.baseline.milestone
                        ? `clamp(0rem, ${from * 100}% - ${laneHeightRem / 2}rem, 100% - ${laneHeightRem}rem)`
                        : `${from * 100}%`,
                    width: plan.baseline.milestone
                        ? `${laneHeightRem}rem`
                        : `${Math.max((to - from) * 100, 0.5)}%`,
                    top: `${laneTopRem(laneOffsetRem, plan.lane, laneHeightRem, laneGapRem)}rem`,
                    height: `${laneHeightRem}rem`,
                } as CSSProperties}>
              {content ??
                    (plan.baseline.milestone ? (<span className="size-2 rotate-45 rounded-[2px] border border-(--gantt-event-color)/60 bg-(--gantt-event-color)/15"/>) : (<span className="relative block h-full w-full rounded-sm border border-(--gantt-event-color)/40 bg-(--gantt-event-color)/10"/>))}
            </div>);
        })}
        {segments.map((segment, segmentIndex) => {
            const from = fractionOf(rangeStartMs + (segment.startMin ?? 0) * 60000);
            const to = fractionOf(rangeStartMs + (segment.endMin ?? 0) * 60000);
            const milestone = segment.occurrence.end.getTime() ===
                segment.occurrence.start.getTime();
            if (to <= from && !milestone)
                return null;
            const lane = segment.column ?? 0;
            const barRemWidth = milestone
                ? laneHeightRem
                : (to - from) * trackRemWidth;
            const wantsOutside = milestone ||
                viewConfig.barLabel === "outside" ||
                (viewConfig.barLabel === "auto" &&
                    barRemWidth <
                        (viewConfig.metrics?.autoLabelMin ?? AUTO_LABEL_MIN_REM));
            const placement = !wantsOutside
                ? "inside"
                : to <= 0.92
                    ? "after"
                    : from >= 0.08
                        ? "before"
                        : "inside";
            const segDragKind = ghost && ghost.occurrenceKey === segment.occurrence.key
                ? ghost.kind
                : undefined;
            return (<div key={segment.occurrence.key} data-drag-kind={segDragKind} data-milestone={milestone || undefined} data-lane={lane} data-lane-count={laneCount} className="group/gantt-seg pointer-events-auto absolute px-px data-[drag-kind=move]:opacity-0" style={{
                    insetInlineStart: milestone
                        ? `clamp(0rem, ${from * 100}% - ${laneHeightRem / 2}rem, 100% - ${laneHeightRem}rem)`
                        : `${from * 100}%`,
                    width: milestone
                        ? `${laneHeightRem}rem`
                        : `${Math.max((to - from) * 100, 0.5)}%`,
                    top: `${laneTopRem(laneOffsetRem, lane, laneHeightRem, laneGapRem)}rem`,
                    height: `${laneHeightRem}rem`,
                    zIndex: segment.occurrence.event.zIndex ??
                        10 + (singleTrack ? segmentIndex : lane),
                }}>
              <GanttBar segment={segment} labelOutside={placement !== "inside"} rowTitle={row.resource.title} className="h-full"/>
              {placement !== "inside" && (<span data-slot="gantt-bar-label" data-placement={placement} className={cn("text-foreground pointer-events-none absolute top-1/2 z-10 max-w-60 -translate-y-1/2 truncate font-medium", "group-data-[drag-kind^=resize]/gantt-seg:opacity-0", placement === "after"
                        ? dependencySourceIds.has(segment.occurrence.eventId)
                            ? "start-full ms-4"
                            : "start-full ms-2"
                        : "end-full me-2")}>
                  {segment.occurrence.event.title}
                </span>)}
            </div>);
        })}
        {bars?.summary && segments.length === 0 && (<div data-slot="gantt-summary" aria-hidden className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{
                insetInlineStart: `${bars.summary.from * 100}%`,
                width: `${Math.max((bars.summary.to - bars.summary.from) * 100, 0.5)}%`,
            }}>
            {viewConfig.renderSummary ? (viewConfig.renderSummary({
                resource: row.resource,
                start: new Date(rangeStartMs + bars.summary.from * (rangeEndMs - rangeStartMs)),
                end: new Date(rangeStartMs + bars.summary.to * (rangeEndMs - rangeStartMs)),
                progress: bars.summary.progress,
            })) : (<>
                
                <span aria-hidden className="bg-muted-foreground/50 absolute start-0 top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full"/>
                <span aria-hidden className="bg-muted-foreground/50 absolute end-0 top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full"/>
                <div className="bg-muted-foreground/20 relative h-1.5 overflow-hidden rounded-full">
                  {bars.summary.progress !== null && (<div data-slot="gantt-summary-progress" className="bg-muted-foreground/50 absolute inset-y-0 start-0 rounded-full" style={{ width: `${bars.summary.progress}%` }}/>)}
                </div>
                {bars.summary.progress !== null && (<span className="text-muted-foreground absolute start-full top-1/2 ms-2 -translate-y-1/2 whitespace-nowrap">
                    {bars.summary.progress}%
                  </span>)}
              </>)}
          </div>)}
        {ghost && (<div data-slot="gantt-drag-ghost" data-kind={ghost.kind} data-milestone={ghost.milestone || undefined} data-drop-invalid={!ghost.valid || undefined} className={cn("pointer-events-none absolute z-40 h-(--gantt-ghost-height) rounded-sm border border-dashed font-medium", !ghost.valid &&
                "border-destructive bg-destructive/10 text-destructive", ghost.valid &&
                ghost.kind === "move" &&
                "border-(--gantt-event-color)/50 bg-(--gantt-event-color)/8", ghost.valid &&
                ghost.kind !== "move" &&
                "text-foreground border-(--gantt-event-color)/70 bg-(--gantt-event-color)/22", ghost.milestone &&
                "flex items-center justify-center rounded-none border-0 bg-transparent")} style={{
                insetInlineStart: ghost.milestone
                    ? `clamp(0rem, ${ghost.from * 100}% - ${laneHeightRem / 2}rem, 100% - ${laneHeightRem}rem)`
                    : `${ghost.from * 100}%`,
                width: ghost.milestone
                    ? `${laneHeightRem}rem`
                    : `${Math.max((ghost.to - ghost.from) * 100, 0.5)}%`,
                top: `${ghostLaneOffsetRem}rem`,
                "--gantt-ghost-height": `${ghostHeightRem}rem`,
                "--gantt-event-color": ghost.color ?? "var(--color-primary)",
            } as CSSProperties}>
            {ghost.milestone && (<span className={cn("size-2.5 rotate-45 rounded-[2px] border border-dashed", ghost.valid
                    ? "border-(--gantt-event-color)/70 bg-(--gantt-event-color)/10"
                    : "border-destructive bg-destructive/10")}/>)}
            {ghost.kind !== "move" && (<span className="pointer-events-none absolute start-full top-1/2 ms-2 max-w-60 -translate-y-1/2 truncate whitespace-nowrap">
                {ghost.title}
              </span>)}
          </div>)}
        {draft && (<div data-slot="gantt-slot-draft" data-lane={draftLane} className="border-primary bg-background pointer-events-none absolute z-40 overflow-hidden rounded-sm border border-dashed" style={{
                insetInlineStart: `${draft.from * 100}%`,
                width: `${Math.max((draft.to - draft.from) * 100, 0.5)}%`,
                top: `${draftTopRem}rem`,
                height: `${laneHeightRem}rem`,
            }}>
            
            <span aria-hidden className="bg-primary/15 absolute inset-0"/>
          </div>)}
      </div>
      
      {draft && draftLabel && (<div data-slot="gantt-slot-draft-label" className="pointer-events-none absolute z-40" style={{
                insetInlineStart: `${draft.to * 100}%`,
                top: `${draftTopRem}rem`,
                height: `${laneHeightRem}rem`,
            }}>
          <span className="bg-foreground text-background absolute start-full top-1/2 ms-2 inline-flex w-max -translate-y-1/2 items-center rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap">
            {draftLabel}
            
            <span aria-hidden className="bg-foreground absolute start-0 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1px]"/>
          </span>
        </div>)}
      
      
      {hintVisible && hintStop && (<div data-slot="gantt-schedule-hint" className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2" style={{
                insetInlineStart: "var(--gantt-hint-x, 50%)",
                top: `${hintTopRem}rem`,
            }}>
          {viewConfig.renderScheduleHint ? (viewConfig.renderScheduleHint({
                start: new Date(hintStop.ms),
                end: new Date(Math.max(hintStop.endMs, hintStop.ms + 1)),
                resource: row.resource,
            })) : (<>
              
              
              <button type="button" data-slot="gantt-schedule-hint-tile" aria-label={hintLabel} className="border-primary ring-background/80 pointer-events-none block size-5 rounded-full border-2 bg-transparent ring-1" onPointerDown={(e) => {
                    if (!viewConfig.dragCreate)
                        e.stopPropagation();
                }} onClick={(e) => {
                    e.stopPropagation();
                    if (wasRecentDrag())
                        return;
                    createAt(hintStop, e);
                    setHintStop(null);
                }}/>
              <span data-slot="gantt-schedule-hint-bubble" className={cn("bg-foreground text-background absolute start-1/2 inline-flex w-max -translate-x-1/2 items-center rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap", rowIndex === 0 ? "top-full mt-2" : "bottom-full mb-2")}>
                {hintLabel}
                <span aria-hidden className={cn("bg-foreground absolute start-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px]", rowIndex === 0 ? "-top-1" : "-bottom-1")}/>
              </span>
            </>)}
        </div>)}
    </div>);
});
interface OffscreenChip {
    id: string;
    side: "start" | "end";
    top: number;
    color?: string;
    label: string;
    startMs: number | null;
    target: number;
}
function sameChips(a: OffscreenChip[], b: OffscreenChip[]): boolean {
    return (a.length === b.length &&
        a.every((chip, i) => chip.id === b[i]?.id &&
            chip.side === b[i]?.side &&
            chip.top === b[i]?.top &&
            chip.target === b[i]?.target));
}
function GanttOffscreenChips({ paneRef, occurrences, locale, refreshKey, }: {
    paneRef: RefObject<HTMLDivElement | null>;
    occurrences: GanttOccurrence[];
    locale?: Locale;
    refreshKey: string;
}) {
    const settings = useGanttSettings();
    const [chips, setChips] = useState<OffscreenChip[]>([]);
    useEffect(() => {
        const pane = paneRef.current;
        const viewport = getPaneViewport(pane);
        if (!pane || !viewport)
            return;
        let raf = 0;
        const measure = () => {
            raf = 0;
            const paneRect = pane.getBoundingClientRect();
            const header = viewport.querySelector<HTMLElement>("[data-slot=gantt-timeline-header]");
            const headerBottom = header
                ? header.getBoundingClientRect().bottom - paneRect.top
                : 0;
            const trackW = viewport.scrollWidth;
            const visibleStart = getScrollStart(viewport);
            const visibleEnd = visibleStart + viewport.clientWidth;
            const zoomEl = pane.querySelector<HTMLElement>("[data-slot=gantt-zoom]");
            const zoom = zoomEl
                ? {
                    top: zoomEl.getBoundingClientRect().top - paneRect.top - 8,
                    bottom: zoomEl.getBoundingClientRect().bottom - paneRect.top + 8,
                }
                : null;
            let chipInZoomBand = false;
            const next: OffscreenChip[] = [];
            for (const rowEl of viewport.querySelectorAll<HTMLElement>("[data-gantt-row]")) {
                const from = parseFloat(rowEl.dataset.ganttBarMin ?? "");
                const to = parseFloat(rowEl.dataset.ganttBarMax ?? "");
                if (Number.isNaN(from) || Number.isNaN(to))
                    continue;
                const rect = rowEl.getBoundingClientRect();
                const top = rect.top - paneRect.top + rect.height / 2;
                if (top < headerBottom + 10 || top > paneRect.height - 16)
                    continue;
                const startPx = from * trackW;
                const endPx = to * trackW;
                const startMs = parseFloat(rowEl.dataset.ganttBarStartMs ?? "");
                const base = {
                    id: rowEl.dataset.ganttRowId ?? "",
                    top: Math.round(top),
                    color: rowEl.dataset.ganttBarColor,
                    label: rowEl.dataset.ganttBarLabel ?? "",
                    startMs: Number.isNaN(startMs) ? null : startMs,
                };
                if (endPx <= visibleStart + 2) {
                    next.push({
                        ...base,
                        side: "start",
                        target: startPx - 24,
                    });
                }
                else if (startPx >= visibleEnd - 2) {
                    if (zoom && top >= zoom.top && top <= zoom.bottom) {
                        chipInZoomBand = true;
                    }
                    next.push({
                        ...base,
                        side: "end",
                        target: endPx - viewport.clientWidth + 24,
                    });
                }
            }
            zoomEl?.style.setProperty("--gantt-zoom-shift", chipInZoomBand ? "28px" : "0px");
            setChips((prev) => (sameChips(prev, next) ? prev : next));
        };
        const schedule = () => {
            if (!raf)
                raf = requestAnimationFrame(measure);
        };
        viewport.addEventListener("scroll", schedule);
        const observer = new ResizeObserver(schedule);
        observer.observe(viewport);
        schedule();
        return () => {
            viewport.removeEventListener("scroll", schedule);
            observer.disconnect();
            if (raf)
                cancelAnimationFrame(raf);
            pane
                .querySelector<HTMLElement>("[data-slot=gantt-zoom]")
                ?.style.removeProperty("--gantt-zoom-shift");
        };
    }, [paneRef, occurrences, refreshKey]);
    if (chips.length === 0)
        return null;
    const scrollTo = (chip: OffscreenChip) => {
        const viewport = getPaneViewport(paneRef.current);
        if (!viewport)
            return;
        const target = Math.max(0, chip.target);
        viewport.scrollTo({
            left: getComputedStyle(viewport).direction === "rtl" ? -target : target,
            behavior: "smooth",
        });
        const bar = viewport.querySelector<HTMLElement>(`[data-gantt-row-id="${CSS.escape(chip.id)}"] [data-slot=gantt-bar]`);
        bar?.focus({ preventScroll: true });
    };
    return (<div data-slot="gantt-offscreen-chips" className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <TooltipProvider delayDuration={600} skipDelayDuration={300}>
        {chips.map((chip) => (<Tooltip key={`${chip.id}-${chip.side}`}>
            <TooltipTrigger asChild>
              <button type="button" data-slot="gantt-offscreen-chip" data-side={chip.side} aria-label={settings.i18n.labels.jumpToBar(chip.label)} className="bg-background text-muted-foreground hover:text-foreground pointer-events-auto absolute flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-xs" style={{
                top: chip.top,
                ...(chip.side === "start"
                    ? { insetInlineStart: "0.5rem" }
                    : { insetInlineEnd: "0.875rem" }),
            }} onClick={() => scrollTo(chip)}>
                {chip.side === "start" ? (<ChevronLeftIcon className="size-3" aria-hidden="true"/>) : (<ChevronRightIcon className="size-3" aria-hidden="true"/>)}
                <span aria-hidden className="ring-background absolute -end-px -top-px size-1.5 rounded-full ring-1" style={{ background: chip.color ?? "var(--color-primary)" }}/>
              </button>
            </TooltipTrigger>
            <TooltipContent side={chip.side === "start" ? "right" : "left"}>
              <div className="font-medium">{chip.label}</div>
              {chip.startMs !== null && (<div className="opacity-80">
                  
                  {format(toZoned(new Date(chip.startMs), settings.timeZone), "MMM d, yyyy", { locale })}
                </div>)}
            </TooltipContent>
          </Tooltip>))}
      </TooltipProvider>
    </div>);
}
export { GanttView };
export type { GanttViewProps };
