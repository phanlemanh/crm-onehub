import {
	BO_CA_GOP_Y,
	type CaGopY,
	caGopY,
	parseCaGopY,
} from "@crm/validation/okr-ca-gop-y";
import { z } from "zod";
import { LoiBoMau, OKR_MAU } from "./cau-hinh";
import type { BoOkrMau, MucTieuMau } from "./khuon";

const Q = OKR_MAU.caQuy4;

const dongNhan = z.strictObject({
	ma: z.string().trim().min(1),
	bo: z.enum(BO_CA_GOP_Y),
	kyVong: caGopY.shape.kyVong,
	ghiChu: z.string().trim().max(500),
});

const tepNhan = z.strictObject({ ca: z.array(dongNhan) });

export type DongNhan = z.infer<typeof dongNhan>;

const sai = (cau: string) => new LoiBoMau(OKR_MAU.ma.sai, cau);

const CAP_QUY: readonly string[] = Q.capQuy;

export function chonMucTieuQuy4(bo: BoOkrMau): MucTieuMau[] {
	return bo.mucTieu.filter(
		(m) =>
			m.trangThai === Q.congBo &&
			((m.chuKy === Q.chuKyQuy && CAP_QUY.includes(m.cap)) ||
				(m.chuKy === Q.chuKyNam && m.cap === Q.capNam)),
	);
}

function tenDonVi(bo: BoOkrMau, m: MucTieuMau): string {
	if (m.cap === Q.capNam) return bo.congTy;
	const ds = m.cap === "bo-phan" ? bo.boPhan : bo.phongBan;
	const dv = ds.find((d) => d.ma === m.donVi);
	if (!dv) throw sai(`${m.ma}: không có đơn vị ${m.donVi ?? ""}`);
	return dv.ten;
}

export function capTrenCua(bo: BoOkrMau, m: MucTieuMau): MucTieuMau | null {
	const cc = m.canChinh;
	if (!cc) return null;
	const dich = cc.mucTieu
		? bo.mucTieu.find((x) => x.ma === cc.mucTieu)
		: bo.mucTieu.find((x) => x.krs.some((k) => k.ma === cc.kr));
	return dich && dich.cap === Q.capNam ? dich : null;
}

const mucTieuCa = (m: MucTieuMau) => ({
	title: m.ten,
	whyNow: m.viSao,
	kind: m.kieu,
});

const krCa = (m: MucTieuMau) =>
	m.krs.map((k) => ({
		title: k.ten,
		kind: k.kieu,
		startValue: k.khoi,
		targetValue: k.dich,
		unit: k.donVi,
	}));

function caTu(bo: BoOkrMau, m: MucTieuMau, d: DongNhan): CaGopY {
	const id = `${d.bo === "ng" ? Q.tienToNg : Q.tienTo}${m.ma}`;
	const tren = d.bo === "ng" ? capTrenCua(bo, m) : null;
	const capTren = tren
		? { mucTieu: mucTieuCa(tren), krs: krCa(tren) }
		: undefined;
	const ca = {
		id,
		bo: d.bo,
		ngonNgu: Q.ngonNgu,
		donVi: { cap: m.cap, ten: tenDonVi(bo, m) },
		mucTieu: mucTieuCa(m),
		krs: krCa(m),
		capTren,
		kyVong: d.kyVong,
		ghiChu: d.ghiChu,
	};
	try {
		return parseCaGopY(ca, id);
	} catch (loi) {
		throw sai(loi instanceof Error ? loi.message : String(loi));
	}
}

const tenDong = z.object({ ma: z.string(), bo: z.string() });

function caCuaDong(tho: z.infer<typeof tepTho>, chiSo: PropertyKey): string {
	const i = z.number().int().safeParse(chiSo);
	const d = tenDong.safeParse(i.success ? tho.ca[i.data] : undefined);
	if (!d.success) return `dòng ${String(chiSo)}`;
	return `${d.data.bo === "ng" ? Q.tienToNg : Q.tienTo}${d.data.ma}`;
}

const tepTho = z.object({ ca: z.array(z.json()) });

export function docNhan(chu: string, tep: string): DongNhan[] {
	let json: z.infer<typeof tepTho>;
	try {
		json = tepTho.parse(JSON.parse(chu));
	} catch (loi) {
		throw sai(
			`Tệp nhãn ${tep} không đọc được: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
	const r = tepNhan.safeParse(json);
	if (r.success) return r.data.ca;
	const dong = r.error.issues.map((i) => {
		const [, chiSo, ...con] = i.path;
		return `${caCuaDong(json, chiSo ?? "")}: ${con.map(String).join(".")}: ${i.message}`;
	});
	throw sai(`Tệp nhãn ${tep} sai khuôn — ${dong.join("; ")}`);
}

function loiNhan(bo: BoOkrMau, nhan: DongNhan[]): string[] {
	const chon = new Set(chonMucTieuQuy4(bo).map((m) => m.ma));
	const loi: string[] = [];
	const daThay = new Set<string>();
	for (const d of nhan) {
		const khoa = `${d.bo}:${d.ma}`;
		if (daThay.has(khoa)) loi.push(`${d.ma}: nhãn ${d.bo} trùng`);
		daThay.add(khoa);
		const m = bo.mucTieu.find((x) => x.ma === d.ma);
		if (!m) loi.push(`${d.ma}: không có mục tiêu này trong bộ mẫu`);
		else if (!chon.has(d.ma))
			loi.push(
				`${d.ma}: mục tiêu không được chọn — nháp, chờ duyệt, đã bỏ, hay ngoài quý 4 và OneHub của năm`,
			);
		else if (d.bo === "ng" && (m.cap !== "phong-ban" || !capTrenCua(bo, m)))
			loi.push(`${d.ma}: ca NG cần mục tiêu phòng ban có căn chỉnh lên OneHub`);
	}
	for (const ma of chon)
		if (!daThay.has(`viet-lai:${ma}`)) loi.push(`${ma}: thiếu nhãn viết lại`);
	return loi;
}

export function sinhCaQuy4(bo: BoOkrMau, dong: DongNhan[]): CaGopY[] {
	const loi = loiNhan(bo, dong);
	if (loi.length) throw sai(loi.join("\n"));
	const chon = chonMucTieuQuy4(bo);
	const ca: CaGopY[] = [];
	for (const d of dong) {
		const m = chon.find((x) => x.ma === d.ma);
		if (!m) continue;
		try {
			ca.push(caTu(bo, m, d));
		} catch (e) {
			loi.push(e instanceof Error ? e.message : String(e));
		}
	}
	if (loi.length) throw sai(loi.join("\n"));
	return [...ca].sort((a, b) => a.id.localeCompare(b.id));
}

type Json = z.infer<ReturnType<typeof z.json>>;

const mangNguyenTo = z.array(
	z.union([z.string(), z.number(), z.boolean(), z.null()]),
);
const mangJson = z.array(z.json());
const doiTuongJson = z.record(z.string(), z.json());

function inGiaTri(v: Json, thut: string): string {
	const nguyenTo = mangNguyenTo.safeParse(v);
	if (nguyenTo.success)
		return `[${nguyenTo.data.map((x) => JSON.stringify(x)).join(", ")}]`;
	const mang = mangJson.safeParse(v);
	if (mang.success) {
		const con = mang.data.map((x) => `${thut}\t${inGiaTri(x, `${thut}\t`)}`);
		return `[\n${con.join(",\n")}\n${thut}]`;
	}
	const doiTuong = doiTuongJson.safeParse(v);
	if (doiTuong.success) {
		const con = Object.entries(doiTuong.data).map(
			([k, x]) => `${thut}\t${JSON.stringify(k)}: ${inGiaTri(x, `${thut}\t`)}`,
		);
		return `{\n${con.join(",\n")}\n${thut}}`;
	}
	return JSON.stringify(v);
}

export function inCa(ca: CaGopY): string {
	return `${inGiaTri(z.json().parse(JSON.parse(JSON.stringify(ca))), "")}\n`;
}
