"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type HTMLAttributes, type ReactNode, type RefObject, } from "react";
import { mergeGanttI18n, type GanttI18nConfig, type GanttI18nOverrides, } from "@crm/ui/components/reui/gantt/gantt-i18n";
import { buildEventIndex, defaultEventOrder, eventsOverlap, findResource, getGanttDateRange, getRangeKey, stepGanttDate, toZoned, type GanttIndex, type WeekStartsOn, } from "@crm/ui/components/reui/gantt/gantt-lib";
import type { GanttBarId, GanttBaseline, GanttBaselineVariance, GanttDateRange, GanttDragState, GanttEvent, GanttInteractions, GanttOccurrence, GanttOffDaysConfig, GanttOverlapPolicy, GanttProposedUpdate, GanttRangeInfo, GanttResource, GanttResourceReorder, GanttRowAlign, GanttScale, GanttScheduleMode, GanttSegment, GanttSelection, GanttSlotDraft, GanttSlotInfo, GanttState, GanttUpdateResult, } from "@crm/ui/components/reui/gantt/gantt-types";
import type { Locale } from "date-fns";
import { Slot } from "radix-ui";
import { cn } from "@crm/ui/lib/utils";
const DEFAULT_INTERACTIONS: GanttInteractions = {
    drag: true,
    resize: true,
    selectSlot: true,
};
const MAX_RANGE_WINDOW = 12;
const DEFAULT_SCHEDULE_MODE: GanttScheduleMode = "multiple";
const DEFAULT_ROW_ALIGN: GanttRowAlign = "start";
function resolveScheduleMode(node: GanttResource | null | undefined, scheduleMode: GanttScheduleMode | undefined): GanttScheduleMode {
    return node?.scheduleMode ?? scheduleMode ?? DEFAULT_SCHEDULE_MODE;
}
const EMPTY_SELECTION: GanttSelection = { eventKeys: [], slot: null };
interface GanttCallbacks<TData = unknown> {
    onEventClick?: (occurrence: GanttOccurrence<TData>, e: React.MouseEvent) => void;
    onEventDoubleClick?: (occurrence: GanttOccurrence<TData>, e: React.MouseEvent) => void;
    onEventUpdate?: (update: GanttProposedUpdate<TData>) => GanttUpdateResult;
    canDropEvent?: (update: GanttProposedUpdate<TData>) => boolean;
    onSlotClick?: (slot: GanttSlotInfo, e: React.MouseEvent) => void;
    onSelectSlot?: (slot: GanttSlotDraft) => void;
    canSelectSlot?: (slot: GanttSlotDraft) => boolean;
    onCreateTask?: (ctx: {
        parentId: string | null;
        index: number;
    }) => void;
    canCreateTask?: (ctx: {
        parentId: string | null;
    }) => boolean;
    onResourceClick?: (ctx: GanttColumnContext, e: React.MouseEvent) => void;
    onResourceDoubleClick?: (ctx: GanttColumnContext, e: React.MouseEvent) => void;
    onRangeChange?: (info: GanttRangeInfo) => void;
    onScaleChange?: (scale: GanttScale) => void;
    onDateChange?: (date: Date) => void;
    onSelectionChange?: (selection: GanttSelection) => void;
    onInteractionsChange?: (interactions: GanttInteractions) => void;
    onEventsChange?: (events: GanttEvent<TData>[]) => void;
    onResourceReorder?: (proposal: GanttResourceReorder) => void | false;
    canReorderResource?: (proposal: GanttResourceReorder) => boolean;
    onResourceReorderReject?: (proposal: GanttResourceReorder) => void;
}
interface UseGanttStateOptions<TData = unknown> extends GanttCallbacks<TData> {
    events?: GanttEvent<TData>[];
    defaultEvents?: GanttEvent<TData>[];
    scale?: GanttScale;
    defaultScale?: GanttScale;
    date?: Date;
    defaultDate?: Date;
    selection?: GanttSelection;
    defaultSelection?: GanttSelection;
    interactions?: Partial<GanttInteractions>;
    defaultInteractions?: Partial<GanttInteractions>;
    loading?: boolean;
    timeZone?: string;
    locale?: Locale;
    weekStartsOn?: WeekStartsOn;
    slotDuration?: number;
    snapDuration?: number;
    i18n?: GanttI18nOverrides;
    rangeBounds?: {
        min?: Date;
        max?: Date;
    };
    activation?: GanttActivationConfig;
    maxRangeWindow?: number;
    resources?: GanttResource[];
    overlap?: GanttOverlapPolicy;
    enforceCanDrop?: boolean;
    getEventPriority?: (event: GanttEvent<TData>) => number;
    eventOrder?: (a: GanttOccurrence<TData>, b: GanttOccurrence<TData>) => number;
    getOccurrences?: (event: GanttEvent<TData>, range: GanttDateRange, ctx: {
        timeZone: string;
    }) => Array<{
        start: Date;
        end: Date;
    }> | null;
}
interface GanttSettings<TData = unknown> extends GanttCallbacks<TData> {
    timeZone: string;
    locale?: Locale;
    weekStartsOn: WeekStartsOn;
    slotDuration: number;
    snapDuration: number;
    i18n: GanttI18nConfig;
    rangeBounds?: {
        min?: Date;
        max?: Date;
    };
    activation?: GanttActivationConfig;
    maxRangeWindow?: number;
    resources: GanttResource[];
    overlap: GanttOverlapPolicy;
    enforceCanDrop?: boolean;
    getEventPriority: (event: GanttEvent<TData>) => number;
    eventOrder: (a: GanttOccurrence<TData>, b: GanttOccurrence<TData>) => number;
    getOccurrences?: (event: GanttEvent<TData>, range: GanttDateRange, ctx: {
        timeZone: string;
    }) => Array<{
        start: Date;
        end: Date;
    }> | null;
}
interface GanttApi<TData = unknown> {
    next(): void;
    prev(): void;
    today(): void;
    goTo(date: Date): void;
    setScale(scale: GanttScale): void;
    getEvents(): GanttEvent<TData>[];
    getEvent(id: GanttBarId): GanttEvent<TData> | undefined;
    setEvents(events: GanttEvent<TData>[]): void;
    addEvent(event: GanttEvent<TData>): void;
    updateEvent(id: GanttBarId, patch: Partial<GanttEvent<TData>>): void;
    removeEvent(id: GanttBarId): void;
    getOccurrences(range?: GanttDateRange): GanttOccurrence<TData>[];
    findOverlapping(candidate: {
        start: Date;
        end: Date;
        excludeEventId?: string;
    }): GanttOccurrence<TData>[];
    select(selection: Partial<GanttSelection>): void;
    selectEvent(key: string, opts?: {
        additive?: boolean;
    }): void;
    clearSelection(): void;
    setInteractions(patch: Partial<GanttInteractions>): void;
    getVisibleRange(): GanttDateRange;
    getActiveRange(): GanttDateRange;
    toZoned(date: Date): Date;
}
interface GanttInternals<TData = unknown> {
    getIndex(): GanttIndex<TData>;
    setDrag(drag: GanttDragState<TData> | null): void;
    setSlotDraft(draft: GanttSlotDraft | null): void;
    applyProposedUpdate(update: GanttProposedUpdate<TData>): boolean;
    getSettingsVersion(): number;
    extendRange(direction: "before" | "after"): boolean;
    didAnchorSlide(): boolean;
    setViewportCenter(date: Date | null): void;
}
interface GanttInstance<TData = unknown> {
    getState(): GanttState<TData>;
    subscribe(listener: () => void): () => void;
    api: GanttApi<TData>;
    settings: GanttSettings<TData>;
    internals: GanttInternals<TData>;
}
function resolveSettings<TData>(options: UseGanttStateOptions<TData>): GanttSettings<TData> {
    const { events: _e, defaultEvents: _de, scale: _v, defaultScale: _dv, date: _d, defaultDate: _dd, selection: _s, defaultSelection: _ds, interactions: _i, defaultInteractions: _di, loading: _l, ...rest } = options;
    const getEventPriority = options.getEventPriority ??
        ((event: GanttEvent<TData>) => event.priority ?? 0);
    return {
        ...rest,
        timeZone: options.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: options.locale,
        weekStartsOn: options.weekStartsOn ?? options.locale?.options?.weekStartsOn ?? 0,
        slotDuration: options.slotDuration ?? 30,
        snapDuration: options.snapDuration ?? 15,
        i18n: mergeGanttI18n(options.i18n),
        rangeBounds: options.rangeBounds,
        resources: options.resources ?? [],
        overlap: options.overlap ?? "allow",
        getEventPriority,
        eventOrder: options.eventOrder ??
            ((a, b) => getEventPriority(b.event) - getEventPriority(a.event) ||
                defaultEventOrder(a, b)),
        getOccurrences: options.getOccurrences,
    };
}
const warned = new Set<string>();
function warnOnce(key: string, message: string) {
    if (process.env.NODE_ENV !== "production" && !warned.has(key)) {
        warned.add(key);
        console.warn(`[gantt] ${message}`);
    }
}
interface GanttStore<TData> {
    instance: GanttInstance<TData>;
    setOptions(next: UseGanttStateOptions<TData>): boolean;
    notify(): void;
    emitRangeIfChanged(): void;
}
function createGanttStore<TData>(initial: UseGanttStateOptions<TData>): GanttStore<TData> {
    let options = initial;
    let settings = resolveSettings(initial);
    let settingsVersion = 0;
    const listeners = new Set<() => void>();
    const internal = {
        scale: initial.defaultScale ?? "day",
        date: initial.defaultDate ?? new Date(),
        events: initial.defaultEvents ?? [],
        selection: initial.defaultSelection ?? EMPTY_SELECTION,
        interactions: { ...DEFAULT_INTERACTIONS, ...initial.defaultInteractions },
        drag: null as GanttDragState<TData> | null,
        slotDraft: null as GanttSlotDraft | null,
        rangeWindow: { before: 0, after: 0 },
        viewportCenter: null as Date | null,
    };
    let snapshot: GanttState<TData> | null = null;
    let indexCache: {
        events: GanttEvent<TData>[];
        rangeKey: string;
        timeZone: string;
        index: GanttIndex<TData>;
    } | null = null;
    let lastEmittedRangeKey: string | null = null;
    let lastAnchorChangeWasSlide = false;
    const invalidate = () => {
        snapshot = null;
    };
    const notify = () => {
        listeners.forEach((listener) => listener());
        emitRangeIfChanged();
    };
    const getState = (): GanttState<TData> => {
        if (snapshot)
            return snapshot;
        const scale = options.scale ?? internal.scale;
        const date = options.date ?? internal.date;
        const rangeOpts = {
            timeZone: settings.timeZone,
            weekStartsOn: settings.weekStartsOn,
        };
        const { visibleRange: baseRange, activeRange } = getGanttDateRange(scale, date, rangeOpts);
        const { before, after } = internal.rangeWindow;
        let visibleRange = baseRange;
        if (before > 0 || after > 0) {
            let earlier = date;
            for (let i = 0; i < before; i++) {
                earlier = stepGanttDate(scale, earlier, -1, rangeOpts);
            }
            let later = date;
            for (let i = 0; i < after; i++) {
                later = stepGanttDate(scale, later, 1, rangeOpts);
            }
            visibleRange = {
                start: getGanttDateRange(scale, earlier, rangeOpts).visibleRange.start,
                end: getGanttDateRange(scale, later, rangeOpts).visibleRange.end,
            };
        }
        snapshot = {
            scale,
            date,
            visibleRange,
            activeRange,
            events: options.events ?? internal.events,
            selection: options.selection ?? internal.selection,
            interactions: options.interactions
                ? { ...DEFAULT_INTERACTIONS, ...options.interactions }
                : internal.interactions,
            loading: options.loading ?? false,
            drag: internal.drag,
            slotDraft: internal.slotDraft,
            viewportCenter: internal.viewportCenter,
        };
        return snapshot;
    };
    const emitRangeIfChanged = () => {
        if (!settings.onRangeChange)
            return;
        const state = getState();
        const key = `${state.scale}:${getRangeKey(state.visibleRange)}:${settings.timeZone}`;
        if (key === lastEmittedRangeKey)
            return;
        lastEmittedRangeKey = key;
        settings.onRangeChange({
            range: state.visibleRange,
            activeRange: state.activeRange,
            scale: state.scale,
            date: state.date,
            timeZone: settings.timeZone,
        });
    };
    type ControlledKey = "scale" | "date" | "events" | "selection" | "interactions";
    const setField = <K extends ControlledKey>(key: K, value: GanttState<TData>[K extends "events" ? "events" : K]) => {
        const controlled = options[key] !== undefined;
        if (key === "date" || key === "scale") {
            const current = getState()[key];
            const same = key === "date"
                ? (current as Date).getTime() === (value as Date).getTime()
                : current === value;
            if (same)
                return;
            internal.rangeWindow = { before: 0, after: 0 };
            internal.viewportCenter = null;
            lastAnchorChangeWasSlide = false;
            invalidate();
        }
        if (!controlled) {
            ;
            (internal as any)[key] = value;
            invalidate();
        }
        const callbacks: Record<ControlledKey, ((v: never) => void) | undefined> = {
            scale: settings.onScaleChange as never,
            date: settings.onDateChange as never,
            events: settings.onEventsChange as never,
            selection: settings.onSelectionChange as never,
            interactions: settings.onInteractionsChange as never,
        };
        callbacks[key]?.(value as never);
        if (!controlled)
            notify();
    };
    const applyProposedUpdate = (update: GanttProposedUpdate<TData>, extra?: Partial<GanttEvent<TData>>): boolean => {
        const result = settings.onEventUpdate?.(update);
        if (result === false)
            return false;
        const adjusted: Partial<GanttEvent<TData>> = result && typeof result === "object"
            ? {
                start: result.start ?? update.start,
                end: result.end ?? update.end,
                allDay: result.allDay ?? update.allDay,
            }
            : { start: update.start, end: update.end, allDay: update.allDay };
        if (update.resourceId !== undefined)
            adjusted.resourceId = update.resourceId;
        const merged = extra ? { ...extra, ...adjusted } : adjusted;
        const events = getState().events;
        const next = events.map((event) => event.id === update.event.id ? { ...event, ...merged } : event);
        setField("events", next);
        return true;
    };
    const getIndex = (): GanttIndex<TData> => {
        const state = getState();
        const rangeKey = getRangeKey(state.visibleRange);
        if (indexCache &&
            indexCache.events === state.events &&
            indexCache.rangeKey === rangeKey &&
            indexCache.timeZone === settings.timeZone) {
            return indexCache.index;
        }
        const index = buildEventIndex(state.events, state.visibleRange, {
            timeZone: settings.timeZone,
            eventOrder: settings.eventOrder,
            getOccurrences: settings.getOccurrences,
        });
        indexCache = {
            events: state.events,
            rangeKey,
            timeZone: settings.timeZone,
            index,
        };
        return index;
    };
    const clampToBounds = (date: Date): Date => {
        const bounds = settings.rangeBounds;
        if (!bounds)
            return date;
        if (bounds.min && date.getTime() < bounds.min.getTime())
            return bounds.min;
        if (bounds.max && date.getTime() > bounds.max.getTime())
            return bounds.max;
        return date;
    };
    const api: GanttApi<TData> = {
        next() {
            const state = getState();
            setField("date", clampToBounds(stepGanttDate(state.scale, state.date, 1, {
                timeZone: settings.timeZone,
            })));
        },
        prev() {
            const state = getState();
            setField("date", clampToBounds(stepGanttDate(state.scale, state.date, -1, {
                timeZone: settings.timeZone,
            })));
        },
        today() {
            setField("date", clampToBounds(new Date()));
        },
        goTo(date) {
            setField("date", clampToBounds(date));
        },
        setScale(scale) {
            setField("scale", scale);
        },
        getEvents() {
            return getState().events;
        },
        getEvent(id) {
            return getState().events.find((event) => event.id === id);
        },
        setEvents(events) {
            setField("events", events);
        },
        addEvent(event) {
            setField("events", [...getState().events, event]);
        },
        updateEvent(id, patch) {
            const event = api.getEvent(id);
            if (!event)
                return;
            const merged = { ...event, ...patch };
            const timingChanged = patch.start !== undefined ||
                patch.end !== undefined ||
                patch.allDay !== undefined;
            if (timingChanged && settings.onEventUpdate) {
                const rest = { ...patch };
                delete rest.start;
                delete rest.end;
                delete rest.allDay;
                applyProposedUpdate({
                    event: merged,
                    occurrence: null,
                    start: merged.start,
                    end: merged.end,
                    allDay: merged.allDay ?? false,
                    source: "api",
                }, Object.keys(rest).length > 0 ? rest : undefined);
                return;
            }
            setField("events", getState().events.map((e) => (e.id === id ? merged : e)));
        },
        removeEvent(id) {
            setField("events", getState().events.filter((event) => event.id !== id));
        },
        getOccurrences(range) {
            if (!range)
                return getIndex().occurrences;
            const state = getState();
            const within = range.start >= state.visibleRange.start &&
                range.end <= state.visibleRange.end;
            if (within) {
                return getIndex().occurrences.filter((occ) => eventsOverlap(occ, range));
            }
            return buildEventIndex(state.events, range, {
                timeZone: settings.timeZone,
                eventOrder: settings.eventOrder,
                getOccurrences: settings.getOccurrences,
            }).occurrences;
        },
        findOverlapping({ start, end, excludeEventId }) {
            return api
                .getOccurrences({ start, end })
                .filter((occ) => occ.eventId !== excludeEventId);
        },
        select(partial) {
            const current = getState().selection;
            setField("selection", {
                eventKeys: partial.eventKeys ?? current.eventKeys,
                slot: partial.slot !== undefined ? partial.slot : current.slot,
            });
        },
        selectEvent(key, opts) {
            const current = getState().selection;
            const eventKeys = opts?.additive
                ? current.eventKeys.includes(key)
                    ? current.eventKeys.filter((k) => k !== key)
                    : [...current.eventKeys, key]
                : [key];
            setField("selection", { ...current, eventKeys });
        },
        clearSelection() {
            setField("selection", EMPTY_SELECTION);
        },
        setInteractions(patch) {
            setField("interactions", { ...getState().interactions, ...patch });
        },
        getVisibleRange() {
            return getState().visibleRange;
        },
        getActiveRange() {
            return getState().activeRange;
        },
        toZoned(date) {
            return toZoned(date, settings.timeZone);
        },
    };
    const internals: GanttInternals<TData> = {
        getIndex,
        setDrag(drag) {
            internal.drag = drag;
            invalidate();
            notify();
        },
        setSlotDraft(draft) {
            internal.slotDraft = draft;
            invalidate();
            notify();
        },
        setViewportCenter(date) {
            const prev = internal.viewportCenter;
            if (prev?.getTime() === date?.getTime())
                return;
            internal.viewportCenter = date;
            invalidate();
            notify();
        },
        applyProposedUpdate,
        getSettingsVersion() {
            return settingsVersion;
        },
        extendRange(direction) {
            const state = getState();
            const bounds = settings.rangeBounds;
            if (direction === "before" &&
                bounds?.min &&
                state.visibleRange.start.getTime() <= bounds.min.getTime()) {
                return false;
            }
            if (direction === "after" &&
                bounds?.max &&
                state.visibleRange.end.getTime() >= bounds.max.getTime()) {
                return false;
            }
            const cap = Math.max(1, settings.maxRangeWindow ?? MAX_RANGE_WINDOW);
            const { before, after } = internal.rangeWindow;
            const grow = direction === "before" ? before < cap : after < cap;
            if (grow) {
                internal.rangeWindow =
                    direction === "before"
                        ? { before: before + 1, after }
                        : { before, after: after + 1 };
            }
            else {
                const next = stepGanttDate(state.scale, state.date, direction === "before" ? -1 : 1, {
                    timeZone: settings.timeZone,
                });
                if (options.date !== undefined) {
                    settings.onDateChange?.(next);
                    return false;
                }
                internal.date = next;
                lastAnchorChangeWasSlide = true;
                settings.onDateChange?.(next);
            }
            invalidate();
            notify();
            return true;
        },
        didAnchorSlide() {
            return lastAnchorChangeWasSlide;
        },
    };
    const instance: GanttInstance<TData> = {
        getState,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        api,
        get settings() {
            return settings;
        },
        internals,
    };
    const STATE_KEYS = [
        "events",
        "scale",
        "date",
        "selection",
        "interactions",
        "loading",
    ] as const;
    const SETTINGS_KEYS = [
        "timeZone",
        "locale",
        "weekStartsOn",
        "slotDuration",
        "snapDuration",
        "i18n",
        "rangeBounds",
        "activation",
        "maxRangeWindow",
        "resources",
        "overlap",
        "enforceCanDrop",
        "getEventPriority",
        "eventOrder",
        "getOccurrences",
    ] as const;
    return {
        instance,
        setOptions(next) {
            const prev = options;
            options = next;
            if (prev.date?.getTime() !== next.date?.getTime() ||
                prev.scale !== next.scale) {
                internal.rangeWindow = { before: 0, after: 0 };
                lastAnchorChangeWasSlide = false;
            }
            let changed = false;
            for (const key of STATE_KEYS) {
                if (prev[key] !== next[key]) {
                    changed = true;
                    break;
                }
            }
            let settingsChanged = false;
            for (const key of SETTINGS_KEYS) {
                if (prev[key] !== next[key]) {
                    settingsChanged = true;
                    break;
                }
            }
            settings = resolveSettings(next);
            if (settingsChanged) {
                settingsVersion++;
                changed = true;
            }
            if (changed)
                invalidate();
            return changed;
        },
        notify,
        emitRangeIfChanged,
    };
}
function useGanttState<TData = unknown>(options: UseGanttStateOptions<TData> = {}): GanttInstance<TData> {
    const [store] = useState(() => createGanttStore<TData>(options));
    const changed = store.setOptions(options);
    const changedRef = useRef(false);
    if (changed)
        changedRef.current = true;
    useLayoutEffect(() => {
        if (changedRef.current) {
            changedRef.current = false;
            store.notify();
        }
    });
    useEffect(() => {
        store.emitRangeIfChanged();
    }, []);
    return store.instance;
}
const GanttContext = createContext<GanttInstance<any> | null>(null);
function useGantt<TData = unknown>(): GanttInstance<TData> {
    const instance = useContext(GanttContext);
    if (!instance) {
        throw new Error("useGantt must be used within <Gantt>");
    }
    return instance as GanttInstance<TData>;
}
interface UseGanttSelectorOptions<TData, TSelected> {
    calendar?: GanttInstance<TData>;
    isEqual?: (a: TSelected, b: TSelected) => boolean;
}
function useGanttSelector<TData = unknown, TSelected = unknown>(selector: (state: GanttState<TData>) => TSelected, options?: UseGanttSelectorOptions<TData, TSelected>): TSelected {
    const contextInstance = useContext(GanttContext);
    const instance = options?.calendar ?? contextInstance;
    if (!instance) {
        throw new Error("useGanttSelector needs an <Gantt> ancestor or an explicit `calendar` option");
    }
    const isEqual = options?.isEqual ?? Object.is;
    const lastRef = useRef<{
        value: TSelected;
    } | null>(null);
    const selectorRef = useRef(selector);
    selectorRef.current = selector;
    const getSnapshot = () => {
        const next = selectorRef.current(instance.getState() as GanttState<TData>);
        if (lastRef.current && isEqual(lastRef.current.value, next)) {
            return lastRef.current.value;
        }
        lastRef.current = { value: next };
        return next;
    };
    return useSyncExternalStore(instance.subscribe, getSnapshot, getSnapshot);
}
function useGanttScale(): {
    scale: GanttScale;
    setScale: (scale: GanttScale) => void;
} {
    const instance = useGantt();
    const scale = useGanttSelector((state) => state.scale);
    return { scale, setScale: instance.api.setScale };
}
function useGanttNavigation(): {
    date: Date;
    title: string;
    visibleRange: GanttDateRange;
    activeRange: GanttDateRange;
    next: () => void;
    prev: () => void;
    today: () => void;
    goTo: (date: Date) => void;
    isToday: boolean;
} {
    const instance = useGantt();
    const { settings } = instance;
    const slice = useGanttSelector((state) => ({
        date: state.date,
        scale: state.scale,
        visibleRange: state.visibleRange,
        activeRange: state.activeRange,
        viewportCenter: state.viewportCenter,
    }), {
        isEqual: (a, b) => a.date.getTime() === b.date.getTime() &&
            a.scale === b.scale &&
            a.viewportCenter?.getTime() === b.viewportCenter?.getTime() &&
            getRangeKey(a.visibleRange) === getRangeKey(b.visibleRange),
    });
    useGanttSettingsVersion(instance);
    const isToday = useGanttSelector((state) => {
        const now = new Date();
        return now >= state.activeRange.start && now < state.activeRange.end;
    });
    const titleDate = slice.viewportCenter ?? slice.date;
    const titleActive = slice.viewportCenter
        ? getGanttDateRange(slice.scale, slice.viewportCenter, {
            timeZone: settings.timeZone,
            weekStartsOn: settings.weekStartsOn,
        }).activeRange
        : slice.activeRange;
    return {
        date: slice.date,
        title: settings.i18n.functions.formatTitle(slice.scale, {
            date: toZoned(titleDate, settings.timeZone),
            activeRange: titleActive,
            visibleRange: slice.visibleRange,
            locale: settings.locale,
        }),
        visibleRange: slice.visibleRange,
        activeRange: slice.activeRange,
        next: instance.api.next,
        prev: instance.api.prev,
        today: instance.api.today,
        goTo: instance.api.goTo,
        isToday,
    };
}
function useGanttSelection(): {
    selection: GanttSelection;
    select: (selection: Partial<GanttSelection>) => void;
    selectEvent: (key: string, opts?: {
        additive?: boolean;
    }) => void;
    clearSelection: () => void;
} {
    const instance = useGantt();
    const selection = useGanttSelector((state) => state.selection);
    return {
        selection,
        select: instance.api.select,
        selectEvent: instance.api.selectEvent,
        clearSelection: instance.api.clearSelection,
    };
}
function useGanttInteractions(): {
    interactions: GanttInteractions;
    setInteractions: (patch: Partial<GanttInteractions>) => void;
} {
    const instance = useGantt();
    const interactions = useGanttSelector((state) => state.interactions);
    return { interactions, setInteractions: instance.api.setInteractions };
}
function useGanttOccurrences<TData = unknown>(range?: GanttDateRange): GanttOccurrence<TData>[] {
    const instance = useGantt<TData>();
    return useGanttSelector<TData, GanttOccurrence<TData>[]>(() => instance.api.getOccurrences(range), {
        calendar: instance,
        isEqual: (a, b) => a.length === b.length &&
            a.every((occ, i) => occ.key === b[i]?.key &&
                occ.end.getTime() === b[i].end.getTime() &&
                occ.event === b[i].event),
    });
}
interface GanttNodeSchedules<TData = unknown> {
    node: GanttResource | null;
    scheduleMode: GanttScheduleMode;
    schedules: GanttOccurrence<TData>[];
    conflicts: Array<[
        GanttOccurrence<TData>,
        GanttOccurrence<TData>
    ]>;
}
function useGanttNodeSchedules<TData = unknown>(nodeId: string): GanttNodeSchedules<TData> {
    const settings = useGanttSettings<TData>();
    const viewConfig = useGanttViewConfig<TData>();
    const occurrences = useGanttOccurrences<TData>();
    const node = findResource(settings.resources, nodeId);
    const schedules = occurrences.filter((occurrence) => occurrence.event.resourceId === nodeId);
    const conflicts: Array<[
        GanttOccurrence<TData>,
        GanttOccurrence<TData>
    ]> = [];
    for (let i = 0; i < schedules.length; i++) {
        for (let j = i + 1; j < schedules.length; j++) {
            const left = schedules[i];
            const right = schedules[j];
            if (left && right && eventsOverlap(left, right)) {
                conflicts.push([left, right]);
            }
        }
    }
    return {
        node,
        scheduleMode: resolveScheduleMode(node, viewConfig.scheduleMode),
        schedules,
        conflicts,
    };
}
function useGanttSettingsVersion<TData>(instance: GanttInstance<TData>): number {
    return useSyncExternalStore(instance.subscribe, instance.internals.getSettingsVersion, instance.internals.getSettingsVersion);
}
function useGanttSettings<TData = unknown>(): GanttSettings<TData> {
    const instance = useGantt<TData>();
    useGanttSettingsVersion(instance);
    return instance.settings;
}
interface GanttClassNames {
    nav?: string;
    toolbar?: string;
    view?: string;
    event?: string;
    baseline?: string;
    dependencies?: string;
}
interface GanttColumnContext {
    resource: GanttResource;
    depth: number;
    isGroup: boolean;
    collapsed: boolean;
}
interface GanttColumn {
    id: string;
    title?: ReactNode;
    width?: number;
    align?: "start" | "center" | "end";
    render?: (ctx: GanttColumnContext) => ReactNode;
    className?: string;
}
interface GanttActivationConfig {
    moveDistancePx?: number;
    createDistancePx?: number;
    touchDelayMs?: number;
    touchTolerancePx?: number;
}
type GanttGridLine = boolean | "solid" | "dashed";
interface GanttTimelineLines {
    vertical?: GanttGridLine;
    horizontal?: GanttGridLine;
}
interface GanttResolvedLines {
    vertical: "solid" | "dashed" | null;
    horizontal: "solid" | "dashed" | null;
}
function resolveTimelineLines(value: GanttTimelineLines | "vertical" | "both" | "none" | undefined): GanttResolvedLines {
    if (value === "none")
        return { vertical: null, horizontal: null };
    if (value === "vertical")
        return { vertical: "solid", horizontal: null };
    if (value === "both" || value === undefined) {
        return { vertical: "solid", horizontal: "solid" };
    }
    const stroke = (line: GanttGridLine | undefined) => line === false ? null : line === true || line === undefined ? "solid" : line;
    return {
        vertical: stroke(value.vertical),
        horizontal: stroke(value.horizontal),
    };
}
interface GanttMetrics {
    laneHeight?: number;
    laneGap?: number;
    rowPadding?: number;
    minRowHeight?: number;
    ghostHeight?: number;
    autoLabelMin?: number;
    unitWidths?: Partial<Record<GanttScale, number>>;
    minTimelineWidth?: number;
    infiniteScrollEdge?: number;
}
interface GanttDragIndicatorProps<TData = unknown> {
    occurrence: GanttOccurrence<TData>;
    kind: "move" | "resize-start" | "resize-end";
    start: Date;
    end: Date;
    valid: boolean;
    baseline: GanttBaseline | null;
}
interface GanttScheduleHintProps {
    start: Date;
    end: Date;
    resource: GanttResource;
}
interface GanttSummaryProps {
    resource: GanttResource;
    start: Date;
    end: Date;
    progress: number | null;
}
interface GanttBaselineProps<TData = unknown> {
    event: GanttEvent<TData>;
    start: Date;
    end: Date;
    milestone: boolean;
    variance: GanttBaselineVariance;
}
interface GanttRowBaselineProps {
    resource: GanttResource;
    start: Date;
    end: Date;
    milestone: boolean;
    variance: GanttBaselineVariance | null;
}
interface GanttTreePanelConfig {
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    resizable?: boolean;
    nameColumnWidth?: number;
    onWidthChange?: (width: number) => void;
}
interface GanttRenderEventProps<TData = unknown> {
    occurrence: GanttOccurrence<TData>;
    segment: GanttSegment<TData>;
    isDragging: boolean;
    isSelected: boolean;
}
interface GanttViewConfig<TData = unknown> {
    nowIndicator: boolean;
    interval: number;
    scrollbars: "custom" | "native";
    displayScheduleHint: boolean;
    initialCenter: "now" | "anchor" | Date;
    dragCreate: boolean;
    displayCreateTaskHint: boolean;
    zoomControl: boolean;
    wheelZoom: boolean;
    navButtonVariant: "ghost" | "outline" | "secondary" | "default";
    navButtonSize: "sm" | "default";
    offDays?: boolean | GanttOffDaysConfig;
    columns?: GanttColumn[];
    columnsMenu?: ReactNode;
    treePanel?: GanttTreePanelConfig;
    timelineLines: GanttTimelineLines | "vertical" | "both" | "none";
    barLabel: "inside" | "outside" | "auto";
    offscreenIndicators: boolean;
    infiniteScroll: boolean;
    zoomRange?: {
        min?: number;
        max?: number;
        step?: number;
    };
    metrics?: GanttMetrics;
    stickyNav: boolean;
    rowCheckboxes: boolean;
    selectedRows?: string[];
    onSelectedRowsChange?: (ids: string[]) => void;
    collapsedGroups?: string[];
    defaultCollapsedGroups?: string[];
    onCollapsedGroupsChange?: (ids: string[]) => void;
    zoom?: number;
    defaultZoom?: number;
    onZoomChange?: (zoom: number) => void;
    parentScheduling: boolean;
    summaryBars: boolean;
    baselineBars: boolean;
    dependencyLines: boolean;
    scheduleMode: GanttScheduleMode;
    rowAlign: GanttRowAlign;
    classNames?: GanttClassNames;
    renderEvent?: (props: GanttRenderEventProps<TData>) => ReactNode;
    renderEventMenu?: (props: GanttRenderEventProps<TData>) => ReactNode;
    renderResourceLabel?: (props: {
        resource: GanttResource;
        depth: number;
        isGroup: boolean;
        collapsed: boolean;
    }) => ReactNode;
    renderResourceMenu?: (ctx: GanttColumnContext) => ReactNode;
    renderNoResources?: () => ReactNode;
    renderDragPreview?: (props: GanttDragIndicatorProps<TData>) => ReactNode;
    renderResizeIndicator?: (props: GanttDragIndicatorProps<TData>) => ReactNode;
    renderScheduleHint?: (props: GanttScheduleHintProps) => ReactNode;
    renderSummary?: (props: GanttSummaryProps) => ReactNode;
    renderBaseline?: (props: GanttBaselineProps<TData>) => ReactNode;
    renderRowBaseline?: (props: GanttRowBaselineProps) => ReactNode;
    getSummaryProgress?: (ctx: {
        resource: GanttResource;
        events: GanttEvent<TData>[];
    }) => number | null;
    getEventAttributes?: (occurrence: GanttOccurrence<TData>) => Record<`data-${string}`, string | undefined>;
}
const DEFAULT_VIEW_CONFIG: GanttViewConfig = {
    nowIndicator: true,
    interval: 60,
    scrollbars: "custom",
    displayScheduleHint: false,
    initialCenter: "now",
    displayCreateTaskHint: false,
    dragCreate: false,
    zoomControl: true,
    wheelZoom: true,
    navButtonVariant: "ghost",
    navButtonSize: "sm",
    timelineLines: "vertical",
    barLabel: "inside",
    offscreenIndicators: true,
    infiniteScroll: true,
    stickyNav: false,
    rowCheckboxes: true,
    parentScheduling: false,
    summaryBars: true,
    baselineBars: true,
    dependencyLines: true,
    scheduleMode: "multiple",
    rowAlign: "start",
};
const GanttViewConfigContext = createContext<GanttViewConfig<any>>(DEFAULT_VIEW_CONFIG);
function useGanttViewConfig<TData = unknown>(): GanttViewConfig<TData> {
    return useContext(GanttViewConfigContext);
}
const VIEW_CONFIG_KEYS: Array<keyof GanttViewConfig> = [
    "nowIndicator",
    "interval",
    "scrollbars",
    "displayScheduleHint",
    "initialCenter",
    "displayCreateTaskHint",
    "dragCreate",
    "zoomControl",
    "wheelZoom",
    "navButtonVariant",
    "navButtonSize",
    "offDays",
    "columns",
    "columnsMenu",
    "treePanel",
    "metrics",
    "timelineLines",
    "barLabel",
    "offscreenIndicators",
    "infiniteScroll",
    "zoomRange",
    "stickyNav",
    "rowCheckboxes",
    "selectedRows",
    "onSelectedRowsChange",
    "collapsedGroups",
    "defaultCollapsedGroups",
    "onCollapsedGroupsChange",
    "zoom",
    "defaultZoom",
    "onZoomChange",
    "parentScheduling",
    "summaryBars",
    "baselineBars",
    "dependencyLines",
    "scheduleMode",
    "rowAlign",
    "classNames",
    "renderEvent",
    "renderEventMenu",
    "renderResourceLabel",
    "renderResourceMenu",
    "renderNoResources",
    "renderDragPreview",
    "renderResizeIndicator",
    "renderScheduleHint",
    "renderSummary",
    "renderBaseline",
    "renderRowBaseline",
    "getSummaryProgress",
    "getEventAttributes",
];
interface GanttProps<TData = unknown> extends UseGanttStateOptions<TData>, Partial<GanttViewConfig<TData>>, Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue"> {
    calendar?: GanttInstance<TData>;
    apiRef?: RefObject<GanttApi<TData> | null>;
    asChild?: boolean;
    children?: ReactNode;
}
const OPTION_KEYS: Array<keyof UseGanttStateOptions> = [
    "events",
    "defaultEvents",
    "scale",
    "defaultScale",
    "date",
    "defaultDate",
    "selection",
    "defaultSelection",
    "interactions",
    "defaultInteractions",
    "loading",
    "timeZone",
    "locale",
    "weekStartsOn",
    "slotDuration",
    "snapDuration",
    "i18n",
    "rangeBounds",
    "activation",
    "maxRangeWindow",
    "resources",
    "overlap",
    "enforceCanDrop",
    "getEventPriority",
    "eventOrder",
    "getOccurrences",
    "onEventClick",
    "onEventDoubleClick",
    "onEventUpdate",
    "canDropEvent",
    "onSlotClick",
    "onSelectSlot",
    "canSelectSlot",
    "onCreateTask",
    "canCreateTask",
    "onResourceClick",
    "onResourceDoubleClick",
    "onRangeChange",
    "onScaleChange",
    "onDateChange",
    "onSelectionChange",
    "onInteractionsChange",
    "onEventsChange",
    "onResourceReorder",
    "onResourceReorderReject",
    "canReorderResource",
];
function shallowEqualRecord(a: object, b: object): boolean {
    const aEntries = Object.entries(a);
    const bEntries = new Map(Object.entries(b));
    if (aEntries.length !== bEntries.size)
        return false;
    for (const [key, value] of aEntries) {
        if (!bEntries.has(key) || !Object.is(value, bEntries.get(key)))
            return false;
    }
    return true;
}
function splitOptions<TData>(props: object): {
    options: UseGanttStateOptions<TData>;
    viewConfig: GanttViewConfig<TData>;
    rest: HTMLAttributes<HTMLDivElement>;
} {
    const options: Array<[string, unknown]> = [];
    const viewConfig: Array<[string, unknown]> = [];
    const rest: Array<[string, unknown]> = [];
    for (const [key, value] of Object.entries(props)) {
        if ((OPTION_KEYS as string[]).includes(key))
            options.push([key, value]);
        else if ((VIEW_CONFIG_KEYS as string[]).includes(key)) {
            if (value !== undefined)
                viewConfig.push([key, value]);
        }
        else
            rest.push([key, value]);
    }
    return {
        options: Object.fromEntries(options),
        viewConfig: { ...DEFAULT_VIEW_CONFIG, ...Object.fromEntries(viewConfig) },
        rest: Object.fromEntries(rest),
    };
}
function Gantt<TData = unknown>({ calendar, apiRef, className, asChild = false, children, ...props }: GanttProps<TData>) {
    const { options, viewConfig, rest } = splitOptions<TData>(props);
    const viewConfigRef = useRef(viewConfig);
    if (!shallowEqualRecord(viewConfigRef.current, viewConfig)) {
        viewConfigRef.current = viewConfig;
    }
    const stableViewConfig = viewConfigRef.current;
    if (calendar && Object.keys(options).length > 0) {
        warnOnce("calendar-and-options", "both `calendar` and option props were passed; option props are ignored when adopting an instance.");
    }
    const own = useGanttState<TData>(calendar ? {} : options);
    const instance = calendar ?? own;
    useEffect(() => {
        if (apiRef)
            apiRef.current = instance.api;
    }, [apiRef, instance]);
    const Comp = asChild ? Slot.Root : "div";
    return (<GanttContext.Provider value={instance}>
      <GanttViewConfigContext.Provider value={stableViewConfig}>
        <Comp data-slot="gantt" className={cn("text-foreground flex min-h-0 min-w-0 flex-col text-xs", className)} {...rest}>
          
          <Slot.Slottable>{children}</Slot.Slottable>
          <div data-slot="gantt-announcer" aria-live="polite" className="sr-only"/>
        </Comp>
      </GanttViewConfigContext.Provider>
    </GanttContext.Provider>);
}
export { DEFAULT_ROW_ALIGN, DEFAULT_SCHEDULE_MODE, DEFAULT_VIEW_CONFIG, Gantt, GanttContext, GanttViewConfigContext, resolveScheduleMode, resolveTimelineLines, useGantt, useGanttInteractions, useGanttNavigation, useGanttNodeSchedules, useGanttOccurrences, useGanttScale, useGanttSelection, useGanttSelector, useGanttSettings, useGanttSettingsVersion, useGanttState, useGanttViewConfig, };
export type { GanttActivationConfig, GanttApi, GanttBaselineProps, GanttCallbacks, GanttClassNames, GanttColumn, GanttColumnContext, GanttDragIndicatorProps, GanttGridLine, GanttInstance, GanttInternals, GanttMetrics, GanttNodeSchedules, GanttProps, GanttRenderEventProps, GanttResolvedLines, GanttRowBaselineProps, GanttScheduleHintProps, GanttSettings, GanttSummaryProps, GanttTimelineLines, GanttTreePanelConfig, GanttViewConfig, UseGanttStateOptions, };
