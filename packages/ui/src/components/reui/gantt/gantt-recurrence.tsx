import type { GanttDateRange, GanttEvent, GanttOccurrence, GanttRecurrenceRule, GanttWeekday, } from "@crm/ui/components/reui/gantt/gantt-types";
import { TZDate } from "@date-fns/tz";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
const MAX_OCCURRENCES = 1000;
const WEEKDAYS: GanttWeekday[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
class GanttRecurrenceError extends Error {
    constructor(part: string) {
        super(`Unsupported recurrence part: ${part}. Use the getOccurrences prop to plug a full RRULE engine for exotic rules.`);
        this.name = "GanttRecurrenceError";
    }
}
function parseRRuleString(input: string, timeZone?: string): GanttRecurrenceRule {
    const body = input.trim().replace(/^RRULE:/i, "");
    const rule: Partial<GanttRecurrenceRule> = {};
    for (const pair of body.split(";")) {
        if (!pair)
            continue;
        const [rawKey, rawValue] = pair.split("=");
        const key = rawKey?.toUpperCase();
        const value = rawValue ?? "";
        switch (key) {
            case "FREQ": {
                const freq = value.toLowerCase();
                if (freq !== "daily" &&
                    freq !== "weekly" &&
                    freq !== "monthly" &&
                    freq !== "yearly") {
                    throw new GanttRecurrenceError(`FREQ=${value}`);
                }
                rule.freq = freq;
                break;
            }
            case "INTERVAL":
                rule.interval = Math.max(1, parseInt(value, 10) || 1);
                break;
            case "COUNT":
                rule.count = Math.max(1, parseInt(value, 10) || 1);
                break;
            case "UNTIL":
                rule.until = parseRRuleDate(value, timeZone);
                break;
            case "BYDAY":
                rule.byWeekday = value.split(",").map((token) => {
                    const match = /^(-?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/.exec(token.trim());
                    if (!match)
                        throw new GanttRecurrenceError(`BYDAY=${token}`);
                    const day = match[2] as GanttWeekday;
                    return match[1] ? { day, ordinal: parseInt(match[1], 10) } : day;
                });
                break;
            case "BYMONTHDAY":
                rule.byMonthDay = value.split(",").map((v) => parseInt(v, 10));
                break;
            case "BYMONTH":
                rule.byMonth = value.split(",").map((v) => parseInt(v, 10));
                break;
            case "WKST": {
                if (!WEEKDAYS.includes(value as GanttWeekday)) {
                    throw new GanttRecurrenceError(`WKST=${value}`);
                }
                rule.weekStart = value as GanttWeekday;
                break;
            }
            default:
                throw new GanttRecurrenceError(key ?? pair);
        }
    }
    if (!rule.freq)
        throw new GanttRecurrenceError("missing FREQ");
    return rule as GanttRecurrenceRule;
}
function parseRRuleDate(value: string, timeZone?: string): Date {
    const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value);
    if (!match)
        throw new GanttRecurrenceError(`UNTIL=${value}`);
    const [, y, m, d, hh = "23", mm = "59", ss = "59", z] = match;
    const date = !z && timeZone
        ? new TZDate(Number(y), Number(m) - 1, Number(d), +hh, +mm, +ss, timeZone)
        : new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}${z ? "Z" : ""}`);
    if (Number.isNaN(date.getTime())) {
        throw new GanttRecurrenceError(`UNTIL=${value}`);
    }
    return new Date(date.getTime());
}
function formatRRuleString(rule: GanttRecurrenceRule): string {
    const parts: string[] = [`FREQ=${rule.freq.toUpperCase()}`];
    if (rule.interval && rule.interval > 1)
        parts.push(`INTERVAL=${rule.interval}`);
    if (rule.count)
        parts.push(`COUNT=${rule.count}`);
    if (rule.until) {
        const u = rule.until;
        const pad = (n: number) => String(n).padStart(2, "0");
        parts.push(`UNTIL=${u.getUTCFullYear()}${pad(u.getUTCMonth() + 1)}${pad(u.getUTCDate())}T${pad(u.getUTCHours())}${pad(u.getUTCMinutes())}${pad(u.getUTCSeconds())}Z`);
    }
    if (rule.byWeekday?.length) {
        parts.push(`BYDAY=${rule.byWeekday
            .map((d) => (typeof d === "string" ? d : `${d.ordinal}${d.day}`))
            .join(",")}`);
    }
    if (rule.byMonthDay?.length)
        parts.push(`BYMONTHDAY=${rule.byMonthDay.join(",")}`);
    if (rule.byMonth?.length)
        parts.push(`BYMONTH=${rule.byMonth.join(",")}`);
    if (rule.weekStart)
        parts.push(`WKST=${rule.weekStart}`);
    return parts.join(";");
}
function resolveRule(recurrence: GanttRecurrenceRule | string, timeZone?: string): GanttRecurrenceRule {
    return typeof recurrence === "string"
        ? parseRRuleString(recurrence, timeZone)
        : recurrence;
}
function expandRecurrence<TData>(event: GanttEvent<TData>, range: GanttDateRange, ctx: {
    timeZone: string;
}): GanttOccurrence<TData>[] {
    const allDay = event.allDay ?? false;
    if (!event.recurrence) {
        const visible = event.end.getTime() === event.start.getTime()
            ? event.start >= range.start && event.start < range.end
            : event.start < range.end && event.end > range.start;
        if (visible) {
            return [
                {
                    key: `${event.id}::${event.start.toISOString()}`,
                    eventId: event.id,
                    event,
                    start: event.start,
                    end: event.end,
                    allDay,
                    isRecurring: false,
                },
            ];
        }
        return [];
    }
    const rule = resolveRule(event.recurrence, ctx.timeZone);
    if (rule.byMonthDay?.length)
        throw new GanttRecurrenceError("BYMONTHDAY");
    if (rule.byMonth?.length)
        throw new GanttRecurrenceError("BYMONTH");
    if (rule.byWeekday?.length && rule.freq !== "weekly") {
        throw new GanttRecurrenceError("BYDAY outside FREQ=WEEKLY");
    }
    const interval = Math.max(1, rule.interval ?? 1);
    const durationMs = event.end.getTime() - event.start.getTime();
    const zonedStart = new TZDate(event.start.getTime(), ctx.timeZone);
    const exTimes = new Set((rule.exDates ?? []).map((d) => d.getTime()));
    const weeklyDays: number[] | null = rule.freq === "weekly" && rule.byWeekday?.length
        ? rule.byWeekday.map((d) => {
            if (typeof d !== "string") {
                throw new GanttRecurrenceError("BYDAY ordinal outside monthly/yearly");
            }
            return WEEKDAYS.indexOf(d);
        })
        : null;
    const occurrences: GanttOccurrence<TData>[] = [];
    let produced = 0;
    let index = 0;
    let cursor = zonedStart;
    const advance = (from: TZDate, steps: number): TZDate => rule.freq === "daily"
        ? addDays(from, steps * interval)
        : rule.freq === "weekly"
            ? addWeeks(from, steps * interval)
            : rule.freq === "monthly"
                ? addMonths(from, steps * interval)
                : addYears(from, steps * interval);
    const canFastForward = rule.freq === "daily" || rule.freq === "weekly";
    const weekSlackMs = weeklyDays ? 6 * 86400000 : 0;
    const maxStepMs = (rule.freq === "daily"
        ? 24
        : rule.freq === "weekly"
            ? 7 * 24
            : rule.freq === "monthly"
                ? 31 * 24
                : 366 * 24) *
        3600000 *
        interval +
        3600000;
    for (let pass = 0; canFastForward && pass < 2; pass++) {
        const gap = range.start.getTime() - durationMs - weekSlackMs - cursor.getTime();
        const skip = Math.floor(gap / maxStepMs);
        if (skip <= 0)
            break;
        cursor = advance(cursor, skip);
        index += skip * (weeklyDays ? weeklyDays.length : 1);
    }
    let guard = 0;
    while (guard++ < 10000 &&
        !(rule.until && cursor.getTime() > rule.until.getTime()) &&
        cursor.getTime() + durationMs + weekSlackMs < range.start.getTime()) {
        cursor = advance(cursor, 1);
        index += weeklyDays ? weeklyDays.length : 1;
    }
    if (weeklyDays && index > 0) {
        index -= weeklyDays.filter((day) => day < zonedStart.getDay()).length;
    }
    const pushIfVisible = (rawStart: Date) => {
        const start = new Date(rawStart.getTime());
        if (exTimes.has(start.getTime()))
            return;
        const end = new Date(start.getTime() + durationMs);
        const visible = durationMs === 0
            ? start >= range.start && start < range.end
            : start < range.end && end > range.start;
        if (visible) {
            occurrences.push({
                key: `${event.id}::${start.toISOString()}`,
                eventId: event.id,
                event,
                start,
                end,
                allDay,
                isRecurring: true,
                recurrenceIndex: index,
            });
        }
    };
    while (produced < MAX_OCCURRENCES) {
        if (rule.until && cursor.getTime() > rule.until.getTime())
            break;
        if (rule.count !== undefined && index >= rule.count)
            break;
        const horizonMs = weeklyDays
            ? addDays(cursor, -cursor.getDay()).getTime()
            : cursor.getTime();
        if (horizonMs >= range.end.getTime() && rule.count === undefined) {
            break;
        }
        if (rule.freq === "weekly" && weeklyDays) {
            for (let d = 0; d < 7; d++) {
                const candidate = addDays(cursor, d - cursor.getDay());
                if (!weeklyDays.includes(candidate.getDay()))
                    continue;
                if (candidate.getTime() < zonedStart.getTime())
                    continue;
                if (rule.until && candidate.getTime() > rule.until.getTime())
                    continue;
                if (produced >= MAX_OCCURRENCES)
                    break;
                if (rule.count !== undefined && index >= rule.count)
                    break;
                pushIfVisible(candidate);
                produced++;
                index++;
            }
        }
        else {
            pushIfVisible(cursor);
            produced++;
            index++;
        }
        cursor = advance(cursor, 1);
    }
    if (rule.rDates?.length) {
        const seen = new Set(occurrences.map((o) => o.start.getTime()));
        for (const rDate of rule.rDates) {
            const start = new Date(rDate.getTime());
            if (seen.has(start.getTime()) || exTimes.has(start.getTime()))
                continue;
            const end = new Date(start.getTime() + durationMs);
            const hidden = durationMs === 0
                ? start < range.start || start >= range.end
                : start >= range.end || end <= range.start;
            if (hidden)
                continue;
            seen.add(start.getTime());
            occurrences.push({
                key: `${event.id}::${start.toISOString()}`,
                eventId: event.id,
                event,
                start,
                end,
                allDay,
                isRecurring: true,
                recurrenceIndex: index++,
            });
        }
        occurrences.sort((a, b) => a.start.getTime() - b.start.getTime());
    }
    return occurrences;
}
export { GanttRecurrenceError, expandRecurrence, formatRRuleString, MAX_OCCURRENCES, parseRRuleString, };
