import {
	type KieuKr,
	kiemSoTheoKieu,
	kieuKr,
	soKr,
} from "@crm/validation/okr-kr";
import { boDau, khoa, tachDong } from "../to-chuc/nhap";
import type { OkrDongNhapOutput } from "./okr.contracts";
import { OKR } from "./okr-config";

const N = OKR.thongDiep.nhap;

export type SnapNhapOkr = {
	members: { id: string; email: string }[];
	daCo: string[];
	tranConLai: number | null;
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
};

const kieuTheoChu = new Map<string, string>(Object.entries(OKR.nhap.kieu));

export function dongLoOkr(chu: string): { line: number; o: string[] }[] {
	const dong = tachDong(chu);
	const dau = boDau(dong[0]?.o[0] ?? "");
	if (OKR.nhap.tenCotDau.some((t) => t === dau)) return dong.slice(1);
	return dong;
}

function docSo(o: string): number | null {
	const s = o.replace(/\s/g, "");
	const n = s.includes(",")
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

type Doc =
	| { loi: string }
	| { kind: KieuKr; ownerUserId: string; khoi: number; dich: number };

function docDong(r: OkrDongNhapOutput, nguoi: Map<string, string>): Doc {
	if (r.objective === "") return { loi: N.thieuMucTieu };
	if (r.keyResult === "") return { loi: N.thieuKr };
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
			title: keyResult.slice(0, OKR.ten.krToiDa),
			kind: d.kind,
			startValue: d.khoi,
			targetValue: d.dich,
			unit: unit.slice(0, OKR.ten.donViDo),
			ownerUserId: d.ownerUserId,
		});
		nhom.set(k, mt);
		return r;
	});
	const mucTieu = [...nhom.values()].map((m) => ({
		...m,
		title: m.title.slice(0, OKR.ten.mucTieuToiDa),
	}));
	const valid = rows.filter((r) => r.error === null).length;
	return {
		rows,
		mucTieu,
		summary: {
			valid,
			invalid: rows.length - valid,
			objectives: mucTieu.length,
		},
		vuotTran: snap.tranConLai !== null && mucTieu.length > snap.tranConLai,
	};
}
