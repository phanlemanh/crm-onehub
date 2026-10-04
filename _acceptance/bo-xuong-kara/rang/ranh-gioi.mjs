import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const RG = {
	nhanh: "origin/onehub",
	cam: "apps/app/",
	tepChung: [
		"packages/ui/src/lib/messages.ts",
		"_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs",
		"_acceptance/nen-chat-ai-elements/so-lech-chuan.md",
	],
	gia: {
		tep: ["apps/app/x.tsx", "packages/ui/src/components/kara/busy.tsx"],
		numstat: "5\t1\tpackages/ui/src/lib/messages.ts",
	},
};

function khongDoDuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function git(...doiSo) {
	const ket = spawnSync("git", ["-C", GOC, ...doiSo], { encoding: "utf8" });
	if (ket.status !== 0)
		khongDoDuoc(`git ${doiSo.join(" ")}: ${(ket.stderr ?? "").trim()}`);
	return ket.stdout;
}

function phan(tep, numstat) {
	const loi = [];
	for (const t of tep) if (t.startsWith(RG.cam)) loi.push(`cham apps/app: ${t}`);
	const bang = [];
	for (const d of numstat.split("\n").filter(Boolean)) {
		const [them, xoa, ten] = d.split("\t");
		bang.push(`${ten}: +${them} -${xoa}`);
		if (RG.tepChung.includes(ten) && xoa !== "0")
			loi.push(`xoa dong o tep chung: ${ten}`);
	}
	return { loi, bang };
}

function ketThuc(tep, { loi, bang }) {
	console.log(`tep da cham (${tep.length}):`);
	for (const t of tep) console.log(`   ${t}`);
	console.log("tep chung:");
	for (const b of bang) console.log(`   ${b}`);
	for (const l of loi) console.log(`SAI ${l}`);
	if (loi.length > 0) process.exit(1);
	console.log("XANH: khong cham apps/app, tep chung chi them dong");
}

if (process.argv.includes("--kiem-do-do")) {
	ketThuc(RG.gia.tep, phan(RG.gia.tep, RG.gia.numstat));
	process.exit(0);
}

const mb = git("merge-base", "HEAD", RG.nhanh).trim();
const tep = git("diff", "--name-only", `${mb}..HEAD`)
	.split("\n")
	.filter(Boolean);
if (tep.length === 0) {
	console.log("RONG: nhanh da gop, khong con diff");
	process.exit(0);
}
const numstat = git("diff", "--numstat", `${mb}..HEAD`, "--", ...RG.tepChung);
ketThuc(tep, phan(tep, numstat));
