import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const TEP_MAC_DINH = ".github/workflows/auto-pr.yml";
const TEN_JOB = "open";
const KHO_HANG = "trycompai/crm";
const NEN_HANG = "origin/release";
const NEN_NHANH = "origin/onehub";
const DONG_KHOA = `    if: github.repository == '${KHO_HANG}'`;
const SHA_XANH = "c042478";
const CHO_PHEP = [
	".github/workflows/auto-pr.yml",
	"_acceptance/config.yaml",
	"_acceptance/auto-pr-thoi-do-o-ban-re/",
	"docs/superpowers/specs/2026-09-07-auto-pr-thoi-do-o-ban-re-design.md",
];

function thamSo(ten, mac) {
	const i = process.argv.indexOf(ten);
	return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : mac;
}

function do1(ma, chu) {
	console.error(chu);
	process.exit(ma);
}

function git(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();
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

function slugTuUrl(url) {
	const m = url.match(/github\.com[:/](.+?)(?:\.git)?$/);
	return m ? m[1] : null;
}

function chanKhoa() {
	const tep = thamSo("--workflow", join(GOC, TEP_MAC_DINH));
	let nguon;
	try {
		nguon = readFileSync(tep, "utf8");
	} catch {
		do1(2, `KHONG DO DUOC: khong doc duoc ${tep}`);
	}

	const than = khoiJob(nguon, TEN_JOB);
	if (!than) do1(1, `DO [khoa]: khong tim thay job \`${TEN_JOB}\` trong ${tep}`);

	const cacIf = than.filter((d) => /^ {4}if:/.test(d));
	if (cacIf.length === 0) {
		do1(1, `DO [khoa]: job \`${TEN_JOB}\` KHONG co dong \`if\` — o ban re job nay se chay va do moi luot day`);
	}
	if (cacIf.length > 1) {
		do1(1, `DO [khoa]: job \`${TEN_JOB}\` co ${cacIf.length} dong \`if\`, mong doi dung 1 — dieu kien chong nhau thi khong doc duoc bang mat job chay o dau. Doc duoc:\n${cacIf.join("\n")}`);
	}

	const dieuKien = cacIf[0].replace(/^ {4}if:\s*/, "").trim();
	const mong = `github.repository == '${KHO_HANG}'`;
	if (dieuKien !== mong) {
		do1(1, `DO [khoa]: dieu kien la \`${dieuKien}\`, mong doi \`${mong}\``);
	}

	const url = thamSo("--remote", git("remote", "get-url", "origin"));
	const taiCho = slugTuUrl(url);
	if (!taiCho) {
		do1(2, `KHONG DO DUOC: khong rut duoc owner/repo tu remote \`${url}\``);
	}
	if (taiCho === KHO_HANG) {
		do1(1, `DO [khoa]: kho tai cho rut tu remote la \`${taiCho}\`, dung bang kho hang — khoa nay KHONG loai tru gi, ket luan "job khong chay o day" la sai`);
	}

	console.log(`XANH [khoa]: job \`${TEN_JOB}\` co dung 1 dong \`if\` = \`${dieuKien}\`; kho tai cho rut tu remote la \`${taiCho}\`, khac \`${KHO_HANG}\``);
	return 0;
}

function dongThem(nen) {
	let raw;
	try {
		raw = execFileSync("git", ["-C", GOC, "diff", "-U0", nen, "--", TEP_MAC_DINH], { encoding: "utf8" });
	} catch {
		do1(2, `KHONG DO DUOC: khong giai duoc ref \`${nen}\` — fetch truoc roi do lai`);
	}
	const them = raw.split("\n").filter((d) => d.startsWith("+") && !d.startsWith("+++")).map((d) => d.slice(1));
	const bot = raw.split("\n").filter((d) => d.startsWith("-") && !d.startsWith("---")).map((d) => d.slice(1));
	return { them, bot };
}

function chanLechMotDong() {
	const nen = thamSo("--nen", NEN_HANG);
	const { them, bot } = dongThem(nen);

	if (them.length === 0 && bot.length === 0) {
		do1(1, `DO [lech-mot-dong]: ${TEP_MAC_DINH} KHONG lech \`${nen}\` dong nao — ban va chua co mat`);
	}
	if (them.length !== 1 || bot.length !== 0) {
		do1(1, `DO [lech-mot-dong]: lech \`${nen}\` la +${them.length}/-${bot.length}, mong doi +1/-0 — moi dong lech them la mot moi xung dot khi keo ban hang ve`);
	}
	if (them[0] !== DONG_KHOA) {
		do1(1, `DO [lech-mot-dong]: dong them vao la \`${them[0]}\`, mong doi dung \`${DONG_KHOA}\` — dem dong khong noi duoc dong ay la gi, va thut 4 dau cach moi la tang job`);
	}

	let veHang = "";
	try {
		const h = dongThem("upstream/HEAD");
		if (h.them.length !== 1 || h.bot.length !== 0 || h.them[0] !== DONG_KHOA) {
			do1(1, `DO [lech-mot-dong]: so voi \`upstream/HEAD\` lech +${h.them.length}/-${h.bot.length} (dong: \`${h.them[0] ?? ""}\`) — nen \`${nen}\` khong con guong dung ban hang`);
		}
		veHang = " va khop ca `upstream/HEAD`";
	} catch {
		veHang = " (`upstream/HEAD` khong giai duoc o day — chi do tren `" + nen + "`)";
	}

	console.log(`XANH [lech-mot-dong]: ${TEP_MAC_DINH} lech \`${nen}\` dung +1/-0, dong them vao dung la dong khoa o tang job${veHang}`);
	return 0;
}

function chanMotTep() {
	const nen = thamSo("--nen", NEN_NHANH);
	let ds;
	try {
		ds = git("diff", "--name-only", `${nen}...HEAD`);
	} catch {
		do1(2, `KHONG DO DUOC: khong giai duoc ref \`${nen}\``);
	}
	const tep = ds.split("\n").filter((d) => d !== "");
	if (tep.length === 0) {
		do1(1, `DO [mot-tep]: vong nay khong cham tep nao so voi \`${nen}\` — ban va chua co mat`);
	}
	const lac = tep.filter((t) => !CHO_PHEP.some((c) => (c.endsWith("/") ? t.startsWith(c) : t === c)));
	if (lac.length > 0) {
		do1(1, `DO [mot-tep]: ${lac.length} tep nam NGOAI danh sach cho phep cua vong nay:\n${lac.join("\n")}`);
	}
	if (!tep.includes(TEP_MAC_DINH)) {
		do1(1, `DO [mot-tep]: ${TEP_MAC_DINH} khong nam trong ${tep.length} tep da cham — ban va chua co mat`);
	}

	console.log(`XANH [mot-tep]: ${tep.length} tep doi so voi \`${nen}\`, tat ca nam trong danh sach cho phep, va ${TEP_MAC_DINH} co mat`);
	return 0;
}

function chanChayThat() {
	const sha = thamSo("--sha", SHA_XANH);
	const url = git("remote", "get-url", "origin");
	const kho = slugTuUrl(url);

	let day;
	try {
		day = git("rev-parse", sha);
	} catch {
		do1(2, `KHONG DO DUOC: khong giai duoc sha \`${sha}\` trong kho nay`);
	}

	let json;
	try {
		json = execFileSync("gh", ["api", `repos/${kho}/commits/${day}/check-runs`, "--jq", '.check_runs[] | "\\(.name)\\t\\(.conclusion // .status)"'], { encoding: "utf8" }).trim();
	} catch {
		do1(2, `KHONG DO DUOC: gh api khong tra ve check-runs cho ${sha} — can gh dang nhap va commit da day len ${kho}`);
	}
	const cua = json.split("\n").filter((d) => d !== "").map((d) => d.split("\t")).find(([ten]) => ten === "Open a pull request into main");
	if (!cua) {
		do1(2, `KHONG DO DUOC: ${sha} khong co check-run \`Open a pull request into main\` — chua chay xong hoac chua day`);
	}
	if (cua[1] !== "skipped") {
		do1(1, `DO [chay-that]: tai ${sha} check-run \`Open a pull request into main\` ket luan \`${cua[1]}\`, mong doi \`skipped\``);
	}

	const doiChieu = thamSo("--doi-chieu", "co");
	if (doiChieu === "co") {
		try {
			git("merge-base", "--is-ancestor", day, "HEAD");
		} catch {
			do1(1, `DO [chay-that]: ${sha} do duoc \`skipped\` nhung KHONG phai to tien cua HEAD — so do la cua mot cay khac, khong noi gi ve cay dang merge`);
		}
		const tai = git("show", `${day}:${TEP_MAC_DINH}`);
		const nay = readFileSync(join(GOC, TEP_MAC_DINH), "utf8");
		if (tai !== nay) {
			do1(1, `DO [chay-that]: ${TEP_MAC_DINH} tai ${sha} KHAC ban tren cay hien tai — so \`skipped\` do o ${sha} khong con noi ve cay nay`);
		}
	}

	console.log(`XANH [chay-that]: tai ${sha} check-run \`Open a pull request into main\` ket luan \`skipped\`; ${sha} la to tien cua HEAD va ${TEP_MAC_DINH} khong doi tu do den nay`);
	return 0;
}

const CHAN = {
	khoa: chanKhoa,
	"lech-mot-dong": chanLechMotDong,
	"mot-tep": chanMotTep,
	"chay-that": chanChayThat,
};

const ten = process.argv[2];
if (!ten || !CHAN[ten]) {
	do1(2, `KHONG DO DUOC: chan phai la mot trong ${Object.keys(CHAN).join(" | ")}`);
}
process.exit(CHAN[ten]());
