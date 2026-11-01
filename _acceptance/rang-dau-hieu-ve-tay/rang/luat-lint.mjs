import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CHEP = [".oxlintrc.json", "package.json", "tools/oxlint", "packages/db/src/giai-doan.ts", "design/patterns", "apps/app"];
const BO_QUA = /\/(node_modules|\.next|\.turbo|\.eve)(\/|$)/;
const LUAT = "tools/oxlint/onehub/rules/khong-ve-tay.ts";
const TIEM = "apps/app/components/zz-tiem.tsx";
const NO = "apps/app/components/landing/product-shot/companies-page.tsx";
const DAU = "const cn = (...a: string[]) => a.join(\" \"); const x = \"a\"; const ok = true;";

function dung(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

if (!JSON.parse(readFileSync(join(GOC, "package.json"), "utf8")).scripts?.["lint:slop"])
	dung(2, "KHONG DO DUOC: package.json khong co script lint:slop");

function chayLint(cay) {
	const r = spawnSync("bun", ["run", "lint:slop"], { cwd: cay, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	if (!/Finished in/.test(ra)) dung(2, `KHONG DO DUOC: lint:slop khong chay o ${cay} — ${ra.slice(0, 400)}`);
	const dong = ra.split("\n");
	const loi = [];
	dong.forEach((d, i) => {
		if (!d.includes("onehub(khong-ve-tay)")) return;
		const vt = dong.slice(i + 1, i + 4).find((x) => x.includes(",-["));
		loi.push({ msg: d, vt: vt ? (/,-\[(.*)\]/.exec(vt)?.[1] ?? "") : "" });
	});
	return { ma: r.status, loi };
}

function thay(nguon, cu, moi) {
	if (!nguon.includes(cu)) dung(2, `KHONG DO DUOC: fixture khong thay «${cu.slice(0, 60)}»`);
	return nguon.split(cu).join(moi);
}

function voiCay(sua, lam) {
	const tam = mkdtempSync(join(tmpdir(), "bk5-luat-"));
	try {
		for (const p of CHEP) cpSync(join(GOC, p), join(tam, p), { recursive: true, filter: (s) => !BO_QUA.test(s) });
		symlinkSync(join(GOC, "node_modules"), join(tam, "node_modules"));
		for (const [tep, doi] of Object.entries(sua)) {
			const d = join(tam, tep);
			mkdirSync(dirname(d), { recursive: true });
			let cu = "";
			try {
				cu = readFileSync(d, "utf8");
			} catch {}
			writeFileSync(d, doi instanceof Function ? doi(cu) : doi);
		}
		return lam(chayLint(tam));
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

let ok = true;
function ca(ten, dat, chiTiet) {
	console.log(`${dat ? "DAT" : "TRUOT"} ${ten}${dat ? "" : ` — ${chiTiet}`}`);
	ok = dat && ok;
}
const tom = (r) => `ma ${r.ma}; ${r.loi.length} dong: ${r.loi.map((l) => `${l.vt} ${l.msg.trim().slice(0, 110)}`).join(" | ")}`;
const cua = (r, tep) => r.loi.filter((l) => l.vt.startsWith(`${tep}:`));
const hai = (dong2) => `${DAU}\n${dong2}\n`;

const DO = [
	["table", "export const A = () => <table />;", "DataTable"],
	["clipboard", "export const A = () => navigator.clipboard;", "CopyValue"],
	["tieu-de-h2", 'export const A = () => <h2 className="text-lg">x</h2>;', "SectionHeading"],
	["tieu-de-h4", 'export const A = () => <h4 className="text-sm">x</h4>;', "SectionHeading"],
	["chip-dinh", 'import { ToggleGroup } from "@crm/ui/components/toggle-group"; export const A = () => <ToggleGroup type="single" spacing={0} />;', "Hàng công cụ"],
	["alert-dialog", 'import { AlertDialog } from "@crm/ui/components/alert-dialog"; export const A = AlertDialog;', "ConfirmDialog"],
	["divide-y-tran", 'export const A = () => <ul className="divide-y" />;', "Item"],
	["divide-y-cn-mot", 'export const A = () => <ul className={cn("divide-y")} />;', "Item"],
	["divide-y-cn-hai", 'export const A = () => <ul className={cn("border", "divide-y")} />;', "Item"],
	["divide-y-template", "export const A = () => <ul className={`divide-y ${x}`} />;", "Item"],
	["divide-y-ba-ngoi", 'export const A = () => <ul className={ok ? "divide-y" : ""} />;', "Item"],
	["cham-tran", 'export const A = () => <span className="size-2 rounded-full" />;', "StatusIndicator"],
	["cham-cn-mot", 'export const A = () => <span className={cn("size-2 rounded-full")} />;', "StatusIndicator"],
	["cham-cn-hai", 'export const A = () => <span className={cn("size-2", "rounded-full")} />;', "StatusIndicator"],
	["cham-template", "export const A = () => <span className={`size-2 rounded-full ${x}`} />;", "StatusIndicator"],
	["cham-ba-ngoi", 'export const A = () => <span className={ok ? "size-2 rounded-full" : "size-3"} />;', "StatusIndicator"],
	["hang-cung-tep", 'const DONG = "divide-y border"; export const A = () => <ul className={DONG} />;', "Item"],
];
for (const [ten, dong, thayGhim] of DO) {
	voiCay({ [TIEM]: hai(dong) }, (r) => {
		const l = cua(r, TIEM);
		ca(`do: ${ten}`, l.length === 1 && l[0].vt.startsWith(`${TIEM}:2:`) && l[0].msg.includes(thayGhim), tom(r));
	});
}

voiCay(
	{
		[TIEM]: hai(DO[0][1]),
		".oxlintrc.json": (s) => s.replace('"onehub/khong-ve-tay": "error"', '"onehub/khong-ve-tay": "off"'),
	},
	(r) => ca("tu-kiem: tat luat thi ca table khong con dong", cua(r, TIEM).length === 0, tom(r)),
);

const IM = [
	["h2-khong-class", "export const A = () => <h2>x</h2>;"],
	["toggle-khong-spacing", 'import { ToggleGroup } from "@crm/ui/components/toggle-group"; export const A = () => <ToggleGroup type="single" />;'],
	["spacing-1", 'import { ToggleGroup } from "@crm/ui/components/toggle-group"; export const A = () => <ToggleGroup type="single" spacing={1} />;'],
	["size2-khong-tron", 'export const A = () => <span className="size-2" />;'],
	["size25-tron", 'export const A = () => <span className="size-2.5 rounded-full" />;'],
	["divide-y-0", 'export const A = () => <ul className="divide-y-0" />;'],
	["divide-x", 'export const A = () => <ul className="divide-x" />;'],
	["Table-hoa", 'import { Table } from "@crm/ui/components/table"; export const A = () => <Table />;'],
	["navigator-share", "export const A = () => navigator.share;"],
	["confirm-dialog", 'import { ConfirmDialog } from "@crm/ui/components/confirm-dialog"; export const A = ConfirmDialog;'],
	["hang-tep-khac", 'import { DONG } from "./zz-hang"; export const A = () => <ul className={DONG} />;'],
];
for (const [ten, dong] of IM) {
	voiCay({ [TIEM]: hai(dong), "apps/app/components/zz-hang.ts": 'export const DONG = "divide-y border";\n' }, (r) =>
		ca(`im: ${ten}`, cua(r, TIEM).length === 0 && cua(r, "apps/app/components/zz-hang.ts").length === 0, tom(r)),
	);
}

const CHIN = [
	DAU,
	'import { ToggleGroup } from "@crm/ui/components/toggle-group";',
	'import { AlertDialog } from "@crm/ui/components/alert-dialog";',
	"export const A = () => navigator.clipboard;",
	"export const B = () => <table />;",
	'export const C = () => <h2 className="a">x</h2>;',
	'export const D = () => <h4 className="a">x</h4>;',
	'export const E = () => <ToggleGroup type="single" spacing={0} />;',
	'export const F = () => <ul className="divide-y" />;',
	'export const G = () => <span className="size-2 rounded-full" />;',
	'export const H = () => <ul className={cn("divide-y")} />;',
	"export const I = AlertDialog;",
	"",
].join("\n");
voiCay({ [TIEM]: CHIN }, (r) => ca("doi-chung: chin dau hieu trong mot tep thi 9 dong", cua(r, TIEM).length === 9, tom(r)));
for (const cho of ["apps/app/app/proto/zz-tiem.tsx", "apps/app/test/zz-tiem.tsx", "packages/ui/src/zz-tiem.tsx", "docs/zz-tiem.tsx"]) {
	voiCay({ [cho]: CHIN }, (r) => ca(`im-cho: ${dirname(cho)}/`, cua(r, cho).length === 0, tom(r)));
}

voiCay({}, (r) => ca("no-bang: dung so thi im", cua(r, NO).length === 0, tom(r)));
voiCay({ [NO]: (s) => `${s}\nexport const ZzThem = () => <table />;\n` }, (r) => {
	const l = cua(r, NO);
	ca("no-vuot: them mot table thi do", l.length === 2 && l.every((x) => x.msg.includes("vượt nợ cũ")), tom(r));
});
voiCay({ [NO]: (s) => thay(thay(s, "<table", "<div"), "</table>", "</div>") }, (r) => {
	const l = cua(r, NO);
	ca("no-thieu: bo table thi do", l.length === 1 && l[0].msg.includes("Nợ cũ khai 1, còn 0"), tom(r));
});
voiCay({ [NO]: (s) => `${s}\nexport const ZzChep = () => navigator.clipboard;\n` }, (r) => {
	const l = cua(r, NO);
	ca(
		"no-dau-hieu-khac: them navigator.clipboard thi do nhu cho moi",
		l.length === 1 && l[0].msg.includes("CopyValue") && !l[0].msg.includes("vượt nợ cũ"),
		tom(r),
	);
});

const HANG = {
	table: ["`<table>`"],
	clipboard: ["`navigator.clipboard`"],
	"tieu-de": ["`<h1>`, `<h2>`", "`<h3>`, `<h4>`"],
	"divide-y": ['`<ul className="divide-y …">`'],
	cham: ["chấm `size-2 rounded-full bg-*`"],
	"chip-dinh": ["`ToggleGroup spacing={0}`"],
	"alert-dialog": ["`AlertDialog` ráp tay"],
};

function cotDung() {
	const tk = readFileSync(join(GOC, "docs/design.md"), "utf8");
	const muc = /### Dấu hiệu vẽ tay\n([\s\S]*?)\n## /.exec(tk)?.[1] ?? "";
	if (!muc) dung(2, "KHONG DO DUOC: docs/design.md thieu muc «### Dấu hiệu vẽ tay»");
	return muc
		.split("\n")
		.filter((d) => d.startsWith("| ") && !d.startsWith("| ---") && !d.startsWith("| Vẽ tay"))
		.map((d) => {
			const o = d.split(" | ");
			return { trai: o[0].slice(2), phai: o.slice(1).join(" | ").replace(/ \|$/, "") };
		});
}

function thayTuLint(r) {
	const ra = {};
	for (const l of r.loi) {
		const m = /«([a-z-]+)» vẽ tay trong \S+: dùng (.*?)\. Nợ cũ/.exec(l.msg);
		if (m) ra[m[1]] = m[2];
	}
	return ra;
}

function kiemThay(thayMap) {
	const hang = cotDung();
	const truot = [];
	for (const [ma, khoa] of Object.entries(HANG)) {
		const dong = hang.filter((h) => khoa.some((k) => h.trai.startsWith(k)));
		const t = thayMap[ma] ?? "";
		const ten = [...t.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
		const tenDung = new Set(dong.flatMap((h) => [...h.phai.matchAll(/`([^`]+)`/g)].map((m) => m[1])));
		const dat =
			dong.length === khoa.length &&
			(tenDung.size ? ten.length > 0 && ten.every((n) => tenDung.has(n)) : dong.every((h) => t.includes(h.phai)));
		if (!dat) truot.push(ma);
	}
	return truot;
}

voiCay({ [TIEM]: CHIN }, (r) => {
	const map = thayTuLint(r);
	const truot = kiemThay(map);
	for (const ma of Object.keys(HANG)) ca(`thay-dung-hang: ${ma}`, !truot.includes(ma), `thay «${map[ma]}»`);
});

voiCay(
	{
		[TIEM]: CHIN,
		[LUAT]: (s) =>
			thay(
				thay(thay(s, 'table: "`DataTable`', 'table: "@@T'), 'clipboard: "`CopyValue`",', 'clipboard: "`DataTable` khi cần tìm, lọc, phân trang; còn lại `SimpleTable`",'),
				'table: "@@T khi cần tìm, lọc, phân trang; còn lại `SimpleTable`",',
				'table: "`CopyValue`",',
			),
	},
	(r) => {
		const truot = kiemThay(thayTuLint(r));
		ca("doi-cheo: doi chuoi thay table va clipboard cho nhau thi thay-dung-hang do", truot.includes("table") && truot.includes("clipboard"), `truot: ${truot.join(",")}`);
	},
);

{
	const r = chayLint(GOC);
	ca("cay-that: bun run lint:slop tren cay that khong dong khong-ve-tay nao", r.loi.length === 0, tom(r));
}

if (!ok) process.exit(1);
console.log("DAT tat ca");
