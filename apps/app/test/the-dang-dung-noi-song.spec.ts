import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const GOC = join(import.meta.dir, "..", "..", "..");
const CAY = ["apps/app", "packages/ui"];
const BO_QUA = new Set(["node_modules", ".next", "test", ".turbo", "dist"]);
const DUOI = /\.(ts|tsx)$/;

const TEP_THE = "packages/ui/src/components/the-dang-dung.tsx";
const TEP_CU = "apps/app/components/agent-builder/the-dang-dung.tsx";
const CHO_GOI = [
	"apps/app/components/agent-builder/agent-builder-chat.tsx",
	"apps/app/app/proto/_modules/cho-tac-nhan-lau/index.tsx",
];
const NHAP_UI = '"@crm/ui/components/the-dang-dung"';

const DINH_NGHIA = /\b(function|const|let|class)\s+TheDangDung\b/;
const DUNG_THE = /<TheDangDung\b/;
const NHAP_APP = /from\s+["']@\//;
const NHAP_MAY_CHU = /from\s+["']@crm\/(db|auth)(\/[^"']*)?["']/;
const ACTION_CO_LOP = /<CardAction\b[^>]*\bclassName=/;
const FOOTER_CO_LOP = /<CardFooter\b[^>]*\bclassName=/;

function docCay(): Map<string, string> {
	const tep = new Map<string, string>();
	const di = (thuMuc: string) => {
		for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
			if (BO_QUA.has(muc.name)) continue;
			const duong = join(thuMuc, muc.name);
			if (muc.isDirectory()) di(duong);
			else if (DUOI.test(muc.name))
				tep.set(relative(GOC, duong), readFileSync(duong, "utf8"));
		}
	};
	for (const cay of CAY) di(join(GOC, cay));
	return tep;
}

export function kiemNoiSong(tep: Map<string, string>): string[] {
	const loi: string[] = [];
	const noiDinhNghia = [...tep].filter(([, nd]) => DINH_NGHIA.test(nd));
	if (noiDinhNghia.some(([duong]) => duong.startsWith("apps/app/")))
		loi.push("TheDangDung con dinh nghia o apps/app");
	if (noiDinhNghia.length > 1) loi.push("TheDangDung dinh nghia o hon mot noi");
	if (!noiDinhNghia.some(([duong]) => duong === TEP_THE))
		loi.push(`TheDangDung khong dinh nghia o ${TEP_THE}`);

	for (const [duong, nd] of tep) {
		if (duong === TEP_THE || !DUNG_THE.test(nd)) continue;
		if (!nd.includes(NHAP_UI))
			loi.push(
				`cho goi khong nhap tu @crm/ui/components/the-dang-dung: ${duong}`,
			);
	}
	for (const duong of CHO_GOI) {
		const nd = tep.get(duong) ?? "";
		if (!DUNG_THE.test(nd) || !nd.includes(NHAP_UI))
			loi.push(
				`cho goi khong nhap tu @crm/ui/components/the-dang-dung: ${duong}`,
			);
	}

	const the = tep.get(TEP_THE) ?? "";
	if (NHAP_APP.test(the)) loi.push("the nhap ngoai packages/ui");
	if (NHAP_MAY_CHU.test(the)) loi.push("the nhap goi may chu");
	if (ACTION_CO_LOP.test(the)) loi.push("CardAction mang className");
	if (FOOTER_CO_LOP.test(the)) loi.push("CardFooter mang className");
	return loi;
}

const THAT = docCay();

function sua(duong: string, doi: (nd: string) => string) {
	const ban = new Map(THAT);
	ban.set(duong, doi(ban.get(duong) ?? ""));
	return ban;
}

const MA_TRAN: [string, Map<string, string>, string][] = [
	[
		"(a) them lai the o agent-builder",
		sua(TEP_CU, () => "export function TheDangDung() { return null; }"),
		"TheDangDung con dinh nghia o apps/app",
	],
	[
		"(b) man chat nhap duong cu",
		sua(CHO_GOI[0], (nd) => nd.replaceAll(NHAP_UI, '"./the-dang-dung"')),
		"cho goi khong nhap tu @crm/ui/components/the-dang-dung",
	],
	[
		"(c) the nhap tu app",
		sua(
			TEP_THE,
			(nd) => `import { useSeconds } from "@/lib/use-seconds";\n${nd}`,
		),
		"the nhap ngoai packages/ui",
	],
	[
		"(d) the nhap @crm/db",
		sua(TEP_THE, (nd) => `import { db } from "@crm/db";\n${nd}`),
		"the nhap goi may chu",
	],
	[
		"(e) CardAction mang className",
		sua(TEP_THE, (nd) =>
			nd.replace("<CardAction>", '<CardAction className="gap-3">'),
		),
		"CardAction mang className",
	],
	[
		"(f) CardFooter mang className",
		sua(TEP_THE, (nd) =>
			nd.replace("<CardFooter>", '<CardFooter className="gap-2 border-t">'),
		),
		"CardFooter mang className",
	],
	[
		"(g) ban mau nhap duong cu",
		sua(CHO_GOI[1], (nd) =>
			nd.replaceAll(NHAP_UI, '"@/components/agent-builder/the-dang-dung"'),
		),
		"cho goi khong nhap tu @crm/ui/components/the-dang-dung",
	],
	[
		"(h) the nhap @crm/auth",
		sua(TEP_THE, (nd) => `import { auth } from "@crm/auth/server";\n${nd}`),
		"the nhap goi may chu",
	],
	[
		"(i) dinh nghia thu hai",
		sua(
			"apps/app/components/khac.tsx",
			() => "export function TheDangDung() { return null; }",
		),
		"TheDangDung dinh nghia o hon mot noi",
	],
];

describe("TheDangDung song o packages/ui", () => {
	test("cay-that", () => {
		expect(kiemNoiSong(THAT)).toEqual([]);
	});

	test("ma tran chieu do co dung chin ca", () => {
		expect(MA_TRAN).toHaveLength(9);
	});

	for (const [ten, cay, thongDiep] of MA_TRAN) {
		test(ten, () => {
			expect(kiemNoiSong(cay).some((dong) => dong.includes(thongDiep))).toBe(
				true,
			);
		});
	}
});
