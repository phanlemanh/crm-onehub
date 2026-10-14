import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { db } from "@crm/db";
import {
	deXuat,
	dungSan,
	duyet,
	goi,
	ma,
	ok,
	taoTrang,
	traLai,
} from "./tai-lieu-san";

dungSan();

const GOC = join(import.meta.dir, "..", "..", "..");
const THU_MUC = ["apps/api/src", "packages/db/src", "apps/agent/agent"];
const BO_QUA = /(^|\/)(generated|node_modules)(\/|$)/;

const CO_TU_TRUOC = [
	"apps/agent/agent/lib/tai-lieu-nop.ts: taiLieuSuKien.update(",
];

const SUA_XOA =
	/taiLieu(PhienBan|SuKien)\s*\.\s*(update|updateMany|delete|deleteMany|upsert)\s*\(|(UPDATE|DELETE\s+FROM)\s+"taiLieu(PhienBan|SuKien)"/g;

function tepTs(thuMuc: string): string[] {
	return readdirSync(thuMuc).flatMap((ten) => {
		const duong = join(thuMuc, ten);
		if (BO_QUA.test(relative(GOC, duong))) return [];
		if (statSync(duong).isDirectory()) return tepTs(duong);
		return /\.tsx?$/.test(ten) ? [duong] : [];
	});
}

async function chup(trangId: string) {
	const [phienBan, suKien] = await Promise.all([
		db.taiLieuPhienBan.findMany({ where: { trangId }, orderBy: { id: "asc" } }),
		db.taiLieuSuKien.findMany({ where: { trangId }, orderBy: { id: "asc" } }),
	]);
	return { phienBan, suKien };
}

type Chup = Awaited<ReturnType<typeof chup>>;

async function suKienThem(trangId: string, truoc: Chup) {
	const sau = await chup(trangId);
	const cuPb = new Set(truoc.phienBan.map((p) => p.id));
	const cuSk = new Set(truoc.suKien.map((s) => s.id));
	expect(sau.phienBan.filter((p) => cuPb.has(p.id))).toEqual(truoc.phienBan);
	expect(sau.suKien.filter((s) => cuSk.has(s.id))).toEqual(truoc.suKien);
	const moi = sau.suKien.filter((s) => !cuSk.has(s.id));
	for (const s of moi) {
		expect(s.aiId.length).toBeGreaterThan(0);
		expect(s.luc).toBeInstanceOf(Date);
	}
	const so: Record<string, number> = {};
	for (const s of moi) so[s.loai] = (so[s.loai] ?? 0) + 1;
	return so;
}

describe("lslt-nhat-ky", () => {
	test("chi-ghi-them: quet tinh — khong duong nao sua hay xoa phien ban, su kien; doi chung duong bat duoc mau", () => {
		expect("tx.taiLieuPhienBan.update(".match(SUA_XOA)).toHaveLength(1);
		expect('DELETE FROM "taiLieuSuKien"'.match(SUA_XOA)).toHaveLength(1);
		const tep = THU_MUC.flatMap((t) => tepTs(join(GOC, t)));
		expect(tep.length).toBeGreaterThan(50);
		const vi = tep.flatMap((duong) =>
			[...readFileSync(duong, "utf8").matchAll(SUA_XOA)].map(
				(m) => `${relative(GOC, duong)}: ${m[0]}`,
			),
		);
		expect(vi.filter((v) => !CO_TU_TRUOC.includes(v))).toEqual([]);
		expect(vi).toEqual(CO_TU_TRUOC);
	});

	test("chi-ghi-them: chay tron luong, moi hang cu giu nguyen, so su kien them dung bang viet truoc", async () => {
		const BANG = {
			quayLai: { DE_XUAT: 1 },
			duyetQuayLai: { DUYET: 1 },
			deXuatLuuTru: { DE_XUAT: 1 },
			duyetLuuTru: { LUU_TRU: 1, CU: 1 },
			deXuatKhoiPhuc: { DE_XUAT: 1 },
			duyetKhoiPhuc: { KHOI_PHUC: 1 },
			traLai: { TRA_LAI: 1 },
		} as const;
		const t = await taoTrang(ma("Nhat ky"), "## A\n\nBản một.", "tao", "chu");
		await duyet(t.deXuatId, "chu");
		await duyet(await deXuat(t.slug, "## A\n\nBản hai.", "tao"), "chu");
		const thay: Record<string, Record<string, number>> = {};
		const buoc = async (
			ten: keyof typeof BANG,
			lam: () => Promise<unknown>,
		) => {
			const truoc = await chup(t.trangId);
			await lam();
			thay[ten] = await suKienThem(t.trangId, truoc);
		};
		let id = "";
		await buoc("quayLai", async () => {
			id = ok<{ deXuatId: string }>(
				await goi("taiLieu.quayLai", { slug: t.slug, so: 1 }, "tao"),
				"quay lai",
			).deXuatId;
		});
		await buoc("duyetQuayLai", () => duyet(id, "chu"));
		await deXuat(t.slug, "## A\n\nBản chờ khi lưu trữ.", "tao");
		await buoc("deXuatLuuTru", async () => {
			id = ok<{ deXuatId: string }>(
				await goi(
					"taiLieu.deXuatLuuTru",
					{ slug: t.slug, lyDo: "Hết dùng." },
					"khac",
				),
				"de xuat luu tru",
			).deXuatId;
		});
		await buoc("duyetLuuTru", () => duyet(id, "chu"));
		await buoc("deXuatKhoiPhuc", async () => {
			id = ok<{ deXuatId: string }>(
				await goi(
					"taiLieu.deXuatKhoiPhuc",
					{ slug: t.slug, lyDo: "Cần lại." },
					"khac",
				),
				"de xuat khoi phuc",
			).deXuatId;
		});
		await buoc("duyetKhoiPhuc", () => duyet(id, "chu"));
		const bi = await deXuat(t.slug, "## A\n\nBản bị trả.", "tao");
		await buoc("traLai", () => traLai(bi, "chu"));
		expect(thay).toEqual(BANG);
	});
});
