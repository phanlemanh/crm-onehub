import { afterAll, beforeAll, describe, test } from "bun:test";
import { db } from "@crm/db";
import { docLichLam } from "@crm/db/du-an";
import { SETTINGS_ID } from "@crm/db/settings";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { duAnLichOutput } from "../src/du-an/du-an.contracts";
import { lichLamViecOutput } from "../src/lich-lam-viec/lich-lam-viec.contracts";
import { viecDaDoiOutput } from "../src/viec/viec.contracts";
import { donDuAn, duAnThu, lichCua, viecCoLich } from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import { batApp, donViec, goi, nguoi } from "./support/viec-gieo";

const MA_TEST_MS = 120_000;

type Chup = { ngayNghiTuan: number[]; khongNghiTuan: boolean } | null;

let app: NestExpressApplication;
let chup: Chup = null;
let lichTruoc: number[] = [];

function json<T>(x: T): string {
	return JSON.stringify(x);
}

async function docHang(): Promise<Chup> {
	return db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { ngayNghiTuan: true, khongNghiTuan: true },
	});
}

beforeAll(async () => {
	await moXuong();
	app = await batApp();
	chup = await docHang();
	lichTruoc = [...(await docLichLam(db)).ngayNghiTuan];
});

afterAll(async () => {
	if (chup === null) {
		await db.appSetting.deleteMany({ where: { id: SETTINGS_ID } });
	} else {
		await db.appSetting.update({
			where: { id: SETTINGS_ID },
			data: chup,
		});
	}
	const sau = await docHang();
	const lichSau = [...(await docLichLam(db)).ngayNghiTuan];
	await app.close();
	await donDuAn();
	await donViec();
	await donDep();
	if (json(sau) !== json(chup) || json(lichSau) !== json(lichTruoc)) {
		throw new Error(`vg: don lich de lai co ${json({ sau, lichSau })}`);
	}
});

async function dat(ds: number[], userId: string): Promise<void> {
	const r = await goi(
		app,
		"lichLamViec.datNgayNghiTuan",
		"mutation",
		{ ngayNghiTuan: ds },
		userId,
	);
	if (r.status !== 200) throw new Error(`vg: dat rong loi ${json(r)}`);
}

async function lichCuaNguoi(userId: string): Promise<number[]> {
	const r = await goi(app, "lichLamViec.get", "query", undefined, userId);
	if (r.status !== 200) throw new Error(`vg: get loi ${json(r)}`);
	return lichLamViecOutput.parse(r.data).ngayNghiTuan;
}

describe("vg-lich-rong", () => {
	test(
		"vg-lich-rong: bỏ chọn hết ngày nghỉ thì mọi đường đọc trả lịch làm cả tuần",
		async () => {
			const q = await nguoi("vg-q", "owner");
			const p = await duAnThu(q.id, "Lịch bảy ngày");

			await dat([7], q.id);
			if (json(await lichCuaNguoi(q.id)) !== json([7])) {
				throw new Error("vg: doi chung dat bay hong");
			}

			await dat([], q.id);
			for (let lan = 1; lan <= 3; lan += 1) {
				const ra = await lichCuaNguoi(q.id);
				if (json(ra) !== json([])) {
					throw new Error(`vg: get rong thanh ${json(ra)} lan ${lan}`);
				}
			}
			const r = await goi(app, "duAn.lich", "query", { id: p.id }, q.id);
			const lichDuAn = duAnLichOutput.parse(r.data).lich.ngayNghiTuan;
			if (json(lichDuAn) !== json([])) {
				throw new Error(`vg: lich du an rong thanh ${json(lichDuAn)}`);
			}
			const doc = (await docLichLam(db)).ngayNghiTuan;
			if (json(doc) !== json([])) {
				throw new Error(`vg: doc lich rong thanh ${json(doc)}`);
			}
		},
		MA_TEST_MS,
	);
});

describe("vg-tu-doi-bay-ngay", () => {
	test(
		"vg-tu-doi-bay-ngay: lịch làm cả tuần thì việc phải chờ dời sang Thứ Bảy",
		async () => {
			const q = await nguoi("vg-td", "owner");

			const chay = async (lich: number[]) => {
				await dat(lich, q.id);
				const p = await duAnThu(q.id, "Tự dời bảy ngày");
				const A = await viecCoLich({
					duAnId: p.id,
					giaoId: q.id,
					tieuDe: "A",
					batDau: "2026-10-20",
					han: "2026-10-21",
				});
				const B = await viecCoLich({
					duAnId: p.id,
					giaoId: q.id,
					tieuDe: "B",
					batDau: "2026-10-22",
					han: "2026-10-23",
				});
				const pt = await goi(
					app,
					"duAn.phuThuocTao",
					"mutation",
					{ truocId: A.id, sauId: B.id },
					q.id,
				);
				if (pt.status !== 200) {
					throw new Error(`vg: phu thuoc loi ${json(pt)}`);
				}
				const r = await goi(
					app,
					"viec.doiLich",
					"mutation",
					{ id: A.id, batDauNgay: "2026-10-20", hanNgay: "2026-10-23" },
					q.id,
				);
				if (r.status !== 200) throw new Error(`vg: doi lich loi ${json(r)}`);
				const daDoi = viecDaDoiOutput.parse(r.data).daDoi;
				const b = await lichCua(B.id);
				return { daDoi, b, B };
			};

			const t7cn = await chay([6, 7]);
			if (
				json([t7cn.b.batDau, t7cn.b.han]) !== json(["2026-10-26", "2026-10-27"])
			) {
				throw new Error(`vg: doi chung lich T7 CN hong ${json(t7cn.b)}`);
			}

			const bay = await chay([]);
			if (
				json([bay.b.batDau, bay.b.han]) !== json(["2026-10-24", "2026-10-25"])
			) {
				throw new Error(`vg: tu doi bo cuoi tuan ${json(bay.b)}`);
			}
			if (!bay.daDoi.some((v) => v.id === bay.B.id)) {
				throw new Error("vg: tu doi khong bao B");
			}
		},
		MA_TEST_MS,
	);
});

describe("vg-hoan-tac", () => {
	test(
		"vg-hoan-tac: chuỗi năm bước Hoàn tác giữa lịch làm cả tuần và lịch có ngày nghỉ",
		async () => {
			const q = await nguoi("vg-ht", "owner");
			const CHUOI = [[6, 7], [], [6, 7], [], [7], []];

			await db.appSetting.updateMany({
				where: { id: SETTINGS_ID },
				data: { ngayNghiTuan: [], khongNghiTuan: false },
			});
			await dat(CHUOI[0] ?? [], q.id);

			let daSo = 0;
			for (let n = 1; n < CHUOI.length; n += 1) {
				const ds = CHUOI[n] ?? [];
				await dat(ds, q.id);
				const ra = await lichCuaNguoi(q.id);
				if (json(ra) !== json(ds)) {
					throw new Error(`vg: hoan tac buoc ${n} ra ${json(ra)}`);
				}
				const hang = await docHang();
				if (hang?.khongNghiTuan !== (ds.length === 0)) {
					throw new Error(`vg: co khong nghi sai buoc ${n}`);
				}
				daSo += 1;
			}
			if (daSo !== 5) throw new Error(`vg: chuoi hoan tac thieu ${daSo}`);
		},
		MA_TEST_MS,
	);
});
