import { afterAll, beforeAll, describe, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db, type TrangThaiViec } from "@crm/db";
import { doiTrangThai, taoViec } from "@crm/db/viec-ghi";
import { doiVai, donDep, gieoCongTy, moXuong } from "./support/ke-hoach-gieo";
import { donViec, nguoi } from "./support/viec-gieo";

const THUOC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"viec-chung",
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

async function vanTay(ids: string[]): Promise<string> {
	const hang = await db.$queryRaw<{ v: string | null }[]>`
		SELECT md5(
			coalesce((SELECT string_agg(t::text, '' ORDER BY id) FROM viec t WHERE t."taoBoiId" = ANY(${ids})), '') ||
			coalesce((SELECT string_agg(e::text, '' ORDER BY e.id) FROM "viecVet" e JOIN viec t ON t.id = e."viecId" WHERE t."taoBoiId" = ANY(${ids})), '')
		) AS v`;
	return hang[0]?.v ?? "";
}

describe("vc-thuoc", () => {
	test("vc-thuoc: đếm đúng đáp án viết trước, thấy vai okr cài trực tiếp, bỏ việc đã khép, chỉ đọc", async () => {
		const src = readFileSync(THUOC, "utf8");
		if (!src.includes("import.meta.url") || /\/Users\/|\/home\//.test(src))
			throw new Error("vc: thuoc ghi cung goc kho");
		const a = await nguoi("vc-th-a", "member");
		const b = await nguoi("vc-th-b", "member");
		const w = await nguoi("vc-th-w", "member");
		const congTy = await gieoCongTy();
		const deal = await db.deal.create({
			data: { name: "vc-th deal", companyId: congTy.id, ownerId: a.id },
		});
		const gan = [{ loai: "deal" as const, id: deal.id }];
		const tao = (
			tieuDe: string,
			lam: string,
			hanNgay: Date | null,
			luc = vn("2026-03-03T10:00:00"),
		) =>
			db.$transaction((tx) =>
				taoViec(tx, {
					nguoiId: a.id,
					tieuDe,
					nguoiThucHienId: lam,
					hanNgay,
					gan,
					nguon: "web",
					now: luc,
				}),
			);
		const doi = (viecId: string, ai: string, den: TrangThaiViec, luc: Date) =>
			db.$transaction((tx) =>
				doiTrangThai(tx, { viecId, nguoiId: ai, den, nguon: "web", now: luc }),
			);
		const t1 = await tao("vc-th truoc han 1", b.id, han("2026-03-10"));
		await doi(t1.id, b.id, "DANG_LAM", vn("2026-03-05T09:00:00"));
		const t2 = await tao("vc-th truoc han 2", b.id, han("2026-03-12"));
		await doi(t2.id, b.id, "XONG", vn("2026-03-06T09:00:00"));
		const t3 = await tao("vc-th dung ngay 23h", b.id, han("2026-03-10"));
		await doi(t3.id, b.id, "DANG_LAM", vn("2026-03-10T23:00:00"));
		const t4 = await tao("vc-th sau han", b.id, han("2026-03-10"));
		await doi(t4.id, b.id, "DANG_LAM", vn("2026-03-11T10:00:00"));
		const t5 = await tao("vc-th chua chuyen", b.id, han("2026-03-10"));
		const t6 = await tao("vc-th khong han", b.id, null);
		await doi(t6.id, b.id, "DANG_LAM", vn("2026-03-08T09:00:00"));
		const t7 = await tao("vc-th giao bat dau", b.id, han("2026-03-12"));
		await doi(t7.id, a.id, "DANG_LAM", vn("2026-03-05T09:00:00"));
		const t8 = await tao("vc-th giao huy", b.id, han("2026-03-12"));
		await doi(t8.id, a.id, "HUY", vn("2026-03-05T09:00:00"));
		await tao("vc-th tu giao 1", a.id, han("2026-03-10"));
		await tao("vc-th tu giao 2", a.id, null);
		await tao(
			"vc-th ngoai cua so",
			b.id,
			han("2026-02-25"),
			vn("2026-02-20T10:00:00"),
		);
		const truoc = await vanTay([a.id]);
		const k0 = chay([a.id]);
		const g = k0.json?.viecGiaoNguoiKhac;
		if (
			k0.ma !== 0 ||
			g?.tong !== 7 ||
			g?.roiChuaLamDungHan !== 4 ||
			g?.tiLe !== 0.5714
		) {
			throw new Error(
				`vc: thuoc dem sai dung han ${JSON.stringify(k0.json)} ${k0.ra.slice(-400)}`,
			);
		}
		if (k0.json?.viecDoiTacTaiVaiChiOkr !== 0)
			throw new Error("vc: thuoc khong thay vai okr doi chung");
		await db.viecTheoDoi.create({ data: { viecId: t2.id, userId: w.id } });
		await doiVai(w.id, "okr");
		const kKhep = chay([a.id]);
		if (kKhep.json?.viecDoiTacTaiVaiChiOkr !== 0 || kKhep.ma !== 0)
			throw new Error("vc: thuoc dem viec da khep");
		await db.viecTheoDoi.create({ data: { viecId: t5.id, userId: w.id } });
		const k1 = chay([a.id]);
		if (k1.json?.viecDoiTacTaiVaiChiOkr !== 1 || k1.ma !== 2)
			throw new Error("vc: thuoc khong thay vai okr");
		const sau = await vanTay([a.id]);
		if (truoc !== sau) throw new Error("vc: thuoc ghi vao kho");
	}, 120_000);
});
