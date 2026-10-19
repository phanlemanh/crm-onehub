import { spawnSync } from "node:child_process";
import {
	cpSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RANG = dirname(fileURLToPath(import.meta.url));
const GOC_THAT = resolve(RANG, "..", "..", "..");
const MAU = /getSession\(|verifyApiKey|API_KEY_HEADER|x-api-key/;
const THU_MUC = [
	{ goc: "apps/api/src", bo: ["generated"] },
	{ goc: "apps/app", bo: ["node_modules", "test", "proto"] },
	{ goc: "apps/agent/agent", bo: [".eve", "node_modules", "test"] },
	{ goc: "packages/auth/src", bo: [] },
];
const DUOI = /\.(ts|tsx|mjs)$/;
const THONG_DIEP = "duong doc khoa chua co o";

function tepNguon(goc, tuongDoi, bo) {
	const ra = [];
	const di = (thuMuc) => {
		for (const ten of readdirSync(thuMuc)) {
			if (bo.includes(ten) || ten.startsWith(".next")) continue;
			const day = join(thuMuc, ten);
			if (statSync(day).isDirectory()) di(day);
			else if (DUOI.test(ten)) ra.push(day);
		}
	};
	di(join(goc, tuongDoi));
	return ra;
}

async function duongPlugin(goc) {
	const duong = Bun.resolveSync(
		"@better-auth/api-key",
		join(goc, "packages", "auth"),
	);
	const { apiKey } = await import(duong);
	return Object.entries(apiKey().endpoints).map(([ten, e]) => ({
		ten,
		path: e.path,
	}));
}

async function do1(goc) {
	const bang = JSON.parse(
		readFileSync(
			join(goc, "_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json"),
			"utf8",
		),
	);
	const oCua = new Map();
	for (const d of bang.duong) for (const c of d.cho) oCua.set(c, d.o);
	const mien = new Set(bang.mien.map((m) => m.cho));
	const sai = [];
	const thay = new Set();
	for (const { goc: g, bo } of THU_MUC) {
		for (const tep of tepNguon(goc, g, bo)) {
			if (!MAU.test(readFileSync(tep, "utf8"))) continue;
			const ten = relative(goc, tep);
			thay.add(ten);
			if (oCua.has(ten)) console.log(`DUNG ${ten} -> o ${oCua.get(ten)}`);
			else if (mien.has(ten)) console.log(`DUNG ${ten} -> mien`);
			else {
				console.log(`SAI ${ten} -> ${THONG_DIEP}`);
				sai.push(ten);
			}
		}
	}
	for (const c of [...oCua.keys(), ...mien]) {
		if (!thay.has(c)) {
			console.log(`SAI ${c} -> o tro cho khong con doc khoa`);
			sai.push(c);
		}
	}
	const plugin = await duongPlugin(goc);
	const trongBang = new Set(bang.duong.map((d) => d.plugin).filter(Boolean));
	const mienPlugin = new Set(bang.plugin_mien.map((m) => m.ten));
	for (const p of plugin) {
		if (p.path && trongBang.has(p.path)) console.log(`DUNG plugin ${p.path}`);
		else if (!p.path && mienPlugin.has(p.ten))
			console.log(`DUNG plugin ${p.ten} -> mien`);
		else {
			console.log(`SAI plugin ${p.path ?? p.ten} -> ${THONG_DIEP}`);
			sai.push(p.path ?? p.ten);
		}
	}
	return sai;
}

async function phaThu() {
	const tam = mkdtempSync(join(tmpdir(), "tvk-duong-doc-khoa-"));
	try {
		const lay = spawnSync(
			"bash",
			["-c", `git -C "${GOC_THAT}" archive HEAD | tar -x -C "${tam}"`],
			{ encoding: "utf8" },
		);
		if (lay.status !== 0) throw new Error(`khong chep duoc cay: ${lay.stderr}`);
		cpSync(
			join(
				GOC_THAT,
				"_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json",
			),
			join(tam, "_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json"),
		);
		spawnSync("ln", [
			"-s",
			join(GOC_THAT, "packages/auth/node_modules"),
			join(tam, "packages/auth/node_modules"),
		]);
		writeFileSync(
			join(tam, "apps/api/src/doc-khoa-tam.ts"),
			'export const H = "x-api-key";\n',
		);
		const sai = await do1(tam);
		const dung = sai.includes("apps/api/src/doc-khoa-tam.ts");
		console.log(
			dung
				? `PHA-THU DUNG: ban sao co cho doc khoa moi -> do "${THONG_DIEP}"`
				: "PHA-THU SAI: ban sao khong do",
		);
		return dung;
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

if (process.argv.includes("--pha-thu")) {
	process.exit((await phaThu()) ? 0 : 1);
}
const sai = await do1(GOC_THAT);
console.log(
	sai.length === 0
		? "KET LUAN: moi cho doc khoa co o"
		: `KET LUAN: ${sai.length} cho sai`,
);
process.exit(sai.length === 0 ? 0 : 1);
