import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = join(DAY, "..", "..", "..");
const CAU_HINH = {
	vung: [
		"apps/app/app/(app)/[slug]/okr/soan",
		"apps/app/app/(app)/[slug]/okr/theo-don-vi",
		"apps/app/app/(app)/[slug]/settings/okr/the-tro-ly-okr.tsx",
		"apps/app/app/(app)/[slug]/settings/okr/the-soan-so-do.tsx",
		"apps/app/app/(app)/[slug]/settings/organization/chi-tiet-bo-phan.tsx",
		"apps/app/app/(app)/[slug]/settings/organization/danh-sach-keo.tsx",
		"apps/app/app/(app)/[slug]/settings/organization/hop-thoai-don-vi.tsx",
		"apps/app/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri.tsx",
		"apps/app/app/(app)/[slug]/settings/organization/kieu.ts",
		"apps/app/app/(app)/[slug]/tai-lieu",
		"packages/ui/src/components/proposed-change.tsx",
		"packages/ui/src/components/empty.tsx",
		"packages/ui/src/components/nav-item.tsx",
		"packages/ui/src/components/section-heading.tsx",
		"packages/ui/src/components/ai-elements/suggestion.tsx",
		"packages/ui/src/components/ai-elements/prompt-input.tsx",
	],
	loai: [".eve", "node_modules", "test/.chay"],
	tepPha: "apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx",
	chenPha: 'className="bg-red-500 text-gray-400"',
	tienToTam: "soan-san-",
	nhanh:
		/(?:className|style)=(?:"[^"]*"|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/g,
	mau: [
		{
			ma: "ban-kinh-literal",
			re: /\brounded(?:-[a-z]{1,2})?-\[/,
			pha: '<div className="rounded-[7px]" />',
		},
		{
			ma: "hex-trong-class-hoac-style",
			re: /#[0-9a-fA-F]{3,8}\b/,
			pha: '<div className="bg-[#ff0000]" />',
			chiTrongNhanh: true,
		},
		{
			ma: "table-tho",
			re: /<table\b/,
			pha: "<table />",
		},
		{
			ma: "divide-y",
			re: /\bdivide-y\b/,
			pha: '<ul className="divide-y" />',
		},
		{
			ma: "navigator-clipboard",
			re: /navigator\.clipboard/,
			pha: 'const chep = () => navigator.clipboard.writeText("x");',
		},
		{
			ma: "cham-size-2-rounded-full",
			re: /\bsize-2(?![\d.])[^"'`\n]*\brounded-full\b|\brounded-full\b[^"'`\n]*\bsize-2(?![\d.])/,
			pha: '<span className="size-2 rounded-full" />',
		},
	],
};

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

const goiKit =
	process.env.CLAUDE_PLUGIN_ROOT ??
	execFileSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"scripts/design-gate.mjs",
			"--require",
			"scripts/design-scan.js",
		],
		{ encoding: "utf8" },
	).trim();
const CONG = join(goiKit, "scripts", "design-gate.mjs");
if (!existsSync(CONG)) khongDo(`khong co ${CONG}`);

function cong(duong) {
	return spawnSync("node", [CONG, "--target", duong, "--mode", "static"], {
		cwd: GOC,
		encoding: "utf8",
	});
}

const dongCua = (van, viTri) => van.slice(0, viTri).split("\n").length;

function quetMau(van) {
	const loi = [];
	for (const m of CAU_HINH.mau) {
		const vet = [];
		if (m.chiTrongNhanh) {
			for (const nh of van.matchAll(CAU_HINH.nhanh)) {
				const k = new RegExp(m.re.source, "g");
				for (const h of nh[0].matchAll(k))
					vet.push(dongCua(van, nh.index + h.index));
			}
		} else {
			const k = new RegExp(m.re.source, "g");
			for (const h of van.matchAll(k)) vet.push(dongCua(van, h.index));
		}
		for (const dong of vet) loi.push({ ma: m.ma, dong });
	}
	return loi;
}

function phaMau(tam, goc) {
	let hong = 0;
	for (const m of CAU_HINH.mau) {
		const ban = join(tam, `pha-${m.ma}.tsx`);
		writeFileSync(ban, `${goc}\n${m.pha}\n`);
		const van = readFileSync(ban, "utf8");
		const dongGai = dongCua(van, van.lastIndexOf(m.pha));
		const bat = quetMau(van).filter((l) => l.ma === m.ma && l.dong === dongGai);
		const dat = bat.length > 0;
		if (!dat) hong += 1;
		console.log(
			`${dat ? "DUNG" : "SAI"} pha-${m.ma}: gai ${m.pha} o dong ${dongGai} -> ${dat ? `bat ${m.ma}:${dongGai}` : "khong bat"}`,
		);
	}
	return hong;
}

if (process.argv.includes("--pha")) {
	const tam = mkdtempSync(join(tmpdir(), CAU_HINH.tienToTam));
	const ban = join(tam, "bang-nhap.tsx");
	const goc = readFileSync(join(GOC, CAU_HINH.tepPha), "utf8");
	const pha = goc.replace("<Button", `<Button ${CAU_HINH.chenPha}`);
	if (pha === goc)
		khongDo(`khong chen duoc className vao Button cua ${CAU_HINH.tepPha}`);
	writeFileSync(ban, pha);
	const r = cong(ban);
	const dat = r.status !== 0 && /gray-on-color/.test(r.stdout ?? "");
	console.log(
		`${dat ? "DUNG" : "SAI"} pha-gray-on-color: ban sao co ${CAU_HINH.chenPha} tren Button -> design-gate ma ${r.status}`,
	);
	const hong = phaMau(tam, goc);
	rmSync(tam, { recursive: true, force: true });
	process.exit(dat && hong === 0 ? 0 : 1);
}

const biLoai = (duong) =>
	CAU_HINH.loai.some(
		(l) => duong.split("/").includes(l) || duong.includes(`/${l}/`),
	);

function lietKe(duong) {
	const tuyet = join(GOC, duong);
	if (!existsSync(tuyet)) khongDo(`thieu vung: ${duong}`);
	if (!statSync(tuyet).isDirectory()) return [duong];
	return readdirSync(tuyet, { withFileTypes: true }).flatMap((m) => {
		const con = `${duong}/${m.name}`;
		if (biLoai(con)) return [];
		if (m.isDirectory()) return lietKe(con);
		return m.name.endsWith(".tsx") ? [con] : [];
	});
}

const tep = [...new Set(CAU_HINH.vung.flatMap(lietKe))].sort();
if (tep.length === 0) khongDo("vung khong co tep .tsx nao");
console.log(
	`tap tep: ${tep.length} (vung co dinh, ${CAU_HINH.vung.length} duong)`,
);

let sai = 0;
for (const t of tep) {
	const r = cong(t);
	const loiMau = quetMau(readFileSync(join(GOC, t), "utf8"));
	if (r.status === 0 && loiMau.length === 0) {
		console.log(`DUNG ${t}: design-gate ma 0, quet mau 0`);
		continue;
	}
	sai += 1;
	console.log(
		`SAI ${t}: design-gate ma ${r.status}, quet mau ${loiMau.length}`,
	);
	for (const l of loiMau) console.log(`  ${t}:${l.dong} ${l.ma}`);
	if (r.status !== 0)
		for (const d of `${r.stdout ?? ""}${r.stderr ?? ""}`
			.trim()
			.split("\n")
			.slice(0, 8))
			console.log(`  ${d}`);
}
console.log(
	`KET LUAN ${tep.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
