import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const MOC = "a62adb16";
const TEN = "slack-thieu-quyen-email";
const args = process.argv.slice(2);
const git = (...a) =>
	execFileSync("git", ["-C", ROOT, ...a], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
const coHang = (tep) => {
	try {
		execFileSync(
			"git",
			["-C", ROOT, "cat-file", "-e", `origin/release:${tep}`],
			{
				stdio: "ignore",
			},
		);
		return true;
	} catch {
		return false;
	}
};
const giaTep = args.flatMap((a, i) => (a === "--gia-tep" ? [args[i + 1]] : []));

const loi = [];
const commits = git(
	"log",
	"--no-merges",
	"--format=%H",
	`--grep=${TEN}`,
	`${MOC}..HEAD`,
)
	.split("\n")
	.filter(Boolean);
if (commits.length === 0) loi.push("KHONG THAY COMMIT");

const tep = new Set(giaTep);
for (const c of commits) {
	for (const t of git("show", "--name-only", "--format=", c)
		.split("\n")
		.filter(Boolean))
		tep.add(t);
}
const tepHang = [...tep]
	.filter(
		(t) =>
			!t.startsWith("_acceptance/") &&
			!t.startsWith("docs/") &&
			!t.endsWith(".md"),
	)
	.filter(coHang)
	.sort();
for (const t of tepHang) loi.push(`TEP HANG: ${t}`);

const rieng = git(
	"log",
	"--no-merges",
	"--format=%H%x00%B%x01",
	`${MOC}..HEAD`,
	"^origin/onehub",
)
	.split("\x01")
	.map((s) => s.trim())
	.filter(Boolean)
	.map((s) => s.split("\x00"));
if (args.includes("--gia-commit-khong-ten"))
	rieng.push(["0000000000000000000000000000000000000000", "fix: gia"]);
for (const [sha, msg] of rieng) {
	if (!msg.includes(TEN)) loi.push(`COMMIT KHONG TEN: ${sha}`);
}

console.log(
	`khong-sua-tep-hang: ${commits.length} commit mang ten, ${tep.size} tep da xet, ${rieng.length} commit rieng cua nhanh`,
);
if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log("khong-sua-tep-hang: khong tep nao cua hang bi sua");
