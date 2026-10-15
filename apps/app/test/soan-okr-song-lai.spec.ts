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
	test("trang server tinh co va truyen xuong NutSoan, TrangSoan", () => {
		// Từ DH1 (dieu-huong-khu-muc-tieu) nút soạn ở đầu trang khu: cờ đi
		// dau-trang-okr (server) → DauTrangOkrHoiY → DauTrangOkr → HanhDongKhu → NutSoan.
		const dau = doc("app/(app)/[slug]/okr/dau-trang-okr.tsx");
		expect(dau, "trang khong tinh co cau noi").toMatch(
			/import \{[^}]*\bokrBridgeConfigured\b[^}]*\} from "@\/lib\/agent-bridge"/,
		);
		expect(dau, "trang khong tinh co cau noi").toMatch(
			/<DauTrangOkrHoiY[\s\S]*?cauNoi=\{okrBridgeConfigured\(\)\}/,
		);
		expect(
			doc("app/(app)/[slug]/okr/dau-trang-hoi-y.tsx"),
			"dau trang khong truyen co",
		).toMatch(/<DauTrangOkr[\s\S]*?cauNoi=\{cauNoi\}/);
		expect(
			doc("app/(app)/[slug]/okr/thanh-tab.tsx"),
			"dau trang khong truyen co",
		).toMatch(/<HanhDongKhu[\s\S]*?cauNoi=\{cauNoi\}/);
		expect(
			doc("app/(app)/[slug]/okr/hanh-dong-khu.tsx"),
			"hang hanh dong khong truyen co",
		).toMatch(/<NutSoan[\s\S]*?cauNoi=\{cauNoi\}/);
		const layout = doc("app/(app)/[slug]/layout.tsx");
		expect(layout, "man soan khong nhan co cau noi").toMatch(
			/import \{[^}]*\bokrBridgeConfigured\b[^}]*\} from "@\/lib\/agent-bridge"/,
		);
		expect(layout, "man soan khong nhan co cau noi").toMatch(
			/<RecordSheetHost cauNoiOkr=\{okrBridgeConfigured\(\)\} \/>/,
		);
		const host = doc("components/crm/record-sheet/record-sheet-host.tsx");
		expect(host, "man soan khong nhan co cau noi").toMatch(
			/<SoanSheet[\s\S]*?cauNoi=\{cauNoiOkr\}/,
		);
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
		const gia =
			'"use client";\nimport { okrBridgeConfigured } from "@/lib/agent-bridge";\n';
		expect(clientNhapCauNoi(gia), "client import agent-bridge: fixture").toBe(
			true,
		);
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
