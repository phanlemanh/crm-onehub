import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { TroLySoDoOutput } from "../src/okr/okr.contracts";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	ketThucMau,
	mt,
	NAC_CAU_HINH,
	ok,
	phienMau,
} from "./tro-ly-okr-san";

const GOC_KHO = join(import.meta.dir, "../../..");
const TRUONG_AN = [
	"aiDeXuatAnPhamVi",
	"aiDeXuatAnDonVi",
	"aiTomTatAnPhamVi",
	"aiTomTatAnDonVi",
];
const THANG = "2026-11";
const NGAY = 24 * 60 * 60 * 1000;
const T = new Date("2026-11-13T09:00:00+07:00").getTime();
const MT = mt("q4-kd-bac-1");

let app: NestExpressApplication;
let cTruong = "";
let cQuanTri = "";

function git(...args: string[]) {
	const r = spawnSync("git", ["-C", GOC_KHO, ...args], { encoding: "utf8" });
	return { ma: r.status, ra: r.stdout.trim(), loi: r.stderr.trim() };
}

async function nhanRoiHoanTac(nhanLuc: number, hoanTacLuc: number) {
	datDongHo(new Date(nhanLuc - 60_000));
	const ten = (
		await db.okrObjective.findUniqueOrThrow({
			where: { id: MT },
			select: { title: true },
		})
	).title;
	const [id] = await gieoDong(MT, null, [
		dongMau({
			loai: "viet-lai",
			objectiveId: MT,
			truong: "title",
			truoc: ten,
			sau: `${ten}, rõ từng tuần`,
		}),
	]);
	const deXuatId = id ?? "";
	datDongHo(new Date(nhanLuc));
	ok(
		await goi(
			app,
			"okr.troLyQuyet",
			"mutation",
			{ deXuatId, cach: "nhan" },
			cTruong,
		),
		"nhan",
	);
	datDongHo(new Date(hoanTacLuc));
	ok(
		await goi(
			app,
			"okr.updateObjective",
			"mutation",
			{ id: MT, title: ten },
			cTruong,
		),
		"hoan tac",
	);
	const doc = ok<{ title: string }>(
		await goi(app, "okr.objective", "query", { id: MT }, cTruong),
		"doc lai",
	);
	expect(doc.title).toBe(ten);
	return deXuatId;
}

async function hoanTacSql() {
	const sql = readFileSync(
		join(
			import.meta.dir,
			"../../../_acceptance/tro-ly-okr-de-xuat/rang/hoan-tac.sql",
		),
		"utf8",
	);
	const hang = await db.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT set_config('okr.thang', ${THANG}, true)`;
		return tx.$queryRawUnsafe<
			{
				nac: string;
				da_nhan: number;
				hoan_tac: number;
				ty_le_hoan_tac: number | null;
			}[]
		>(sql);
	});
	return hang.find((h) => h.nac === "bat");
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cTruong = await phienMau("nguyen-thi-lan");
	cQuanTri = await phienMau("le-hai-dang");
	datDongHo(new Date(T - 60 * 60_000));
	await ghiCauHinh(app, cQuanTri, NAC_CAU_HINH.bat);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("tach-giao-dich", () => {
	test("bài OKR sẵn có chỉ được thêm dòng, mỗi dòng thêm nêu một trong bốn trường chế độ ẩn", () => {
		const coRef = git("rev-parse", "--verify", "--quiet", "origin/onehub");
		const goc =
			coRef.ma === 0 ? git("merge-base", "HEAD", "origin/onehub") : null;
		if (goc?.ma !== 0 || goc.ra === "") {
			console.warn(
				"tach-giao-dich: không có origin/onehub hay merge-base (checkout nông) — bỏ qua phần so diff",
			);
			return;
		}
		const diff = git(
			"diff",
			"--unified=0",
			goc.ra,
			"--",
			":(glob)apps/api/test/okr*.spec.ts",
		);
		expect(diff.ma).toBe(0);
		const dong = diff.ra.split("\n");
		const bo = dong.filter((d) => d.startsWith("-") && !d.startsWith("---"));
		const them = dong.filter((d) => d.startsWith("+") && !d.startsWith("+++"));
		const la = them.filter((d) => !TRUONG_AN.some((t) => d.includes(t)));
		if (bo.length + la.length > 0)
			console.log(`dong la:\n${[...bo, ...la].join("\n")}`);
		expect(bo, "bai OKR san co bi xoa dong").toEqual([]);
		expect(la, "dong them khong neu truong che do an").toEqual([]);
	});

	test(
		"Hoàn tác sau Nhận ghi lại truoc qua okr.updateObjective; hoan-tac.sql đếm trong 7 ngày, ngày thứ 8 không đếm",
		async () => {
			await nhanRoiHoanTac(T, T + NGAY);
			await nhanRoiHoanTac(T + 2 * NGAY, T + 10 * NGAY);
			const sql = await hoanTacSql();
			expect(sql?.da_nhan).toBe(2);
			expect(sql?.hoan_tac, "hoan tac ngoai 7 ngay").toBe(1);
			expect(sql?.ty_le_hoan_tac).toBe(0.5);
			const api = ok<TroLySoDoOutput>(
				await goi(app, "okr.troLySoDo", "query", { thang: THANG }, cQuanTri),
				"so do",
			);
			expect({ daNhan: api.bat.daNhan, hoanTac: api.bat.hoanTac }).toEqual({
				daNhan: 2,
				hoanTac: 1,
			});
		},
		CHO_DB,
	);
});
