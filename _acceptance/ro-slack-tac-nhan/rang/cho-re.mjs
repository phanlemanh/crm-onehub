import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const args = process.argv.slice(2);
const refDoc = args.includes("--ref-doc")
	? args[args.indexOf("--ref-doc") + 1]
	: null;
const git = (...a) =>
	execFileSync("git", ["-C", ROOT, ...a], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});

function coOHang(duong) {
	try {
		git("cat-file", "-e", `origin/release:${duong}`);
		return true;
	} catch {
		return false;
	}
}

const base = git("merge-base", "HEAD", "origin/onehub").trim();
const sua = git("diff", "--name-only", `${base}..HEAD`)
	.split("\n")
	.filter(Boolean)
	.filter(
		(p) =>
			!p.startsWith("_acceptance/") && !p.startsWith("docs/") && !p.endsWith(".md"),
	)
	.filter(coOHang)
	.sort();

const doc = refDoc
	? git("show", `${refDoc}:docs/agent.md`)
	: readFileSync(resolve(ROOT, "docs/agent.md"), "utf8");
const muc = doc.split(/\n(?=## )/).find((s) => s.startsWith("## Chỗ rẽ")) ?? "";
const neu = [
	...new Set([...muc.matchAll(/`(apps\/[^`]+\.ts)`/g)].map((m) => m[1])),
]
	.filter(coOHang)
	.sort();

const loi = [
	...sua.filter((p) => !neu.includes(p)).map((p) => `THUA: ${p}`),
	...neu.filter((p) => !sua.includes(p)).map((p) => `THIEU: ${p}`),
];
if (!muc) loi.push("THIEU MUC: ## Chỗ rẽ trong docs/agent.md");
if (muc && !/gỡ/i.test(muc)) loi.push("THIEU DIEU KIEN GO");

console.log(JSON.stringify({ sua, neu }));
if (loi.length) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log(`cho-re: ${sua.length} tệp của hãng bị sửa, khớp mục chỗ rẽ`);
