"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { crmMessages } from "@/lib/messages/crm";
import { InlineScript } from "./inline-script";

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const relativeDateFormatters = new Map<string, Intl.RelativeTimeFormat>();
const LOCAL_DAY_OPTIONS = {
	month: "short",
	day: "numeric",
	year: "numeric",
} as const;
const MOC = "\u0000";
const NUT_TU = "local-date-words";

function manh(f: (n: string) => string): [string, string] {
	const [truoc, sau] = f(MOC).split(MOC);
	return [truoc ?? "", sau ?? ""];
}

function tuThoiGian(locale: Locale) {
	const t = crmMessages(locale).time;
	return {
		justNow: t.justNow,
		m: manh(t.minutes),
		h: manh(t.hours),
		d: manh(t.days),
		ahead: manh(t.ahead),
		ago: manh(t.ago),
	};
}

const kichBan = () =>
	`{var s="time[data-local-date-kind]",f=function(n){try{var T=JSON.parse(document.getElementById("${NUT_TU}").dataset.tu),g=document.documentElement.lang||void 0,k=n.dataset.localDateKind,v=n.dataset.localDateValue,e=n.dataset.localDateEnd,o=JSON.parse(n.dataset.localDateOptions||"{}"),d=new Date(v),t=d.getTime(),x=Date.now()-t,a=Math.abs(x),r;if(k==="date-time")r=new Intl.DateTimeFormat(g,o).format(d);else if(k==="date-range")r=new Intl.DateTimeFormat(g,o).formatRange(d,new Date(e));else if(k==="day")r=new Intl.DateTimeFormat(g,o).format(new Date(v+"T00:00:00"));else if(k==="relative-date"){var z=new Date(),q=(Date.UTC(z.getFullYear(),z.getMonth(),z.getDate())-Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/${DAY_MS};r=new Intl.RelativeTimeFormat(g,{numeric:"auto"}).format(-q,"day")}else if(!Number.isFinite(t))r="—";else if(a<${MINUTE_MS})r=T.justNow;else if(a>=${30 * DAY_MS})r=new Intl.DateTimeFormat(g,{month:"short",day:"numeric"}).format(d);else{var u=a<${HOUR_MS}?T.m[0]+Math.floor(a/${MINUTE_MS})+T.m[1]:a<${DAY_MS}?T.h[0]+Math.floor(a/${HOUR_MS})+T.h[1]:T.d[0]+Math.floor(a/${DAY_MS})+T.d[1];r=x<0?T.ahead[0]+u+T.ahead[1]:T.ago[0]+u+T.ago[1]}n.textContent=r}catch{}};var c=function(r){if(r.nodeType===1&&r.matches&&r.matches(s))f(r);if(r.querySelectorAll)r.querySelectorAll(s).forEach(f)};c(document);new MutationObserver(function(m){m.forEach(function(r){r.addedNodes.forEach(c)})}).observe(document.documentElement,{childList:true,subtree:true})}`;

export function LocalDateTime({
	date,
	options,
}: {
	date: string;
	options: Intl.DateTimeFormatOptions;
}) {
	const locale = useLocale();
	return (
		<LocalTime
			kind="date-time"
			date={date}
			options={options}
			fallback={getDateTimeFormatter(locale, options).format(new Date(date))}
		/>
	);
}

export function LocalDateTimeRange({
	start,
	end,
	options,
}: {
	start: string;
	end: string;
	options: Intl.DateTimeFormatOptions;
}) {
	const locale = useLocale();
	return (
		<LocalTime
			kind="date-range"
			date={start}
			end={end}
			options={options}
			fallback={getDateTimeFormatter(locale, options).formatRange(
				new Date(start),
				new Date(end),
			)}
		/>
	);
}

export function LocalRelativeDate({ date }: { date: string }) {
	const locale = useLocale();
	return (
		<LocalTime
			kind="relative-date"
			date={date}
			fallback={formatRelativeDate(date, locale)}
		/>
	);
}

export function LocalRelativeTime({ date }: { date: string }) {
	const locale = useLocale();
	return (
		<LocalTime
			kind="relative-time"
			date={date}
			fallback={formatRelativeTime(date, locale)}
		/>
	);
}

export function LocalDay({ date }: { date: string }) {
	const locale = useLocale();
	const day = date.slice(0, 10);
	return (
		<LocalTime
			kind="day"
			date={day}
			options={LOCAL_DAY_OPTIONS}
			fallback={getDateTimeFormatter(locale, LOCAL_DAY_OPTIONS).format(
				dayDate(day),
			)}
		/>
	);
}

export function LocalDateTimeHydrator({ locale }: { locale: Locale }) {
	return (
		<>
			<span
				id={NUT_TU}
				hidden
				data-tu={JSON.stringify(tuThoiGian(locale))}
				data-lang={locale}
			/>
			<InlineScript html={kichBan()} />
		</>
	);
}

function LocalTime({
	kind,
	date,
	end,
	options,
	fallback,
}: {
	kind: "date-time" | "date-range" | "day" | "relative-date" | "relative-time";
	date: string;
	end?: string;
	options?: Intl.DateTimeFormatOptions;
	fallback: string;
}) {
	return (
		<time
			dateTime={date}
			data-local-date-kind={kind}
			data-local-date-value={date}
			data-local-date-end={end}
			data-local-date-options={options ? JSON.stringify(options) : undefined}
			suppressHydrationWarning
		>
			{fallback}
		</time>
	);
}

function formatRelativeDate(date: string, locale: Locale): string {
	const now = new Date();
	const then = new Date(date);
	const days = (calendarDay(now) - calendarDay(then)) / DAY_MS;
	return getRelativeFormatter(locale).format(-days, "day");
}

function formatRelativeTime(date: string, locale: Locale): string {
	const then = new Date(date).getTime();
	if (!Number.isFinite(then)) return "—";
	const difference = Date.now() - then;
	const absolute = Math.abs(difference);
	const t = crmMessages(locale).time;
	if (absolute < MINUTE_MS) return t.justNow;
	if (absolute >= 30 * DAY_MS) {
		return getDateTimeFormatter(locale, {
			month: "short",
			day: "numeric",
		}).format(new Date(then));
	}

	const distance =
		absolute < HOUR_MS
			? t.minutes(String(Math.floor(absolute / MINUTE_MS)))
			: absolute < DAY_MS
				? t.hours(String(Math.floor(absolute / HOUR_MS)))
				: t.days(String(Math.floor(absolute / DAY_MS)));
	return difference < 0 ? t.ahead(distance) : t.ago(distance);
}

function calendarDay(date: Date): number {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDate(day: string): Date {
	return new Date(`${day}T00:00:00`);
}

function getDateTimeFormatter(
	locale: Locale,
	options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
	const key = `${locale}:${JSON.stringify(options)}`;
	const cached = dateTimeFormatters.get(key);
	if (cached) return cached;

	const formatter = new Intl.DateTimeFormat(locale, options);
	dateTimeFormatters.set(key, formatter);
	return formatter;
}

function getRelativeFormatter(locale: Locale): Intl.RelativeTimeFormat {
	const cached = relativeDateFormatters.get(locale);
	if (cached) return cached;

	const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
	relativeDateFormatters.set(locale, formatter);
	return formatter;
}
