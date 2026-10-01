import { execFileSync } from "node:child_process";
import { GOC, ketThuc } from "./chung.mjs";

const HO_SO = "_acceptance/mien-so-chup-bo-okr-mau";
const HO_SO_DOI_CHUNG = "_acceptance/bo-okr-mau";
const COMMIT_DOI_CHUNG = "e3e2f252f";
const TEP_DOI_CHUNG = "apps/api/scripts/okr-mau/nap.ts";
const NHANH_CHINH = "origin/onehub";
const MA_SAN_PHAM = /^(apps|packages)\//;

const git = (...d) =>
	execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();
const dong = (s) =>
	s
		.split("\n")
		.map((x) => x.trim())
		.filter(Boolean);
const chamMa = (tep) => tep.filter((t) => MA_SAN_PHAM.test(t));

function tepCuaHoSo(hoSo) {
	const nhatKy = dong(
		git(
			"log",
			"--no-merges",
			"--full-diff",
			"--name-only",
			"--format=@@%h",
			"--",
			hoSo,
		),
	);
	return {
		commit: nhatKy.filter((x) => x.startsWith("@@")).map((x) => x.slice(2)),
		tep: [...new Set(nhatKy.filter((x) => !x.startsWith("@@")))].sort(),
	};
}

const cua = tepCuaHoSo(HO_SO);
if (cua.commit.length === 0) {
	console.log("KHONG DO DUOC: khong commit nao cham ho so");
	process.exit(2);
}
console.log(
	`(i) ${cua.commit.length} commit cham ${HO_SO}: ${cua.commit.join(" ")}`,
);
for (const t of cua.tep) console.log(`(i)  ${t}`);

let tepNhanh = [];
let coNhanhChinh = true;
try {
	git("rev-parse", "--verify", "--quiet", NHANH_CHINH);
} catch {
	coNhanhChinh = false;
	console.log(`(ii) khong co ${NHANH_CHINH} — chi (i) chong lung`);
}
if (coNhanhChinh) {
	const goc = git("merge-base", "HEAD", NHANH_CHINH);
	if (goc !== git("rev-parse", "HEAD")) {
		tepNhanh = dong(git("diff", "--name-only", goc, "HEAD"));
		console.log(`(ii) diff ${goc.slice(0, 8)}..HEAD: ${tepNhanh.length} tep`);
		for (const t of tepNhanh) console.log(`(ii) ${t}`);
	} else console.log("(ii) nhanh da gop — (ii) rong");
}

const vi = [...new Set([...chamMa(cua.tep), ...chamMa(tepNhanh)])];
for (const t of vi) console.log(`CHAM MA SAN PHAM: ${t}`);

const phanLoai = chamMa(
	dong(git("show", "--name-only", "--format=", COMMIT_DOI_CHUNG)),
).includes(TEP_DOI_CHUNG);
console.log(
	phanLoai
		? `doi chung am ${COMMIT_DOI_CHUNG}: CHAM MA SAN PHAM: ${TEP_DOI_CHUNG}`
		: `DOI CHUNG LOT: ${COMMIT_DOI_CHUNG} khong neu ${TEP_DOI_CHUNG}`,
);

const gom = chamMa(tepCuaHoSo(HO_SO_DOI_CHUNG).tep).includes(TEP_DOI_CHUNG);
console.log(
	gom
		? `doi chung am qua ham gom (${HO_SO_DOI_CHUNG}): CHAM MA SAN PHAM: ${TEP_DOI_CHUNG}`
		: `DOI CHUNG LOT: ham gom tren ${HO_SO_DOI_CHUNG} khong thay ${TEP_DOI_CHUNG}`,
);

ketThuc(
	vi.length === 0 && phanLoai && gom ? 0 : 1,
	`${vi.length} tep ma san pham, doi chung phan loai ${phanLoai ? "bat" : "LOT"}, doi chung gom ${gom ? "bat" : "LOT"}`,
);
