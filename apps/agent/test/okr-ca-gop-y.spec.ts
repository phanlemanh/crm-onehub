import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { kiemSoTheoKieu, krInput } from "@crm/validation/okr-kr";
import { MA_VAN_DE } from "@crm/validation/okr-tro-ly";
import { docBoCaGopY, THU_MUC_CA_MAU, THU_MUC_CA_THAT } from "../evals/okr/ca-gop-y";

const GOC_KHO = join(import.meta.dir, "..", "..", "..");

describe("ca-gop-y", () => {
	const ca = docBoCaGopY(THU_MUC_CA_MAU);

	test("bộ mẫu đủ 30 ca và đủ tỷ lệ các loại", () => {
		expect(ca.length).toBeGreaterThanOrEqual(30);
		expect(ca.filter((c) => c.ngonNgu === "tron-anh-viet").length).toBeGreaterThanOrEqual(5);
		expect(ca.filter((c) => c.kyVong.khongGopY).length).toBeGreaterThanOrEqual(3);
		expect(ca.filter((c) => c.bo === "ng" && c.capTren).length).toBeGreaterThanOrEqual(4);
		const theoMa = Object.fromEntries(MA_VAN_DE.map((m) => [m, ca.filter((c) => c.kyVong.vanDe.includes(m)).length]));
		for (const m of MA_VAN_DE) expect(theoMa[m], m).toBeGreaterThanOrEqual(2);
		expect(new Set(ca.map((c) => c.id)).size).toBe(ca.length);
	});

	test("mọi KR qua khuôn nhập và luật số của sản phẩm, trừ ca cố ý sai số", () => {
		for (const c of ca) {
			for (const k of [...c.krs, ...(c.capTren?.krs ?? [])]) {
				const nhap = krInput.safeParse({ ...k, ownerUserId: "ca", currentValue: k.startValue, dueOn: null, weight: 1 });
				expect(nhap.success, `${c.id} ${k.title}`).toBe(true);
				const sai = kiemSoTheoKieu(k.kind, k.startValue, k.targetValue);
				expect(sai === null, `${c.id} ${k.title}`).toBe(!c.kyVong.soSai);
			}
		}
		expect(ca.filter((c) => c.kyVong.soSai).length).toBeGreaterThanOrEqual(1);
	});

	test("thư mục khác đọc bằng cùng hàm; tệp sai khuôn gọi tên tệp và trường", () => {
		const khac = mkdtempSync(join(tmpdir(), "ca-gop-y-"));
		for (const t of ["gy-01.json", "gy-12.json"]) copyFileSync(join(THU_MUC_CA_MAU, t), join(khac, t));
		expect(docBoCaGopY(khac).map((c) => c.id)).toEqual(["gy-01", "gy-12"]);
		const hong = { ...ca[0], id: "gy-hong", mucTieu: { whyNow: "", kind: "cam-ket" } };
		writeFileSync(join(khac, "gy-hong.json"), JSON.stringify(hong));
		expect(() => docBoCaGopY(khac)).toThrow(/gy-hong\.json.*mucTieu\.title/);
	});

	test("thư mục ca thật bị git bỏ qua", () => {
		const ra = execFileSync("git", ["check-ignore", join(THU_MUC_CA_THAT, "x.json")], { cwd: GOC_KHO, encoding: "utf8" });
		expect(ra.trim()).toBe(join(THU_MUC_CA_THAT, "x.json"));
	});
});
