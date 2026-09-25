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
	soKr: number;
};

export type SoRieng = {
	tongKr: number;
	chuaKhoiDiem: number;
	chuaNoiKenh: number;
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

function hang(
	key: string,
	ten: string,
	cap: HangToanCanh["cap"],
	ds: MucTieuTinh[],
): HangToanCanh {
	return {
		key,
		ten,
		cap,
		tienDo: trungBinh(ds.map((m) => m.progress)),
		kyVong: trungBinh(
			ds.flatMap((m) => (m.expected === null ? [] : [m.expected])),
		),
		soMucTieu: ds.length,
		soKr: ds.reduce((a, m) => a + m.soKr, 0),
	};
}

export function gopToanCanh(
	cay: CayGon,
	congBo: MucTieuTinh[],
	tenGoc: string,
): ToanCanhOutput {
	const theoKhoa = new Map<string, MucTieuTinh[]>();
	for (const m of congBo) {
		const k = khoaCuaMucTieu(m);
		if (k === null) continue;
		theoKhoa.set(k, [...(theoKhoa.get(k) ?? []), m]);
	}
	const cua = (k: string) => theoKhoa.get(k) ?? [];
	const ra: HangToanCanh[] = [hang("goc", tenGoc, "goc", cua("goc"))];
	const donVi: { ten: string; khoa: string }[] = [];
	for (const b of cay.divisions) {
		const conBp = b.departments.flatMap((p) => cua(`pb:${p.id}`));
		ra.push(
			hang(`bp:${b.id}`, b.name, "bo-phan", [...cua(`bp:${b.id}`), ...conBp]),
		);
		donVi.push({ ten: b.name, khoa: `bp:${b.id}` });
		for (const p of b.departments) {
			ra.push(hang(`pb:${p.id}`, p.name, "phong-ban", cua(`pb:${p.id}`)));
			donVi.push({ ten: p.name, khoa: `pb:${p.id}` });
		}
	}
	for (const p of cay.chuaXep) {
		ra.push(hang(`pb:${p.id}`, p.name, "phong-ban", cua(`pb:${p.id}`)));
		donVi.push({ ten: p.name, khoa: `pb:${p.id}` });
	}
	const cuaDonVi = congBo.filter((m) => khoaCuaMucTieu(m) !== null);
	const daDat = donVi.filter((d) => cua(d.khoa).length > 0);
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
		},
		hang: ra,
	};
}

const KHONG: SoRieng = { tongKr: 0, chuaKhoiDiem: 0, chuaNoiKenh: 0 };

const cong = (a: SoRieng, b: SoRieng): SoRieng => ({
	tongKr: a.tongKr + b.tongKr,
	chuaKhoiDiem: a.chuaKhoiDiem + b.chuaKhoiDiem,
	chuaNoiKenh: a.chuaNoiKenh + b.chuaNoiKenh,
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
