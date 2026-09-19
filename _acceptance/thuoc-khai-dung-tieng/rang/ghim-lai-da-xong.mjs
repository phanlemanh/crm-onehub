import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bang, GOC, thoat } from "./chung.mjs";

const HO_SO = "nen-chat-ai-elements";
const BAO_CAO = `_acceptance/${HO_SO}/evidence-report.md`;
const EVALS = `_acceptance/${HO_SO}/evals.yaml`;

const bao = readFileSync(join(GOC, BAO_CAO), "utf8");
const m = /^verified_commit:\s*"?([0-9a-f]{7,40})"?/m.exec(bao);
if (!m) {
	thoat(2, `KHONG DO DUOC: ${BAO_CAO} khong co truong verified_commit.`);
}
const sha = m[1];

const evals = readFileSync(join(GOC, EVALS), "utf8");
const duong = [
	...new Set(
		[...evals.matchAll(/^\s*-\s*"([^"]+)"\s*$/gm)]
			.map((x) => x[1])
			.filter((d) => d.includes("/") || d.includes(".")),
	),
].sort();

console.log(
	`-- Ho so ${HO_SO} da ky, va vong nay sua .githooks/gate-shape.json —\n` +
		"   mot tep nam trong paths eval cua no. Bang chung da ky cua no vi the HOA CU.\n" +
		`-- verified_commit hien tai: ${sha}\n` +
		`-- ${duong.length} duong trong paths eval, doc TU ${EVALS}.`,
);

function bam(rev, d) {
	if (d.includes("*")) {
		try {
			const ra = execFileSync(
				"git",
				["-C", GOC, "ls-tree", "-r", rev, "--", d.replace(/\*\*$/, "")],
				{ encoding: "utf8" },
			).trim();
			const dong = ra
				.split("\n")
				.filter((x) => x !== "")
				.map((x) => {
					const [mo, ten] = x.split("\t");
					return `${mo.split(" ")[2]} ${ten}`;
				})
				.sort();
			return `${dong.length} tep · ${bamChuoi(dong.join("\n"))}`;
		} catch {
			return "(khong doc duoc)";
		}
	}
	try {
		return execFileSync("git", ["-C", GOC, "rev-parse", `${rev}:${d}`], {
			encoding: "utf8",
		}).trim();
	} catch {
		return "(khong co)";
	}
}

function bamChuoi(v) {
	return createHash("sha1").update(v).digest("hex").slice(0, 12);
}

const hang = [];
let hong = 0;

for (const d of duong) {
	const cu = bam(sha, d);
	const nay = bam("HEAD", d);
	if (cu !== nay) {
		hang.push(
			`HOA CU [bang-chung-hoa-cu:${d}] ${cu.slice(0, 12)} -> ${nay.slice(0, 12)}`,
		);
		hong += 1;
	} else {
		hang.push(`con tuoi ${d} ${nay.slice(0, 12)}`);
	}
}

bang("-- Tung duong, kem bam truoc/sau:", hang);
if (hong > 0) {
	console.log(
		"   Cach sua KHONG phai sua tay evidence-report: chay nghi thuc ghim lai\n" +
			"   (repin-lane.mjs) de mot lan chay bang MAY chong lung cho bam moi.",
	);
}
console.log(`ket qua: ${hong} duong hoa cu tren ${duong.length}`);
process.exit(hong > 0 ? 1 : 0);
