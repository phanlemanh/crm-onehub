"use client";

import { CardTableEmpty } from "@crm/ui/components/card-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { dateFormat, formatDay, toDay } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { BAC_GHI_DANH, MA_CHI_SO } from "@crm/validation/okr-chi-so";
import { KIEU_KR, NGUON_KR } from "@crm/validation/okr-kr";
import {
	CAP_MUC_TIEU,
	LOAI_MUC_TIEU,
	TRANG_THAI_MUC_TIEU,
} from "@crm/validation/okr-muc-tieu";
import type { OkrVetSnapshot } from "@crm/validation/okr-vet";
import { useQuery } from "@tanstack/react-query";
import { okrMessages } from "@/lib/messages/okr";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { okrSoMessages } from "@/lib/messages/okr-so";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { type CayDuLieu, CELL } from "./kieu";
import { docKhoaPhamVi, hienPhamVi, KHOA_NGUON } from "./nguon-so";

type ChiTiet = RouterOutputs["okr"]["objective"];
type Vet = ChiTiet["trail"][number];

const KHOA_HIEN = [
	"title",
	"kind",
	"level",
	"status",
	"ownerUserId",
	"participantIds",
	"whyNow",
	"startValue",
	"targetValue",
	"currentValue",
	"unit",
	"dueOn",
	"weight",
	"targetObjectiveId",
	"targetKeyResultId",
	"nguon",
	"nguonMay",
	"chiSo",
	"phamVi",
	"bac",
	"sheetId",
	"sheetO",
] as const;

type KhoaHien = (typeof KHOA_HIEN)[number];

const HANH_DONG_KR = ["tao-kr", "sua-kr", "xoa-kr"] as const;

const HANH_DONG_SUA = ["sua", "sua-kr"] as const;

const GHI_CHU_TRO_LY = /^tro-ly-okr:\S+$/;

function theoKara(note: string | null): boolean {
	return note !== null && GHI_CHU_TRO_LY.test(note);
}

const KHONG_CO = "—";

type BoiCanh = {
	locale: Locale;
	tenNguoi: (id: string) => string;
	tenMucTieuDich: (id: string) => string | null;
	tenKr: (id: string) => string | null;
	cay: CayDuLieu | undefined;
};

function giaTri(
	khoa: KhoaHien,
	v: OkrVetSnapshot[string] | undefined,
	bc: BoiCanh,
): string | null {
	const m = okrMessages(bc.locale);
	const s = okrSoMessages(bc.locale);
	if (v === null || v === undefined) return null;
	if (Array.isArray(v)) return v.map(bc.tenNguoi).join(", ");
	const chu = String(v);
	switch (khoa) {
		case "ownerUserId":
			return bc.tenNguoi(chu);
		case "status": {
			const t = TRANG_THAI_MUC_TIEU.find((x) => x === chu);
			return t ? m.trangThai[t] : chu;
		}
		case "kind": {
			const l = LOAI_MUC_TIEU.find((x) => x === chu);
			if (l) return m.loai[l];
			const k = KIEU_KR.find((x) => x === chu);
			return k ? m.kieu[k] : chu;
		}
		case "level": {
			const c = CAP_MUC_TIEU.find((x) => x === chu);
			return c ? m.hopThoai.capMucTieu[c] : chu;
		}
		case "dueOn":
			return formatDay(chu, bc.locale);
		case "targetObjectiveId":
			return bc.tenMucTieuDich(chu);
		case "targetKeyResultId":
			return bc.tenKr(chu);
		case "nguon":
		case "nguonMay": {
			const n = NGUON_KR.find((x) => x === chu);
			return n ? s.nguon[KHOA_NGUON[n]].nhan : chu;
		}
		case "chiSo": {
			const c = MA_CHI_SO.find((x) => x === chu);
			return c ? s.chiSo[c].nhan : chu;
		}
		case "bac": {
			const b = BAC_GHI_DANH.find((x) => x === chu);
			return b ? s.bac[b].nhan : chu;
		}
		case "phamVi": {
			const pv = docKhoaPhamVi(chu);
			if (!pv) return chu;
			const hien = hienPhamVi(pv, bc.cay, s);
			return hien.ten ? `${hien.nhan} · ${hien.ten}` : hien.nhan;
		}
		default:
			return chu;
	}
}

type ThayDoi = { khoa: KhoaHien; nhan: string; chu: string };

function thayDoi(vet: Vet, bc: BoiCanh): ThayDoi[] {
	const m = okrMessages(bc.locale);
	const laKr = HANH_DONG_KR.some((h) => h === vet.action);
	const haiPhia = vet.before !== null && vet.after !== null;
	return KHOA_HIEN.flatMap((khoa) => {
		const truoc = giaTri(khoa, vet.before?.[khoa], bc);
		const sau = giaTri(khoa, vet.after?.[khoa], bc);
		if (truoc === null && sau === null) return [];
		const nhan =
			laKr && khoa === "kind" ? m.hopThoai.kieuKr : m.vet.truong[khoa];
		const chu = haiPhia
			? `${truoc ?? KHONG_CO} → ${sau ?? KHONG_CO}`
			: (sau ?? truoc ?? KHONG_CO);
		return [{ khoa, nhan, chu }];
	});
}

function tenViec(vet: Vet, doi: ThayDoi[], locale: Locale): string {
	const m = okrMessages(locale);
	if (!theoKara(vet.note)) return m.hanhDong[vet.action];
	const g = okrGopYMessages(locale).vet;
	const motTruong = doi.length === 1 ? doi[0] : undefined;
	const viec =
		motTruong && HANH_DONG_SUA.some((h) => h === vet.action)
			? g.suaTruong(motTruong.nhan.toLocaleLowerCase(locale))
			: m.hanhDong[vet.action];
	return `${viec} — ${g.theoKara}`;
}

export function luc(at: string, locale: Locale): string {
	const d = new Date(at);
	const gio = dateFormat(locale, { hour: "2-digit", minute: "2-digit" });
	return `${formatDay(toDay(d), locale)} ${gio.format(d)}`;
}

export function BangVet({
	trail,
	keyResults,
	alignments,
}: {
	trail: Vet[];
	keyResults: ChiTiet["keyResults"];
	alignments: ChiTiet["alignments"];
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const trpc = useTRPC();
	const users = useQuery(trpc.users.list.queryOptions());
	const coNguon = trail.some((v) => v.action === "doi-nguon");
	const cay = useQuery({
		...trpc.org.tree.queryOptions(),
		enabled: coNguon,
	});

	const bc: BoiCanh = {
		locale,
		tenNguoi: (id) => users.data?.find((u) => u.id === id)?.name ?? id,
		tenMucTieuDich: (id) =>
			alignments.find(
				(a) => a.targetObjectiveId === id && a.targetKeyResultId === null,
			)?.objectiveTitle ?? null,
		tenKr: (id) =>
			alignments.find((a) => a.targetKeyResultId === id)?.keyResultTitle ??
			null,
		cay: cay.data,
	};

	const cot: SimpleTableColumn[] = [
		{ id: "luc", header: m.vet.cot.luc, width: "w-40" },
		{ id: "ai", header: m.vet.cot.ai, width: "w-36" },
		{ id: "viec", header: m.vet.cot.viec, width: "w-40" },
		{ id: "thayDoi", header: m.vet.cot.thayDoi },
	];

	const dong = [...trail].reverse();

	return (
		<SimpleTable columns={cot}>
			{dong.map((v) => {
				const doi = thayDoi(v, bc);
				const kr =
					v.keyResultId === null
						? null
						: (keyResults.find((k) => k.id === v.keyResultId)?.title ??
							giaTri("title", v.before?.title ?? v.after?.title, bc));
				return (
					<SimpleTableRow
						key={v.id}
						data-vet-hang={v.id}
						data-hanh-dong={v.action}
					>
						<TableCell className={`${CELL} tabular-nums`}>
							{luc(v.at, locale)}
						</TableCell>
						<TableCell className={CELL}>
							{v.actor ? (
								<span translate="no">{v.actor.name}</span>
							) : (
								<EmptyCellValue />
							)}
						</TableCell>
						<TableCell className={CELL}>
							<span className="flex min-w-0 flex-col gap-0.5 whitespace-normal">
								<span data-viec>{tenViec(v, doi, locale)}</span>
								{kr ? (
									<span
										className="text-muted-foreground text-xs"
										translate="no"
									>
										{kr}
									</span>
								) : null}
								{v.action === "tra-lai" && v.note ? (
									<span
										className="text-muted-foreground text-xs"
										data-ly-do-vet
										translate="no"
									>
										{v.note}
									</span>
								) : null}
							</span>
						</TableCell>
						<TableCell className={CELL}>
							<span className="flex min-w-0 flex-col gap-0.5 whitespace-normal">
								{doi.map((t) => (
									<span key={t.khoa} data-khoa={t.khoa}>
										{t.nhan}: <span translate="no">{t.chu}</span>
									</span>
								))}
							</span>
						</TableCell>
					</SimpleTableRow>
				);
			})}
			{dong.length === 0 ? (
				<SimpleTableRow>
					<TableCell colSpan={cot.length} className="p-0">
						<CardTableEmpty>{m.vet.rong}</CardTableEmpty>
					</TableCell>
				</SimpleTableRow>
			) : null}
		</SimpleTable>
	);
}
