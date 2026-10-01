import { execFileSync } from "node:child_process";
import { GOC } from "./chung.mjs";

const HO_SO = "_acceptance/mien-so-chup-bo-okr-mau";
const DOI_CHUNG = "e3e2f252f";
const TEP_DOI_CHUNG = "apps/api/scripts/okr-mau/nap.ts";
const MA_SAN_PHAM = /^(apps|packages)\//;

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();
const dong = (s) =>
	s
		.split("\n")
		.map((x) => x.trim())
		.filter(Boolean);
const chamMa = (tep) => tep.filter((t) => MA_SAN_PHAM.test(t));

const nhatKy = dong(
	git("log", "--no-merges", "--name-only", "--format=@@%h", "--", HO_SO),
);
const commit = nhatKy.filter((x) => x.startsWith("@@")).map((x) => x.slice(2));
if (commit.length === 0) {
	console.log("KHONG DO DUOC: khong commit nao cham ho so");
	process.exit(2);
}
const tepHoSo = [...new Set(nhatKy.filter((x) => !x.startsWith("@@")))].sort();
console.log(`(i) ${commit.length} commit cham ${HO_SO}: ${commit.join(" ")}`);
for (const t of tepHoSo) console.log(`(i)  ${t}`);

let tepNhanh = [];
let goc = "";
try {
	goc = git("merge-base", "HEAD", "origin/onehub");
} catch {
	console.log("(ii) khong co origin/onehub — chi (i) chong lung");
}
if (goc && goc !== git("rev-parse", "HEAD")) {
	tepNhanh = dong(git("diff", "--name-only", goc, "HEAD"));
	console.log(`(ii) diff ${goc.slice(0, 8)}..HEAD: ${tepNhanh.length} tep`);
	for (const t of tepNhanh) console.log(`(ii) ${t}`);
} else if (goc) console.log("(ii) nhanh da gop — (ii) rong");

const vi = [...new Set([...chamMa(tepHoSo), ...chamMa(tepNhanh)])];
for (const t of vi) console.log(`CHAM MA SAN PHAM: ${t}`);

const doiChung = chamMa(
	dong(git("show", "--name-only", "--format=", DOI_CHUNG)),
);
const bat = doiChung.includes(TEP_DOI_CHUNG);
console.log(
	bat
		? `doi chung am ${DOI_CHUNG}: CHAM MA SAN PHAM: ${TEP_DOI_CHUNG}`
		: `DOI CHUNG LOT: ${DOI_CHUNG} khong neu ${TEP_DOI_CHUNG}`,
);
process.exit(vi.length === 0 && bat ? 0 : 1);
