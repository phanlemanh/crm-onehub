import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DealsService } from "../src/deals/deals.service";
import {
	donGiaiDoan,
	type GiaiDoanGieo,
	gieoGiaiDoan,
	khuonMotBuoc,
} from "./support/goi-y-gieo";
import {
	dichVu,
	donDep,
	gieoCongTy,
	moXuong,
	token,
} from "./support/ke-hoach-gieo";
import { batApp, donViec, nguoi } from "./support/viec-gieo";

const THUOC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"goi-y-mo-ke-hoach",
	"rang",
	"do-nguong.mjs",
);
const TU = "2031-03-02";
const DEN = "2031-03-15";
const vn = (luc: string) => new Date(`${luc}+07:00`);

const DAP_AN = {
	lanChuyen: 3,
	dealThangThieuGoiY: 0,
	goiYPhan: 2,
	xuLyKip: 1,
	tiLe: 0.5,
} as const;

let app: NestExpressApplication;
let gd: GiaiDoanGieo;
let deals: DealsService;
let P = "";
const congTy: string[] = [];

type Ket = {
	ma: number | null;
	json: Record<string, number | null | boolean> | null;
	ra: string;
};

function chay(
	argv: string[] = ["--tu", TU, "--den", DEN, "--trong", congTy.join(",")],
): Ket {
	const r = spawnSync("node", [THUOC, ...argv], {
		env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
		encoding: "utf8",
	});
	let json: Ket["json"] = null;
	try {
		json = r.stdout ? JSON.parse(r.stdout) : null;
	} catch {
		json = null;
	}
	return { ma: r.status, json, ra: `${r.stdout}\n${r.stderr}` };
}

function nem(thongDiep: string): never {
	throw new Error(thongDiep);
}

async function luc<T>(khi: string, viec: () => Promise<T>): Promise<T> {
	setSystemTime(vn(khi));
	try {
		return await viec();
	} finally {
		setSystemTime();
	}
}

async function ctyMoi(): Promise<string> {
	const c = await gieoCongTy();
	congTy.push(c.id);
	return c.id;
}

async function dealO(congTyId: string, stage: string, khi: string) {
	return luc(khi, () =>
		deals.create({
			name: `${token()} deal do`,
			companyId: congTyId,
			ownerId: P,
			stage,
		}),
	);
}

async function chuyen(
	dealId: string,
	stage: string,
	khi: string,
	thua = false,
) {
	await luc(khi, () =>
		deals.setStage(
			thua
				? { id: dealId, stage, closedReason: "ly do" }
				: { id: dealId, stage },
			P,
		),
	);
}

async function goiYCho(dealId: string) {
	return db.goiYKeHoach.findFirstOrThrow({
		where: { dealId, trangThai: "CHO" },
	});
}

beforeAll(async () => {
	await moXuong();
	app = await batApp();
	deals = app.get(DealsService);
	gd = await gieoGiaiDoan();
	P = (await nguoi("GY Thước")).id;

	const c1 = await ctyMoi();
	const d1 = await dealO(c1, gd.M1, "2031-03-03T09:00:00");
	await chuyen(d1.id, gd.W, "2031-03-04T09:00:00");
	const g1 = await goiYCho(d1.id);
	await luc("2031-03-05T09:00:00", () => dichVu().boQuaGoiY({ id: g1.id }, P));

	const c2 = await ctyMoi();
	const d2 = await dealO(c2, gd.M1, "2031-03-03T09:00:00");
	await chuyen(d2.id, gd.L, "2031-03-04T10:00:00", true);
	await chuyen(d2.id, gd.W, "2031-03-05T10:00:00");
	const khuon = await khuonMotBuoc();
	await luc("2031-03-09T10:00:00", () =>
		dichVu().createFromTemplate(
			{
				companyId: c2,
				templateId: khuon,
				startedAt: new Date("2031-03-09T00:00:00.000Z"),
				ownerId: P,
			},
			P,
		),
	);

	const c3 = await ctyMoi();
	const d3 = await dealO(c3, gd.W, "2031-03-13T09:00:00");
	await chuyen(d3.id, gd.W2, "2031-03-13T10:00:00");

	const c4 = await ctyMoi();
	await luc("2031-03-03T08:00:00", () =>
		dichVu().createFromTemplate(
			{
				companyId: c4,
				templateId: khuon,
				startedAt: new Date("2031-03-03T00:00:00.000Z"),
				ownerId: P,
			},
			P,
		),
	);
	const d4 = await dealO(c4, gd.M1, "2031-03-03T09:00:00");
	await chuyen(d4.id, gd.W, "2031-03-06T09:00:00");
});

afterAll(async () => {
	await app.close();
	await donGiaiDoan();
	await donViec();
	await donDep();
});

describe("gy-thuoc", () => {
	test("đáp án viết trước, chiều xanh, chỉ đọc", () => {
		const k = chay();
		if (!k.json) nem(`gy: thuoc dem sai json ${k.ra}`);
		for (const [truong, mong] of Object.entries(DAP_AN)) {
			if (k.json[truong] !== mong)
				nem(`gy: thuoc dem sai ${truong} ${k.json[truong]}`);
		}
		if (k.ma !== 0) nem(`gy: thuoc do sai chieu xanh ${k.ma}`);
		if (k.json.chiDoc !== true) nem("gy: thuoc khong chi doc");
		expect(k.ma).toBe(0);
	});

	test("không đo được thì không xanh", () => {
		const rong = chay([
			"--tu",
			"2031-01-01",
			"--den",
			"2031-01-31",
			"--trong",
			congTy.join(","),
		]);
		if (rong.ma !== 3) nem(`gy: thuoc xanh khi khong do lanChuyen ${rong.ma}`);
		const non = chay([
			"--tu",
			"2031-03-12",
			"--den",
			DEN,
			"--trong",
			congTy.join(","),
		]);
		if (non.ma !== 3) nem(`gy: thuoc xanh khi khong do goiYPhan ${non.ma}`);
		const thieu = chay(["--tu", TU]);
		if (thieu.ma !== 3) nem("gy: thuoc thieu doi so khong chan");
		expect(thieu.ma).toBe(3);
	});

	test("dưới ngưỡng thì chết", async () => {
		const c5 = await ctyMoi();
		const d5 = await dealO(c5, gd.M1, "2031-03-03T09:00:00");
		await chuyen(d5.id, gd.W, "2031-03-04T11:00:00");
		const g5 = await goiYCho(d5.id);
		await luc("2031-03-09T11:00:00", () =>
			dichVu().boQuaGoiY({ id: g5.id }, P),
		);
		const k = chay();
		if (k.json?.tiLe !== Number((1 / 3).toFixed(4)) || k.ma !== 2) {
			nem(`gy: thuoc khong do khi duoi nguong ${k.json?.tiLe} ${k.ma}`);
		}
		await db.goiYKeHoach.deleteMany({ where: { dealId: d5.id } });
		await db.deal.delete({ where: { id: d5.id } });
		congTy.pop();
		expect(k.ma).toBe(2);
	});

	test("thiếu gợi ý thì chết, mẫu số không đọc từ bảng gợi ý", async () => {
		const ds = await db.goiYKeHoach.findMany({
			where: { companyId: { in: congTy } },
		});
		const mot = ds.find((g) => g.trangThai === "BO_QUA");
		if (!mot) nem("gy: dung thuoc hong");
		await db.goiYKeHoach.delete({ where: { id: mot.id } });
		const k1 = chay();
		if (k1.json?.dealThangThieuGoiY !== 1 || k1.ma !== 2) {
			nem("gy: thuoc khong bat thieu goi y");
		}
		await db.goiYKeHoach.deleteMany({ where: { companyId: { in: congTy } } });
		const k2 = chay();
		if (
			k2.json?.lanChuyen !== 3 ||
			k2.json?.dealThangThieuGoiY !== 3 ||
			k2.ma !== 2
		) {
			nem("gy: mau so doc tu bang goi y");
		}
		expect(k2.ma).toBe(2);
	});
});
