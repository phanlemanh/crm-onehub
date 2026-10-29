import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VONG = "ve-sinh-do-san-onehub";
const NHAN = [`F8 neo (${VONG}):`, `${VONG} cach-toi:`, `${VONG} khai-trang:`];
const TAM_NHIN = 12;
const ROUTE = "apps/app/app/eve/agents/okr";
const NOI = /^\+\s*(status:\s*not-run|expected_exit:)/;
const DAN_CHAM_TEP = /cham-tep V\d+-\d+/;
const TEP_MOI = "tep moi tren nhanh";

function git(...thamSo) {
	const r = spawnSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});
	if (r.status !== 0) {
		console.log(`KHONG DO DUOC: git ${thamSo.join(" ")} — ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

function hoSoDaKy() {
	return readdirSync(join(GOC, "_acceptance"), { withFileTypes: true })
		.filter((m) => m.isDirectory() && m.name !== VONG)
		.map((m) => m.name)
		.filter((ten) => {
			const hd = join(GOC, "_acceptance", ten, "contract.md");
			if (!existsSync(hd)) return false;
			const tt = readFileSync(hd, "utf8").match(/^status:\s*(\S+)/m)?.[1];
			return tt === "signed-off" || tt === "machine-cleared";
		});
}

const docDong = (d) => {
	try {
		return JSON.parse(d);
	} catch {
		return null;
	}
};

function dongFixChamTep(cwd, slug, tep) {
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

function taoNhan(cwd, coTaiCoSo) {
	const daXet = new Map();
	return (tep) => {
		if (!daXet.has(tep)) {
			const slug = /^_acceptance\/([^/]+)\//.exec(tep)?.[1];
			const id = slug ? dongFixChamTep(cwd, slug, tep) : null;
			daXet.set(
				tep,
				!coTaiCoSo(tep)
					? TEP_MOI
					: id
						? `dong fix ${id} dan cham-tep trong _acceptance/${slug}/decisions.jsonl`
						: null,
			);
		}
		return daXet.get(tep);
	};
}

function hunkCua(diff) {
	const ra = [];
	let tep = null;
	let hunk = null;
	for (const dong of diff.split("\n")) {
		if (dong.startsWith("+++ ")) {
			tep = dong.slice(6);
			continue;
		}
		if (dong.startsWith("@@")) {
			const moi = Number(dong.match(/\+(\d+)/)?.[1] ?? 0);
			hunk = { tep, dong: moi, them: [] };
			ra.push(hunk);
			continue;
		}
		if (hunk && dong.startsWith("+") && !dong.startsWith("+++"))
			hunk.them.push(dong.slice(1));
	}
	return ra.filter((h) => h.them.length > 0);
}

function coKhai(hunk, docTep) {
	if (hunk.them.some((d) => NHAN.some((n) => d.includes(n)))) return true;
	if (hunk.tep.endsWith(".json"))
		return NHAN.some((n) => docTep(hunk.tep).includes(n));
	const dong = docTep(hunk.tep).split("\n");
	const tu = Math.max(0, hunk.dong - 1 - TAM_NHIN);
	const den = hunk.dong - 1 + hunk.them.length + TAM_NHIN;
	return dong.slice(tu, den).some((d) => NHAN.some((n) => d.includes(n)));
}

const KHOI_EVAL = /^\s*-\s+id:/;
const KHONG_CHAY = /^\+\s*status:\s*not-run\b/;
const THAY_BOI = /^\s*superseded_by:\s*([^#\s]+)#(AC-\d+)\s*$/;

function hoSoKyCo(cwd, slug, ac) {
	const hd = join(cwd, "_acceptance", slug, "contract.md");
	if (!existsSync(hd)) return false;
	const chu = readFileSync(hd, "utf8");
	const tt = chu.match(/^status:\s*(\S+)/m)?.[1];
	if (tt !== "signed-off" && tt !== "machine-cleared") return false;
	return new RegExp(`^\\s*-\\s+${ac}:`, "m").test(chu);
}

function thayBoiCuaKhoi(chu, dongMoi) {
	const dong = chu.split("\n");
	let dau = dongMoi - 1;
	while (dau >= 0 && !KHOI_EVAL.test(dong[dau])) dau -= 1;
	if (dau < 0) return null;
	let cuoi = dongMoi;
	while (cuoi < dong.length && !KHOI_EVAL.test(dong[cuoi])) cuoi += 1;
	for (const d of dong.slice(dau, cuoi)) {
		const m = THAY_BOI.exec(d);
		if (m) return { slug: m[1], ac: m[2] };
	}
	return null;
}

function taoNhanNoi(cwd, docTep) {
	return (tep, dongMoi, d) => {
		if (!KHONG_CHAY.test(d)) return null;
		const thay = thayBoiCuaKhoi(docTep(tep), dongMoi);
		if (!thay || !hoSoKyCo(cwd, thay.slug, thay.ac)) return null;
		const slug = /^_acceptance\/([^/]+)\//.exec(tep)?.[1];
		const id = slug ? dongFixChamTep(cwd, slug, tep) : null;
		if (!id) return null;
		return `superseded_by ${thay.slug}#${thay.ac} (da ky) va dong fix ${id} dan cham-tep trong _acceptance/${slug}/decisions.jsonl`;
	};
}

function soi(
	diffRang,
	diffEvals,
	diffRoute,
	docTep,
	nhanTep = () => null,
	nhanNoi = () => null,
) {
	const hong = [];
	const nhan = new Map();
	const hunk = hunkCua(diffRang);
	for (const h of hunk) {
		if (coKhai(h, docTep)) continue;
		const lyDo = nhanTep(h.tep);
		if (!lyDo) {
			hong.push(`HONG KHAI ${h.tep}:${h.dong}`);
			continue;
		}
		const cu = nhan.get(h.tep);
		nhan.set(h.tep, { lyDo, so: (cu?.so ?? 0) + 1 });
	}
	let tepEvals = null;
	let dongMoi = 0;
	const nhanNoiDa = new Map();
	for (const d of diffEvals.split("\n")) {
		if (d.startsWith("+++ ")) {
			tepEvals = d.slice(6);
			continue;
		}
		if (d.startsWith("@@")) {
			dongMoi = Number(d.match(/\+(\d+)/)?.[1] ?? 0);
			continue;
		}
		if (!d.startsWith("+")) continue;
		if (NOI.test(d)) {
			const lyDo = nhanNoi(tepEvals, dongMoi, d);
			if (lyDo) nhanNoiDa.set(`${tepEvals}:${dongMoi}`, lyDo);
			else hong.push(`HONG NOI ${tepEvals}`);
		}
		dongMoi += 1;
	}
	if (diffRoute.trim()) hong.push("HONG ROUTE");
	return { hong, soHunk: hunk.length, nhan, nhanNoi: nhanNoiDa };
}

if (process.argv.includes("--tu-thu")) {
	const gia = (tep, them) =>
		`+++ b/${tep}\n@@ -1,0 +5,1 @@\n${them.map((d) => `+${d}`).join("\n")}\n`;
	const rong = () => "";
	const thieu = soi(
		gia("_acceptance/x/rang/a.mjs", ["const a = 1;"]),
		"",
		"",
		rong,
	);
	if (!thieu.hong.some((h) => h.startsWith("HONG KHAI"))) {
		console.log("HONG tu kiem khai: hunk khong chu thich ma khong bat");
		process.exit(1);
	}
	console.log("OK tu kiem khai");
	const coNhan = soi(
		gia("_acceptance/x/rang/a.mjs", [`// ${NHAN[1]} ly do`, "const a = 1;"]),
		"",
		"",
		rong,
	);
	if (coNhan.hong.length > 0) {
		console.log("HONG tu kiem khai: hunk co chu thich van bi bat");
		process.exit(1);
	}
	const noi = soi(
		"",
		gia("_acceptance/x/evals.yaml", ["    status: not-run"]),
		"",
		rong,
	);
	if (!noi.hong.includes("HONG NOI _acceptance/x/evals.yaml")) {
		console.log("HONG tu kiem noi: them status: not-run ma khong bat");
		process.exit(1);
	}
	console.log("OK tu kiem noi");
	const tep = "_acceptance/x/rang/a.mjs";
	const coDong = soi(gia(tep, ["const a = 1;"]), "", "", rong, (t) =>
		t === tep ? "dong fix d-1 dan cham-tep" : null,
	);
	if (coDong.hong.length > 0 || coDong.nhan.get(tep)?.so !== 1) {
		console.log(
			"HONG tu kiem dong fix: hunk co dong fix dan cham-tep van bi bat",
		);
		process.exit(1);
	}
	const tam = mkdtempSync(join(tmpdir(), "vs-khong-noi-"));
	try {
		const dongSo = (ghiDe) =>
			JSON.stringify({
				id: "d-tu-thu",
				type: "fix",
				decision: `${tep}: doi thuoc theo luat moi (cham-tep V5-15).`,
				why: "tu thu",
				decided_by: "tu thu",
				...ghiDe,
			});
		const ca = [
			["co dong fix dan cham-tep neu tep", [dongSo({})], false],
			["khong co decisions.jsonl", null, true],
			["decisions.jsonl rong", [], true],
			[
				"dong fix neu tep khong dan cham-tep",
				[dongSo({ decision: `${tep}: doi thuoc.` })],
				true,
			],
			["dong dan cham-tep type khac fix", [dongSo({ type: "approach" })], true],
			[
				"dong fix dan cham-tep neu tep khac",
				[dongSo({ decision: "_acceptance/x/rang/b.mjs (cham-tep V5-15)." })],
				true,
			],
		];
		let loi = 0;
		for (const [ten, dong, mongHong] of ca) {
			const cwd = mkdtempSync(join(tam, "ca-"));
			if (dong !== null) {
				mkdirSync(join(cwd, "_acceptance", "x"), { recursive: true });
				writeFileSync(
					join(cwd, "_acceptance", "x", "decisions.jsonl"),
					dong.map((d) => `${d}\n`).join(""),
				);
			}
			const kq = soi(
				gia(tep, ["const a = 1;"]),
				"",
				"",
				rong,
				taoNhan(cwd, () => true),
			);
			const thucHong = kq.hong.includes(`HONG KHAI ${tep}:5`);
			if (thucHong !== mongHong) loi += 1;
			console.log(
				`${thucHong === mongHong ? "ok" : "SAI"} dong fix: ${ten} -> ${mongHong ? "do" : "xanh"}`,
			);
		}
		const ev = "_acceptance/x/evals.yaml";
		const khoi = (them) =>
			["evals:", "  - id: E1", "    criterion: AC-1", ...them, ""].join("\n");
		const hd = (tt) => `---\nstatus: ${tt}\n---\n- AC-4: mot dieu\n`;
		const caNoi = [
			[
				"not-run co superseded_by da ky va dong fix",
				["    status: not-run", "    superseded_by: y#AC-4"],
				"signed-off",
				true,
				false,
			],
			[
				"not-run khong superseded_by",
				["    status: not-run"],
				"signed-off",
				true,
				true,
			],
			[
				"not-run tro ho so chua ky",
				["    status: not-run", "    superseded_by: y#AC-4"],
				"draft",
				true,
				true,
			],
			[
				"not-run tro AC khong co",
				["    status: not-run", "    superseded_by: y#AC-9"],
				"signed-off",
				true,
				true,
			],
			[
				"not-run khong dong fix",
				["    status: not-run", "    superseded_by: y#AC-4"],
				"signed-off",
				false,
				true,
			],
			[
				"expected_exit du dieu kien van do",
				["    expected_exit: 2", "    superseded_by: y#AC-4"],
				"signed-off",
				true,
				true,
			],
		];
		for (const [ten, them, tt, coFix, mongHong] of caNoi) {
			const cwd = mkdtempSync(join(tam, "noi-"));
			mkdirSync(join(cwd, "_acceptance", "x"), { recursive: true });
			mkdirSync(join(cwd, "_acceptance", "y"), { recursive: true });
			writeFileSync(join(cwd, "_acceptance", "y", "contract.md"), hd(tt));
			writeFileSync(join(cwd, ev), khoi(them));
			if (coFix)
				writeFileSync(
					join(cwd, "_acceptance", "x", "decisions.jsonl"),
					`${dongSo({ decision: `${ev}: khai not-run kem superseded_by (cham-tep V5-3).` })}\n`,
				);
			const doc = (t) => readFileSync(join(cwd, t), "utf8");
			const kqNoi = soi(
				"",
				`+++ b/${ev}\n@@ -3,0 +4,${them.length} @@\n${them.map((d) => `+${d}`).join("\n")}\n`,
				"",
				doc,
				() => null,
				taoNhanNoi(cwd, doc),
			);
			const thucHong = kqNoi.hong.includes(`HONG NOI ${ev}`);
			if (thucHong !== mongHong) loi += 1;
			console.log(
				`${thucHong === mongHong ? "ok" : "SAI"} not-run: ${ten} -> ${mongHong ? "do" : "xanh"}`,
			);
		}
		const moi = soi(
			gia(tep, ["const a = 1;"]),
			"",
			"",
			rong,
			taoNhan(join(tam, "khong-co"), () => false),
		);
		const moiDung =
			moi.hong.length === 0 && moi.nhan.get(tep)?.lyDo === TEP_MOI;
		if (!moiDung) loi += 1;
		console.log(
			`${moiDung ? "ok" : "SAI"} dong fix: tep moi tren nhanh -> xanh`,
		);
		if (loi > 0) {
			console.log(`HONG tu kiem dong fix: ${loi} ca sai`);
			process.exit(1);
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
	console.log("OK tu kiem dong fix");
	process.exit(0);
}

const mb = git("merge-base", "HEAD", "origin/onehub").trim();
const daKy = hoSoDaKy();
const rang = daKy.map((t) => `_acceptance/${t}/rang`);
const evals = daKy.map((t) => `_acceptance/${t}/evals.yaml`);
const diffRang = git("diff", "-U0", `${mb}..HEAD`, "--", ...rang);
const diffEvals = git("diff", "-U0", `${mb}..HEAD`, "--", ...evals);
const diffRoute = git("diff", `${mb}..HEAD`, "--", ROUTE);
const docGoc = (tep) => readFileSync(join(GOC, tep), "utf8");
const kq = soi(
	diffRang,
	diffEvals,
	diffRoute,
	docGoc,
	taoNhan(
		GOC,
		(tep) =>
			spawnSync("git", ["-C", GOC, "cat-file", "-e", `${mb}:${tep}`]).status ===
			0,
	),
	taoNhanNoi(GOC, docGoc),
);
for (const [tep, { lyDo, so }] of kq.nhan)
	console.log(`NHAN ${tep}: ${so} hunk nho ${lyDo}`);
for (const [cho, lyDo] of kq.nhanNoi)
	console.log(`NHAN NOI ${cho}: not-run nho ${lyDo}`);
for (const h of kq.hong) console.log(h);
if (kq.hong.length > 0) process.exit(1);
const soNhan = [...kq.nhan.values()].reduce((a, n) => a + n.so, 0);
console.log(
	`khong-noi: ${kq.soHunk} hunk co khai (${kq.soHunk - soNhan} chu thich nhan, ${soNhan} dong fix dan cham-tep hay tep moi; moc ${mb.slice(0, 9)})`,
);
