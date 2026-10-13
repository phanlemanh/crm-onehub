import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../../../packages/validation/node_modules/zod/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "cay-can-chinh-co-ly-do";
const RA = join(GOC, ".acceptance-runs", SLUG, "dot-bien");
const CAY = "apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx";
const SV = "apps/api/src/okr/okr-xem.service.ts";
const CHAN = [
	"l3_canh",
	"l3_quyen",
	"l3_nut",
	"l3_ba_muc",
	"l3_lap_lai",
	"l3_loc",
	"l3_dem",
	"l3_chu",
];

const config = Bun.YAML.parse(readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"));
const lenhCua = (khoa) => {
	const r = z.string().safeParse(config.executors.test[khoa]);
	if (!r.success) throw new Error(`khong co executors.test.${khoa}`);
	return r.data;
};
const chay = (lenh) => {
	const r = spawnSync("bash", ["-c", lenh], { cwd: GOC, encoding: "utf8", maxBuffer: 256 << 20 });
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};
const bam = (tep) => createHash("sha256").update(readFileSync(join(GOC, tep))).digest("hex");

const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1) throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};

const VET = [
	{ ten: "(a) chi dung canh dich KR", tep: SV, cam: thay("a.targetKeyResultId ?? a.targetObjectiveId", "a.targetKeyResultId ?? \"\""), lenh: lenhCua("l3_canh"), ghim: "canh thieu:" },
	{ ten: "(b) bo loc dich co mat", tep: SV, cam: thay(".filter(({ den }) => coMat.has(den))", ""), lenh: lenhCua("l3_quyen"), ghim: "canh lo ra ngoai cay" },
	{ ten: "(c) doc canh theo goc thay vi cha", tep: CAY, cam: thay("children: dung(nut.children, id, nut.id, canh),", "children: dung(nut.children, id, idCha ?? nut.id, canh),"), lenh: lenhCua("l3_nut"), ghim: "ly do sai cha" },
	{ ten: "(d) bang muc tin thu hai", tep: CAY, cam: thay("const NHOM_CHUA = \"chua-can-chinh\";", "const NHOM_CHUA = \"chua-can-chinh\";\nconst BANG_HAI = { \"chua-co-ly-do\": \"cho\" };\nvoid BANG_HAI;"), lenh: lenhCua("l3_ba_muc"), ghim: "bang muc tin thu hai" },
	{ ten: "(e) bo giu to tien", tep: CAY, cam: thay("return khop || con.length > 0 ? [{ ...n, children: con }] : [];", "return khop ? [{ ...n, children: con }] : [];"), lenh: lenhCua("l3_loc"), ghim: "thieu: O, K1" },
	{ ten: "(f) chip tat ca dem moi nut", tep: CAY, cam: thay("? canh.length", "? day.length + 99"), lenh: lenhCua("l3_dem"), ghim: "so tren chip sai" },
];

mkdirSync(RA, { recursive: true });
const nen = CHAN.map((k) => ({ k, ...chay(lenhCua(k)) }));
const chuaXanh = nen.filter((x) => x.ma !== 0);
if (chuaXanh.length) {
	console.log(`KHONG DO DUOC: chua pha gi ma ${chuaXanh.map((x) => `${x.k}(${x.ma})`).join(" · ")} da khong xanh`);
	process.exit(2);
}
console.log(`chieu xanh: ${CHAN.length}/${CHAN.length} chan xanh tren cay lanh`);

let bat = 0;
for (const v of VET) {
	const duong = join(GOC, v.tep);
	const truoc = readFileSync(duong, "utf8");
	const bamTruoc = bam(v.tep);
	let r;
	try {
		const sau = v.cam(truoc);
		if (sau === truoc) throw new Error(`vet ${v.ten} khong doi gi`);
		writeFileSync(duong, sau);
		r = chay(v.lenh);
		writeFileSync(join(RA, `${v.ten.slice(1, 2)}.txt`), r.ra);
	} finally {
		writeFileSync(duong, truoc);
	}
	if (bam(v.tep) !== bamTruoc) {
		console.log(`TEP KHONG TRA LAI: ${v.tep}`);
		process.exit(3);
	}
	const duBat = r.ma !== 0 && r.ra.includes(v.ghim);
	if (duBat) bat += 1;
	console.log(`${duBat ? "bat" : "MU"} ${v.ten}: ${r.ma !== 0 ? "do" : "XANH"}${r.ra.includes(v.ghim) ? "" : ` (thieu «${v.ghim}»)`}`);
}
const ban = execFileSync("git", ["-C", GOC, "diff", "--name-only", "--", CAY, SV], { encoding: "utf8" }).trim();
if (ban) {
	console.log(`cay ban sau dot bien: ${ban}`);
	process.exit(3);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
