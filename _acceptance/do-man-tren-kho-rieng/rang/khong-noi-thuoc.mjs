import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "do-man-tren-kho-rieng";
const CANH_CAY = "_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

export function tepViPham(tep) {
	return tep.filter((t) => {
		if (t === CANH_CAY) return true;
		const m = /^_acceptance\/([^/]+)\//.exec(t);
		return m !== null && m[1] !== SLUG;
	});
}

export function dongXoaConfig(diff) {
	return diff
		.split("\n")
		.filter((d) => d.startsWith("-") && !d.startsWith("---"))
		.filter((d) => d.slice(1).trim().length > 0);
}

let sai = 0;
function khang(dieu, cau) {
	console.log(`  ${dieu ? "DUNG" : "SAI "} ${cau}`);
	if (!dieu) sai += 1;
}

const git = (...a) => execFileSync("git", a, { cwd: GOC, encoding: "utf8" });

const giaTep = tepViPham([
	`_acceptance/${SLUG}/contract.md`,
	"_acceptance/dat-okr-trong-crm/rang/man-okr.mjs",
]);
khang(
	giaTep.length === 1 && giaTep[0].includes("man-okr.mjs"),
	"doi chung: tep cua ho so khac bi goi ten",
);
const giaXoa = dongXoaConfig(
	"--- a/_acceptance/config.yaml\n-    dok_man_chrome: 'x'\n+    dmk_x: y",
);
khang(
	giaXoa.length === 1 && giaXoa[0].includes("dok_man_chrome"),
	"doi chung: dong executor bi xoa bi goi ten",
);

const goc = git("merge-base", "HEAD", "origin/onehub").trim();
const tep = git("diff", "--name-only", goc).split("\n").filter(Boolean);
const vp = tepViPham(tep);
for (const t of vp) console.log(`    cham: ${t}`);
khang(
	vp.length === 0,
	`khong tep nao cua ho so khac hay canh-cay.mjs bi cham (${tep.length} tep doi)`,
);
const xoa = dongXoaConfig(git("diff", goc, "--", "_acceptance/config.yaml"));
for (const d of xoa) console.log(`    xoa: ${d.slice(0, 120)}`);
khang(
	xoa.length === 0,
	"config.yaml chi them dong, khong sua hay xoa executor co san",
);
console.log(`khong-noi-thuoc: ${sai === 0 ? "sach" : `${sai} SAI`}`);
process.exit(sai > 0 ? 1 : 0);
