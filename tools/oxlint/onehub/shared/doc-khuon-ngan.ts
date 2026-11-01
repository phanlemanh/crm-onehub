import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC_KHO = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../../..",
);

export const DUONG_KHUON = "design/patterns/ngan-ban-ghi.md";

export type NgoaiLe = { tep: string; khoi: string; lyDo: string };

export type KhuonNgan = {
	doiTuong: string[];
	khuonNhap: string;
	dangKy: string;
	kind: string[];
	ngoaiKhuon: { kind: string; lyDo: string }[];
	mauTep: string;
	cam: string[];
	camHo: string[];
	thayCho: Record<string, string>;
	ngoaiLe: NgoaiLe[];
};

type Nut =
	| { loai: "chuoi"; gia: string }
	| { loai: "ds"; gia: string[] }
	| { loai: "bang"; gia: Map<string, Nut> }
	| { loai: "dsBang"; gia: Map<string, Nut>[] };

function giaTri(tho: string): Nut {
	const t = tho.trim();
	if (!t.startsWith("[")) return { loai: "chuoi", gia: t };
	if (!t.endsWith("]")) throw new Error(`khuon: danh sach khong dong «${t}»`);
	const trong = t.slice(1, -1).trim();
	return {
		loai: "ds",
		gia: trong ? trong.split(",").map((x) => x.trim()) : [],
	};
}

function thut(dong: string): number {
	return dong.length - dong.trimStart().length;
}

function docKhoi(
	dong: string[],
	batDau: number,
	muc: number,
): [Map<string, Nut>, number] {
	const bang = new Map<string, Nut>();
	let i = batDau;
	while (i < dong.length) {
		const d = dong[i] ?? "";
		if (!d.trim()) {
			i++;
			continue;
		}
		const t = thut(d);
		if (t < muc) break;
		if (t > muc) throw new Error(`khuon: thut le o dong «${d.trim()}»`);
		const khop = /^([A-Za-z_]+):(.*)$/.exec(d.trim());
		if (!khop) throw new Error(`khuon: dong khong doc duoc «${d.trim()}»`);
		const khoa = khop[1] ?? "";
		const sau = khop[2] ?? "";
		if (sau.trim()) {
			bang.set(khoa, giaTri(sau));
			i++;
			continue;
		}
		const keTho = dong.slice(i + 1).find((x) => x.trim());
		if (keTho === undefined || thut(keTho) <= muc) {
			bang.set(khoa, { loai: "chuoi", gia: "" });
			i++;
			continue;
		}
		const ke = keTho.trim();
		if (ke.startsWith("- ") && /^- [a-z_]+:/.test(ke)) {
			const ds: Map<string, Nut>[] = [];
			i++;
			while ((dong[i] ?? "").trim().startsWith("- ")) {
				const dau = dong[i] ?? "";
				const mucCon = thut(dau) + 2;
				const chep = [
					" ".repeat(mucCon) + dau.trim().slice(2),
					...dong.slice(i + 1),
				];
				const [con, het] = docKhoi(chep, 0, mucCon);
				ds.push(con);
				i += het;
			}
			bang.set(khoa, { loai: "dsBang", gia: ds });
			continue;
		}
		if (ke.startsWith("- "))
			throw new Error(
				`khuon: khoa ${khoa} viet danh sach dang khoi, chi doc dang [a, b]`,
			);
		const [con, het] = docKhoi(dong, i + 1, muc + 2);
		bang.set(khoa, { loai: "bang", gia: con });
		i = het;
	}
	return [bang, i];
}

function chuoi(b: Map<string, Nut>, khoa: string): string {
	const v = b.get(khoa);
	if (v?.loai !== "chuoi" || !v.gia) throw new Error(`khuon: thieu khoa ${khoa}`);
	return v.gia;
}

function danhSach(b: Map<string, Nut>, khoa: string): string[] {
	const v = b.get(khoa);
	if (v?.loai !== "ds")
		throw new Error(`khuon: khoa ${khoa} khong phai danh sach [a, b]`);
	return v.gia;
}

function bangCon(b: Map<string, Nut>, khoa: string): Map<string, Nut> {
	const v = b.get(khoa);
	if (v?.loai !== "bang") throw new Error(`khuon: thieu khoi ${khoa}`);
	return v.gia;
}

function khoiCuaDong(muc: Map<string, Nut>, tep: string): string[] {
	const v = muc.get("khoi");
	if (v?.loai === "chuoi" && v.gia) return [v.gia];
	if (v?.loai === "ds" && v.gia.length) return v.gia;
	throw new Error(`khuon: ngoai_le ${tep} thieu khoi`);
}

function docNgoaiLe(goc: Map<string, Nut>): NgoaiLe[] {
	const v = goc.get("ngoai_le");
	if (!v) return [];
	if (v.loai !== "dsBang")
		throw new Error("khuon: ngoai_le khong phai danh sach ban ghi");
	return v.gia.flatMap((muc) => {
		const tep = chuoi(muc, "tep");
		const ly = muc.get("ly_do");
		const lyDo = ly?.loai === "chuoi" ? ly.gia : "";
		return khoiCuaDong(muc, tep).map((khoi) => ({ tep, khoi, lyDo }));
	});
}

function docNgoaiKhuon(
	nhanDien: Map<string, Nut>,
): { kind: string; lyDo: string }[] {
	const v = nhanDien.get("ngoai_khuon");
	if (!v) return [];
	if (v.loai !== "dsBang")
		throw new Error("khuon: nhan_dien.ngoai_khuon khong phai danh sach ban ghi");
	return v.gia.map((muc) => {
		const ly = muc.get("ly_do");
		return {
			kind: chuoi(muc, "kind"),
			lyDo: ly?.loai === "chuoi" ? ly.gia : "",
		};
	});
}

export function phanTichKhuon(nguon: string): KhuonNgan {
	const fm = /^---\n([\s\S]*?)\n---/.exec(nguon)?.[1];
	if (fm === undefined) throw new Error("khuon: thieu frontmatter");
	const [goc] = docKhoi(fm.split("\n"), 0, 0);
	const cam = danhSach(goc, "cam_ngoai_khuon");
	const camHo = danhSach(goc, "cam_ho");
	for (const h of camHo)
		if (!cam.includes(h))
			throw new Error(`khuon: cam_ho co ${h} ngoai cam_ngoai_khuon`);
	const bangThay = bangCon(goc, "thay_cho");
	const thayCho: Record<string, string> = {};
	for (const khoi of cam) {
		const v = bangThay.get(khoi);
		if (v?.loai !== "chuoi" || !v.gia.trim())
			throw new Error(`khuon: thay_cho thieu ${khoi}`);
		thayCho[khoi] = v.gia;
	}
	const khuon = bangCon(goc, "khuon");
	const nhanDien = bangCon(goc, "nhan_dien");
	return {
		doiTuong: danhSach(goc, "doi_tuong"),
		khuonNhap: chuoi(khuon, "nhap"),
		dangKy: chuoi(nhanDien, "dang_ky"),
		kind: danhSach(nhanDien, "kind"),
		ngoaiKhuon: docNgoaiKhuon(nhanDien),
		mauTep: chuoi(bangCon(goc, "mau_dang_chay"), "tep"),
		cam,
		camHo,
		thayCho,
		ngoaiLe: docNgoaiLe(goc),
	};
}

export function docKhuonNgan(goc: string = GOC_KHO): KhuonNgan {
	return phanTichKhuon(readFileSync(join(goc, DUONG_KHUON), "utf8"));
}

export function khoiCuaTen(ten: string, k: KhuonNgan): string | null {
	for (const khoi of k.cam) {
		if (ten === khoi) return khoi;
		if (
			k.camHo.includes(khoi) &&
			ten.startsWith(khoi) &&
			/^[A-Z]/.test(ten.slice(khoi.length))
		)
			return khoi;
	}
	return null;
}
