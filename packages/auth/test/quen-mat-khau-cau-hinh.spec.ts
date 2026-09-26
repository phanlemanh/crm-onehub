import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import { duongDatMatKhau } from "../src/thu-mat-khau";

const ENV = resolve(import.meta.dir, "../src/env.ts");
const KHOA_GIA = "re_test_gia";
const NGUOI_GUI = "CRM <no-reply@example.test>";

function napEnv(bien: Record<string, string>) {
	const ra = Bun.spawnSync(
		["bun", "-e", `await import(${JSON.stringify(ENV)})`],
		{ env: { ...process.env, RESEND_API_KEY: "", MAIL_FROM: "", ...bien } },
	);
	return { ma: ra.exitCode, loi: ra.stderr.toString() };
}

describe("cau-hinh-nua", () => {
	it("chi co RESEND_API_KEY thi nap hong va neu ten ca hai bien", () => {
		const ra = napEnv({ RESEND_API_KEY: KHOA_GIA });
		expect(ra.ma).not.toBe(0);
		expect(ra.loi).toContain("RESEND_API_KEY");
		expect(ra.loi).toContain("MAIL_FROM");
	});

	it("chi co MAIL_FROM thi nap hong va neu ten ca hai bien", () => {
		const ra = napEnv({ MAIL_FROM: NGUOI_GUI });
		expect(ra.ma).not.toBe(0);
		expect(ra.loi).toContain("RESEND_API_KEY");
		expect(ra.loi).toContain("MAIL_FROM");
	});

	it("du ca hai thi nap duoc, cung khuon tien trinh con", () => {
		expect(napEnv({ RESEND_API_KEY: KHOA_GIA, MAIL_FROM: NGUOI_GUI }).ma).toBe(
			0,
		);
	});
});

describe("lien-ket-goc", () => {
	it("goc co hoac khong co dau gach cuoi, co duong con, deu khong sinh hai gach", () => {
		expect(duongDatMatKhau("abc", "http://x.test")).toBe(
			"http://x.test/dat-mat-khau/abc",
		);
		expect(duongDatMatKhau("abc", "http://x.test/")).toBe(
			"http://x.test/dat-mat-khau/abc",
		);
		expect(duongDatMatKhau("abc", "http://x.test/crm")).toBe(
			"http://x.test/crm/dat-mat-khau/abc",
		);
	});
});
