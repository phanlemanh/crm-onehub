import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HOP_DONG = join(import.meta.dirname, "..", "contract.md");
const CU = "không bao giờ vào `ci.yml` của hãng";
const MUC = "## Kho này là bản riêng";
const NOI_CI = "`.github/workflows/acceptance.yml`";
const NEN_TRUOC_GOP = "1dd4e587bf9d77b9eaa357df6ee1e8950178b169";

const gon = (s) => s.replace(/\s+/g, " ").trim();

function doanMoi() {
	const chu = readFileSync(HOP_DONG, "utf8");
	const i = chu.indexOf("(anh duyệt nguyên văn ở Cổng 1 này):");
	if (i === -1) throw new Error("contract.md khong co doan da duyet");
	const m = /«([\s\S]*?)»/.exec(chu.slice(i));
	if (!m) throw new Error("contract.md khong co «…» sau dong duyet");
	return gon(m[1]);
}

function kiem(chu, moi) {
	const loi = [];
	const dau = chu.indexOf(MUC);
	if (dau === -1) return [`thieu muc «${MUC}»`];
	const sau = chu.indexOf("\n## ", dau + MUC.length);
	const muc = gon(chu.slice(dau, sau === -1 ? undefined : sau));
	if (gon(chu).includes(gon(CU))) loi.push("con luat cu");
	if (!muc.includes(moi)) loi.push("thieu doan moi trong muc");
	if (!muc.includes(NOI_CI)) loi.push("muc khong con nhac acceptance.yml");
	return loi;
}

const moi = doanMoi();
const hong = kiem(readFileSync(join(GOC, "CLAUDE.md"), "utf8"), moi).map(
	(l) => `ban that: ${l}`,
);
const goc = NEN_TRUOC_GOP;
const cu = execFileSync("git", ["-C", GOC, "show", `${goc}:CLAUDE.md`], {
	encoding: "utf8",
});
const loiCu = kiem(cu, moi);
const bat = loiCu.includes("con luat cu");
console.log(
	`chieu do CLAUDE.md o ${goc.slice(0, 9)}: ${bat ? "DO dung cho" : "KHONG BAT"} — ${loiCu.join("; ")}`,
);
if (!bat) hong.push("chieu do: khong bat «con luat cu»");

if (hong.length > 0) {
	console.error(hong.join("\n"));
	process.exit(1);
}
console.log(
	"claude-md: luat cu da bo, doan moi co nguyen van trong muc «Kho này là bản riêng»; chieu do dung cho",
);
