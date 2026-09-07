import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";
import { bam, docConfig, GOC, ketThuc, SHA_GHIM } from "./chung.mjs";

const CHAN = [
	"_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs",
	"_acceptance/lenh-dung-do-khong-ai-thay/rang/o-cam-ep-chay-lai.mjs",
];

const bamDau = bam(docConfig());

const cu = execFileSync(
	"git",
	["show", `${SHA_GHIM}:_acceptance/config.yaml`],
	{
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 32 * 1024 * 1024,
	},
);

let banCuNem = false;
try {
	Bun.YAML.parse(cu);
} catch {
	banCuNem = true;
}
console.log(
	`config.yaml tai sha ghim parse duoc bang YAML: ${banCuNem ? "KHONG" : "co"}`,
);
if (!banCuNem) {
	console.error(
		"MA 2: ban cu KHONG nem loi — tien de cua vong sai, khong co gi de sua, va phep do nay khong chung duoc dieu gi.",
	);
	ketThuc(bamDau, 2);
}

const hong = [];
for (const c of CHAN) {
	const r = spawnSync("bun", [join(GOC, c)], {
		cwd: GOC,
		encoding: "utf8",
		timeout: 1800000,
	});
	const duoi = `${r.stdout ?? ""}${r.stderr ?? ""}`
		.trim()
		.split("\n")
		.slice(-2)
		.join(" | ");
	console.log(
		`  ${r.status === 0 ? "ok " : "DO "} ${c.split("/").at(-1)} · ma ${r.status}`,
	);
	if (r.status !== 0) hong.push({ c, ma: r.status, duoi });
}

if (hong.length > 0) {
	console.error("DO: chan cua ho so DA KY van khong chay duoc:");
	for (const h of hong)
		console.error(`  ${h.c} · ma ${h.ma} · ${h.duoi.slice(0, 240)}`);
	ketThuc(bamDau, 1);
}

console.log(
	`XANH: ban cu nem loi YAML (tien de dung), va ca ${CHAN.length} chan cua ho so da ky nay chay duoc.`,
);
ketThuc(bamDau, 0);
