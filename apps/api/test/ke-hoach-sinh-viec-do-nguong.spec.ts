import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { ghiTuBuoc, taoViecChoBuoc } from "@crm/db/buoc-viec";
import { doiTrangThai, taoViec } from "@crm/db/viec-ghi";
import {
	donDep,
	gieoBoPhan,
	gieoKeHoach,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";
import { donViec } from "./support/viec-gieo";

const THUOC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"ke-hoach-sinh-viec",
	"rang",
	"do-nguong.mjs",
);
const TU = "2026-03-02";
const DEN = "2026-03-15";
const vn = (luc: string) => new Date(`${luc}+07:00`);
const han = (ngay: string) => new Date(`${ngay}T00:00:00.000Z`);

beforeAll(moXuong);
afterAll(async () => {
	await donViec();
	await donDep();
});

function chay(trong: string[]) {
	const r = spawnSync(
		"node",
		[THUOC, "--tu", TU, "--den", DEN, "--trong", trong.join(",")],
		{
			env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
			encoding: "utf8",
		},
	);
	return {
		ma: r.status,
		json:
			r.status === 0 || r.status === 2 ? JSON.parse(r.stdout || "{}") : null,
		ra: `${r.stdout}\n${r.stderr}`,
	};
}

type Ctx = { giao: string; lam: string; planId: string; boPhanId: string };

async function viecKhuon(
	c: Ctx,
	o: { han: string; tao?: Date; roi?: Date; huy?: boolean },
): Promise<string> {
	const { plan, buoc } = await taoBuoc(c, o.han);
	const now = o.tao ?? vn("2026-03-03T09:00:00");
	const { viecId } = await db.$transaction((tx) =>
		taoViecChoBuoc(tx, {
			stepId: buoc,
			planId: plan,
			tieuDe: `khuon ${o.han}`,
			hanNgay: han(o.han),
			nguoiGiaoId: c.giao,
			nguoiThucHienId: c.lam,
			nguon: "khuon",
			now,
		}),
	);
	if (o.roi) {
		const roi = o.roi;
		await db.$transaction((tx) =>
			doiTrangThai(tx, {
				viecId,
				nguoiId: c.lam,
				den: "DANG_LAM",
				nguon: "web",
				now: roi,
			}),
		);
	}
	if (o.huy) {
		await db.$transaction((tx) =>
			ghiTuBuoc(tx, {
				viecId,
				nguoiId: c.giao,
				nguon: "ke-hoach",
				now: vn("2026-03-10T09:00:00"),
				lenh: { lenh: "huy", lyDo: "gỡ bước" },
			}),
		);
	}
	return viecId;
}

async function taoBuoc(c: Ctx, hanNgay: string) {
	const s = await db.onboardingStep.create({
		data: {
			planId: c.planId,
			label: `buoc ${hanNgay}`,
			departmentId: c.boPhanId,
			dueAt: han(hanNgay),
			position: await db.onboardingStep.count({ where: { planId: c.planId } }),
		},
	});
	return { plan: c.planId, buoc: s.id };
}

describe("kh-thuoc", () => {
	test("kh-thuoc: đếm đúng đáp án viết trước, thoát 2 dưới ngưỡng, 0 khi đạt, chỉ đọc", async () => {
		const src = readFileSync(THUOC, "utf8");
		if (!src.includes("import.meta.url") || /\/Users\/|\/home\//.test(src)) {
			throw new Error("kh: thuoc hardcode duong dan");
		}
		const giao = await gieoThanhVien("KH Giao thước");
		const lam = await gieoThanhVien("KH Làm thước");
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({ camTrich: giao.id, buoc: [] });
		const c: Ctx = {
			giao: giao.id,
			lam: lam.id,
			planId: plan.id,
			boPhanId: bp.id,
		};

		await viecKhuon(c, { han: "2026-03-05", roi: vn("2026-03-04T10:00:00") });
		await viecKhuon(c, { han: "2026-03-06", roi: vn("2026-03-06T23:00:00") });
		await viecKhuon(c, { han: "2026-03-07", roi: vn("2026-03-08T09:00:00") });
		await viecKhuon(c, { han: "2026-03-08" });
		await db.$transaction((tx) =>
			taoViec(tx, {
				nguoiId: giao.id,
				tieuDe: "tay",
				hanNgay: han("2026-03-05"),
				nguoiThucHienId: lam.id,
				gan: [{ loai: "plan", id: plan.id }],
				nguon: "web",
				now: vn("2026-03-03T09:00:00"),
			}),
		);
		await viecKhuon(c, {
			han: "2026-03-05",
			tao: vn("2026-02-20T09:00:00"),
			roi: vn("2026-03-04T10:00:00"),
		});
		await viecKhuon(c, { han: "2026-03-20" });
		await viecKhuon(c, {
			han: "2026-03-09",
			roi: vn("2026-03-08T10:00:00"),
			huy: true,
		});

		const mot = chay([giao.id]);
		if (mot.json?.chiDoc !== true) throw new Error("kh: thuoc khong chi doc");
		const vk = mot.json?.viecKhuon;
		for (const [truong, mong] of [
			["tong", 4],
			["dungHan", 2],
			["tiLe", 0.5],
		] as const) {
			if (vk?.[truong] !== mong)
				throw new Error(`kh: thuoc dem sai ${truong} ${mot.ra}`);
		}
		if (mot.ma !== 2) throw new Error("kh: thuoc khong do khi duoi nguong");

		await viecKhuon(c, { han: "2026-03-10", roi: vn("2026-03-09T10:00:00") });
		await viecKhuon(c, { han: "2026-03-11", roi: vn("2026-03-10T10:00:00") });
		const hai = chay([giao.id]);
		if (hai.ma !== 2 || hai.json?.viecKhuon?.tong !== 6) {
			throw new Error(`kh: thuoc do sai chieu xanh ${hai.ra}`);
		}
		await viecKhuon(c, { han: "2026-03-12", roi: vn("2026-03-12T08:00:00") });
		const ba = chay([giao.id]);
		if (
			ba.ma !== 0 ||
			ba.json?.viecKhuon?.dungHan !== 5 ||
			ba.json?.viecKhuon?.tong !== 7
		) {
			throw new Error(`kh: thuoc do sai chieu xanh ${ba.ra}`);
		}
		expect(ba.ma).toBe(0);
	});
});
