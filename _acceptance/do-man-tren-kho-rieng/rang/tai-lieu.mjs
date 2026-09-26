import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MEASURE_DATABASE } from "../../../packages/db/src/measure-database.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GIO_MS = 3_600_000;

export function muc(van, tieuDe) {
	const i = van.indexOf(tieuDe);
	if (i === -1) return null;
	const cap = tieuDe.match(/^#+/)[0].length;
	const sau = van.slice(i + tieuDe.length);
	const ke = sau.search(new RegExp(`\\n#{1,${cap}} `));
	return ke === -1 ? sau : sau.slice(0, ke);
}

function phang(van) {
	return (van ?? "").replace(/\s+/g, " ");
}

export function thieu(van, moc) {
	const p = phang(van);
	return moc.filter((m) => !p.includes(m));
}

export function lechGiaTri(mucSetup) {
	const loi = [];
	const gio = /\((\d+) hours\)/.exec(phang(mucSetup));
	if (!gio || Number(gio[1]) * GIO_MS !== MEASURE_DATABASE.maxAgeMs)
		loi.push(
			`maxAgeMs: tai lieu ghi ${gio?.[1] ?? "?"} gio, code ${MEASURE_DATABASE.maxAgeMs / GIO_MS} gio`,
		);
	const cong = /(\d{4})–(\d{4})/.exec(phang(mucSetup));
	if (
		!cong ||
		Number(cong[1]) !== PHIEN_DO.cong.tu ||
		Number(cong[2]) !== PHIEN_DO.cong.den
	)
		loi.push(
			`cong: tai lieu ghi ${cong?.[1] ?? "?"}–${cong?.[2] ?? "?"}, code ${PHIEN_DO.cong.tu}–${PHIEN_DO.cong.den}`,
		);
	return loi;
}

export function khoiPhienDo(env) {
	const dong = env.split("\n");
	const i = dong.findIndex((d) => /^# PHIEN_DO\b/.test(d));
	if (i === -1) return "";
	const khoi = [];
	for (let k = i; k < dong.length && dong[k].startsWith("#"); k += 1)
		khoi.push(dong[k]);
	return khoi.join("\n");
}

const MOC_SETUP = [
	"db:do --tao",
	"--xoa",
	"--quet",
	"do:man",
	"template",
	"maxAgeMs",
	"tien-de",
];
const MOC_CLAUDE = ["do:man", "không bao giờ ghi vào kho chung"];
const MOC_ENV = ["never by hand"];

let sai = 0;
function khang(dieu, cau) {
	console.log(`  ${dieu ? "DUNG" : "SAI "} ${cau}`);
	if (!dieu) sai += 1;
}

const setup = readFileSync(join(GOC, "docs/setup.md"), "utf8");
const mucSetup = muc(setup, "### Screen measurements");
const claude = readFileSync(join(GOC, "CLAUDE.md"), "utf8");
const env = readFileSync(join(GOC, ".env.example"), "utf8");

khang(
	thieu((mucSetup ?? "").replaceAll("--quet", ""), MOC_SETUP).includes(
		"--quet",
	),
	"doi chung: bo --quet thi bi goi ten --quet",
);
khang(
	lechGiaTri((mucSetup ?? "").replace(/\(\d+ hours\)/, "(6 hours)")).some((l) =>
		l.startsWith("maxAgeMs"),
	),
	"doi chung: tai lieu ghi 6 gio thi bi goi ten maxAgeMs",
);
khang(
	lechGiaTri((mucSetup ?? "").replace(/\d{4}–\d{4}/, "3000–3999")).some((l) =>
		l.startsWith("cong"),
	),
	"doi chung: tai lieu ghi sai dai cong thi bi goi ten cong",
);
khang(
	thieu(khoiPhienDo(env).replace("never by hand", "by hand"), MOC_ENV)
		.length === 1,
	"doi chung: bo 'never by hand' thi bi goi ten",
);

khang(mucSetup !== null, "docs/setup.md co muc ### Screen measurements");
const t1 = thieu(mucSetup, MOC_SETUP);
khang(
	t1.length === 0,
	`docs/setup.md muc Screen measurements thieu: ${t1.join(", ") || "-"}`,
);
const lech = lechGiaTri(mucSetup);
khang(
	lech.length === 0,
	`docs/setup.md khop hang so code: ${lech.join("; ") || "khop"}`,
);
const t2 = thieu(muc(claude, "## Cách chứng minh nó chạy"), MOC_CLAUDE);
khang(
	t2.length === 0,
	`CLAUDE.md muc Cach chung minh thieu: ${t2.join(", ") || "-"}`,
);
const t3 = thieu(khoiPhienDo(env), MOC_ENV);
khang(
	t3.length === 0,
	`.env.example khoi PHIEN_DO thieu: ${t3.join(", ") || "-"}`,
);
console.log(`tai-lieu: ${sai === 0 ? "XANH" : `DO — ${sai} SAI`}`);
process.exit(sai > 0 ? 1 : 0);
