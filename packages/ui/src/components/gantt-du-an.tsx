"use client";

import { Button } from "@crm/ui/components/button";
import { Gantt } from "@crm/ui/components/reui/gantt/gantt";
import type { GanttI18nOverrides } from "@crm/ui/components/reui/gantt/gantt-i18n";
import { GanttNav } from "@crm/ui/components/reui/gantt/gantt-nav";
import type {
	GanttEvent,
	GanttOccurrence,
	GanttProposedUpdate,
	GanttResource,
} from "@crm/ui/components/reui/gantt/gantt-types";
import { GanttView } from "@crm/ui/components/reui/gantt/gantt-view";
import { Skeleton } from "@crm/ui/components/skeleton";
import { type StatusTone, TONE_COLOR } from "@crm/ui/components/status-indicator";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import type { Messages } from "@crm/ui/lib/messages";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { cn } from "@crm/ui/lib/utils";
import { format, subMilliseconds } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { useMemo, useSyncExternalStore } from "react";

export const GANTT_DU_AN = {
	muiGio: "Asia/Ho_Chi_Minh",
	lechGio: "+07:00",
	ngayMs: 24 * 60 * 60 * 1000,
	thangMacDinh: "week",
	hangMoc: "__moc",
	hangChuaLich: "__chua-lich",
	rongNgayRem: 2.5,
	manHep: "(max-width: 767px)",
	cotHep: { width: 168, minWidth: 120, nameColumnWidth: 168 },
} as const;

export type GanttDuAnViec = {
	id: string;
	tieuDe: string;
	chaId: string | null;
	batDau: string | null;
	han: string | null;
	nghia: NghiaTrangThai;
	suaDuoc: boolean;
	phaiCho: string[];
};

export type GanttDuAnMoc = {
	id: string;
	ten: string;
	ngay: string;
	tre: boolean;
	cho: string[];
};

export type GanttDuAnLich = {
	ngayNghiTuan: number[];
	ngayLe: string[];
};

export type GanttDuAnDoiLich = {
	id: string;
	batDau: string;
	han: string;
	nguon: "keo" | "phim";
};

export type GanttDuAnProps = {
	viec: GanttDuAnViec[];
	moc: GanttDuAnMoc[];
	lich: GanttDuAnLich;
	homNay: string;
	chiDoc?: boolean;
	onDoiLich?: (doi: GanttDuAnDoiLich) => void;
	onDatNgay?: (id: string) => void;
	onMoViec?: (id: string) => void;
	className?: string;
};

type DuLieuThanh =
	| { loai: "viec"; tone: StatusTone }
	| { loai: "moc"; ten: string; tre: boolean };

function khongDoi(): () => void {
	return () => {};
}

function ngheManHep(bao: () => void): () => void {
	const mql = window.matchMedia(GANTT_DU_AN.manHep);
	mql.addEventListener("change", bao);
	return () => mql.removeEventListener("change", bao);
}

function useDaHydrat(): boolean {
	return useSyncExternalStore(
		khongDoi,
		() => true,
		() => false,
	);
}

function useManHep(): boolean {
	return useSyncExternalStore(
		ngheManHep,
		() => window.matchMedia(GANTT_DU_AN.manHep).matches,
		() => false,
	);
}

function thuocTinhThanh(
	occurrence: GanttOccurrence<DuLieuThanh>,
): Record<`data-${string}`, string> {
	const du = occurrence.event.data;
	if (du?.loai === "viec") return { "data-gantt-bar": "", "data-tone": du.tone };
	if (du?.loai === "moc") return { "data-gantt-moc": du.ten };
	return {};
}

function dauNgay(ngay: string): Date {
	return new Date(`${ngay}T00:00:00${GANTT_DU_AN.lechGio}`);
}

function ngayCua(date: Date): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: GANTT_DU_AN.muiGio,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

function thuJs(thuIso: number): number {
	return thuIso % 7;
}

const LICH_NGON_NGU = {
	vi: { dateFns: vi, ngay: "dd/MM", ngayDai: "EEEE dd/MM/yyyy" },
	en: { dateFns: enUS, ngay: "MMM d", ngayDai: "EEEE, MMM d, yyyy" },
} as const;

export function nhanGantt(msg: Messages["gantt"], locale: Locale): GanttI18nOverrides {
	const lich = LICH_NGON_NGU[locale];
	const ngay = (d: Date) => format(d, lich.ngay, { locale: lich.dateFns });
	const khoang = (tu: Date, den: Date) => {
		const cuoi = den.getTime() > tu.getTime() ? subMilliseconds(den, 1) : tu;
		return ngay(tu) === ngay(cuoi) ? ngay(tu) : `${ngay(tu)} – ${ngay(cuoi)}`;
	};
	return {
		formats: {
			monthTitle: "MMMM yyyy",
			dayTitle: lich.ngayDai,
			timeGutter: "HH",
			eventTime: "HH:mm",
		},
		functions: {
			formatTitle: (scale, { date, activeRange }) => {
				if (scale === "day") return format(date, lich.ngayDai, { locale: lich.dateFns });
				if (scale === "month") return format(date, "MMMM yyyy", { locale: lich.dateFns });
				if (scale === "quarter") return msg.quy(format(date, "Q"), format(date, "yyyy"));
				if (scale === "year") return format(date, "yyyy");
				return `${khoang(activeRange.start, activeRange.end)}/${format(activeRange.start, "yyyy")}`;
			},
			formatEventTime: (start, end) => khoang(start, end),
			formatDayRange: (range) => khoang(range.start, range.end),
		},
		labels: {
			today: msg.today,
			previous: msg.previous,
			next: msg.next,
			addEvent: msg.addTask,
			addTask: msg.addTask,
			allDay: msg.allDay,
			loading: msg.loading,
			event: msg.event,
			events: (n) => msg.events(String(n)),
			week: (n) => msg.week(String(n)),
			resources: msg.resources,
			goToDate: msg.goToDate,
			scheduleHint: msg.scheduleHint,
			scheduleHintDrag: msg.scheduleHint,
			reorder: msg.reorder,
			selectView: msg.selectView,
			zoomIn: msg.zoomIn,
			zoomOut: msg.zoomOut,
			resizePanel: msg.resizePanel,
			jumpToBar: (title) => msg.jumpToBar(title),
			progress: (p) => msg.progress(String(p)),
			durationDays: (d) => msg.durationDays(String(d)),
			continues: msg.continues,
			planned: (r) => msg.planned(r),
			milestone: msg.milestone,
			scales: msg.scales,
		},
	};
}

export function GanttDuAn(props: GanttDuAnProps) {
	const daHydrat = useDaHydrat();
	const hep = useManHep();
	if (!daHydrat) {
		return <Skeleton aria-hidden data-gantt-cho="" className={cn("min-h-64 w-full", props.className)} />;
	}
	return <GanttDuAnDaDung {...props} hep={hep} />;
}

function GanttDuAnDaDung({
	viec,
	moc,
	lich,
	homNay,
	chiDoc = false,
	onDoiLich,
	onDatNgay,
	onMoViec,
	className,
	hep,
}: GanttDuAnProps & { hep: boolean }) {
	const msg = useMessages().gantt;
	const locale = useLocale();
	const lichNgonNgu = LICH_NGON_NGU[locale];
	const i18n = useMemo(() => nhanGantt(msg, locale), [msg, locale]);

	const coLich = viec.filter((v) => v.batDau && v.han);
	const chuaLich = viec.filter((v) => !(v.batDau && v.han));

	const resources = useMemo<GanttResource[]>(() => {
		const hang: GanttResource[] = [];
		if (moc.length > 0) {
			hang.push({ id: GANTT_DU_AN.hangMoc, title: msg.mocNhom });
		}
		const conCua = new Map<string, GanttDuAnViec[]>();
		for (const v of coLich) {
			if (v.chaId) conCua.set(v.chaId, [...(conCua.get(v.chaId) ?? []), v]);
		}
		for (const v of coLich) {
			if (v.chaId && coLich.some((c) => c.id === v.chaId)) continue;
			const con = conCua.get(v.id) ?? [];
			hang.push({
				id: v.id,
				title: v.tieuDe,
				...(con.length > 0
					? { children: con.map((c) => ({ id: c.id, title: c.tieuDe })) }
					: {}),
			});
		}
		if (chuaLich.length > 0) {
			hang.push({
				id: GANTT_DU_AN.hangChuaLich,
				title: msg.chuaLich(String(chuaLich.length)),
				children: chuaLich.map((v) => ({ id: v.id, title: v.tieuDe })),
			});
		}
		return hang;
	}, [coLich, chuaLich, moc.length, msg]);

	const events = useMemo<GanttEvent<DuLieuThanh>[]>(() => {
		const thanh: GanttEvent<DuLieuThanh>[] = coLich.map((v) => {
			const keoDuoc = v.suaDuoc && !chiDoc;
			const batDau = dauNgay(v.batDau as string);
			const ketThuc = new Date(dauNgay(v.han as string).getTime() + GANTT_DU_AN.ngayMs);
			return {
				id: v.id,
				title: v.tieuDe,
				start: batDau,
				end: ketThuc,
				allDay: true,
				resourceId: v.id,
				color: TONE_COLOR[toneTheoNghia(v.nghia)],
				readOnly: !keoDuoc,
				draggable: keoDuoc,
				resizable: keoDuoc,
				dependencies: v.phaiCho.filter((id) => coLich.some((c) => c.id === id)),
				data: { loai: "viec", tone: toneTheoNghia(v.nghia) },
			};
		});
		const moi: GanttEvent<DuLieuThanh>[] = moc.map((m) => {
			const ngay = dauNgay(m.ngay);
			return {
				id: m.id,
				title: m.ten,
				start: ngay,
				end: ngay,
				allDay: true,
				resourceId: GANTT_DU_AN.hangMoc,
				color: TONE_COLOR[m.tre ? "error" : "neutral"],
				readOnly: true,
				draggable: false,
				resizable: false,
				dependencies: m.cho.filter((id) => coLich.some((c) => c.id === id)),
				data: { loai: "moc", ten: m.ten, tre: m.tre },
			};
		});
		return [...moi, ...thanh];
	}, [coLich, moc, chiDoc]);

	const offDays = useMemo(
		() => ({
			weekendDays: lich.ngayNghiTuan.map(thuJs),
			dates: lich.ngayLe.map(dauNgay),
		}),
		[lich],
	);

	function onEventUpdate(update: GanttProposedUpdate<DuLieuThanh>) {
		if (update.event.data?.loai !== "viec" || !onDoiLich) return false;
		const han = new Date(update.end.getTime() - GANTT_DU_AN.ngayMs);
		onDoiLich({
			id: update.event.id,
			batDau: ngayCua(update.start),
			han: ngayCua(han),
			nguon: update.source === "keyboard" ? "phim" : "keo",
		});
	}

	const chuaLichIds = new Set(chuaLich.map((v) => v.id));

	const tam = useMemo(() => {
		const moc_ = [
			...coLich.flatMap((v) => [dauNgay(v.batDau as string), dauNgay(v.han as string)]),
			...moc.map((m) => dauNgay(m.ngay)),
		].map((d) => d.getTime());
		if (moc_.length === 0) return dauNgay(homNay);
		return new Date((Math.min(...moc_) + Math.max(...moc_)) / 2);
	}, [coLich, moc, homNay]);

	return (
		<Gantt<DuLieuThanh>
			className={className}
			resources={resources}
			events={events}
			defaultScale={GANTT_DU_AN.thangMacDinh}
			defaultDate={tam}
			initialCenter={tam}
			timeZone={GANTT_DU_AN.muiGio}
			weekStartsOn={1}
			locale={lichNgonNgu.dateFns}
			i18n={i18n}
			offDays={offDays}
			rowCheckboxes={false}
			treePanel={hep ? GANTT_DU_AN.cotHep : undefined}
			getEventAttributes={thuocTinhThanh}
			metrics={{ unitWidths: { month: GANTT_DU_AN.rongNgayRem, week: GANTT_DU_AN.rongNgayRem } }}
			wheelZoom={false}
			dragCreate={false}
			summaryBars={false}
			baselineBars={false}
			parentScheduling={false}
			scheduleMode="single"
			interactions={{ drag: !chiDoc, resize: !chiDoc, selectSlot: false }}
			onEventUpdate={onEventUpdate}
			onEventClick={
				onMoViec
					? (occurrence) => {
							if (occurrence.event.data?.loai === "viec") onMoViec(occurrence.event.id);
						}
					: undefined
			}
			renderResourceLabel={({ resource }) =>
				chuaLichIds.has(resource.id) && onDatNgay && !chiDoc ? (
					<span className="flex min-w-0 items-center gap-2">
						<span className="truncate" translate="no">
							{resource.title}
						</span>
						<Button size="sm" variant="outline" onClick={() => onDatNgay(resource.id)}>
							{msg.datNgay}
						</Button>
					</span>
				) : (
					<span className="truncate" translate={resource.id.startsWith("__") ? undefined : "no"}>
						{resource.title}
					</span>
				)
			}
		>
			<GanttNav />
			<GanttView key={hep ? "hep" : "rong"} />
		</Gantt>
	);
}
