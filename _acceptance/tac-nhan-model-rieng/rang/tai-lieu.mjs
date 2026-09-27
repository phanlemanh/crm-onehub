import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TAI_LIEU = "docs/agent.md";

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], { encoding: "utf8" });
}

function docTaiLieu(ref) {
	return ref
		? git("show", `${ref}:${TAI_LIEU}`)
		: readFileSync(join(GOC, TAI_LIEU), "utf8");
}

function muc(noiDung, tieuDe) {
	const dong = noiDung.split("\n");
	const batDau = dong.findIndex((d) => d.startsWith(tieuDe));
	if (batDau === -1) return "";
	const cap = tieuDe.match(/^#+/)[0].length;
	let ket = dong.length;
	for (let i = batDau + 1; i < dong.length; i += 1) {
		const m = dong[i].match(/^(#+) /);
		if (m && m[1].length <= cap) {
			ket = i;
			break;
		}
	}
	return dong.slice(batDau, ket).join("\n");
}

function luatHai(noiDung) {
	const khoi = muc(muc(noiDung, "## Khi nào thêm mã"), "### Luật");
	const batDau = khoi.indexOf("\n2. **");
	const ket = khoi.indexOf("\n3. **");
	return batDau === -1 ? "" : khoi.slice(batDau, ket === -1 ? undefined : ket);
}

function tapTepRe() {
	const goc = git("merge-base", "HEAD", "origin/onehub").trim();
	const doi = git("diff", "--name-only", goc, "HEAD").split("\n").filter(Boolean);
	const hang = new Set(
		git("ls-tree", "-r", "--name-only", "origin/release").split("\n"),
	);
	return new Set(doi.filter((tep) => hang.has(tep)));
}

function tapTrongDoan(noiDung) {
	const doan = muc(noiDung, "### Chỗ rẽ có tên với bản của hãng");
	return new Set(
		[...doan.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]),
	);
}

function bang(a, b) {
	return a.size === b.size && [...a].every((x) => b.has(x));
}

function kiem(noiDung, tapRe) {
	const model = muc(noiDung, "## Model");
	const tacNhan = muc(noiDung, "## Team-agent builder and runner");
	const trongDoan = tapTrongDoan(noiDung);
	return {
		1: /theo vai/.test(model) && /(không|thôi) ghim model theo bản/.test(model),
		2: tacNhan.includes("RUNNER_FAILED") && tacNhan.includes("RUNNER_NO_RESULT"),
		3: /ranh giới riêng/.test(luatHai(noiDung)),
		4: trongDoan.size > 0 && bang(trongDoan, tapRe),
	};
}

const viTriRef = process.argv.indexOf("--ref");
const ref = viTriRef === -1 ? null : process.argv[viTriRef + 1];
const tapRe = tapTepRe();

const dau = kiem(docTaiLieu(ref), tapRe);
for (const [dieu, dat] of Object.entries(dau)) {
	console.log(`${ref ? `ref ${ref.slice(0, 8)}` : "HEAD"} dieu ${dieu}: ${dat ? "dat" : "khong dat"}`);
}
if (!ref) {
	const trongDoan = tapTrongDoan(docTaiLieu(null));
	const thieu = [...tapRe].filter((t) => !trongDoan.has(t));
	const thua = [...trongDoan].filter((t) => !tapRe.has(t));
	if (thieu.length) console.log(`thieu trong doan cho re: ${thieu.join(", ")}`);
	if (thua.length) console.log(`thua trong doan cho re: ${thua.join(", ")}`);
}

if (ref) process.exit(Object.values(dau).every(Boolean) ? 0 : 1);

const goc = git("merge-base", "HEAD", "origin/onehub").trim();
const cu = kiem(docTaiLieu(goc), tapRe);
for (const dieu of ["1", "2", "4"]) {
	console.log(`merge-base dieu ${dieu}: ${cu[dieu] ? "dat (sai: ban cu khong duoc dat)" : "khong dat (dung)"}`);
}
const dat =
	Object.values(dau).every(Boolean) && !cu[1] && !cu[2] && !cu[4];
process.exit(dat ? 0 : 1);
