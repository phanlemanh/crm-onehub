import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { doTaiGop } from "./cau-hinh.mjs";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const SLUG = "cap-nhat-tuan-okr";
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const MAY = new Set(["test", "script"]);
const HO_SO_DAT_OKR = "dat-okr-trong-crm";

doTaiGop(TEP_NAY);

function dung(ma, loi) {
	console.log(loi);
	process.exit(ma);
}

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();

function khuon(glob) {
	let re = "";
	for (let i = 0; i < glob.length; i++) {
		const c = glob[i];
		if (c === "*") {
			if (glob[i + 1] === "*") {
				re += ".*";
				i++;
				if (glob[i + 1] === "/") i++;
			} else re += "[^/]*";
		} else if (c === "?") re += "[^/]";
		else if (".+^$()[]{}|\\".includes(c)) re += `\\${c}`;
		else re += c;
	}
	return new RegExp(`^${re}$`);
}

const DUOI_TEP = /[\w.\-/]+\.(?:tsx|ts|mjs|cjs|js|sh)\b/g;

function tepTrongLenh(lenh) {
	const cds = [...lenh.matchAll(/(?:^|&&|;)\s*cd\s+([^\s&;]+)/g)].map((m) => ({
		idx: m.index,
		dir: m[1],
	}));
	const ra = new Set();
	for (const m of lenh.matchAll(DUOI_TEP)) {
		let dir = "";
		for (const c of cds) {
			if (c.idx <= m.index) dir = c.dir;
			else break;
		}
		let duong = dir ? join(dir, m[0]) : m[0];
		duong = duong.replace(/^\.\//, "");
		if (existsSync(join(GOC, duong))) ra.add(duong);
	}
	return [...ra];
}

function docYaml(tep) {
	try {
		return Bun.YAML.parse(readFileSync(tep, "utf8"));
	} catch (loi) {
		return dung(2, `KHONG DO DUOC: khong doc duoc ${tep} — ${loi.message}`);
	}
}

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
};
const duongTuyChon = (v) => (v.startsWith("/") ? v : join(GOC, v));

if (process.argv.includes("--chieu-do")) {
	const CAU_HINH_THAT = join(dirname(TEP_NAY), "cau-hinh.mjs");
	const { HO_SO_BI_CHAM: HO_SO_GOC } = await import(
		pathToFileURL(CAU_HINH_THAT).href
	);
	const thuMuc = mkdtempSync(join(tmpdir(), "ho-so-bi-cham-"));

	function chay(doi) {
		const r = spawnSync(process.execPath, [TEP_NAY, ...doi], {
			cwd: GOC,
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
		return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
	}

	const capThieu = join(thuMuc, "cau-hinh-thieu.mjs");
	const tenThieu = HO_SO_GOC[0];
	writeFileSync(
		capThieu,
		`export { VONG } from ${JSON.stringify(CAU_HINH_THAT)};\nexport const HO_SO_BI_CHAM = ${JSON.stringify(HO_SO_GOC.slice(1))};\n`,
	);

	const capThua = join(thuMuc, "cau-hinh-thua.mjs");
	const tenThua = "khong-ton-tai-mot-ho-so-nhu-vay";
	writeFileSync(
		capThua,
		`export { VONG } from ${JSON.stringify(CAU_HINH_THAT)};\nexport const HO_SO_BI_CHAM = ${JSON.stringify([...HO_SO_GOC, tenThua])};\n`,
	);

	const tenHoaCu = "khoa-lo-giu-tran";
	const preMergeGia = join(thuMuc, "pre-merge-gia.txt");
	writeFileSync(
		preMergeGia,
		[
			`VIOLATION [${SLUG}]: verdict=REJECT (must be PASS to merge)`,
			`VIOLATION [${tenHoaCu}]: evidence is stale — code changed after verify (verified_commit 0000000); re-run verify before merge. Changed:`,
			"    apps/app/package.json",
			"pre-merge-check: rules ran=4 declared-off=0 expected=4",
		].join("\n"),
	);

	const preMergeChet = join(thuMuc, "pre-merge-chet.txt");
	writeFileSync(
		preMergeChet,
		`VIOLATION [${SLUG}]: verdict=BLOCKED (must be PASS to merge)\n`,
	);

	const ca = [
		{
			ten: "bo mot ten khoi HO_SO_BI_CHAM",
			doi: ["--cau-hinh", capThieu, "--chi-tap"],
			ghim: `thieu ho so: ${tenThieu}`,
		},
		{
			ten: "them mot ten thua vao HO_SO_BI_CHAM",
			doi: ["--cau-hinh", capThua, "--chi-tap"],
			ghim: `ho so khong bi cham: ${tenThua}`,
		},
		{
			ten: "luoi truoc gop bao mot ho so hoa cu",
			doi: ["--pre-merge-tu", preMergeGia],
			ghim: `ho so hoa cu chua ghim lai: ${tenHoaCu}`,
		},
		{
			ten: "luoi truoc gop chet giua chung (khong co dong tong ket)",
			doi: ["--pre-merge-tu", preMergeChet],
			ghim: "thieu dong tong ket",
		},
	];
	let lot = 0;
	for (const c of ca) {
		const { ma, ra } = chay(c.doi);
		const bat = ma === 1 && ra.includes(c.ghim);
		if (!bat) lot += 1;
		console.log(
			`${bat ? "bat " : "LOT "} ${c.ten}: ma ${ma}, ${bat ? `in «${c.ghim}»` : `khong in «${c.ghim}»: ${ra.trim().slice(-400)}`}`,
		);
	}
	rmSync(thuMuc, { recursive: true, force: true });
	console.log(`chieu do: ${ca.length - lot}/${ca.length} ca do bi bat`);
	process.exit(lot === 0 ? 0 : 1);
}

const DUONG_CAU_HINH_KHOI_DONG = doiSo("--cau-hinh");
const { VONG, HO_SO_BI_CHAM } = await import(
	pathToFileURL(
		DUONG_CAU_HINH_KHOI_DONG
			? duongTuyChon(DUONG_CAU_HINH_KHOI_DONG)
			: join(dirname(TEP_NAY), "cau-hinh.mjs"),
	).href
);

const DUONG_CONFIG = doiSo("--config")
	? duongTuyChon(doiSo("--config"))
	: join(GOC, "_acceptance", "config.yaml");
const cauHinh = docYaml(DUONG_CONFIG);
const bangLenh = new Map(
	Object.entries(cauHinh.executors ?? {}).flatMap(([nhom, khoa]) =>
		Object.entries(khoa ?? {}).map(([ten, lenh]) => [
			`config:executors.${nhom}.${ten}`,
			String(lenh),
		]),
	),
);
function giai(ref) {
	return (
		bangLenh.get(ref) ??
		dung(2, `KHONG DO DUOC: ref ${ref} khong giai duoc trong ${DUONG_CONFIG}`)
	);
}

const D = git("diff", "--name-only", `${VONG.truoc}..HEAD`)
	.split("\n")
	.filter((t) => t && !t.startsWith("_acceptance/"));
console.log(`diff ${VONG.truoc}..HEAD (bo _acceptance/**): ${D.length} tep`);

const hoSo = [];
for (const ten of readdirSync(join(GOC, "_acceptance"))) {
	const hopDong = join(GOC, "_acceptance", ten, "contract.md");
	const evals = join(GOC, "_acceptance", ten, "evals.yaml");
	if (ten === SLUG || !existsSync(hopDong) || !existsSync(evals)) continue;
	const trangThai =
		/^status:\s*(\S+)/m.exec(readFileSync(hopDong, "utf8"))?.[1] ?? "";
	hoSo.push({ ten, daKy: DA_KY.has(trangThai), evals });
}

const evalsDaKy = hoSo
	.filter((h) => h.daKy)
	.flatMap((h) =>
		(docYaml(h.evals).evals ?? [])
			.filter((e) => MAY.has(e.executor) && e.status !== "not-run")
			.map((e) => ({
				ho: h.ten,
				id: `${h.ten}:${e.id}`,
				cmd: e.cmd,
				khuon: (e.paths ?? []).map(khuon),
			})),
	);

function evalBiCham(e) {
	const khopPaths = e.khuon.some((k) => D.some((t) => k.test(t)));
	if (khopPaths) return true;
	const lenh = giai(e.cmd);
	const tepLenh = tepTrongLenh(lenh);
	return tepLenh.some((t) => D.includes(t));
}

const evalsBiCham = evalsDaKy.filter(evalBiCham);
const hoSoBiChamMay = [...new Set(evalsBiCham.map((e) => e.ho))].sort();

console.log(`ho so da ky duoc soi: ${hoSo.filter((h) => h.daKy).length}`);
console.log(`ho so bi cham (may rut): ${hoSoBiChamMay.join(", ") || "(rong)"}`);
console.log(
	`HO_SO_BI_CHAM (cau-hinh.mjs): ${[...HO_SO_BI_CHAM].sort().join(", ") || "(rong)"}`,
);

if (hoSoBiChamMay.length === 0) {
	dung(
		2,
		"KHONG DO DUOC: khong ho so nao bi cham trong diff — khong co gi de soi",
	);
}

const khai = new Set(HO_SO_BI_CHAM);
const may = new Set(hoSoBiChamMay);
const hong = [];
for (const ten of may) if (!khai.has(ten)) hong.push(`thieu ho so: ${ten}`);
for (const ten of khai)
	if (!may.has(ten)) hong.push(`ho so khong bi cham: ${ten}`);
for (const h of hong) console.log(`HONG ${h}`);
if (hong.length > 0) process.exit(1);
console.log(
	`khop: ${hoSoBiChamMay.length} ho so bi cham == HO_SO_BI_CHAM khai o cau-hinh.mjs`,
);

if (process.argv.includes("--chi-tap")) {
	console.log("--chi-tap: dung o day, khong chay eval nao");
	process.exit(0);
}

const doHong = [];

const decisionsDatOkr = join(
	GOC,
	"_acceptance",
	HO_SO_DAT_OKR,
	"decisions.jsonl",
);
const coDong = existsSync(decisionsDatOkr)
	? readFileSync(decisionsDatOkr, "utf8")
			.split("\n")
			.some(
				(d) =>
					d.includes("cap-nhat-tuan-okr") &&
					d.includes("AC-16") &&
					d.includes("E5"),
			)
	: false;
console.log(
	`${HO_SO_DAT_OKR}/decisions.jsonl nhac cap-nhat-tuan-okr + AC-16 + E5: ${coDong ? "co" : "KHONG"}`,
);
if (!coDong) doHong.push(`thieu dong trong ${HO_SO_DAT_OKR}/decisions.jsonl`);

const evalsDatOkrDoi = spawnSync("git", [
	"-C",
	GOC,
	"diff",
	"--quiet",
	`${VONG.truoc}..HEAD`,
	"--",
	`_acceptance/${HO_SO_DAT_OKR}/evals.yaml`,
]).status;
console.log(
	`${HO_SO_DAT_OKR}/evals.yaml so voi ${VONG.truoc}: ${evalsDatOkrDoi === 0 ? "khong doi" : "DA DOI"}`,
);
if (evalsDatOkrDoi !== 0)
	doHong.push(`${HO_SO_DAT_OKR}/evals.yaml da doi so voi VONG.truoc`);

if (doHong.length > 0) {
	for (const h of doHong) console.log(`HONG ${h}`);
	process.exit(1);
}

const laToTien = (sha, dich) =>
	spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", sha, dich])
		.status === 0;

const ghimTrenNhanh = [];
for (const ten of hoSoBiChamMay) {
	const tep = join(GOC, "_acceptance", ten, "run-log.jsonl");
	if (!existsSync(tep)) continue;
	for (const dong of readFileSync(tep, "utf8").split("\n")) {
		if (!dong.includes('"kind":"repin"')) continue;
		const d = JSON.parse(dong);
		if (!d.sha || !laToTien(d.sha, "HEAD") || laToTien(d.sha, VONG.truoc))
			continue;
		const xanh =
			(d.suites_exit ?? []).every((m) => m === 0) &&
			Object.values(d.evals_exit ?? {}).every((m) => m === 0) &&
			Object.keys(d.evals_exit ?? {}).length > 0;
		ghimTrenNhanh.push({ ten, runId: d.run_id, xanh });
	}
}
for (const g of ghimTrenNhanh)
	console.log(
		`ghim lai tren nhanh: ${g.ten} ${g.runId} ${g.xanh ? "xanh" : "DO"}`,
	);
for (const g of ghimTrenNhanh.filter((x) => !x.xanh))
	doHong.push(`luot ghim lai tren nhanh khong xanh: ${g.ten} ${g.runId}`);

const PRE_MERGE_TU = doiSo("--pre-merge-tu");
let raTruocGop;
if (PRE_MERGE_TU) raTruocGop = readFileSync(duongTuyChon(PRE_MERGE_TU), "utf8");
else {
	const preMerge = spawnSync(
		"bash",
		[join(GOC, "scripts", "pre-merge-check.sh"), "--base", "origin/onehub"],
		{ cwd: GOC, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
	);
	raTruocGop = `${preMerge.stdout ?? ""}${preMerge.stderr ?? ""}`.trim();
	const dongKhac = raTruocGop
		.split("\n")
		.filter((d) => d.startsWith("VIOLATION [") && !d.includes(`[${SLUG}]`));
	console.log(
		`pre-merge-check toan kho: ${dongKhac.length} VIOLATION cua ho so khac (dong cua chinh ${SLUG} la verdict cu cua ho so dang cham, khong tinh)`,
	);
	for (const d of dongKhac) console.log(`  ${d}`);
}
if (!raTruocGop.includes(`[${SLUG}]`))
	doHong.push(
		`khong doc duoc dau ra truoc gop: khong co dong nao cho [${SLUG}] — luoi khong chay`,
	);
const dongTongKet = /^pre-merge-check: rules ran=(\d+) declared-off=\d+ expected=(\d+)$/m.exec(
	raTruocGop,
);
if (!dongTongKet)
	doHong.push(
		"khong doc duoc dau ra truoc gop: thieu dong tong ket «pre-merge-check: rules ran=…» — luoi chet giua chung",
	);
else if (dongTongKet[1] !== dongTongKet[2])
	doHong.push(
		`luoi truoc gop chay ${dongTongKet[1]}/${dongTongKet[2]} luat — khong du`,
	);
else console.log(`luoi truoc gop chay du ${dongTongKet[1]}/${dongTongKet[2]} luat`);
const hoaCu = [
	...raTruocGop.matchAll(/^VIOLATION \[([^\]]+)\]: evidence is stale/gm),
]
	.map((m) => m[1])
	.filter((ten) => ten !== SLUG);
console.log(
	`luoi truoc gop bao hoa cu (tru ${SLUG}): ${hoaCu.join(", ") || "(khong co)"}`,
);
for (const ten of hoaCu) doHong.push(`ho so hoa cu chua ghim lai: ${ten}`);

if (doHong.length > 0) {
	for (const h of doHong) console.log(`HONG ${h}`);
	process.exit(1);
}

console.log(
	`ho-so-bi-cham: ${hoSoBiChamMay.length} ho so bi cham, ${ghimTrenNhanh.length} luot ghim lai tren nhanh xanh, 0 ho so hoa cu, 0 hong`,
);
process.exit(0);
