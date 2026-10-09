import { eveTurnReference } from "@crm/validation/eve-stream";
import {
	type BanNhap,
	docBanNhap,
	docKetQuaNop,
	type LyDoTuChoiNop,
} from "@crm/validation/okr-cuoc-soan";
import { chuanHoa } from "@crm/validation/okr-kiem";
import type { MessageStreamEvent } from "eve/client";
import type { EveMessage } from "eve/react";
import type { TranscriptItem, TranscriptMessage } from "@/lib/agent-transcript";
import { SOAN_UI } from "./cau-hinh";

type MucTieuVao = BanNhap["mucTieu"][number];
type KrVao = MucTieuVao["kr"][number];

export type DemDoi = {
	themMucTieu: number;
	themKr: number;
	sua: number;
	chuyen: number;
	bo: number;
};

export type TomTatMoc =
	| { docDuoc: false }
	| {
			docDuoc: true;
			dau: true;
			mucTieu: number;
			kr: number;
			dongDoi: string[];
	  }
	| ({ docDuoc: true; dau: false; dongDoi: string[] } & DemDoi);

export type MocNop = { itemId: string; tom: TomTatMoc };

export type NopKhongThanh = {
	itemId: string;
	loai: "tu-choi" | "loi" | "khong-doc";
	lyDo: LyDoTuChoiNop | null;
};

export type LuotNop = { mocs: MocNop[]; khongThanh: NopKhongThanh[] };

export const khoaMucTieu = (khoa: string): string => `muc-tieu-moi:${khoa}`;

export const khoaKr = (chaKhoa: string, khoa: string): string =>
	`kr-moi:${chaKhoa}:${khoa}`;

const noiDungMucTieu = (m: MucTieuVao): string =>
	JSON.stringify([m.ten, m.viSaoLucNay, m.loai, m.viSao, m.canChinhId ?? null]);

const noiDungKr = (k: KrVao): string =>
	JSON.stringify([
		k.ten,
		k.kieu,
		k.donVi,
		k.khoiDiemGoiY ?? null,
		k.dich ?? null,
		k.viSao,
	]);

type KrPhang = { khoa: string; cha: string; kr: KrVao };

function phang(b: BanNhap): KrPhang[] {
	return b.mucTieu.flatMap((m) =>
		m.kr.map((kr) => ({ khoa: khoaKr(m.khoa, kr.khoa), cha: m.khoa, kr })),
	);
}

function tomTatTu(truoc: BanNhap | null, sau: BanNhap): TomTatMoc {
	const krSau = phang(sau);
	if (!truoc)
		return {
			docDuoc: true,
			dau: true,
			mucTieu: sau.mucTieu.length,
			kr: krSau.length,
			dongDoi: [],
		};
	const mtTruoc = new Map(truoc.mucTieu.map((m) => [m.khoa, m] as const));
	const mtSau = new Set(sau.mucTieu.map((m) => m.khoa));
	const krTruoc = phang(truoc);
	const coSau = new Set(krSau.map((k) => k.khoa));
	const roiDi = krTruoc.filter((k) => !coSau.has(k.khoa));
	const daChuyen = new Set<string>();
	const dem: DemDoi = { themMucTieu: 0, themKr: 0, sua: 0, chuyen: 0, bo: 0 };
	const dongDoi: string[] = [];
	const theoKhoa = new Map(krTruoc.map((k) => [k.khoa, k] as const));
	for (const m of sau.mucTieu) {
		const cu = mtTruoc.get(m.khoa);
		if (!cu) {
			dem.themMucTieu += 1;
			dongDoi.push(khoaMucTieu(m.khoa));
		} else if (noiDungMucTieu(cu) !== noiDungMucTieu(m)) {
			dem.sua += 1;
			dongDoi.push(khoaMucTieu(m.khoa));
		}
		for (const kr of m.kr) {
			const khoa = khoaKr(m.khoa, kr.khoa);
			const cuKr = theoKhoa.get(khoa);
			if (cuKr) {
				if (noiDungKr(cuKr.kr) !== noiDungKr(kr)) {
					dem.sua += 1;
					dongDoi.push(khoa);
				}
				continue;
			}
			const nguon = roiDi.find(
				(r) =>
					!daChuyen.has(r.khoa) &&
					r.cha !== m.khoa &&
					(r.kr.khoa === kr.khoa || chuanHoa(r.kr.ten) === chuanHoa(kr.ten)),
			);
			if (nguon) {
				daChuyen.add(nguon.khoa);
				dem.chuyen += 1;
			} else {
				dem.themKr += 1;
			}
			dongDoi.push(khoa);
		}
	}
	for (const m of truoc.mucTieu) if (!mtSau.has(m.khoa)) dem.bo += 1;
	for (const r of roiDi)
		if (!daChuyen.has(r.khoa) && mtSau.has(r.cha)) dem.bo += 1;
	return { docDuoc: true, dau: false, dongDoi, ...dem };
}

export function tomTatMoc(
	truoc: BanNhap | null,
	sau: BanNhap | null,
): TomTatMoc {
	return sau ? tomTatTu(truoc, sau) : { docDuoc: false };
}

type DidNop = Extract<TranscriptItem, { kind: "did" }>;

const laNop = (item: TranscriptItem): item is DidNop =>
	item.kind === "did" && item.tool === SOAN_UI.congCuNop;

function khongThanh(item: DidNop): NopKhongThanh | null {
	if (item.pending) return null;
	if (item.failed) return { itemId: item.id, loai: "loi", lyDo: null };
	const kq = docKetQuaNop(item.output);
	if (!kq) return { itemId: item.id, loai: "khong-doc", lyDo: null };
	if (kq.ketQua === "tu-choi")
		return { itemId: item.id, loai: "tu-choi", lyDo: kq.lyDo };
	return null;
}

export function luotNop(items: readonly TranscriptItem[]): LuotNop {
	const mocs: MocNop[] = [];
	const hong: NopKhongThanh[] = [];
	let truoc: BanNhap | null = null;
	for (const item of items) {
		if (!laNop(item) || item.pending) continue;
		const loi = khongThanh(item);
		if (loi) {
			hong.push(loi);
			continue;
		}
		const ban = docBanNhap(item.input);
		mocs.push({
			itemId: item.id,
			tom: ban ? tomTatTu(truoc, ban) : { docDuoc: false },
		});
		if (ban) truoc = ban;
	}
	return { mocs, khongThanh: hong };
}

export function mocTuTranscript(items: readonly TranscriptItem[]): MocNop[] {
	return luotNop(items).mocs;
}

export function gioNopCuoi(
	transcript: readonly TranscriptMessage[],
	messages: readonly EveMessage[],
	events: readonly MessageStreamEvent[],
): number | null {
	const tin = transcript.findLast((t) =>
		t.items.some((i) => laNop(i) && !i.pending && khongThanh(i) === null),
	);
	const luot = messages.find((x) => x.id === tin?.id)?.metadata?.turnId;
	if (!luot) return null;
	const suKien = events.find(
		(e) =>
			eveTurnReference.parse("data" in e ? e.data : undefined).turnId === luot,
	);
	const at = suKien ? Date.parse(suKien.meta.at) : Number.NaN;
	return Number.isNaN(at) ? null : at;
}
