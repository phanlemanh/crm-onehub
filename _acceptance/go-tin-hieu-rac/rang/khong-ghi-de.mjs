import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const TEP = [
	"apps/app/components/tin-hieu/bang-tat-ca.tsx",
	"apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx",
	"apps/app/components/tin-hieu/menu-luu-tru.tsx",
	"apps/app/app/(app)/[slug]/tin-hieu/tat-ca/page.tsx",
	"apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx",
];
const THONG_DIEP = "ghi de giao dien thanh phan dung chung";
const CAM =
	/^(?:[a-z]+:)*(?:bg-|rounded|shadow|border|ring-|p[xytrbl]?-|m[xytrbl]?-|gap-|space-[xy]-|text-(?!(?:xs|sm|base|lg|xl|[2-9]xl|left|right|center|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)\b))/;

function thanhPhanUi(nguon) {
	const ten = new Set();
	for (const m of nguon.matchAll(
		/import\s*\{([^}]*)\}\s*from\s*"@crm\/ui\/components\/[^"]+"/g,
	))
		for (const x of m[1].split(",")) {
			const t = x.replace(/\btype\b/, "").trim().split(/\s+as\s+/).pop();
			if (t) ten.add(t);
		}
	return ten;
}

function viPham(nguon) {
	const ui = thanhPhanUi(nguon);
	const ra = [];
	for (const m of nguon.matchAll(/<([A-Z][A-Za-z0-9]*)\b([^>]*?)>/gs)) {
		if (!ui.has(m[1])) continue;
		const lop = m[2].match(/className=(?:"([^"]*)"|\{"([^"]*)"\})/);
		if (!lop) continue;
		for (const tu of (lop[1] ?? lop[2] ?? "").split(/\s+/).filter(Boolean))
			if (CAM.test(tu)) ra.push(`${m[1]} className «${tu}»`);
	}
	return ra;
}

function soTep(ds) {
	let dem = 0;
	const hong = [];
	for (const [ten, nguon] of ds) {
		const v = viPham(nguon);
		dem += 1;
		console.log(`${v.length ? "SAI" : "DUNG"} · ${ten}${v.length ? ` · ${v.join(", ")}` : ""}`);
		for (const x of v) hong.push(`${THONG_DIEP}: ${ten} · ${x}`);
	}
	return { dem, hong };
}

const MAU_DO = [
	[
		"mau nut doi mau",
		'import { Button } from "@crm/ui/components/button";\nexport const A = () => <Button className="bg-red-500" variant="ghost">x</Button>;\n',
	],
	[
		"mau goc rieng",
		'import { Badge } from "@crm/ui/components/badge";\nexport const A = () => <Badge className="rounded-xl">x</Badge>;\n',
	],
	[
		"mau mau chu",
		'import { Item } from "@crm/ui/components/item";\nexport const A = () => <Item className="text-red-600">x</Item>;\n',
	],
];

let bat = 0;
const tam = mkdtempSync(join(tmpdir(), "gtr-ghi-de-"));
try {
	for (const [ten, nguon] of MAU_DO) {
		const p = join(tam, "a.tsx");
		writeFileSync(p, nguon);
		const v = viPham(readFileSync(p, "utf8"));
		const trung = v.length > 0;
		if (trung) bat += 1;
		console.log(`chieu do · ${ten} -> ${trung ? THONG_DIEP : "KHONG BAT"}`);
	}
	const lanh =
		'import { Button } from "@crm/ui/components/button";\nexport const A = () => <Button className="justify-start truncate text-sm" variant="ghost">x</Button>;\n';
	const vLanh = viPham(lanh);
	console.log(
		`doi chung duong · lop bo cuc khong bi bat: ${vLanh.length === 0 ? "DUNG" : `SAI (${vLanh.join(", ")})`}`,
	);
	if (vLanh.length !== 0) bat = -1;
} finally {
	rmSync(tam, { recursive: true, force: true });
}
if (bat !== MAU_DO.length) {
	console.log(`doi chung: SAI — chieu do chi bat ${bat}/${MAU_DO.length}`);
	process.exit(3);
}
console.log(`doi chung: do dung ${bat}/${MAU_DO.length}`);

const { dem, hong } = soTep(
	TEP.map((t) => [t, readFileSync(join(GOC, t), "utf8")]),
);
console.log(`so tep: ${dem}/${TEP.length}`);
if (dem !== TEP.length) process.exit(2);
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
