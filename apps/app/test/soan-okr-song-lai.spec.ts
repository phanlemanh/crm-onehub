import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Glob } from "bun";
import { okrBridgeConfigured } from "@/lib/agent-bridge";

const APP = join(import.meta.dir, "..");
const doc = (duong: string) => readFileSync(join(APP, duong), "utf8");
const LA_CLIENT = /^\s*["']use client["']/;
const NHAP_CAU_NOI = /from\s+["']@\/lib\/agent-bridge["']/;
const BI_MAT = "OKR_AGENT_BRIDGE_SECRET";
const cu = process.env[BI_MAT];

afterEach(() => {
	if (cu === undefined) delete process.env[BI_MAT];
	else process.env[BI_MAT] = cu;
});

function clientNhapCauNoi(nguon: string): boolean {
	return LA_CLIENT.test(nguon) && NHAP_CAU_NOI.test(nguon);
}

describe("cau-noi-server", () => {
	test("trang server tinh co va truyen xuong NutSoan, ManSoan", () => {
		const page = doc("app/(app)/[slug]/okr/theo-don-vi/page.tsx");
		expect(page, "trang khong tinh co cau noi").toMatch(
			/import \{[^}]*\bokrBridgeConfigured\b[^}]*\} from "@\/lib\/agent-bridge"/,
		);
		expect(page, "trang khong tinh co cau noi").toMatch(
			/<TheoDonVi cauNoiOkr=\{okrBridgeConfigured\(\)\} \/>/,
		);
		expect(
			doc("app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx"),
			"theo don vi khong truyen co",
		).toMatch(/<NutSoan[\s\S]*?cauNoi=\{cauNoiOkr\}/);
		expect(
			doc("app/(app)/[slug]/okr/soan/nut-soan.tsx"),
			"man soan khong nhan co cau noi",
		).toMatch(/<ManSoan[\s\S]*?cauNoi=\{cauNoi\}/);
	});

	test("khong tep client nao import agent-bridge", () => {
		const lo: string[] = [];
		for (const f of new Glob("**/*.{ts,tsx}").scanSync({ cwd: APP })) {
			if (f.includes("node_modules") || f.startsWith("test/")) continue;
			if (clientNhapCauNoi(doc(f))) lo.push(f);
		}
		expect(lo, `client import agent-bridge: ${lo.join(", ")}`).toEqual([]);
	});

	test("bo bat client import that su bat duoc", () => {
		const gia = '"use client";\nimport { okrBridgeConfigured } from "@/lib/agent-bridge";\n';
		expect(clientNhapCauNoi(gia), "client import agent-bridge: fixture").toBe(true);
		expect(clientNhapCauNoi(gia.replace('"use client";\n', ""))).toBe(false);
	});

	test("okrBridgeConfigured theo bi mat", () => {
		process.env[BI_MAT] = "";
		expect(okrBridgeConfigured(), "rong").toBe(false);
		process.env[BI_MAT] = "   ";
		expect(okrBridgeConfigured(), "khoang trang").toBe(false);
		process.env[BI_MAT] = "k";
		expect(okrBridgeConfigured(), "co gia tri").toBe(true);
	});
});
