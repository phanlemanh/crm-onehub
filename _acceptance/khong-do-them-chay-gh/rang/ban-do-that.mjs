import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	BAN_DO,
	bat,
	chepBanDo,
	GOC,
	git,
	Ket,
	khongDoDuoc,
	moiTruongSach,
	RA,
	thuMucRa,
} from "./nen.mjs";

const KHOA = ["gpct_luot_that", "gpct_nen_gop"];
const DAT_NEN = "\tdatNenBan(b.goc, sha);\n";
const TRUOC_VONG =
	'\tgit(b.goc, "update-ref", "refs/remotes/origin/onehub", sha);\n\tgit(b.goc, "branch", "-f", "onehub", sha);\n';
const ket = new Ket();

function gh(...a) {
	const r = spawnSync("gh", a, {
		cwd: GOC,
		encoding: "utf8",
		env: moiTruongSach(),
	});
	if (r.status !== 0)
		khongDoDuoc(
			`gh ${a.slice(0, 2).join(" ")}: ${String(r.stderr).trim().split("\n")[0]}`,
		);
	return r.stdout;
}

const nhanh = git(GOC, "rev-parse", "--abbrev-ref", "HEAD").trim();
const pr = JSON.parse(
	gh(
		"pr",
		"list",
		"--head",
		nhanh,
		"--state",
		"open",
		"--json",
		"number,headRefOid",
	),
)[0];
if (!pr) khongDoDuoc(`khong co PR mo cho nhanh ${nhanh}`);
const repo = gh(
	"repo",
	"view",
	"--json",
	"nameWithOwner",
	"-q",
	".nameWithOwner",
).trim();
const luot = gh(
	"api",
	`repos/${repo}/actions/runs?head_sha=${pr.headRefOid}&event=pull_request&per_page=50`,
	"--jq",
	".workflow_runs[]|[.name,.status]|@tsv",
)
	.split("\n")
	.filter(Boolean)
	.map((d) => d.split("\t"));
const chuaXong = luot.filter(([, st]) => st !== "completed");
if (luot.length === 0 || chuaXong.length > 0)
	khongDoDuoc(
		`luot nhap chua xong o ${pr.headRefOid.slice(0, 9)} (PR #${pr.number}): ${chuaXong.map(([n, st]) => `${n} ${st}`).join(", ") || "chua co luot"}`,
	);
console.log(
	`tien de: PR #${pr.number}, ${luot.length} luot cua ${pr.headRefOid.slice(0, 9)} da xong`,
);

const nhatKy = thuMucRa("ban-do");

function chayBan(tep, ten) {
	const r = spawnSync("bun", [tep, "--chi", KHOA.join(",")], {
		cwd: GOC,
		encoding: "utf8",
		env: moiTruongSach(),
		maxBuffer: 256 * 1024 * 1024,
	});
	const chu = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	writeFileSync(join(nhatKy, `${ten}.log`), chu);
	return {
		ma: r.status,
		dong: chu.split("\n"),
		log: join(nhatKy, `${ten}.log`),
	};
}

const khoaDong = (d) => /^(xanh|do san|sai|bo) ([\w-]+)/.exec(d)?.[2] ?? null;

const that = chayBan(BAN_DO, "that");
const iChay = that.dong.findIndex((d) => d.startsWith("chay: "));
const iNeo = that.dong.findIndex((d) => d.startsWith("neo: "));
const tapChay =
	iChay < 0
		? []
		: that.dong[iChay].slice("chay: ".length).split(",").filter(Boolean);
ket.kiem(
	tapChay.length === KHOA.length && KHOA.every((k) => tapChay.includes(k)),
	`chay: ${tapChay.join(",")}`,
	`dong chay: ${that.dong[iChay] ?? "vang"}`,
);
ket.kiem(
	iChay >= 0 && iNeo > iChay,
	"chay: dung truoc neo:",
	`chay o dong ${iChay}, neo o dong ${iNeo}`,
);
const tapKetQua = [
	...new Set(
		that.dong
			.slice(iNeo + 1)
			.map(khoaDong)
			.filter(Boolean),
	),
];
ket.kiem(
	tapKetQua.length === tapChay.length &&
		tapKetQua.every((k) => tapChay.includes(k)),
	`dong ket qua noi ve ${tapKetQua.join(",")}`,
	`khoa tren dong ket qua: ${tapKetQua.join(",") || "khong"}`,
);
for (const k of KHOA)
	ket.kiem(
		that.dong.includes(`xanh ${k}`),
		`xanh ${k}`,
		that.dong.find((d) => khoaDong(d) === k) ?? "khong co dong",
	);
ket.kiem(
	!that.dong.some((d) => d.startsWith("do san gpct_")),
	"khong dong do san gpct_",
	that.dong.filter((d) => d.startsWith("do san gpct_")).join(" | "),
);
ket.kiem(
	that.ma === 0 && that.dong.includes("KET LUAN: xanh"),
	`ban do ma ${that.ma}, KET LUAN: xanh`,
	`ma ${that.ma} (${that.log})`,
);

const pha = chepBanDo(
	join(RA, "ban-do", "pha", "khong-do-them.mjs"),
	DAT_NEN,
	TRUOC_VONG,
);
const p = chayBan(pha, "pha");
const doSan = p.dong.find((d) => d.startsWith("do san gpct_nen_gop"));
const logDo = doSan ? /: (\/\S+\.log)$/.exec(doSan)?.[1] : null;
const coGh =
	logDo && existsSync(logDo)
		? readFileSync(logDo, "utf8").includes("MA 2: gh repo view")
		: false;
bat(
	ket,
	"ban-do-thieu-gh",
	Boolean(doSan) && coGh,
	`dong: ${doSan ?? "vang"}; nhat ky ${logDo ?? "vang"} ${coGh ? "co" : "khong co"} «MA 2: gh repo view» (${p.log})`,
);
ket.ket();
