import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const HO_SO_NAY = "tro-ly-okr-tom-tat";
const DAN_CHAM_TEP = /cham-tep V\d+-\d+/;

const TEP = [
	"apps/api/test/okr-toan-canh-thuan.spec.ts",
	"apps/api/test/okr-toan-canh.spec.ts",
	"apps/api/test/okr-toan-canh-hieu-nang.spec.ts",
	"apps/api/test/okr-mau.spec.ts",
	"apps/api/test/vai-chi-okr.spec.ts",
];

const git = (...args) =>
	execFileSync("git", args, { cwd: GOC, encoding: "utf8", maxBuffer: 1 << 26 });

const boImport = (ma) =>
	ma.replace(/^import\b[^;]*?\bfrom\s+["'][^"']+["'];?[ \t]*\n/gm, "");

export const chiThem = (cu, nay) => {
	const dongNay = boImport(nay).split("\n");
	let vi = 0;
	for (const dong of boImport(cu).split("\n")) {
		while (vi < dongNay.length && dongNay[vi] !== dong) vi += 1;
		if (vi === dongNay.length) return false;
		vi += 1;
	}
	return true;
};

const docDong = (d) => {
	try {
		return JSON.parse(d);
	} catch {
		return null;
	}
};

export function dongFixChamTep(cwd, slug, tep) {
	const L = join(cwd, "_acceptance", slug, "decisions.jsonl");
	if (!existsSync(L)) return null;
	const dong = readFileSync(L, "utf8")
		.split("\n")
		.filter(Boolean)
		.map(docDong)
		.find(
			(o) =>
				o?.type === "fix" &&
				String(o.decision).includes(tep) &&
				DAN_CHAM_TEP.test(`${o.decided_by ?? ""} ${o.why ?? ""} ${o.decision}`),
		);
	return dong ? (dong.id ?? "(khong id)") : null;
}

export const xetTep = (cwd, tep, cu, nay) => {
	if (chiThem(cu, nay)) return { qua: true, dong: null };
	const dong = dongFixChamTep(cwd, HO_SO_NAY, tep);
	return { qua: dong !== null, dong };
};

const tuKiemDongFix = () => {
	const tep = "apps/api/test/a.spec.ts";
	const cu = `it("x", () => {\n\texpect(1).toBe(1);\n});\n`;
	const nay = cu.replace("toBe(1)", "toBe(2)");
	const dongSo = (ghiDe) =>
		JSON.stringify({
			id: "d-tu-kiem",
			type: "fix",
			decision: `${tep}: doi ky vong theo luat moi (cham-tep V5-15).`,
			why: "tu kiem",
			decided_by: "tu kiem",
			...ghiDe,
		});
	const ca = [
		["co dong fix dan cham-tep neu tep -> xanh", [dongSo({})], true],
		["khong co decisions.jsonl -> do", null, false],
		["decisions.jsonl khong co dong nao -> do", [], false],
		[
			"dong fix neu tep nhung khong dan cham-tep -> do",
			[dongSo({ decision: `${tep}: doi ky vong.` })],
			false,
		],
		[
			"dong dan cham-tep nhung type khac fix -> do",
			[dongSo({ type: "approach" })],
			false,
		],
		[
			"dong fix dan cham-tep neu tep khac -> do",
			[dongSo({ decision: "apps/api/test/b.spec.ts (cham-tep V5-15)." })],
			false,
		],
	];
	const tam = mkdtempSync(join(tmpdir(), "tro-ly-ky-vong-"));
	let loi = 0;
	try {
		for (const [ten, dong, mong] of ca) {
			const cwd = mkdtempSync(join(tam, "ca-"));
			if (dong !== null) {
				mkdirSync(join(cwd, "_acceptance", HO_SO_NAY), { recursive: true });
				writeFileSync(
					join(cwd, "_acceptance", HO_SO_NAY, "decisions.jsonl"),
					dong.map((d) => `${d}\n`).join(""),
				);
			}
			const thuc = xetTep(cwd, tep, cu, nay).qua;
			if (thuc !== mong) loi += 1;
			console.log(`${thuc === mong ? "ok" : "SAI"}: ${ten}`);
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
	return loi;
};

const tuKiem = () => {
	const goc = `import { a } from "./a";\n\nit("x", () => {\n\texpect(1).toBe(1);\n});\n`;
	const ca = [
		[
			"chi them ca moi -> xanh",
			goc + `\nit("y", () => {\n\texpect(2).toBe(2);\n});\n`,
			true,
		],
		[
			"them dong giua ca cu -> xanh",
			goc.replace("\texpect", "\tconst z = 1;\n\texpect"),
			true,
		],
		["doi import -> xanh", goc.replace(`{ a }`, `{ a, b }`), true],
		["doi mot dong expect -> do", goc.replace("toBe(1)", "toBe(2)"), false],
		[
			"xoa mot dong expect -> do",
			goc.replace("\texpect(1).toBe(1);\n", ""),
			false,
		],
	];
	let loi = 0;
	for (const [ten, nay, mong] of ca) {
		const thuc = chiThem(goc, nay);
		const dau = thuc === mong ? "ok" : "SAI";
		if (thuc !== mong) loi += 1;
		console.log(`${dau}: ${ten}`);
	}
	loi += tuKiemDongFix();
	if (loi > 0) process.exit(1);
};

if (process.argv.includes("--tu-kiem")) {
	tuKiem();
} else {
	const goc = git("merge-base", "HEAD", "origin/onehub").trim();
	let sua = 0;
	let nhan = 0;
	for (const tep of TEP) {
		const cu = git("show", `${goc}:${tep}`);
		const nay = readFileSync(join(GOC, tep), "utf8");
		const kq = xetTep(GOC, tep, cu, nay);
		if (kq.dong) {
			console.log(
				`ky vong sua, duoc nhan: ${tep} nho dong fix ${kq.dong} dan cham-tep trong _acceptance/${HO_SO_NAY}/decisions.jsonl`,
			);
			nhan += 1;
		}
		if (!kq.qua) {
			console.log(`ky vong bi sua: ${tep}`);
			sua += 1;
		}
	}
	if (sua > 0) process.exit(1);
	console.log(
		`ky vong khong doi: ${TEP.length - nhan} tep chi them dong hoac doi import, ${nhan} tep sua co dong fix dan cham-tep`,
	);
}
