import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../../../packages/validation/node_modules/zod/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "duong-ly-do-muc-tieu";
const RA = join(GOC, ".acceptance-runs", SLUG, "dot-bien");
const LY_DO = "apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx";
const SHEET = "apps/app/components/crm/record-sheet/objective-sheet.tsx";
const NAP = "apps/api/scripts/okr-mau/nap.ts";
const KTRA_MTKR =
	"cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/muc-tieu-va-kr.dom.tsx -t sheet-chi-tiet";
const CHAN = [
	"l2_co_so_lieu",
	"l2_ba_muc",
	"l2_vang",
	"l2_len_muc_tieu",
	"l2_dau_kara",
	"l2_chu",
	"l2_bo_mau",
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
	{ ten: "(a) bo dong can cu", tep: LY_DO, cam: thay("{g.lyDo && g.canCu ? (", "{false ? ("), lenh: lenhCua("l2_co_so_lieu"), ghim: "can cu" },
	{ ten: "(b) suy muc tin o man", tep: LY_DO, cam: thay("label={m.mucTin[g.mucTin]}", 'label={m.mucTin[g.lyDo ? (g.canCu ? "co-so-lieu" : "dat-cuoc") : "chua-co-ly-do"]}'), lenh: lenhCua("l2_ba_muc"), ghim: "muc tin tinh lai o man" },
	{ ten: "(c) luon ve dong can cu", tep: LY_DO, cam: thay("{g.lyDo && g.canCu ? (", "{true ? ("), lenh: lenhCua("l2_vang"), ghim: "dong can cu rong" },
	{ ten: "(d) bo dieu kien lyDoTuKara", tep: LY_DO, cam: thay("{g.lyDoTuKara ? (", "{true ? ("), lenh: lenhCua("l2_dau_kara"), ghim: "dau kara tren ly do cua nguoi" },
	{ ten: "(e) ly do trong item-description", tep: SHEET, cam: (s) => thay("\t\t\t\t\t\t\t\t<LyDoNoiGop g={g} />\n", "")(s).replace("</ItemDescription>\n\t\t\t\t\t\t\t</ItemContent>", "\t<LyDoNoiGop g={g} />\n\t\t\t\t\t\t\t\t</ItemDescription>\n\t\t\t\t\t\t\t</ItemContent>"), lenh: KTRA_MTKR, ghim: "(fail) sheet-chi-tiet" },
	{ ten: "(f) nap.ts bo lyDo", tep: NAP, cam: thay("lyDo: m.canChinh?.lyDo ?? null,", "lyDo: null,"), lenh: lenhCua("l2_bo_mau"), ghim: "ly do mau khong vao csdl" },
	{ ten: "(g) luon ve vung Duong ly do", tep: SHEET, cam: thay("if (mt.alignments.length === 0) return null;", ""), lenh: lenhCua("l2_vang"), ghim: "khung gop vao rong" },
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
const ban = execFileSync("git", ["-C", GOC, "diff", "--name-only", "--", LY_DO, SHEET, NAP], { encoding: "utf8" }).trim();
if (ban) {
	console.log(`cay ban sau dot bien: ${ban}`);
	process.exit(3);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep tra lai nguyen`);
process.exit(bat === VET.length ? 0 : 1);
