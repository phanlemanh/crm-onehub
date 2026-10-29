import {
	congTuan,
	type KrSo,
	moiNhat,
	moiNhatDenTuan,
	soTuanCuaNhom,
} from "@crm/db/okr-hop-tuan";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import type { CapMucTieu } from "@crm/validation/okr-muc-tieu";
import type {
	HangSucKhoe,
	HangToanCanh,
	SucKhoeOutput,
	ToanCanhOutput,
} from "./okr-xem.contracts";

type NguoiGon = { id: string; name: string };
type PhongBanGon = { id: string; name: string; head: NguoiGon | null };

export type CayGon = {
	divisions: (PhongBanGon & { departments: PhongBanGon[] })[];
	chuaXep: PhongBanGon[];
};

export type MucTieuTinh = {
	level: CapMucTieu;
	unitId: string | null;
	progress: number;
	expected: number | null;
	kr: KrSo[];
};

export type SoRieng = {
	tongKr: number;
	chuaKhoiDiem: number;
	chuaNoiKenh: number;
	dungTuan: number;
	krIm: number;
};

export const khoaCuaMucTieu = (m: {
	level: CapMucTieu;
	unitId: string | null;
}): string | null => {
	switch (m.level) {
		case "onehub":
			return "goc";
		case "bo-phan":
			return `bp:${m.unitId}`;
		case "phong-ban":
			return `pb:${m.unitId}`;
		case "ca-nhan":
			return null;
	}
};

const trungBinh = (so: number[]): number | null =>
	so.length === 0
		? null
		: Math.round(so.reduce((a, b) => a + b, 0) / so.length);

export type NhipKy = { tuanKy: string[]; homNay: Date };

export function dungHangSo(
	key: string,
	ten: string,
	cap: HangToanCanh["cap"],
	ds: MucTieuTinh[],
	nhip: NhipKy,
): HangToanCanh {
	const kr = ds.flatMap((m) => m.kr);
	return {
		key,
		ten,
		cap,
		tienDo: trungBinh(ds.map((m) => m.progress)),
		kyVong: trungBinh(
			ds.flatMap((m) => (m.expected === null ? [] : [m.expected])),
		),
		soMucTieu: ds.length,
		soKr: kr.length,
		...soTuanCuaNhom(kr, nhip.tuanKy, nhip.homNay),
	};
}

const CAP_THEO_LEVEL = {
	onehub: "goc",
	"bo-phan": "bo-phan",
	"phong-ban": "phong-ban",
} as const satisfies Partial<Record<CapMucTieu, HangToanCanh["cap"]>>;

export function soRiengTheoKhoa(
	ds: MucTieuTinh[],
	nhip: NhipKy,
): HangToanCanh[] {
	const theoKhoa = new Map<
		string,
		{ cap: HangToanCanh["cap"]; ds: MucTieuTinh[] }
	>();
	for (const m of ds) {
		const k = khoaCuaMucTieu(m);
		if (k === null || m.level === "ca-nhan") continue;
		const nhom = theoKhoa.get(k);
		theoKhoa.set(k, {
			cap: CAP_THEO_LEVEL[m.level],
			ds: [...(nhom?.ds ?? []), m],
		});
	}
	return [...theoKhoa].map(([k, n]) => dungHangSo(k, "", n.cap, n.ds, nhip));
}

export function gopToanCanh(
	cay: CayGon,
	congBo: MucTieuTinh[],
	tenGoc: string,
	nhip: NhipKy,
): ToanCanhOutput {
	const theoKhoa = new Map<string, MucTieuTinh[]>();
	for (const m of congBo) {
		const k = khoaCuaMucTieu(m);
		if (k === null) continue;
		theoKhoa.set(k, [...(theoKhoa.get(k) ?? []), m]);
	}
	const cua = (k: string) => theoKhoa.get(k) ?? [];
	const ra: HangToanCanh[] = [
		dungHangSo("goc", tenGoc, "goc", cua("goc"), nhip),
	];
	const donVi: { ten: string; khoa: string }[] = [];
	for (const b of cay.divisions) {
		const conBp = b.departments.flatMap((p) => cua(`pb:${p.id}`));
		ra.push(
			dungHangSo(
				`bp:${b.id}`,
				b.name,
				"bo-phan",
				[...cua(`bp:${b.id}`), ...conBp],
				nhip,
			),
		);
		donVi.push({ ten: b.name, khoa: `bp:${b.id}` });
		for (const p of b.departments) {
			ra.push(
				dungHangSo(`pb:${p.id}`, p.name, "phong-ban", cua(`pb:${p.id}`), nhip),
			);
			donVi.push({ ten: p.name, khoa: `pb:${p.id}` });
		}
	}
	for (const p of cay.chuaXep) {
		ra.push(
			dungHangSo(`pb:${p.id}`, p.name, "phong-ban", cua(`pb:${p.id}`), nhip),
		);
		donVi.push({ ten: p.name, khoa: `pb:${p.id}` });
	}
	const cuaDonVi = congBo.filter((m) => khoaCuaMucTieu(m) !== null);
	const daDat = donVi.filter((d) => cua(d.khoa).length > 0);
	const tuanNay = dauTuanVN(nhip.homNay);
	const tuanTruoc = congTuan(tuanNay, -1);
	const moiKr = congBo.flatMap((m) => m.kr);
	const coTrongTuan = (t: string) =>
		moiKr.filter((k) => k.lan.some((l) => l.tuan === t)).length;
	const thapDen = (t: string | null) =>
		moiKr.filter(
			(k) => (t === null ? moiNhat(k) : moiNhatDenTuan(k, t))?.tuTin === "thap",
		).length;
	return {
		tongQuan: {
			tienDo: trungBinh(cuaDonVi.map((m) => m.progress)),
			kyVong: trungBinh(
				cuaDonVi.flatMap((m) => (m.expected === null ? [] : [m.expected])),
			),
			donViCongBo: daDat.length,
			tongDonVi: donVi.length,
			donViChuaDat: donVi
				.filter((d) => cua(d.khoa).length === 0)
				.map((d) => d.ten),
			tongKr: moiKr.length,
			daCapNhat: coTrongTuan(tuanNay),
			daCapNhatTruoc: coTrongTuan(tuanTruoc),
			tuTinThap: thapDen(null),
			tuTinThapTruoc: thapDen(tuanTruoc),
		},
		tuan: nhip.tuanKy,
		tuanNay,
		hang: ra,
	};
}

export const KHONG: SoRieng = {
	tongKr: 0,
	chuaKhoiDiem: 0,
	chuaNoiKenh: 0,
	dungTuan: 0,
	krIm: 0,
};

export const cong = (a: SoRieng, b: Partial<SoRieng>): SoRieng => ({
	tongKr: a.tongKr + (b.tongKr ?? 0),
	chuaKhoiDiem: a.chuaKhoiDiem + (b.chuaKhoiDiem ?? 0),
	chuaNoiKenh: a.chuaNoiKenh + (b.chuaNoiKenh ?? 0),
	dungTuan: a.dungTuan + (b.dungTuan ?? 0),
	krIm: a.krIm + (b.krIm ?? 0),
});

export function gopSucKhoe(
	cay: CayGon,
	rieng: Map<string, SoRieng>,
	tenGoc: string,
): SucKhoeOutput {
	const so = (k: string) => rieng.get(k) ?? KHONG;
	const dong = (
		key: string,
		ten: string,
		cap: HangSucKhoe["cap"],
		truong: NguoiGon | null,
		s: SoRieng,
	): HangSucKhoe => ({ key, ten, cap, truong, ...s });
	const ra: HangSucKhoe[] = [dong("goc", tenGoc, "goc", null, so("goc"))];
	let tong = so("goc");
	for (const b of cay.divisions) {
		const gop = b.departments.reduce(
			(a, p) => cong(a, so(`pb:${p.id}`)),
			so(`bp:${b.id}`),
		);
		ra.push(dong(`bp:${b.id}`, b.name, "bo-phan", b.head, gop));
		tong = cong(tong, gop);
		for (const p of b.departments)
			ra.push(
				dong(`pb:${p.id}`, p.name, "phong-ban", p.head, so(`pb:${p.id}`)),
			);
	}
	for (const p of cay.chuaXep) {
		ra.push(dong(`pb:${p.id}`, p.name, "phong-ban", p.head, so(`pb:${p.id}`)));
		tong = cong(tong, so(`pb:${p.id}`));
	}
	return { tongQuan: tong, hang: ra };
}
