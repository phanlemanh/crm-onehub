import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, normalize } from "node:path";
import { bangTrongDesign, cloneDocLap, GOC, git, Ket, MB, SLUG } from "./chung.mjs";
import { giaiGoi, napGoi } from "./goi.mjs";

const require = createRequire(import.meta.url);
const { parseEvals, stripComment } = require(join(GOC, "lib", "eval-yaml.cjs"));
const BAN_CU = "scripts/dieu-phoi";
const DUOI_MA = /\.(mjs|cjs|js|ts|tsx|mts|cts)$/;
const MAU_IMPORT = [
	/\b(?:import|export)\s[^'"`;]*?\bfrom\s*['"](\.[^'"]+)['"]/g,
	/\bimport\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g,
	/\brequire\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g,
	/\bimport\s+['"](\.[^'"]+)['"]/g,
];

const ket = new Ket();
const goi = giaiGoi();
const { kiemChuyen } = await napGoi(goi, "scripts/dieu-phoi.mjs");
const mien = new Set(
	bangTrongDesign("Danh sách miễn").map((o) => o[0]).filter((x) => /^[a-z0-9-]+\/E\d+$/.test(x)),
);
if (mien.size === 0) {
	console.log("KHONG DO DUOC: danh sach mien rong");
	process.exit(2);
}

function khoiCua(dong, so) {
	for (let i = so - 1; i >= 0; i--) {
		const m = /^ {2}- id:\s*(\S+)\s*$/.exec(dong[i]);
		if (m) {
			let j = i + 1;
			while (j < dong.length && !/^ {2}- id:/.test(dong[j]) && !/^\S/.test(dong[j])) j++;
			const chet = dong.slice(i, j).some((d) => /^ {4}status:\s*["']?not-run["']?\s*(#.*)?$/.test(d));
			return { id: m[1], chet };
		}
		if (/^\S/.test(dong[i])) return null;
	}
	return null;
}

function executorSong(goc) {
	const song = new Set();
	git(goc, "ls-files", "_acceptance/*/evals.yaml")
		.split("\n")
		.filter(Boolean)
		.forEach((tep) => {
			for (const e of parseEvals(readFileSync(join(goc, tep), "utf8"), ["cmd", "status"], (s) => stripComment(String(s)).trim())) {
				if (e.status.replace(/["']/g, "") === "not-run") continue;
				const m = /^config:(executors\.[\w-]+\.[\w-]+)$/.exec(e.cmd.replace(/["']/g, ""));
				if (m) song.add(m[1]);
			}
		});
	return song;
}

function khoaConfig(dong, so) {
	const m = /^ {4}([\w-]+):/.exec(dong[so - 1] ?? "");
	if (!m) return null;
	for (let i = so - 2; i >= 0; i--) {
		const n = /^ {2}([\w-]+):\s*$/.exec(dong[i]);
		if (n) {
			for (let k = i - 1; k >= 0; k--) {
				if (/^\S/.test(dong[k])) return dong[k].startsWith("executors:") ? `executors.${n[1]}.${m[1]}` : null;
			}
			return null;
		}
		if (/^\S/.test(dong[i])) return null;
	}
	return null;
}

function phanLop(goc, dsDong) {
	const song = executorSong(goc);
	const lop = {};
	const ngoai = [];
	const khoiSong = new Set();
	const doc = new Map();
	const dongCua = (tep) => {
		if (!doc.has(tep)) doc.set(tep, readFileSync(join(goc, tep), "utf8").split("\n"));
		return doc.get(tep);
	};
	const xep = (ten) => {
		lop[ten] = (lop[ten] ?? 0) + 1;
	};
	for (const muc of dsDong) {
		const i = muc.lastIndexOf(":");
		const tep = muc.slice(0, i);
		const so = Number(muc.slice(i + 1));
		const hs = /^_acceptance\/([^/]+)\/(.+)$/.exec(tep);
		if (hs && hs[1] === SLUG) xep("ho-so-nay");
		else if (hs && hs[2] === "evals.yaml") {
			const k = khoiCua(dongCua(tep), so);
			if (k?.chet) xep("eval-chet");
			else if (k && mien.has(`${hs[1]}/${k.id}`)) {
				xep("eval-song-mien");
				khoiSong.add(`${hs[1]}/${k.id}`);
			} else {
				ngoai.push(muc);
				if (k) khoiSong.add(`${hs[1]}/${k.id}`);
			}
		} else if (hs && hs[1] === "config.yaml") ngoai.push(muc);
		else if (tep === "_acceptance/config.yaml") {
			const khoa = khoaConfig(dongCua(tep), so);
			if (khoa && !song.has(khoa)) xep("executor-chet");
			else ngoai.push(muc);
		} else if (hs) xep("ho-so-khac");
		else if (tep.startsWith("docs/superpowers/")) xep("ke-hoach-cu");
		else if (tep.startsWith("docs/plan/dot-sau-14-10/") || tep === "docs/plan/phan-loai-do-kiem-cheo.md") xep("dot-da-dong");
		else if (/^docs\/plan\/lo-trinh-[^/]+\.json$/.test(tep) || tep === "LO-TRINH.html") xep("ten-viec-lo-trinh");
		else ngoai.push(muc);
	}
	return { lop, ngoai, khoiSong };
}

function quetImport(goc) {
	const vi = [];
	for (const tep of git(goc, "ls-files").split("\n")) {
		if (!DUOI_MA.test(tep) || tep.startsWith(`${BAN_CU}/`) || tep.startsWith("_acceptance/") || tep.startsWith("docs/") || tep.includes("node_modules/")) continue;
		let chu;
		try {
			chu = readFileSync(join(goc, tep), "utf8");
		} catch {
			continue;
		}
		if (!chu.includes("dieu-phoi")) continue;
		for (const mau of MAU_IMPORT) {
			for (const m of chu.matchAll(mau)) {
				const dich = normalize(join(dirname(tep), m[1]));
				if (dich === BAN_CU || dich.startsWith(`${BAN_CU}/`)) vi.push(`${tep} -> ${m[1]}`);
			}
		}
	}
	return vi;
}

function do_(goc) {
	const ds = kiemChuyen(goc);
	const { lop, ngoai, khoiSong } = phanLop(goc, ds);
	const imp = quetImport(goc);
	const conBanCu = git(goc, "ls-files", BAN_CU).split("\n").filter(Boolean);
	const doDs = [];
	for (const m of ngoai) doDs.push(`DO ngoai-lop ${m.slice(0, m.lastIndexOf(":"))} (${m})`);
	const thua = [...khoiSong].filter((x) => !mien.has(x));
	const thieu = [...mien].filter((x) => !khoiSong.has(x));
	if (thua.length || thieu.length) doDs.push(`DO mien-lech thua=${thua.join(",")} thieu=${thieu.join(",")}`);
	for (const v of imp) doDs.push(`DO import ${v.split(" -> ")[0]} (${v})`);
	if (conBanCu.length) doDs.push(`DO con-ban-cu ${conBanCu.length} tep`);
	return { ds, lop, ngoai, imp, conBanCu, doDs };
}

const head = git(GOC, "rev-parse", "HEAD").trim();
const ban = cloneDocLap(head, "kiem-chuyen");
try {
	const r = do_(ban.goc);
	console.log(`kiemChuyen tren clone ${head.slice(0, 12)}: ${r.ds.length} dong · ${JSON.stringify(r.lop)}`);
	console.log(`ngoai lop: ${r.ngoai.length}`);
	console.log(`scripts/dieu-phoi: ${r.conBanCu.length} tep`);
	console.log(`import vao ban cu: ${r.imp.length}`);
	ket.kiem(r.doDs.length === 0, "cay HEAD", r.doDs.slice(0, 8).join(" | "));

	const nen = cloneDocLap(MB, "kiem-chuyen-mb");
	try {
		const n = do_(nen.goc);
		const tepImp = [...new Set(n.imp.map((v) => v.split(" -> ")[0]))].sort();
		ket.kiem(n.ngoai.length > 0, `doi-chung-duong merge-base ngoai lop ${n.ngoai.length}`, "merge-base khong co dong ngoai lop — bo phan lop khong phan biet duoc");
		ket.kiem(
			JSON.stringify(tepImp) === JSON.stringify(["scripts/kiem-cheo/dem.mjs", "scripts/kiem-cheo/khoa.mjs", "scripts/kiem-cheo/test/khoa.test.mjs"]),
			`doi-chung-duong merge-base import ${n.imp.length}`,
			`tep import: ${tepImp.join(",")}`,
		);
	} finally {
		nen.don();
	}

	const tepSua = (tep, sua) => {
		const p = join(ban.goc, tep);
		const goc0 = readFileSync(p, "utf8");
		writeFileSync(p, sua(goc0));
		try {
			return do_(ban.goc).doDs;
		} finally {
			writeFileSync(p, goc0);
		}
	};
	ket.bat(
		"settings-hook-cu",
		tepSua(".claude/settings.json", (t) => {
			const j = JSON.parse(t);
			j.hooks = { PostToolUse: [{ matcher: "*", hooks: [{ type: "command", command: 'exec node "$CLAUDE_PROJECT_DIR/scripts/dieu-phoi/hook-nhip.mjs"' }] }] };
			return `${JSON.stringify(j, null, 2)}\n`;
		}),
		"DO ngoai-lop .claude/settings.json",
	);
	const [slugBang, idBang] = bangTrongDesign("Eval cũ thay bởi vòng này")[0][0].split("/");
	ket.bat(
		"eval-mat-not-run",
		tepSua(`_acceptance/${slugBang}/evals.yaml`, (t) => {
			const dong = t.split("\n");
			const i = dong.indexOf(`  - id: ${idBang}`);
			const k = dong.findIndex((d, n) => n > i && /^ {4}status: not-run/.test(d));
			dong.splice(k, 1);
			return dong.join("\n");
		}),
		`DO ngoai-lop _acceptance/${slugBang}/evals.yaml`,
	);
	ket.bat(
		"import-tuong-doi",
		tepSua("scripts/kiem-cheo/khoa.mjs", (t) => `import { timThuMucDot } from "../dieu-phoi/dot.mjs";\n${t}`),
		"DO import scripts/kiem-cheo/khoa.mjs",
	);
} finally {
	ban.don();
}
ket.ket();
