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

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const SLUG = "cap-nhat-tuan-okr";
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const MAY = new Set(["test", "script"]);
const TRAN_MOT_LENH_MS = 15 * 60_000;
const DONG_DUOI = 6;
const HO_SO_DAT_OKR = "dat-okr-trong-crm";

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
	const { HO_SO_BI_CHAM: HO_SO_GOC } = await import(pathToFileURL(CAU_HINH_THAT).href);
	const REF_THU = "config:executors.script.cl_phan_biet";
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

	const configThat = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const capConfig = join(thuMuc, "config-hong.yaml");
	writeFileSync(
		capConfig,
		configThat.replace(/^(\s*cl_phan_biet:\s*).*$/m, '$1"false"'),
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
			ten: "mot eval doi lenh sang false",
			doi: ["--config", capConfig, "--chi-lenh", REF_THU],
			ghim: "false",
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
console.log(`HO_SO_BI_CHAM (cau-hinh.mjs): ${[...HO_SO_BI_CHAM].sort().join(", ") || "(rong)"}`);

if (hoSoBiChamMay.length === 0) {
	dung(2, "KHONG DO DUOC: khong ho so nao bi cham trong diff — khong co gi de soi");
}

const khai = new Set(HO_SO_BI_CHAM);
const may = new Set(hoSoBiChamMay);
const hong = [];
for (const ten of may) if (!khai.has(ten)) hong.push(`thieu ho so: ${ten}`);
for (const ten of khai) if (!may.has(ten)) hong.push(`ho so khong bi cham: ${ten}`);
for (const h of hong) console.log(`HONG ${h}`);
if (hong.length > 0) process.exit(1);
console.log(`khop: ${hoSoBiChamMay.length} ho so bi cham == HO_SO_BI_CHAM khai o cau-hinh.mjs`);

if (process.argv.includes("--chi-tap")) {
	console.log("--chi-tap: dung o day, khong chay eval nao");
	process.exit(0);
}

function thi(lenh, cwd) {
	const batDau = Date.now();
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
		timeout: TRAN_MOT_LENH_MS,
	});
	const duoi = `${r.stdout ?? ""}${r.stderr ?? ""}`
		.trim()
		.split("\n")
		.slice(-DONG_DUOI)
		.join("\n    ");
	return { ma: r.status ?? -1, giay: Math.round((Date.now() - batDau) / 1000), duoi };
}

const CHI_LENH = doiSo("--chi-lenh");
const lenhCanChay = [...new Map(evalsBiCham.map((e) => [e.cmd, e])).values()].filter(
	(e) => !CHI_LENH || e.cmd === CHI_LENH,
);
console.log(`lenh se chay: ${lenhCanChay.length} (tu ${evalsBiCham.length} eval bi cham)`);

const doHong = [];
for (const e of lenhCanChay) {
	const lenh = giai(e.cmd);
	const kq = thi(lenh, GOC);
	console.log(`${kq.ma === 0 ? "xanh" : `HONG ma ${kq.ma}`} ${kq.giay}s ${e.cmd}\n  lenh: ${lenh}`);
	if (kq.ma !== 0) {
		doHong.push(`eval do: ${e.cmd} — lenh «${lenh}» ma ${kq.ma}\n    ${kq.duoi}`);
	}
}
for (const h of doHong) console.log(`HONG ${h}`);

const decisionsDatOkr = join(GOC, "_acceptance", HO_SO_DAT_OKR, "decisions.jsonl");
const coDong = existsSync(decisionsDatOkr)
	? readFileSync(decisionsDatOkr, "utf8")
			.split("\n")
			.some(
				(d) =>
					d.includes("cap-nhat-tuan-okr") && d.includes("AC-16") && d.includes("E5"),
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
if (evalsDatOkrDoi !== 0) doHong.push(`${HO_SO_DAT_OKR}/evals.yaml da doi so voi VONG.truoc`);

if (doHong.length > 0) {
	for (const h of doHong) console.log(`HONG ${h}`);
	process.exit(1);
}

const preMerge = spawnSync(
	"bash",
	[join(GOC, "scripts", "pre-merge-check.sh"), "--base", "origin/onehub"],
	{ cwd: GOC, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
);
console.log("=== scripts/pre-merge-check.sh --base origin/onehub ===");
console.log(`${preMerge.stdout ?? ""}${preMerge.stderr ?? ""}`.trim());
console.log(`=== pre-merge-check ma thoat: ${preMerge.status} (khong tinh vao ket bai) ===`);

console.log(
	`ho-so-bi-cham: ${hoSoBiChamMay.length} ho so, ${lenhCanChay.length} lenh chay, 0 hong`,
);
process.exit(0);
