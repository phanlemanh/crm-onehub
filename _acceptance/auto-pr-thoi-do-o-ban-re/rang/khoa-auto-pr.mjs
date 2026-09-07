import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const TEP = ".github/workflows/auto-pr.yml";
const TEN_JOB = "open";
const KHO_HANG = "trycompai/crm";
const NEN_HANG = "origin/release";
const NEN_NHANH = "origin/onehub";
const DONG_KHOA = `    if: github.repository == '${KHO_HANG}'`;
const SHA_XANH = "c042478";
const SHA_TRUOC = "5ac85ef";
const CHO_PHEP = [
	".github/workflows/auto-pr.yml",
	"PRODUCT-MAP.md",
	"_acceptance/config.yaml",
	"_acceptance/auto-pr-thoi-do-o-ban-re/",
	"docs/superpowers/specs/2026-09-07-auto-pr-thoi-do-o-ban-re-design.md",
	"docs/superpowers/plans/2026-09-07-auto-pr-thoi-do-o-ban-re.md",
];

function thamSo(ten, mac) {
	const i = process.argv.indexOf(ten);
	return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : mac;
}

function coCo(ten) {
	return process.argv.indexOf(ten) > -1;
}

function git(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();
}

function gitCoThe(...doi) {
	try {
		return { duoc: true, chu: git(...doi) };
	} catch (e) {
		return { duoc: false, chu: String(e.message || e) };
	}
}

function ket(ma, chu) {
	return { ma, chu };
}

function slugTuUrl(url) {
	const m = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
	return m ? m[1] : null;
}

function khoiJob(nguon, ten) {
	const dong = nguon.split("\n");
	const dau = dong.findIndex((d) => d === `  ${ten}:`);
	if (dau === -1) return null;
	const than = [];
	for (let i = dau + 1; i < dong.length; i += 1) {
		const d = dong[i];
		if (d.trim() === "") continue;
		if (!/^ {3}/.test(d)) break;
		than.push(d);
	}
	return than;
}

function soiKhoa(nguon, url) {
	const than = khoiJob(nguon, TEN_JOB);
	if (!than) return ket(1, `khong tim thay job \`${TEN_JOB}\``);

	const cacIf = than.filter((d) => /^ {4}if:/.test(d));
	if (cacIf.length === 0) {
		return ket(1, `job \`${TEN_JOB}\` KHONG co dong \`if\` — o ban re job nay se chay va do moi luot day`);
	}
	if (cacIf.length > 1) {
		return ket(1, `job \`${TEN_JOB}\` co ${cacIf.length} dong \`if\`, mong doi dung 1 — dieu kien chong nhau thi khong doc duoc bang mat job chay o dau. Doc duoc: ${cacIf.map((d) => d.trim()).join(" || ")}`);
	}

	const dieuKien = cacIf[0].replace(/^ {4}if:\s*/, "").trim();
	const mong = `github.repository == '${KHO_HANG}'`;
	if (dieuKien !== mong) return ket(1, `dieu kien la \`${dieuKien}\`, mong doi \`${mong}\``);

	const taiCho = slugTuUrl(url);
	if (!taiCho) return ket(2, `khong rut duoc owner/repo tu remote \`${url}\``);
	if (taiCho === KHO_HANG) {
		return ket(1, `kho tai cho rut tu remote la \`${taiCho}\`, dung bang kho hang — khoa nay KHONG loai tru gi`);
	}
	return ket(0, `dung 1 dong \`if\` = \`${dieuKien}\`; kho tai cho \`${taiCho}\` khac \`${KHO_HANG}\``);
}

function soiLech(nen, cay) {
	const a = nen.split("\n");
	const b = cay.split("\n");
	const them = b.filter((d) => !a.includes(d));
	const bot = a.filter((d) => !b.includes(d));
	if (them.length === 0 && bot.length === 0) return ket(1, "KHONG lech dong nao — ban va chua co mat");
	if (them.length !== 1 || bot.length !== 0) {
		return ket(1, `lech +${them.length}/-${bot.length}, mong doi +1/-0 — moi dong lech them la mot moi xung dot khi keo ban hang ve`);
	}
	if (them[0] !== DONG_KHOA) {
		return ket(1, `dong them vao la \`${them[0]}\`, mong doi dung \`${DONG_KHOA}\` — dem dong khong noi duoc dong ay la gi, va thut 4 dau cach moi la tang job`);
	}
	return ket(0, "dung +1/-0, va dong them vao dung la dong khoa o tang job");
}

function tepDoi(nen) {
	const r = gitCoThe("diff", "--name-only", `${nen}...HEAD`);
	if (!r.duoc) return null;
	const theo = r.chu.split("\n").filter((d) => d !== "");
	let chuaCommit = [];
	try {
		const tho = execFileSync("git", ["-C", GOC, "status", "--porcelain", "-z"], { encoding: "utf8" });
		chuaCommit = tho.split("\0").filter((d) => d !== "").map((d) => d.slice(3)).filter((d) => d !== "");
	} catch {
		chuaCommit = [];
	}
	return [...new Set([...theo, ...chuaCommit])];
}

function soiTep(tep) {
	if (tep.length === 0) return ket(1, "khong cham tep nao — ban va chua co mat");
	const lac = tep.filter((t) => !CHO_PHEP.some((c) => (c.endsWith("/") ? t.startsWith(c) : t === c)));
	if (lac.length > 0) {
		return ket(1, `${lac.length} tep nam NGOAI danh sach cho phep: ${lac.slice(0, 5).join(", ")}${lac.length > 5 ? " …" : ""}`);
	}
	if (!tep.includes(TEP)) return ket(1, `${TEP} khong nam trong ${tep.length} tep da cham`);
	return ket(0, `${tep.length} tep, tat ca trong danh sach cho phep, va ${TEP} co mat`);
}

function ketLuanCheckRun(sha) {
	const url = gitCoThe("remote", "get-url", "origin");
	if (!url.duoc) return ket(2, "khong doc duoc remote `origin`");
	const kho = slugTuUrl(url.chu);
	if (!kho) return ket(2, `khong rut duoc owner/repo tu remote \`${url.chu}\` — kiem hinh dang URL, khong phai kiem dang nhap gh`);
	const day = gitCoThe("rev-parse", sha);
	if (!day.duoc) return ket(2, `khong giai duoc sha \`${sha}\` trong kho nay`);
	let json;
	try {
		json = execFileSync("gh", ["api", `repos/${kho}/commits/${day.chu}/check-runs`, "--jq", '.check_runs[] | "\\(.name)\\t\\(.conclusion // .status)"'], { encoding: "utf8" }).trim();
	} catch {
		return ket(2, `gh api khong tra ve check-runs cho ${sha} — can gh dang nhap va commit da day len ${kho}`);
	}
	const cua = json.split("\n").filter((d) => d !== "").map((d) => d.split("\t")).find(([t]) => t === "Open a pull request into main");
	if (!cua) return ket(2, `${sha} chua co check-run \`Open a pull request into main\` — chua chay xong hoac chua day`);
	return ket(0, cua[1]);
}

function docCay() {
	return readFileSync(join(GOC, TEP), "utf8").trim();
}

function docRef(ref) {
	const r = gitCoThe("show", `${ref}:${TEP}`);
	return r.duoc ? r.chu : null;
}

function chanKhoa() {
	const duong = thamSo("--workflow", join(GOC, TEP));
	let nguon;
	try {
		nguon = readFileSync(duong, "utf8");
	} catch {
		return ket(2, `khong doc duoc ${duong}`);
	}
	const url = coCo("--remote") ? thamSo("--remote", "") : (gitCoThe("remote", "get-url", "origin").chu || "");
	return soiKhoa(nguon, url);
}

function chanLechMotDong() {
	const nen = thamSo("--nen", NEN_HANG);
	const goc = docRef(nen);
	if (goc === null) return ket(2, `khong giai duoc ref \`${nen}\` — fetch truoc roi do lai`);
	const r = soiLech(goc, docCay());
	if (r.ma !== 0) return ket(r.ma, `nen \`${nen}\`: ${r.chu}`);

	const hang = docRef("upstream/HEAD");
	if (hang === null) {
		return ket(0, `nen \`${nen}\`: ${r.chu} (\`upstream/HEAD\` khong giai duoc o may nay — chi do tren \`${nen}\`)`);
	}
	const rh = soiLech(hang, docCay());
	if (rh.ma !== 0) return ket(1, `so voi \`upstream/HEAD\`: ${rh.chu} — nen \`${nen}\` khong con guong dung ban hang`);
	return ket(0, `nen \`${nen}\`: ${r.chu}, va khop ca \`upstream/HEAD\``);
}

function chanMotTep() {
	const nen = thamSo("--nen", NEN_NHANH);
	const tep = tepDoi(nen);
	if (tep === null) return ket(2, `khong giai duoc ref \`${nen}\``);
	const r = soiTep(tep);
	return ket(r.ma, `nen \`${nen}\` (ke ca tep chua commit va untracked): ${r.chu}`);
}

function chanChayThat() {
	const sha = thamSo("--sha", SHA_XANH);
	const r = ketLuanCheckRun(sha);
	if (r.ma !== 0) return r;
	if (r.chu !== "skipped") {
		return ket(1, `tai ${sha} check-run \`Open a pull request into main\` ket luan \`${r.chu}\`, mong doi \`skipped\``);
	}
	if (thamSo("--doi-chieu", "co") !== "co") return ket(0, `tai ${sha} ket luan \`skipped\``);

	const to = gitCoThe("merge-base", "--is-ancestor", git("rev-parse", sha), "HEAD");
	if (!to.duoc) {
		return ket(1, `${sha} do duoc \`skipped\` nhung KHONG phai to tien cua HEAD — so do la cua mot cay khac`);
	}
	if (docRef(sha) !== docCay()) {
		return ket(1, `${TEP} tai ${sha} KHAC ban tren cay hien tai — so \`skipped\` do o ${sha} khong con noi ve cay nay`);
	}
	return ket(0, `tai ${sha} ket luan \`skipped\`; ${sha} la to tien cua HEAD va ${TEP} khong doi tu do den nay`);
}

function chanMaTran() {
	const cay = docCay();
	const url = gitCoThe("remote", "get-url", "origin").chu || "";
	const khongKhoa = cay.split("\n").filter((d) => !/^ {4}if: github\.repository/.test(d)).join("\n");
	const khoaSai = cay.replace(KHO_HANG, "phanlemanh/crm-onehub");
	const haiKhoa = cay.replace(DONG_KHOA, `${DONG_KHOA}\n    if: github.event_name == 'push'`);
	const dongTrong = cay.replace(DONG_KHOA, "    ");
	const nenHang = docRef(NEN_HANG);

	const o = [
		{ ten: "B/dung-mot-if", cho: 0, ...soiKhoa(cay, url) },
		{ ten: "B/vang-if", cho: 1, ...soiKhoa(khongKhoa, url) },
		{ ten: "B/tro-nham-kho", cho: 1, ...soiKhoa(khoaSai, url) },
		{ ten: "B/nhieu-if", cho: 1, ...soiKhoa(haiKhoa, url) },
		{ ten: "A/kho-tai-cho-la-kho-hang", cho: 1, ...soiKhoa(cay, "https://github.com/trycompai/crm.git") },
		{ ten: "C/lech-dung-mot-dong", cho: 0, ...(nenHang === null ? ket(2, "khong giai duoc nen hang") : soiLech(nenHang, cay)) },
		{ ten: "C/khong-lech", cho: 1, ...soiLech(cay, cay) },
		{ ten: "C/dong-them-la-dong-trong", cho: 1, ...(nenHang === null ? ket(2, "khong giai duoc nen hang") : soiLech(nenHang, dongTrong)) },
		{ ten: "C/pham-vi-dung", cho: 0, ...soiTep(tepDoi(NEN_NHANH) ?? []) },
		{ ten: "C/pham-vi-rong", cho: 1, ...soiTep(tepDoi(NEN_HANG) ?? []) },
		{ ten: "C/pham-vi-rong-untracked", cho: 1, ...soiTep([...(tepDoi(NEN_NHANH) ?? []), "packages/db/LAC.txt"]) },
	];

	const lech = o.filter((x) => x.ma !== x.cho);
	for (const x of o) {
		console.log(`  ${x.ma === x.cho ? "ok " : "LECH"} ${x.ten}: cho ma ${x.cho}, duoc ma ${x.ma} — ${x.chu}`);
	}
	if (lech.length > 0) {
		return ket(1, `${lech.length}/${o.length} o ma tran khong dung ket qua mong doi: ${lech.map((x) => x.ten).join(", ")}`);
	}
	return ket(0, `${o.length}/${o.length} o ma tran dung ket qua mong doi — moi hinh dang truc A, B, C deu co MOT luot chay that trong chinh phep do nay`);
}

const CHAN = {
	khoa: chanKhoa,
	"lech-mot-dong": chanLechMotDong,
	"mot-tep": chanMotTep,
	"chay-that": chanChayThat,
	"ma-tran": chanMaTran,
};

const ten = process.argv[2];
if (!ten || !CHAN[ten]) {
	console.error(`KHONG DO DUOC: chan phai la mot trong ${Object.keys(CHAN).join(" | ")}`);
	process.exit(2);
}
const r = CHAN[ten]();
if (r.ma === 0) console.log(`XANH [${ten}]: ${r.chu}`);
else console.error(`${r.ma === 1 ? "DO" : "KHONG DO DUOC"} [${ten}]: ${r.chu}`);
process.exit(r.ma);
