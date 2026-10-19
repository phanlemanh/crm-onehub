import { afterAll, beforeAll, describe, test } from "bun:test";
import { db } from "@crm/db";
import { DU_AN } from "@crm/db/du-an";
import { taoViec } from "@crm/db/viec-ghi";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { viecDaDoiOutput } from "../src/viec/viec.contracts";
import {
	donDuAn,
	duAnThu,
	lichCua,
	ngayDb,
	viecCoLich,
} from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import { batApp, donViec, goi, type KetGoi, nguoi } from "./support/viec-gieo";

const MA_TEST_MS = 600_000;
const GIEO_MS = 300_000;
const TRAN = DU_AN.thongDiep.viecToiDa;
const DONG = DU_AN.thongDiep.daDong;

type ThaoTac =
	| "tao-viec"
	| "viec-con"
	| "chuyen-vao"
	| "them-moc"
	| "sua-moc"
	| "xoa-moc"
	| "them-phu-thuoc"
	| "doi-ngay"
	| "go-phu-thuoc";

type TenDuAn = "P300" | "P299" | "PD";

type Dong = {
	thaoTac: ThaoTac;
	duAn: TenDuAn;
	ket: "thanh-cong" | "tu-choi";
	loi: string | null;
};

const THEM_VIEC: ThaoTac[] = ["tao-viec", "viec-con", "chuyen-vao"];

const MA_TRAN: Dong[] = [
	{ thaoTac: "tao-viec", duAn: "P300", ket: "tu-choi", loi: TRAN },
	{ thaoTac: "viec-con", duAn: "P300", ket: "tu-choi", loi: TRAN },
	{ thaoTac: "chuyen-vao", duAn: "P300", ket: "tu-choi", loi: TRAN },
	{ thaoTac: "them-moc", duAn: "P300", ket: "thanh-cong", loi: null },
	{ thaoTac: "sua-moc", duAn: "P300", ket: "thanh-cong", loi: null },
	{ thaoTac: "xoa-moc", duAn: "P300", ket: "thanh-cong", loi: null },
	{ thaoTac: "them-phu-thuoc", duAn: "P300", ket: "thanh-cong", loi: null },
	{ thaoTac: "doi-ngay", duAn: "P300", ket: "thanh-cong", loi: null },
	{ thaoTac: "go-phu-thuoc", duAn: "P300", ket: "thanh-cong", loi: null },
	{ thaoTac: "tao-viec", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "viec-con", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "chuyen-vao", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "them-moc", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "sua-moc", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "xoa-moc", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "them-phu-thuoc", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "doi-ngay", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "go-phu-thuoc", duAn: "P299", ket: "thanh-cong", loi: null },
	{ thaoTac: "tao-viec", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "viec-con", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "chuyen-vao", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "them-moc", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "sua-moc", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "xoa-moc", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "them-phu-thuoc", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "doi-ngay", duAn: "PD", ket: "tu-choi", loi: DONG },
	{ thaoTac: "go-phu-thuoc", duAn: "PD", ket: "tu-choi", loi: DONG },
];

type DuAnThu = {
	id: string;
	A: string;
	B: string;
	moc: string | null;
	vao: string | null;
};

const NGAY_DAU = [
	{ batDau: "2026-10-20", han: "2026-10-21" },
	{ batDau: "2026-10-22", han: "2026-10-23" },
];

let app: NestExpressApplication;
let q: { id: string };

function json<T>(x: T): string {
	return JSON.stringify(x);
}

async function themViec(
	duAnId: string,
	ten: string,
	tu: number,
	den: number,
): Promise<string[]> {
	return db.$transaction(
		async (tx) => {
			const ra: string[] = [];
			const now = new Date();
			for (let i = tu; i < den; i += 1) {
				const ngay = NGAY_DAU[i];
				const v = await taoViec(tx, {
					nguoiId: q.id,
					tieuDe: `${ten} việc ${i + 1}`,
					gan: [],
					nguon: "web",
					duAnId,
					now,
					batDauNgay: ngay ? ngayDb(ngay.batDau) : null,
					hanNgay: ngay ? ngayDb(ngay.han) : null,
				});
				ra.push(v.id);
			}
			return ra;
		},
		{ timeout: GIEO_MS, maxWait: GIEO_MS },
	);
}

async function dungDuAn(
	ten: string,
	soViec: number,
	truocKhiDay?: (p: DuAnThu) => Promise<void>,
): Promise<DuAnThu> {
	const da = await duAnThu(q.id, ten);
	const [A, B] = await themViec(da.id, ten, 0, NGAY_DAU.length);
	if (!A || !B) throw new Error("vg tran: dung du an thieu viec");
	const p: DuAnThu = { id: da.id, A, B, moc: null, vao: null };
	if (truocKhiDay) await truocKhiDay(p);
	await themViec(da.id, ten, NGAY_DAU.length, soViec);
	return p;
}

async function soViec(duAnId: string): Promise<number> {
	return db.viec.count({ where: { duAnId } });
}

function idCua(r: KetGoi): string {
	const id = (r.data as { id?: unknown } | undefined)?.id;
	if (typeof id !== "string")
		throw new Error(`vg tran: khong co id ${json(r)}`);
	return id;
}

async function lam(t: ThaoTac, p: DuAnThu): Promise<KetGoi> {
	switch (t) {
		case "tao-viec":
			return goi(
				app,
				"viec.create",
				"mutation",
				{ tieuDe: "Việc thêm vào dự án", duAnId: p.id },
				q.id,
			);
		case "viec-con":
			return goi(
				app,
				"viec.taoCon",
				"mutation",
				{ chaId: p.A, tieuDe: "Việc con thêm vào dự án" },
				q.id,
			);
		case "chuyen-vao": {
			const v = await viecCoLich({
				duAnId: null,
				giaoId: q.id,
				tieuDe: "Việc ngoài dự án",
			});
			p.vao = v.id;
			return goi(
				app,
				"viec.doiDuAn",
				"mutation",
				{ id: v.id, duAnId: p.id },
				q.id,
			);
		}
		case "them-moc": {
			const r = await goi(
				app,
				"duAn.mocTao",
				"mutation",
				{ duAnId: p.id, ten: "Mốc thử", ngay: "2026-10-30", cho: [p.B] },
				q.id,
			);
			if (r.status === 200) p.moc = idCua(r);
			return r;
		}
		case "sua-moc":
			return goi(
				app,
				"duAn.mocSua",
				"mutation",
				{ id: p.moc, ten: "Mốc thử đã sửa", ngay: "2026-10-31" },
				q.id,
			);
		case "xoa-moc":
			return goi(app, "duAn.mocXoa", "mutation", { id: p.moc }, q.id);
		case "them-phu-thuoc":
			return goi(
				app,
				"duAn.phuThuocTao",
				"mutation",
				{ truocId: p.A, sauId: p.B },
				q.id,
			);
		case "doi-ngay":
			return goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: p.A, batDauNgay: "2026-10-20", hanNgay: "2026-10-23" },
				q.id,
			);
		case "go-phu-thuoc":
			return goi(
				app,
				"duAn.phuThuocXoa",
				"mutation",
				{ truocId: p.A, sauId: p.B },
				q.id,
			);
	}
}

function viecVuaThem(t: ThaoTac, r: KetGoi, p: DuAnThu): string {
	if (t === "chuyen-vao" && p.vao) return p.vao;
	return idCua(r);
}

type Lich = Awaited<ReturnType<typeof lichCua>>;

async function kiemVet(d: Dong, p: DuAnThu, vetTruoc: number): Promise<void> {
	if (
		d.duAn !== "P300" ||
		!["them-moc", "sua-moc", "xoa-moc"].includes(d.thaoTac)
	)
		return;
	const vetSau = await db.duAnVet.count({
		where: { duAnId: p.id, loai: d.thaoTac },
	});
	if (vetSau - vetTruoc !== 1) {
		throw new Error(`vg tran: vet ${d.thaoTac} ${vetSau - vetTruoc}`);
	}
}

async function kiemTuDoi(
	d: Dong,
	p: DuAnThu,
	r: KetGoi,
	bTruoc: Lich,
	tuDoi: Record<"P300" | "P299", boolean>,
): Promise<void> {
	if (d.thaoTac !== "doi-ngay" || d.duAn === "PD") return;
	const daDoi = viecDaDoiOutput.parse(r.data).daDoi;
	const bSau = await lichCua(p.B);
	const doi =
		daDoi.some((v) => v.id === p.B) &&
		json([bSau.batDau, bSau.han]) !== json([bTruoc.batDau, bTruoc.han]);
	tuDoi[d.duAn] = doi;
	if (doi) return;
	if (d.duAn === "P300") {
		throw new Error(
			`vg tran: tu doi P300 khong chay ${json({ daDoi, bTruoc, bSau })}`,
		);
	}
	throw new Error(`vg tran: doi chung P299 hong ${d.thaoTac}`);
}

async function kiemGo(d: Dong, p: DuAnThu): Promise<void> {
	if (d.thaoTac !== "go-phu-thuoc" || d.duAn === "PD") return;
	const con = await db.viecPhuThuoc.count({
		where: { truocId: p.A, sauId: p.B },
	});
	if (con !== 0) throw new Error("vg tran: go phu thuoc khong ghi");
}

async function kiemP299(d: Dong, p: DuAnThu, r: KetGoi): Promise<void> {
	if (d.duAn !== "P299" || !THEM_VIEC.includes(d.thaoTac)) return;
	const n = await soViec(p.id);
	if (n !== 300) {
		throw new Error(`vg tran: ${d.thaoTac} P299 khong nhan viec thu 300 ${n}`);
	}
	const ra = await goi(
		app,
		"viec.doiDuAn",
		"mutation",
		{ id: viecVuaThem(d.thaoTac, r, p), duAnId: null },
		q.id,
	);
	if (ra.status !== 200 || (await soViec(p.id)) !== 299) {
		throw new Error(`vg tran: P299 khong ve 299 ${json(ra)}`);
	}
}

async function kiemSau(
	d: Dong,
	p: DuAnThu,
	r: KetGoi,
	vetTruoc: number,
	bTruoc: Lich,
	tuDoi: Record<"P300" | "P299", boolean>,
): Promise<void> {
	await kiemVet(d, p, vetTruoc);
	await kiemTuDoi(d, p, r, bTruoc, tuDoi);
	await kiemGo(d, p);
	await kiemP299(d, p, r);
}

beforeAll(async () => {
	await moXuong();
	app = await batApp();
	q = await nguoi("vg-tran", "owner");
}, GIEO_MS);

afterAll(async () => {
	await app.close();
	await donDuAn();
	await donViec();
	await donDep();
});

describe("vg-tran", () => {
	test(
		"vg-tran: ma trận 27 dòng — trần 300 chỉ chặn thêm việc, mốc, phụ thuộc, đổi ngày vẫn được",
		async () => {
			const P300 = await dungDuAn("Trần 300", 300);
			const P299 = await dungDuAn("Trần 299", 299);
			const PD = await dungDuAn("Trần đóng", 300, async (p) => {
				const moc = await goi(
					app,
					"duAn.mocTao",
					"mutation",
					{
						duAnId: p.id,
						ten: "Mốc trước khi đóng",
						ngay: "2026-10-30",
						cho: [],
					},
					q.id,
				);
				p.moc = idCua(moc);
				const pt = await goi(
					app,
					"duAn.phuThuocTao",
					"mutation",
					{ truocId: p.A, sauId: p.B },
					q.id,
				);
				if (pt.status !== 200) {
					throw new Error(`vg tran: dung PD loi ${json(pt)}`);
				}
			});
			const dongPD = await goi(
				app,
				"duAn.dong",
				"mutation",
				{ id: PD.id },
				q.id,
			);
			if (dongPD.status !== 200) {
				throw new Error(`vg tran: dung PD loi ${json(dongPD)}`);
			}
			const duAn: Record<TenDuAn, DuAnThu> = { P300, P299, PD };

			let daSo = 0;
			const tuDoi: Record<"P300" | "P299", boolean> = {
				P300: false,
				P299: false,
			};
			for (const d of MA_TRAN) {
				const p = duAn[d.duAn];
				const vetTruoc = await db.duAnVet.count({
					where: { duAnId: p.id, loai: d.thaoTac },
				});
				const bTruoc = await lichCua(p.B);
				const r = await lam(d.thaoTac, p);
				const ket = r.status === 200 ? "thanh-cong" : "tu-choi";
				if (
					ket !== d.ket ||
					(d.ket === "tu-choi" &&
						(r.code !== "BAD_REQUEST" || r.message !== d.loi))
				) {
					throw new Error(
						`vg tran: ${d.thaoTac} ${d.duAn} ra ${json({ status: r.status, code: r.code, message: r.message })} ky vong ${d.ket}`,
					);
				}
				await kiemSau(d, p, r, vetTruoc, bTruoc, tuDoi);
				daSo += 1;
			}
			if (daSo !== 27) throw new Error(`vg tran: ma tran thieu ${daSo}`);
			const n300 = await soViec(P300.id);
			if (n300 !== 300) throw new Error(`vg tran: P300 vuot tran ${n300}`);
			if (!tuDoi.P300 || !tuDoi.P299) {
				throw new Error(`vg tran: tu doi P300 khong chay ${json(tuDoi)}`);
			}
		},
		MA_TEST_MS,
	);

	test(
		"vg-tran: hai giao dịch cùng thêm việc thứ 300 thì đúng một giao dịch được",
		async () => {
			const p = await dungDuAn("Tranh nhau", 299);
			const them = (ten: string) =>
				db.$transaction((tx) =>
					taoViec(tx, {
						nguoiId: q.id,
						tieuDe: ten,
						gan: [],
						nguon: "web",
						duAnId: p.id,
						now: new Date(),
					}),
				);
			const kq = await Promise.allSettled([them("Tranh A"), them("Tranh B")]);
			const n = await soViec(p.id);
			if (n !== 300) throw new Error(`vg tran: tranh nhau vuot tran ${n}`);
			const tuChoi = kq.filter((k) => k.status === "rejected");
			const loi = tuChoi.map((k) =>
				k.status === "rejected" && k.reason instanceof Error
					? k.reason.message
					: String(k),
			);
			if (tuChoi.length !== 1 || loi[0] !== TRAN) {
				throw new Error(`vg tran: tranh nhau sai loi ${json(loi)}`);
			}
		},
		MA_TEST_MS,
	);
});
