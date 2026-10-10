import { afterAll, describe, expect, test } from "bun:test";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { LO_TRINH } from "@/lib/lo-trinh/cau-hinh";
import { docTepLoTrinh, duongTepLoTrinh } from "@/lib/lo-trinh/doc-tep";

const TAM = mkdtempSync(path.join(tmpdir(), "lo-trinh-doc-tep-"));

afterAll(() => rmSync(TAM, { recursive: true, force: true }));

describe("doc-tep", () => {
	test("duong mac dinh mang dung ten tep cua cau hinh", () => {
		expect(path.basename(duongTepLoTrinh())).toBe(LO_TRINH.tep);
	});

	test("doc tep o chinh goc truoc, roi o goc kho hai cap tren", () => {
		const kho = path.join(TAM, "kho");
		const app = path.join(kho, "apps", "app");
		mkdirSync(app, { recursive: true });
		writeFileSync(path.join(kho, LO_TRINH.tep), "goc-kho");
		expect(docTepLoTrinh(app)).toBe("goc-kho");
		writeFileSync(path.join(app, LO_TRINH.tep), "goc-app");
		expect(docTepLoTrinh(app)).toBe("goc-app");
	});

	test("khong co tep thi tra null", () => {
		const rong = path.join(TAM, "rong", "apps", "app");
		mkdirSync(rong, { recursive: true });
		expect(docTepLoTrinh(rong)).toBeNull();
	});

	test("next.config khong khai glob tim tep lo trinh", () => {
		const cauHinh = readFileSync(
			path.join(import.meta.dir, "..", "next.config.ts"),
			"utf8",
		);
		expect(cauHinh.includes(LO_TRINH.tep)).toBe(false);
	});
});
