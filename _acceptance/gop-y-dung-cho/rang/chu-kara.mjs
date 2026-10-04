import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = join(GOC, ".acceptance-runs", "gop-y-dung-cho");
const CHU_MAC_DINH = join(GOC, "apps/app/lib/messages/okr-gop-y.ts");
const VUNG_QUET = [
	"apps/app/app/(app)/[slug]/okr",
	"apps/app/components/crm/record-sheet/objective-sheet.tsx",
];
const TRO_LY = "Trợ lý";
const MAU_GOI = ["1", "12", "A"];

function doiSo(ten) {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? null);
}

function trai(gia, khoa, ra) {
	if (gia instanceof Function) {
		trai(gia(...MAU_GOI.slice(0, gia.length)), khoa, ra);
		return;
	}
	if (gia instanceof Object) {
		for (const [k, v] of Object.entries(gia)) trai(v, `${khoa}.${k}`, ra);
		return;
	}
	ra.push([khoa, String(gia)]);
}

async function kiemChu(tep) {
	const mod = await import(pathToFileURL(resolve(tep)).href);
	const ra = [];
	trai(mod.okrGopYMessages("vi"), "okr-gop-y", ra);
	const con = ra.filter(([, chu]) => chu.includes(TRO_LY));
	return { soKhoa: ra.length, con: con.map(([k]) => k) };
}

function quetJsx(vung) {
	mkdirSync(RA, { recursive: true });
	const cauHinh = join(RA, "chu-kara.oxlintrc.json");
	writeFileSync(
		cauHinh,
		JSON.stringify({
			plugins: [],
			categories: { correctness: "off" },
			jsPlugins: [join(HERE, "chu-kara-plugin.mjs")],
			rules: { "chu-kara/khong-chu-cung": "error" },
		}),
	);
	const kq = spawnSync(
		join(GOC, "node_modules/.bin/oxlint"),
		["-c", cauHinh, "--format=json", ...vung],
		{ cwd: GOC, encoding: "utf8" },
	);
	const dau = kq.stdout.indexOf("{");
	if (dau === -1) throw new Error(`oxlint khong tra JSON: ${kq.stderr}`);
	const bao = JSON.parse(kq.stdout.slice(dau));
	if (bao.number_of_rules !== 1)
		throw new Error(`oxlint khong nap luat chu-kara: ${kq.stderr}`);
	return {
		soTep: bao.number_of_files,
		chuCung: bao.diagnostics.map(
			(d) => `${d.filename}:${d.labels?.[0]?.span?.line ?? "?"} ${d.message}`,
		),
	};
}

function vungDoDo() {
	const thu = join(mkdtempSync(join(tmpdir(), "chu-kara-")), "okr");
	mkdirSync(thu, { recursive: true });
	writeFileSync(
		join(thu, "nut.tsx"),
		'export function Nut() {\n\treturn <button type="button">Nhờ Trợ lý OKR góp ý</button>;\n}\n',
	);
	return [thu];
}

const chu = await kiemChu(doiSo("--chu") ?? CHU_MAC_DINH);
const jsx = quetJsx(
	process.argv.includes("--kiem-do-do") ? vungDoDo() : VUNG_QUET,
);
console.log(`chu-kara: ${chu.soKhoa} khoa vi, ${jsx.soTep} tep da quet`);
for (const k of chu.con) console.log(`con chu tro ly: ${k}`);
for (const c of jsx.chuCung) console.log(c);
process.exit(chu.con.length + jsx.chuCung.length > 0 ? 1 : 0);
