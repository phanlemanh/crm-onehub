import {
	type KieuKr,
	kiemSoTheoKieu,
	kieuKr,
	soKr,
} from "@crm/validation/okr-kr";
import { boDau, khoa, tachO } from "../to-chuc/nhap";
import type { OkrDongNhapOutput } from "./okr.contracts";
import { OKR } from "./okr-config";

const N = OKR.thongDiep.nhap;

export type SnapNhapOkr = {
	members: { id: string; email: string }[];
	daCo: string[];
	tranConLai: number | null;
	tranKr: number | null;
};

export type KrNhap = {
	line: number;
	title: string;
	kind: KieuKr;
	startValue: number;
	targetValue: number;
	unit: string;
	ownerUserId: string;
};

export type MucTieuNhap = { title: string; keyResults: KrNhap[] };

export type KetQuaNhapOkr = {
	rows: OkrDongNhapOutput[];
	mucTieu: MucTieuNhap[];
	summary: { valid: number; invalid: number; objectives: number };
	vuotTran: boolean;
	vuotTranKr: boolean;
};

const kieuTheoChu = new Map<string, string>(Object.entries(OKR.nhap.kieu));

const nhomNghin = /^-?\d{1,3}(\.\d{3})+$/;

function tachTheo(dong: string, ngan: string): string[] {
	const o: string[] = [];
	let hienTai = "";
	let trongNgoac = false;
	for (let i = 0; i < dong.length; i += 1) {
		const k = dong[i];
		if (k === '"') {
			if (trongNgoac && dong[i + 1] === '"') {
				hienTai += '"';
				i += 1;
			} else trongNgoac = !trongNgoac;
		} else if (k === ngan && !trongNgoac) {
			o.push(hienTai.trim());
			hienTai = "";
		} else hienTai += k;
	}
	o.push(hienTai.trim());
	return o;
}

function tachOOkr(dong: string): string[] {
	if (dong.includes("\t")) return tachO(dong);
	const theoChamPhay = tachTheo(dong, ";");
	if (
		theoChamPhay.length > 1 &&
		theoChamPhay.length >= tachTheo(dong, ",").length
	)
		return theoChamPhay;
	return tachO(dong);
}

export function dongLoOkr(chu: string): { line: number; o: string[] }[] {
	const dong = chu
		.split(/\r?\n/)
		.map((d, i) => ({ line: i + 1, d }))
		.filter((x) => x.d.trim() !== "")
		.map((x) => ({ line: x.line, o: tachOOkr(x.d) }));
	const dau = boDau(dong[0]?.o[0] ?? "");
	if (OKR.nhap.tenCotDau.some((t) => t === dau)) return dong.slice(1);
	return dong;
}

function docSo(o: string): number | null {
	const s = o.replace(/\s/g, "");
	const n =
		s.includes(",") || nhomNghin.test(s)
			? Number(s.replace(/\./g, "").replace(",", "."))
			: Number(s);
	return soKr.safeParse(n).success ? n : null;
}

function docKieu(o: string): KieuKr | null {
	const r = kieuKr.safeParse(kieuTheoChu.get(boDau(o)));
	return r.success ? r.data : null;
}

type MacDinh = { khoi: number | null; dich: number | null };

function macDinh(kind: KieuKr): MacDinh {
	if (kind === "moc") return { khoi: 0, dich: 1 };
	if (kind === "phan-tram") return { khoi: 0, dich: null };
	return { khoi: null, dich: null };
}

const trongKhoang = (s: string, toiDa: number) =>
	s.length >= OKR.ten.toiThieu && s.length <= toiDa;

function dungDoDai(r: OkrDongNhapOutput): boolean {
	return (
		trongKhoang(r.objective, OKR.ten.mucTieuToiDa) &&
		trongKhoang(r.keyResult, OKR.ten.krToiDa) &&
		r.unit.length <= OKR.ten.donViDo
	);
}

type Doc =
	| { loi: string }
	| { kind: KieuKr; ownerUserId: string; khoi: number; dich: number };

function docDong(r: OkrDongNhapOutput, nguoi: Map<string, string>): Doc {
	if (r.objective === "") return { loi: N.thieuMucTieu };
	if (r.keyResult === "") return { loi: N.thieuKr };
	if (!dungDoDai(r)) return { loi: N.doDai };
	const kind = docKieu(r.kind);
	if (kind === null) return { loi: N.kieuLa };
	const ownerUserId = nguoi.get(khoa(r.email));
	if (ownerUserId === undefined) return { loi: N.emailLa };
	const md = macDinh(kind);
	if (r.target === "" && md.dich === null) return { loi: N.thieuDich };
	const khoi = r.start === "" ? md.khoi : docSo(r.start);
	const dich = r.target === "" ? md.dich : docSo(r.target);
	if (khoi === null || dich === null) return { loi: N.soLa };
	const sai = kiemSoTheoKieu(kind, khoi, dich);
	if (sai) return { loi: OKR.thongDiep.soTheoKieu[sai] };
	return { kind, ownerUserId, khoi, dich };
}

export function phanTichLoOkr(chu: string, snap: SnapNhapOkr): KetQuaNhapOkr {
	const nguoi = new Map(snap.members.map((m) => [khoa(m.email), m.id]));
	const daCo = new Set(snap.daCo.map(khoa));
	const nhom = new Map<string, MucTieuNhap>();
	const rows = dongLoOkr(chu).map(({ line, o }) => {
		const [
			objective = "",
			keyResult = "",
			kind = "",
			start = "",
			target = "",
			unit = "",
			email = "",
		] = o;
		const r: OkrDongNhapOutput = {
			line,
			objective,
			keyResult,
			kind,
			start,
			target,
			unit,
			email,
			error: null,
		};
		const d = docDong(r, nguoi);
		if ("loi" in d) return { ...r, error: d.loi };
		const k = khoa(objective);
		if (daCo.has(k)) return { ...r, error: N.daCo };
		const mt = nhom.get(k) ?? { title: objective, keyResults: [] };
		mt.keyResults.push({
			line,
			title: keyResult,
			kind: d.kind,
			startValue: d.khoi,
			targetValue: d.dich,
			unit,
			ownerUserId: d.ownerUserId,
		});
		nhom.set(k, mt);
		return r;
	});
	const mucTieu = [...nhom.values()];
	const tranKr = snap.tranKr;
	const valid = rows.filter((r) => r.error === null).length;
	return {
		rows,
		mucTieu,
		summary: {
			valid,
			invalid: rows.length - valid,
			objectives: mucTieu.length,
		},
		vuotTran:
			snap.tranConLai !== null &&
			mucTieu.length > 0 &&
			mucTieu.length > snap.tranConLai,
		vuotTranKr:
			tranKr !== null && mucTieu.some((m) => m.keyResults.length > tranKr),
	};
}
