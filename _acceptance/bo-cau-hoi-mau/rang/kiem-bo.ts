import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { khuonBo } from "../../tro-ly-doc-kho/rang/quyet-do";
import { BO_MAU } from "./bo-mau-config";
import { type BoMau, type CauMau, khuonBoMau, khuonMaCau } from "./khuon";

export const LUAT = [
	"khuon",
	"thanh-phan",
	"trang-mong",
	"y-trong-yeu",
	"rieng-tu",
] as const;
export type Luat = (typeof LUAT)[number];
export type ViPham = { luat: Luat; ma: string; cau: string };

const NFC = (s: string) => s.normalize("NFC");

export function docTrangMau(thuMuc: string): Map<string, string> {
	return new Map(
		readdirSync(thuMuc)
			.filter((f) => f.endsWith(".md"))
			.sort()
			.map((f) => [
				f.replace(/\.md$/, ""),
				NFC(readFileSync(join(thuMuc, f), "utf8")),
			]),
	);
}

type DuongLoi = readonly PropertyKey[];

function maTaiDuong(ma: readonly string[], duong: DuongLoi): string {
	const i = Number(duong[1]);
	if (duong[0] !== "cau" || !Number.isInteger(i)) return BO_MAU.maCauBo;
	return ma[i] || `#${i}`;
}

function kiemKhuon(chu: string): ViPham[] {
	const loi = (ma: string, cau: string): ViPham => ({ luat: "khuon", ma, cau });
	let tho: unknown;
	try {
		tho = JSON.parse(chu);
	} catch (e) {
		return [
			loi(
				BO_MAU.maCauBo,
				`bo khong phai JSON: ${e instanceof Error ? e.message : String(e)}`,
			),
		];
	}
	const ma = khuonMaCau.parse(tho).cau.map((c) => c.id);
	const cham = khuonBo.safeParse(tho);
	if (!cham.success)
		return cham.error.issues.map((i) =>
			loi(
				maTaiDuong(ma, i.path),
				`script cham khong doc duoc ${i.path.join(".")}: ${i.message}`,
			),
		);
	const chat = khuonBoMau.safeParse(tho);
	if (!chat.success)
		return chat.error.issues.map((i) => {
			const m = maTaiDuong(ma, i.path);
			return loi(
				m,
				`${m} sai khuon bo mau o ${i.path.join(".")}: ${i.message}`,
			);
		});
	const bo = chat.data;
	const ds: ViPham[] = [];
	if (bo.nhan !== BO_MAU.nhanBo)
		ds.push(
			loi(
				BO_MAU.maCauBo,
				`nhan bo la "${bo.nhan}", phai la "${BO_MAU.nhanBo}"`,
			),
		);
	if (!bo.nguon.startsWith(BO_MAU.moDauNguon))
		ds.push(
			loi(BO_MAU.maCauBo, `cau nguon khong mo dau "${BO_MAU.moDauNguon}"`),
		);
	if (bo.cau.length !== BO_MAU.tongCau)
		ds.push(
			loi(BO_MAU.maCauBo, `bo co ${bo.cau.length} cau, phai ${BO_MAU.tongCau}`),
		);
	const daThay = new Set<string>();
	for (const c of bo.cau) {
		if (!BO_MAU.maCau.test(c.id))
			ds.push(loi(c.id, `ma ${c.id} khong dang mNN`));
		if (daThay.has(c.id)) ds.push(loi(c.id, `ma ${c.id} trung`));
		daThay.add(c.id);
	}
	return ds;
}

const oCua = (c: CauMau) => `${c.tang}/${c.kieuChu}`;

export function demThanhPhan(bo: BoMau): Map<string, number> {
	const dem = new Map<string, number>();
	for (const c of bo.cau) dem.set(oCua(c), (dem.get(oCua(c)) ?? 0) + 1);
	dem.set(
		"ganTrangS6",
		bo.cau.filter((c) => c.tang === "S6" && c.ganTrang).length,
	);
	return dem;
}

function kiemThanhPhan(bo: BoMau): ViPham[] {
	const loi = (ma: string, cau: string): ViPham => ({
		luat: "thanh-phan",
		ma,
		cau,
	});
	const dem = demThanhPhan(bo);
	const mong = new Map(
		Object.entries({ ...BO_MAU.thanhPhan, ganTrangS6: BO_MAU.ganTrangS6 }),
	);
	const ds: ViPham[] = [];
	for (const o of [...new Set([...mong.keys(), ...dem.keys()])].sort()) {
		const co = dem.get(o) ?? 0;
		const can = mong.get(o) ?? 0;
		if (co !== can)
			ds.push(loi(o, `o ${o} co ${co} cau, bang viet truoc ${can}`));
	}
	for (const c of bo.cau) {
		const anh: { nhom: string; kho?: string } = BO_MAU.nhomCuaTang[c.tang];
		if (c.nhom !== anh.nhom || c.kho !== anh.kho)
			ds.push(
				loi(
					c.id,
					`${c.id} tang ${c.tang} mang nhom ${c.nhom}/kho ${c.kho ?? "-"}, phai ${anh.nhom}/kho ${anh.kho ?? "-"}`,
				),
			);
	}
	return ds;
}

const laTangCoTrang = (c: CauMau) =>
	(BO_MAU.tangCoTrang as readonly string[]).includes(c.tang);

function kiemTrangMong(
	bo: BoMau,
	trang: ReadonlyMap<string, string>,
): ViPham[] {
	const loi = (ma: string, cau: string): ViPham => ({
		luat: "trang-mong",
		ma,
		cau,
	});
	const theoMa = new Map(bo.cau.map((c) => [c.id, c]));
	const ds: ViPham[] = [];
	for (const c of bo.cau) {
		const mong = c.mong ?? [];
		const sai = mong.flat().filter((s) => !trang.has(s));
		if (sai.length > 0)
			ds.push(
				loi(
					c.id,
					`${c.id} mong trang khong co trong trang mau: ${sai.join(", ")}`,
				),
			);
		if (laTangCoTrang(c) && mong.length === 0)
			ds.push(loi(c.id, `${c.id} tang ${c.tang} khong khai trang mong doi`));
		if (!laTangCoTrang(c) && mong.length > 0)
			ds.push(loi(c.id, `${c.id} tang ${c.tang} khong duoc co trang mong doi`));
		if (c.tang === "S2" && mong.length < BO_MAU.nhomToiThieuS2)
			ds.push(
				loi(
					c.id,
					`${c.id} tang S2 can it nhat ${BO_MAU.nhomToiThieuS2} nhom trang, co ${mong.length}`,
				),
			);
		if (c.ganTrang !== undefined && c.tang !== "S6")
			ds.push(loi(c.id, `${c.id} co ganTrang ma khong phai tang S6`));
		if (c.ganTrang !== undefined && !trang.has(c.ganTrang))
			ds.push(
				loi(c.id, `${c.id} ganTrang ${c.ganTrang} khong co trong trang mau`),
			);
		if (c.tang !== "S7" && c.bienTheCua !== undefined)
			ds.push(loi(c.id, `${c.id} co bienTheCua ma khong phai tang S7`));
		if (c.tang !== "S7") continue;
		const goc = c.bienTheCua ? theoMa.get(c.bienTheCua) : undefined;
		if (!goc) {
			ds.push(
				loi(
					c.id,
					`${c.id} bienTheCua ${c.bienTheCua ?? "-"} khong tro cau nao`,
				),
			);
			continue;
		}
		if (
			!(BO_MAU.tangGocBienThe as readonly string[]).includes(goc.tang) ||
			goc.kieuChu !== "chuan"
		)
			ds.push(
				loi(
					c.id,
					`${c.id} la bien the cua ${goc.id} (${goc.tang}/${goc.kieuChu}), phai la cau S1 hay S3 chu chuan`,
				),
			);
		if (JSON.stringify(goc.mong ?? []) !== JSON.stringify(mong))
			ds.push(loi(c.id, `${c.id} khac trang mong doi cua cau goc ${goc.id}`));
	}
	return ds;
}

function kiemYTrongYeu(
	bo: BoMau,
	trang: ReadonlyMap<string, string>,
): ViPham[] {
	const loi = (ma: string, cau: string): ViPham => ({
		luat: "y-trong-yeu",
		ma,
		cau,
	});
	const theoMa = new Map(bo.cau.map((c) => [c.id, c]));
	const ds: ViPham[] = [];
	for (const c of bo.cau) {
		const y = c.y ?? [];
		if (!laTangCoTrang(c)) {
			if (y.length > 0)
				ds.push(loi(c.id, `${c.id} tang ${c.tang} khong duoc co y trong yeu`));
			continue;
		}
		if (y.length === 0) {
			ds.push(loi(c.id, `${c.id} tang ${c.tang} thieu y trong yeu`));
			continue;
		}
		const chuTrang = (c.mong ?? []).flat().map((s) => trang.get(s) ?? "");
		const lac = y.filter((x) => !chuTrang.some((t) => t.includes(NFC(x))));
		if (lac.length > 0)
			ds.push(
				loi(
					c.id,
					`${c.id} y khong co nguyen van trong trang mong doi: «${lac.join("», «")}»`,
				),
			);
		const goc =
			c.tang === "S7" && c.bienTheCua ? theoMa.get(c.bienTheCua) : undefined;
		if (
			goc &&
			JSON.stringify((goc.y ?? []).map(NFC)) !== JSON.stringify(y.map(NFC))
		)
			ds.push(loi(c.id, `${c.id} y khac y cua cau goc ${goc.id}`));
	}
	return ds;
}

function kiemRiengTu(bo: BoMau): ViPham[] {
	const ds: ViPham[] = [];
	for (const c of bo.cau)
		for (const [loai, mau] of Object.entries(BO_MAU.mauRiengTu))
			if (mau.test(c.cau))
				ds.push({
					luat: "rieng-tu",
					ma: c.id,
					cau: `${c.id} co ${loai} trong chu cau`,
				});
	return ds;
}

export function kiemBo(
	chu: string,
	trang: ReadonlyMap<string, string>,
): ViPham[] {
	const khuon = kiemKhuon(chu);
	if (khuon.length > 0) return khuon;
	const bo = khuonBoMau.parse(JSON.parse(chu));
	return [
		...kiemThanhPhan(bo),
		...kiemTrangMong(bo, trang),
		...kiemYTrongYeu(bo, trang),
		...kiemRiengTu(bo),
	];
}

if (import.meta.main) {
	const doiSo = process.argv.slice(2);
	const i = doiSo.indexOf("--bo");
	const tep =
		i >= 0 && doiSo[i + 1]
			? resolve(process.cwd(), doiSo[i + 1] as string)
			: BO_MAU.duong.bo;
	let chu: string;
	try {
		chu = readFileSync(tep, "utf8");
	} catch (e) {
		console.log(
			`khong doc duoc ${tep}: ${e instanceof Error ? e.message : String(e)}`,
		);
		process.exit(1);
	}
	const ds = kiemBo(chu, docTrangMau(BO_MAU.duong.trangMau));
	let soCau = 0;
	try {
		soCau = khuonMaCau.parse(JSON.parse(chu)).cau.length;
	} catch {
		soCau = 0;
	}
	console.log(`bo-mau: ${soCau} cau, ${ds.length} vi pham`);
	for (const l of LUAT)
		console.log(`luat ${l}: ${ds.filter((v) => v.luat === l).length}`);
	for (const v of ds) console.log(`${v.luat} ${v.ma}: ${v.cau}`);
	process.exit(ds.length === 0 ? 0 : 1);
}
