import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { MUC_CAI_DAT, nhanCaiDat } from "@/lib/cai-dat-dieu-huong";
import { MAN_LUI, tenMan } from "@/lib/tin-hieu/ten-man";

const GOC_MAN = path.join(import.meta.dir, "..", "app", "(app)", "[slug]");
const NGON_NGU = ["vi", "en"] as const;

function manCapMot(): string[] {
	const ra: string[] = [];
	for (const muc of readdirSync(GOC_MAN, { withFileTypes: true })) {
		if (!muc.isDirectory()) continue;
		if (muc.name.startsWith("(")) {
			for (const con of readdirSync(path.join(GOC_MAN, muc.name), {
				withFileTypes: true,
			})) {
				if (
					con.isDirectory() &&
					existsSync(path.join(GOC_MAN, muc.name, con.name, "page.tsx"))
				)
					ra.push(`/${con.name}`);
			}
			continue;
		}
		if (existsSync(path.join(GOC_MAN, muc.name, "page.tsx")))
			ra.push(`/${muc.name}`);
	}
	if (existsSync(path.join(GOC_MAN, "page.tsx"))) ra.push("/");
	return ra.sort();
}

function laTenMan(ten: string): boolean {
	return ten.trim().length > 0 && !ten.startsWith("/") && !ten.includes("/");
}

describe("sgt-ten-man", () => {
	test("sgt-ten-man: moi man cap mot va moi muc cai dat co ten theo ngon ngu", () => {
		const man = manCapMot();
		const caiDat = MUC_CAI_DAT.map((m) => m.href);
		const loi: string[] = [];
		let so = 0;
		for (const locale of NGON_NGU) {
			for (const duong of man) {
				so += 1;
				const ten = tenMan(duong, locale);
				if ((MAN_LUI as readonly string[]).includes(duong)) {
					if (ten !== duong) loi.push(`man lui ${duong} khong tra nguyen van`);
				} else if (!laTenMan(ten))
					loi.push(`man ${duong} chua co ten (${locale}): ${ten}`);
			}
			for (const muc of MUC_CAI_DAT) {
				so += 1;
				const ten = tenMan(muc.href, locale);
				if (!laTenMan(ten.replaceAll(" › ", " ")))
					loi.push(`muc cai dat ${muc.href} chua co ten (${locale}): ${ten}`);
				if (muc.href !== "/settings" && !ten.includes(nhanCaiDat(muc, locale)))
					loi.push(`muc cai dat ${muc.href} thieu nhan thanh ben (${locale})`);
			}
		}
		expect(loi).toEqual([]);
		expect(so).toBe((man.length + caiDat.length) * NGON_NGU.length);
		console.log(
			`sgt-ten-man: ${man.length} man cap mot + ${caiDat.length} muc cai dat, x ${NGON_NGU.length} ngon ngu = ${so} o`,
		);
	});

	test("sgt-ten-man: doan con, truy van va duong la", () => {
		const thanhVien = MUC_CAI_DAT.find((m) => m.href === "/settings/members");
		if (!thanhVien) throw new Error("NHOM_CAI_DAT khong con muc thanh vien");
		for (const locale of NGON_NGU) {
			expect(tenMan("/okr/abc/kr?x=1", locale)).toBe(tenMan("/okr", locale));
			expect(tenMan("/settings/members", locale)).toContain(
				nhanCaiDat(thanhVien, locale),
			);
			expect(tenMan("/khong-co-man", locale)).toBe("/khong-co-man");
		}
		expect(tenMan("/okr", "vi")).not.toBe(tenMan("/okr", "en"));
		console.log("sgt-ten-man: 3 x 2 + 1 = 7 khang dinh doan con");
	});
});
