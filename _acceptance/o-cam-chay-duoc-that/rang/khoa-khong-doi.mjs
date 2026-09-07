import { execFileSync } from "node:child_process";
import {
	bam,
	docConfig,
	GOC,
	ketThuc,
	moiOCam,
	O_CAM_MOI,
	SHA_GHIM,
} from "./chung.mjs";

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

const tapCu = new Set(moiOCam(cu));
const tapMoi = new Set(moiOCam(docConfig()));

if (tapCu.size === 0) {
	console.error("MA 2: tap khoa tai sha ghim rong");
	ketThuc(bamDau, 2);
}

const mat = [...tapCu].filter((k) => !tapMoi.has(k));
const them = [...tapMoi].filter((k) => !tapCu.has(k));
const chophep = new Set(O_CAM_MOI.map((t) => `executors.script.${t}`));
const themLa = them.filter((k) => !chophep.has(k));

console.log(`khoa tai sha ghim: ${tapCu.size} · khoa o HEAD: ${tapMoi.size}`);
console.log(
	`  mat: ${mat.length} · them: ${them.length} · them NGOAI danh sach: ${themLa.length}`,
);

if (mat.length > 0) {
	console.error("DO: co khoa cu bi bot hoac doi ten — chu ky da trich chung:");
	for (const k of mat) console.error(`  ${k}`);
	ketThuc(bamDau, 1);
}
if (themLa.length > 0) {
	console.error("DO: co khoa them NGOAI danh sach tam ten da ghim:");
	for (const k of themLa) console.error(`  ${k}`);
	ketThuc(bamDau, 1);
}

console.log(
	`XANH: moi khoa cu con nguyen, va ${them.length} khoa them deu nam trong danh sach tam ten da ghim.`,
);
ketThuc(bamDau, 0);
