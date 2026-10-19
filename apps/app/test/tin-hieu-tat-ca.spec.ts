import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { CHO_TIN_HIEU } from "@crm/validation/tin-hieu";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { ghepTatCa } from "@/lib/tin-hieu/tat-ca";
import { docTrangThaiTinHieu } from "@/lib/tin-hieu/trang-thai";

const MAU = readFileSync(
	path.join(import.meta.dir, "fixtures", "tin-hieu", "LO-TRINH.mau.html"),
	"utf8",
);
const m = tinHieuMessages("vi");
const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;
const MA_MAU = (
	JSON.parse(MAU.match(KHOI)?.[1] ?? "{}") as { tin_hieu: { id: string }[] }
).tin_hieu.map((t) => t.id);
const KHOA_HOP_LE = new Set<string>([
	...CHO_TIN_HIEU.filter((c) => !c.startsWith("hang-") && c !== "chua-gom"),
	"da-giao",
	"dang-lam",
	"chua-bat-dau",
	"hang-khac",
	"cho-lay-ve",
	"cho-gom",
]);

function hang(ma: string, daKeoVe: boolean) {
	return {
		so: Number(ma.replace("crm-", "")),
		guiLuc: "2026-10-20T00:00:00.000Z",
		daKeoVe,
		phongBan: null,
	};
}

describe("ghep", () => {
	test("ghep: trang thai the Tat ca bang trang thai the Cua toi cho moi ma, khoa thuoc tap khai", () => {
		expect(MA_MAU.length).toBeGreaterThan(0);
		const rows = [
			...MA_MAU.map((ma) => hang(ma, true)),
			hang("crm-90", false),
			hang("crm-91", true),
		];
		const kq = ghepTatCa({ rows, html: MAU, now: new Date(), m });
		const cuaToi = docTrangThaiTinHieu(
			MAU,
			rows.map((r) => ({ ma: `crm-${r.so}`, daKeoVe: r.daKeoVe })),
			m,
		);
		let so = 0;
		for (const r of rows) {
			const ma = `crm-${r.so}`;
			const tt = kq.trangThai[ma];
			expect(tt, `thieu trang thai ${ma}`).toBeDefined();
			const { khoa, ...conLai } = tt ?? { khoa: "" };
			expect(conLai, "trang thai the Tat ca lech the Cua toi").toEqual(
				cuaToi.trangThai[ma] ?? {},
			);
			expect(KHOA_HOP_LE.has(khoa), `khoa la ${khoa}`).toBe(true);
			so += 1;
		}
		expect(so).toBe(rows.length);
		expect(kq.banVeDocDuoc).toBe(true);
	});

	test("ghep: ban ve vang thi trang thai CRM va o chua co cho la null", () => {
		const kq = ghepTatCa({
			rows: [hang("crm-1", false), hang("crm-2", true)],
			html: null,
			now: new Date("2026-11-12T00:00:00Z"),
			m,
		});
		expect(kq.banVeDocDuoc).toBe(false);
		expect(kq.baSo.chuaCoCho).toBeNull();
		expect(kq.trangThai["crm-1"]?.khoa).toBe("cho-lay-ve");
		expect(kq.trangThai["crm-2"]?.khoa).toBe("cho-gom");
	});
});
