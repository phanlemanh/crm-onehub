import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	type CapChu,
	chuoiTrong,
	type DongBang,
	GOC,
	HO_SO,
	LAU_EN,
	LAU_VI,
	LOP_CHU,
	NGOAI_LOP_CHU,
	quetChuLop,
	quetMo,
	soBangMo,
	tepTrong,
} from "./support/bam-kr-quet";

const CAP: CapChu[] = JSON.parse(
	readFileSync(join(HO_SO, "cap-chu.json"), "utf8"),
);
const BANG: DongBang[] = JSON.parse(
	readFileSync(join(HO_SO, "cho-mo-ban-ghi.json"), "utf8"),
);

describe("bkr-chu", () => {
	test("bkr-chu: khong con Cap nhat tuan dung nhu danh tu trong lop chu", () => {
		const q = quetChuLop();
		console.log(`quet: ${q.tep} tep, ${q.chuoi} chuoi`);
		const doiChung = LOP_CHU.flatMap(tepTrong).filter(
			(t) => !NGOAI_LOP_CHU.has(t),
		).length;
		expect(q.tep).toBe(doiChung);
		expect(q.tep).toBeGreaterThan(10);
		expect(q.lot).toEqual([]);
	});

	test("bkr-chu: moi cap trong bang cap chu da ap dung so lan", () => {
		let dem = 0;
		for (const c of CAP) {
			const than = readFileSync(join(GOC, c.tep), "utf8");
			expect(
				than.split(c.cu).length - 1,
				`bkr-chu: ${c.tep} con "${c.cu}"`,
			).toBe(0);
			expect(
				than.split(c.moi).length - 1,
				`bkr-chu: ${c.tep} thieu "${c.moi}"`,
			).toBeGreaterThanOrEqual(c.soLan);
			dem += 1;
		}
		expect(dem).toBe(CAP.length);
		expect(CAP.filter((c) => c.lang === "vi").length).toBeGreaterThanOrEqual(8);
	});

	test("bkr-chu: cum khoang thoi gian giu nguyen (doi chung duong)", () => {
		const ca = LOP_CHU.flatMap(tepTrong).flatMap(chuoiTrong);
		expect(ca.some((c) => /cập nhật tuần này/.test(c))).toBe(true);
	});

	test("bkr-chu: tin nhac that cua loai okr-cap-nhat khong con Cap nhat tuan", async () => {
		const { dungTin } = await import("../../agent/agent/lib/tin-nhac");
		const { viecOkr } = await import("@crm/db/okr-nhac");
		const viec = viecOkr.parse({
			loai: "okr-cap-nhat",
			krIds: ["k1", "k2"],
			nhan: "2 KR chờ cập nhật tuần này",
			soKr: 2,
		});
		const tin = JSON.stringify(
			dungTin(
				"Lan",
				new Date("2026-10-26T01:30:00Z"),
				[viec],
				() => "https://crm.test/okr",
				"tron",
			),
		);
		expect(tin).toContain("Cập nhật");
		expect(LAU_VI.test(tin), `bkr-chu: tin nhac ${tin}`).toBe(false);
	});

	test("bkr-chu: chieu do — chuoi lot bi bat", () => {
		expect(LAU_VI.test("Lớp 3: dòng tóm gọn Cập nhật tuần")).toBe(true);
		expect(LAU_VI.test("Cần cập nhật tuần này")).toBe(false);
		expect(LAU_EN.test("Weekly update day")).toBe(false);
	});
});

describe("bkr-quet-mo", () => {
	test("bkr-quet-mo: moi cho mo ban ghi duoi khu OKR khop bang viet truoc", () => {
		const tim = quetMo();
		console.log(`quet: ${tim.length} cho goi`);
		expect(tim.length).toBeGreaterThan(10);
		expect(soBangMo(tim, BANG)).toEqual([]);
		for (const b of BANG.filter((x) => x.nguon === "kr"))
			expect(b.kind, `bkr-quet-mo: ${b.tep}`).toBe("kr");
	});

	test("bkr-quet-mo: chieu do — tra lai kind objective o cho nguon KR", () => {
		const tim = quetMo().map((g) =>
			g.tep === "viec-cua-toi.tsx" && g.kind === "kr"
				? { ...g, kind: "objective" }
				: g,
		);
		expect(
			soBangMo(tim, BANG).some((l) =>
				/viec-cua-toi\.tsx:\d+ nguon KR mo objective/.test(l),
			),
		).toBe(true);
		const them = [
			...quetMo(),
			{ tep: "x.tsx", kind: "objective", id: "a", dong: 1 },
		];
		expect(soBangMo(them, BANG).some((l) => l.includes("cho goi moi"))).toBe(
			true,
		);
	});
});
