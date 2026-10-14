import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TEP = "docs/vong-doi.md";
const DONG = "| Dải báo bản ghi đã lưu trữ |";
const PHAI_CO = ["có", "DaiLuuTru", "KhoaLuuTru", "packages/ui"];
const CHIEU_DO = process.argv.includes("--chieu-do");

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

function noiDung() {
	if (!CHIEU_DO) return readFileSync(join(GOC, TEP), "utf8");
	const moc = git("merge-base", "HEAD", "origin/onehub").trim();
	return git("show", `${moc}:${TEP}`);
}

function muc(chu) {
	const dau = chu.indexOf("## Mảnh dùng chung");
	if (dau < 0) return "";
	const sau = chu.indexOf("\n## ", dau + 1);
	return sau < 0 ? chu.slice(dau) : chu.slice(dau, sau);
}

function kiem(chu) {
	const dong = muc(chu)
		.split("\n")
		.filter((d) => d.startsWith(DONG));
	if (dong.length !== 1) return `can dung 1 dong bang, co ${dong.length}`;
	const o = dong[0].split("|")[2] ?? "";
	const thieu = PHAI_CO.filter((t) => !o.includes(t));
	if (thieu.length > 0)
		return `dai bao van ghi chua (thieu ${thieu.join(", ")})`;
	if (o.includes("chưa")) return "dai bao van ghi chua";
	return null;
}

const loi = kiem(noiDung());
if (loi) {
	console.log(`dai-luu-tru-dung-chung bang-manh: do — ${loi}`);
	process.exit(1);
}
console.log("dai-luu-tru-dung-chung bang-manh: dat");
