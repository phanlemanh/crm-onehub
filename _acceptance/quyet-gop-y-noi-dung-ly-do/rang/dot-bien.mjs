import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = path.join(ROOT, ".acceptance-runs/quyet-gop-y-noi-dung-ly-do");
const SV = "apps/api/src/okr/tro-ly.service.ts";
const KARA = "apps/app/app/(app)/[slug]/okr/gop-y-kara.ts";
const CHAN = ["k3c_api", "k3c_vi", "k3c_mot_nguon"];

function moiTruong() {
	const env = { ...process.env };
	for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
	return env;
}
const chayVo = (lenh) => spawnSync("bash", ["-c", lenh], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20, env: moiTruong() });
const bam = (tep) => createHash("sha256").update(fs.readFileSync(path.join(ROOT, tep))).digest("hex");
function lenh(khoa) {
	const cfg = Bun.YAML.parse(fs.readFileSync(path.join(ROOT, "_acceptance/config.yaml"), "utf8"));
	const l = cfg.executors?.test?.[khoa] ?? cfg.executors?.script?.[khoa];
	if (!l) throw new Error(`thieu executors.*.${khoa}`);
	return l;
}
const chay = (khoa) => {
	const r = chayVo(lenh(khoa));
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};
const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1) throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};
const noi = (...b) => (s) => b.reduce((x, f) => f(x), s);

const BAT_TRONG = [
	"if (ghiOkr) await this.ghiTheoDong(tx, userId, hang.id, dong, giaTri);",
	"if (ghiOkr)\n\t\t\t\t\ttry {\n\t\t\t\t\t\tawait this.ghiTheoDong(tx, userId, hang.id, dong, giaTri);\n\t\t\t\t\t} catch (loi) {\n\t\t\t\t\t\tconst lyDo = lyDoKhongQuyetCua(loi);\n\t\t\t\t\t\tif (lyDo === null) throw loi;\n\t\t\t\t\t\treturn { ok: false, lyDo };\n\t\t\t\t\t}",
];

const VET = [
	{ ten: "(a) bo anh xa can-chinh-chua-cong-bo", tep: SV, cam: thay('"can-chinh-chua-cong-bo": [T.canChinh.chuaCongBo],', '"can-chinh-chua-cong-bo": [],'), doi: [["k3c_mot_nguon", "thieu anh xa: can-chinh-chua-cong-bo"]] },
	{ ten: "(b) bat loi trong giao dich", tep: SV, cam: noi(thay(...BAT_TRONG), thay("const lyDo = lyDoKhongQuyetCua(loi);\n\t\t\t\tif (lyDo === null) throw loi;", "const lyDo = null;\n\t\t\t\tif (lyDo === null) throw loi;")), doi: [["k3c_api", ": gop y khong con cho"]] },
	{ ten: "(c) app luon cau thu lai", tep: KARA, cam: thay("const cau = laLyDoKhongQuyet(kq.lyDo)", "const cau = false && laLyDoKhongQuyet(kq.lyDo)"), doi: [["k3c_vi", "cau sai cho"]] },
];

fs.mkdirSync(RA, { recursive: true });
const nen = CHAN.map((k) => ({ k, ...chay(k) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`);
	process.exit(2);
}
let bat = 0;
for (const v of VET) {
	const duong = path.join(ROOT, v.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	const ket = [];
	try {
		fs.writeFileSync(duong, v.cam(truoc));
		for (const [k, ghim] of v.doi) {
			const r = chay(k);
			fs.writeFileSync(path.join(RA, `dot-bien-${v.ten.slice(1, 2)}-${k}.txt`), r.ra);
			ket.push({ k, do: r.ma !== 0, ghim: r.ra.includes(ghim), thongDiep: ghim });
		}
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const du = ket.every((x) => x.do && x.ghim);
	if (du) bat++;
	console.log(`${du ? "bat" : "MU"} ${v.ten}: ${ket.map((x) => `${x.k} ${x.do ? "do" : "XANH"}${x.ghim ? "" : ` (thieu «${x.thongDiep}»)`}`).join(" · ")}`);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
