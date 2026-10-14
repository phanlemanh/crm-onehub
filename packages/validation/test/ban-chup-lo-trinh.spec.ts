import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import {
	BAN_CHUP_LO_TRINH,
	banChupVao,
	phanTichBanChupLuu,
} from "../src/ban-chup-lo-trinh";

const GOC = join(import.meta.dir, "..", "..", "..");
const KHOI = docDuLieu(readFileSync(join(GOC, "LO-TRINH.html"), "utf8"));
if (KHOI.duLieu === null) throw new Error("LO-TRINH.html khong mang khoi");
const DU_LIEU: Record<string, unknown> = KHOI.duLieu;

const sach = () => structuredClone(DU_LIEU);

function vao(doi: Partial<Record<string, unknown>> = {}) {
	return {
		nguon: BAN_CHUP_LO_TRINH.nguonCrm,
		sha: "a".repeat(40),
		commitLuc: "2026-10-14T08:00:00+07:00",
		duLieu: sach(),
		canhBao: [],
		...doi,
	};
}

function duongLoi(gt: unknown): string {
	const kq = banChupVao.safeParse(gt);
	if (kq.success) return "(qua)";
	return (kq.error.issues[0]?.path ?? []).map(String).join(".");
}

describe("khuon", () => {
	test("khoi that cua cay qua khuon va giu khoa ngoai khuon tin_hieu", () => {
		expect("tin_hieu" in DU_LIEU).toBe(true);
		const kq = banChupVao.safeParse(vao());
		expect(kq.success).toBe(true);
		if (!kq.success) return;
		expect(kq.data.duLieu).toEqual(DU_LIEU);
	});

	test("ma tran hong ghim dung duong khoa", () => {
		const khuonKhac = sach();
		khuonKhac.khuon = "khac";
		const thieuLoTrinh = sach();
		delete thieuLoTrinh.lo_trinh;
		const thieuMa = sach();
		const loTrinh = thieuMa.lo_trinh as { hang: Record<string, unknown>[] }[];
		const hang0 = loTrinh[0]?.hang[0];
		if (!hang0) throw new Error("khoi that khong co hang nao");
		delete hang0.ma;
		const ca: [string, unknown, string][] = [
			["h1 khuon la", vao({ duLieu: khuonKhac }), "duLieu.khuon"],
			["h2 thieu lo_trinh", vao({ duLieu: thieuLoTrinh }), "duLieu.lo_trinh"],
			["h3 sha rong", vao({ sha: "" }), "sha"],
			[
				"h4 commitLuc khong phai gio",
				vao({ commitLuc: "hom qua" }),
				"commitLuc",
			],
			[
				"h6 hang thieu ma",
				vao({ duLieu: thieuMa }),
				"duLieu.lo_trinh.0.hang.0.ma",
			],
		];
		for (const [ten, gt, duong] of ca)
			expect(`${ten}: ${duongLoi(gt)}`).toBe(`${ten}: ${duong}`);
	});

	test("doi chung: cung khoi khong pha thi qua", () => {
		expect(duongLoi(vao())).toBe("(qua)");
	});
});

describe("doc-luu", () => {
	test("hang luu hop le tra ban chup co ISO; hang hong tra duong khoa", () => {
		const commitLuc = new Date("2026-10-14T01:00:00Z");
		const layLuc = new Date("2026-10-14T01:02:00Z");
		const ok = phanTichBanChupLuu({
			sha: "b".repeat(40),
			commitLuc,
			layLuc,
			duLieu: sach(),
			canhBao: [],
		});
		expect(ok.ok).toBe(true);
		if (ok.ok) {
			expect(ok.banChup.layLuc).toBe(layLuc.toISOString());
			expect(ok.banChup.commitLuc).toBe(commitLuc.toISOString());
		}
		const hong = phanTichBanChupLuu({
			sha: "b".repeat(40),
			commitLuc,
			layLuc,
			duLieu: { khuon: "khac" },
			canhBao: [],
		});
		expect(hong.ok).toBe(false);
	});
});
