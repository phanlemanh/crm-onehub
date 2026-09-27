import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TAI_LIEU = "docs/agent.md";
const MUC_BO_DUNG = "## Team-agent builder and runner";
const MUC_RE = "### Chỗ rẽ có tên";

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], { encoding: "utf8" });
}

function docTaiLieu(ref) {
	return ref
		? git("show", `${ref}:${TAI_LIEU}`)
		: readFileSync(join(GOC, TAI_LIEU), "utf8");
}

function cacMuc(noiDung, tieuDe) {
	const dong = noiDung.split("\n");
	const cap = tieuDe.match(/^#+/)[0].length;
	const ketQua = [];
	for (let i = 0; i < dong.length; i += 1) {
		if (!dong[i].startsWith(tieuDe)) continue;
		let ket = dong.length;
		for (let j = i + 1; j < dong.length; j += 1) {
			const m = dong[j].match(/^(#+) /);
			if (m && m[1].length <= cap) {
				ket = j;
				break;
			}
		}
		ketQua.push(dong.slice(i, ket).join("\n"));
	}
	return ketQua;
}

function tapTepRe() {
	const goc = git("merge-base", "HEAD", "origin/onehub").trim();
	const doi = git("diff", "--name-only", goc, "HEAD")
		.split("\n")
		.filter(Boolean);
	const hang = new Set(
		git("ls-tree", "-r", "--name-only", "origin/release").split("\n"),
	);
	return doi.filter((tep) => hang.has(tep));
}

function tapTrongMucRe(noiDung) {
	return new Set(
		cacMuc(noiDung, MUC_RE).flatMap((doan) =>
			[...doan.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]),
		),
	);
}

function kiem(noiDung, tapRe) {
	const boDung = cacMuc(noiDung, MUC_BO_DUNG).join("\n");
	const trongMuc = tapTrongMucRe(noiDung);
	const thieu = tapRe.filter((tep) => !trongMuc.has(tep));
	return {
		"SESSION_LIMITS": boDung.includes("SESSION_LIMITS"),
		"128k": /128k|128 000|128\.000/.test(boDung),
		"500k": /500k|500 000|500\.000/.test(boDung),
		"session-limit": boDung.includes("session-limit"),
		outputSchema: boDung.includes("outputSchema"),
		[`cho re du tep (thieu: ${thieu.join(", ") || "khong"})`]: thieu.length === 0,
	};
}

const tapRe = tapTepRe();
const dau = kiem(docTaiLieu(null), tapRe);
for (const [dieu, dat] of Object.entries(dau)) {
	console.log(`HEAD ${dieu}: ${dat ? "dat" : "khong dat"}`);
}

const goc = git("merge-base", "HEAD", "origin/onehub").trim();
const cu = kiem(docTaiLieu(goc), tapRe);
const cuTruot = Object.entries(cu).filter(([, dat]) => !dat);
console.log(
	`merge-base truot ${cuTruot.length} dieu: ${cuTruot.map(([dieu]) => dieu.split(" (")[0]).join(", ") || "khong dieu nao (sai)"}`,
);

const dat = Object.values(dau).every(Boolean) && cuTruot.length > 0;
console.log(dat ? "tai-lieu ok" : "tai-lieu khong dat");
process.exit(dat ? 0 : 1);
