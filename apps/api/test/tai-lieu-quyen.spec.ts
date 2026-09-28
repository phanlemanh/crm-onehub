import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import {
	type Ai,
	deXuat,
	dungSan,
	duyet,
	goi,
	hashCua,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

const T = TAI_LIEU_API.thongDiep;

const MA_TRAN = [
	{ ca: "chu trang voi ban nguoi khac tao", tao: "tao", ai: "chu", duoc: true },
	{ ca: "chu trang voi ban chinh minh tao", tao: "chu", ai: "chu", duoc: true },
	{ ca: "owner", tao: "tao", ai: "owner", duoc: true },
	{ ca: "admin", tao: "tao", ai: "admin", duoc: true },
	{ ca: "nguoi tao khong phai chu trang", tao: "tao", ai: "tao", duoc: false },
	{ ca: "thanh vien khac", tao: "tao", ai: "khac", duoc: false },
	{ ca: "vai okr", tao: "tao", ai: "okr", duoc: false },
] as const satisfies readonly {
	ca: string;
	tao: Ai;
	ai: Ai;
	duoc: boolean;
}[];

let dem = 0;

async function deXuatCho(tao: Ai) {
	dem += 1;
	const { slug, trangId, deXuatId } = await taoTrang(
		`Quyền duyệt ${dem}`,
		"Gốc.",
	);
	await duyet(deXuatId, "chu");
	const id = await deXuat(slug, `Bản sửa ${dem}.`, tao);
	return { trangId, id };
}

const dem2 = (trangId: string) =>
	Promise.all([
		db.taiLieuPhienBan.count({ where: { trangId } }),
		db.taiLieuSuKien.count({ where: { trangId } }),
	]);

describe("quyen-duyet", () => {
	test("quyen-duyet: bay ca approve theo ma tran viet truoc", async () => {
		for (const { ca, tao, ai, duoc } of MA_TRAN) {
			const { trangId, id } = await deXuatCho(tao);
			const hash = await hashCua(id, "chu");
			const truoc = await dem2(trangId);
			const tra = await goi("taiLieu.approve", { id, diffHash: hash }, ai);
			if (duoc) {
				expect(`${ca}: ${tra.status} ${tra.loi}`).toBe(`${ca}: 200 `);
				expect((await dem2(trangId))[0]).toBe(truoc[0] + 1);
				continue;
			}
			expect(`${ca}: ${tra.status} ${tra.loi}`, "nguoi tao tu duyet duoc").toBe(
				`${ca}: 403 ${T.khongDuocDuyet}`,
			);
			expect(await dem2(trangId), `${ca}: co gi doi`).toEqual(truoc);
			const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id } });
			expect(dx.trangThai).toBe("CHO_DUYET");
		}
	});

	test("quyen-duyet: reject cung ma tran", async () => {
		for (const { ca, tao, ai, duoc } of MA_TRAN) {
			const { trangId, id } = await deXuatCho(tao);
			const truoc = await dem2(trangId);
			const tra = await goi(
				"taiLieu.reject",
				{ id, lyDo: "Chưa đủ căn cứ." },
				ai,
			);
			const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id } });
			if (duoc) {
				expect(`${ca}: ${tra.status} ${tra.loi}`).toBe(`${ca}: 200 `);
				expect(dx.trangThai).toBe("TRA_LAI");
				continue;
			}
			expect(
				`${ca}: ${tra.status} ${tra.loi}`,
				"nguoi tao tu tra lai duoc",
			).toBe(`${ca}: 403 ${T.khongDuocDuyet}`);
			expect(await dem2(trangId), `${ca}: co gi doi`).toEqual(truoc);
			expect(dx.trangThai).toBe("CHO_DUYET");
		}
	});

	test("quyen-duyet: id khong ton tai tra NOT_FOUND", async () => {
		const tra = await goi(
			"taiLieu.approve",
			{ id: "khong-co-that", diffHash: "0".repeat(64) },
			"admin",
		);
		expect(`${tra.status} ${tra.loi}`).toBe(`404 ${T.khongCo}`);
	});
});
