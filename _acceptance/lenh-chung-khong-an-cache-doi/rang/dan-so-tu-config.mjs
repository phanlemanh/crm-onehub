import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const CHAN = join(import.meta.dirname, "suite-cuong-buc.mjs");
const THAT = join(GOC, "_acceptance", "config.yaml");

function chay(duongConfig) {
	try {
		const ra = execFileSync("node", [CHAN, "--config", duongConfig], {
			cwd: GOC,
			encoding: "utf8",
			stdio: "pipe",
		});
		return { ma: 0, ra };
	} catch (e) {
		return { ma: e.status ?? 1, ra: `${e.stdout ?? ""}${e.stderr ?? ""}` };
	}
}

const soKhai = (readFileSync(THAT, "utf8").match(
	/^ {2}suite_keys:\n((?: {4}- .+\n)+)/m,
) ?? [, ""])[1]
	.trim()
	.split("\n")
	.filter((d) => d.trim().length > 0).length;

if (soKhai === 0) {
	console.error("KHONG DO DUOC: config that khong khai suite_keys nao.");
	process.exit(2);
}

const xanh = chay(THAT);
const loi = [];
if (xanh.ma !== 0) loi.push(`chieu xanh sai — config that ma chan tra ma ${xanh.ma}`);
const daSoi = xanh.ra.match(/da soi (\d+) lenh/);
if (daSoi === null) loi.push("chieu xanh sai — chan khong in ra so lenh da soi");
else if (Number(daSoi[1]) !== soKhai)
	loi.push(
		`chieu xanh sai — chan soi ${daSoi[1]} lenh ma config khai ${soKhai} phan tu`,
	);
console.log(`chieu xanh: ma ${xanh.ma} · da soi ${daSoi?.[1] ?? "?"} · config khai ${soKhai}`);

const thu = mkdtempSync(join(tmpdir(), "cauhinh-"));
const ban = join(thu, "config.yaml");
try {
	copyFileSync(THAT, ban);
	const CAY = "o_cam_an_cache_cay_vao";
	let nguon = readFileSync(ban, "utf8");
	nguon = nguon.replace(
		/^ {2}suite_keys:\n/m,
		`  suite_keys:\n    - executors.script.${CAY}\n`,
	);
	nguon = nguon.replace(
		/^ {4}lint_slop: /m,
		`    ${CAY}: "bunx turbo run test"\n    lint_slop: `,
	);
	writeFileSync(ban, nguon);

	const do_ = chay(ban);
	console.log(`chieu do: ma ${do_.ma}`);
	if (do_.ma !== 1)
		loi.push(`chieu do sai — cay mot o cam an cache ma chan tra ma ${do_.ma}, doi ma 1`);
	if (!do_.ra.includes(CAY))
		loi.push(`chieu do sai — dau ra KHONG goi ten o cam vua cay (${CAY})`);
} finally {
	rmSync(thu, { recursive: true, force: true });
}

if (loi.length > 0) {
	for (const l of loi) console.error(`DO: ${l}`);
	process.exit(1);
}
console.log(
	"XANH: cap hai chieu goi CHINH chan cua AC-1 — config that thi ma 0 va soi du so lenh; ban sao co o cam an cache thi ma 1 va goi dung ten.",
);
