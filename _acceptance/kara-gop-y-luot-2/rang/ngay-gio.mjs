import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { OKR_CHU_KY } from "../../../apps/app/lib/okr-chu-ky-nhan.ts";
import { formatNgayGio } from "../../../packages/ui/src/lib/format.ts";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const MAU = JSON.parse(readFileSync(join(GOC, "_acceptance/kara-gop-y-luot-2/rang/ngay-gio-mau.json"), "utf8"));
const OKR = "apps/app/app/(app)/[slug]/okr";
const NAM_CHO = [
	`${OKR}/nhom-kara.tsx`,
	`${OKR}/bang-vet.tsx`,
	`${OKR}/soan/nut-soan.tsx`,
	`${OKR}/soan/danh-sach-cuoc.tsx`,
	`${OKR}/soan/bang-nhap.tsx`,
];
const KHUON_RIENG = [
	/new Intl\.DateTimeFormat\b/,
	/\.toLocale(?:Date|Time)?String\(/,
	/\bdateFormat\(/,
	/\bngayThangVn\(/,
	/\bget(?:Hours|Minutes|Date|Month|FullYear)\(/,
];
const PHAN = ["ngay-gio", "ngay", "ngay-thang", "gio"];
const BAI_DOM =
	"cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/gop-y-dung-cho-luot-2.dom.tsx -t k3-ngay-gio";

function quet(thuMuc) {
	const sai = [];
	for (const tep of NAM_CHO) {
		const chu = readFileSync(join(thuMuc, tep), "utf8");
		if (!chu.includes("formatNgayGio(") || !chu.includes('from "@crm/ui/lib/format"'))
			sai.push(`chua goi ham chung: ${tep}`);
		if (!chu.includes("timeZone: OKR_CHU_KY.muiGio")) sai.push(`khong theo gio Viet Nam: ${tep}`);
		if (KHUON_RIENG.some((r) => r.test(chu))) sai.push(`khuon rieng con: ${tep}`);
	}
	return sai;
}

const co = process.argv.slice(2);
if (co[0] === "--ban-sao" && co[1] === "them-cu") {
	const tam = mkdtempSync(join(tmpdir(), "k3-ngay-gio-"));
	for (const tep of NAM_CHO) {
		mkdirSync(dirname(join(tam, tep)), { recursive: true });
		cpSync(join(GOC, tep), join(tam, tep));
	}
	appendFileSync(join(tam, NAM_CHO[0]), "\nexport const cu = new Date().toLocaleString();\n");
	const sai = quet(tam);
	rmSync(tam, { recursive: true, force: true });
	for (const s of sai) console.log(s);
	const bat = sai.includes(`khuon rieng con: ${NAM_CHO[0]}`);
	if (!bat) console.log("CHIEU DO HONG: ban sao co toLocaleString ma quet khong bat");
	process.exit(bat ? 1 : 3);
}

const lech = [];
for (const locale of ["vi", "en"])
	for (const phan of PHAN) {
		const thuc = formatNgayGio(MAU.moc, locale, { timeZone: OKR_CHU_KY.muiGio, phan });
		if (thuc !== MAU[locale][phan]) lech.push(`ham chung lech mau: ${locale}/${phan} «${thuc}» != «${MAU[locale][phan]}»`);
	}
if (lech.length) {
	for (const l of lech) console.log(l);
	process.exit(1);
}
console.log(`ngay-gio: ham chung khop mau ${PHAN.length * 2}/${PHAN.length * 2}`);

const sai = quet(GOC);
if (sai.length) {
	for (const s of sai) console.log(s);
	process.exit(1);
}
console.log(`ngay-gio: ${NAM_CHO.length}/${NAM_CHO.length} cho goi ham chung`);

const dom = spawnSync("bash", ["-c", BAI_DOM], { cwd: GOC, encoding: "utf8", maxBuffer: 64 << 20 });
const ra = `${dom.stdout}${dom.stderr}`;
if (dom.status !== 0 || !ra.includes("k3-ngay-gio: 14/14 o")) {
	console.log(ra.split("\n").slice(-30).join("\n"));
	console.log(`ngay-gio: man dung lech (bai DOM thoat ${dom.status})`);
	process.exit(1);
}
console.log("ngay-gio: man dung 14/14 o khop mau");
